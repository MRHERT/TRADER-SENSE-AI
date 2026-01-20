from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import Challenge, Trade, Position
from app.routes.market import get_live_price

trade_bp = Blueprint("trade", __name__)


def _get_current_user_id():
    identity = get_jwt_identity()
    return int(identity) if identity is not None else None


def _today_bounds():
    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)
    return start, now


@trade_bp.route("/history", methods=["GET"])
@jwt_required()
def trade_history():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    challenge_id = request.args.get("challengeId", type=int)

    if challenge_id:
        challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    else:
        challenge = (
            Challenge.query.filter_by(user_id=user_id, status="ACTIVE")
            .order_by(Challenge.created_at.desc())
            .first()
        )

    if not challenge:
        return jsonify({"trades": []})

    trades = (
        Trade.query.filter_by(challenge_id=challenge.id)
        .order_by(Trade.created_at.desc())
        .limit(100)
        .all()
    )

    payload = [
        {
            "id": trade.id,
            "symbol": trade.symbol,
            "side": trade.side,
            "quantity": trade.quantity,
            "price": trade.price,
            "pnl": trade.pnl,
            "status": "EXECUTED",
            "createdAt": trade.created_at.isoformat(),
        }
        for trade in trades
    ]

    return jsonify({"trades": payload})


@trade_bp.route("/execute", methods=["POST"])
@jwt_required()
def execute_trade():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}

    challenge_id = data.get("challengeId")
    symbol = (data.get("symbol") or "").upper()
    side = (data.get("side") or "").upper()

    try:
        quantity = float(data.get("quantity") or 0)
        price = float(data.get("price") or 0)
        pnl = float(data.get("pnl") or 0)
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid numeric values."}), 400

    if not challenge_id or not symbol or side not in {"BUY", "SELL"}:
        return jsonify({"message": "Invalid trade payload."}), 400

    if quantity <= 0 or price <= 0:
        return jsonify({"message": "Quantity and price must be positive."}), 400

    challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    if not challenge:
        return jsonify({"message": "Challenge not found."}), 404

    if challenge.status != "ACTIVE":
        return jsonify({"message": "Challenge is not active."}), 400

    # Server-side Portfolio Logic
    # Binance-style: Cash is a Position (USD)
    # 1. Get/Create USD Position
    usd_pos = Position.query.filter_by(challenge_id=challenge.id, symbol="USD").first()
    if not usd_pos:
        # Migration: If no USD position, assume current_balance is the initial cash
        usd_pos = Position(
            challenge_id=challenge.id,
            symbol="USD",
            quantity=challenge.current_balance,
            avg_price=1.0
        )
        db.session.add(usd_pos)
        # Flush to get ID if needed, though mostly we just need object
        db.session.flush()

    cost = price * quantity
    
    if side == "BUY":
        # Check USD Position for liquidity
        if usd_pos.quantity < cost:
            return jsonify({"message": "Insufficient buying power."}), 400
        
        # Deduct from USD Position
        usd_pos.quantity -= cost
        
        # Update/Create Asset Position
        pos = Position.query.filter_by(challenge_id=challenge.id, symbol=symbol).first()
        if pos:
            new_qty = pos.quantity + quantity
            # Weighted average price
            new_avg = ((pos.quantity * pos.avg_price) + cost) / new_qty
            pos.quantity = new_qty
            pos.avg_price = new_avg
        else:
            pos = Position(
                challenge_id=challenge.id, 
                symbol=symbol, 
                quantity=quantity, 
                avg_price=price
            )
            db.session.add(pos)
            
    elif side == "SELL":
        pos = Position.query.filter_by(challenge_id=challenge.id, symbol=symbol).first()
        if not pos or pos.quantity < quantity:
            return jsonify({"message": "Not enough shares to sell."}), 400
            
        # Add to USD Position
        usd_pos.quantity += cost
        
        # Reduce Asset Position
        pos.quantity -= quantity
        
        # Calculate realized PnL for this trade (for stats only)
        # (Sell Price - Avg Buy Price) * Quantity
        realized_pnl = (price - pos.avg_price) * quantity
        pnl = realized_pnl  
        
        if pos.quantity < 0.000001: # Float epsilon
            db.session.delete(pos)

    # NOTE: challenge.current_balance is NOT manually updated with profit/loss here.
    # It will be updated to reflect Total Equity (Sum of all positions) 
    # either here or by the periodic evaluator.
    # For now, let's update it to be the Total Equity so the UI is consistent.
    
    # We need to sum all positions. Since we are in a transaction, we should query existing + current changes.
    # However, for simplicity and performance, we can just update the `current_balance` 
    # to be the "Estimated Total Value" using the provided price for the traded asset 
    # and assuming other assets haven't moved in this split second.
    # BUT, to be safe and accurate to the user request ("Balance updates automatically"),
    # we should let the frontend/portfolio endpoint handle the total calculation,
    # OR we update the cached value here.
    
    # Let's update `current_balance` to be the USD quantity (Cash) + Asset Value?
    # No, user said "Do not directly change the balance number".
    # This implies we leave `current_balance` alone or use it as Total Equity.
    # If we use it as Total Equity, it doesn't change on Buy (swap USD->Asset).
    # It only changes on price movement.
    # So strictly speaking, on Buy/Sell, Total Equity stays roughly same (minus spread/fees).
    # So we DO NOT touch challenge.current_balance here.

    trade = Trade(
        challenge_id=challenge_id,
        symbol=symbol,
        side=side,
        quantity=quantity,
        price=price,
        pnl=pnl,
    )

    db.session.add(trade)
    db.session.commit()

    return jsonify({
        "message": "Trade executed.", 
        "tradeId": trade.id,
        "newCashBalance": usd_pos.quantity # Return USD qty as cash balance
    }), 201


@trade_bp.route("/portfolio", methods=["GET"])
@jwt_required()
def get_portfolio():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    challenge_id = request.args.get("challengeId", type=int)

    if challenge_id:
        challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    else:
        challenge = (
            Challenge.query.filter_by(user_id=user_id, status="ACTIVE")
            .order_by(Challenge.created_at.desc())
            .first()
        )

    if not challenge:
        return jsonify({"positions": [], "cashBalance": 0})

    positions = Position.query.filter_by(challenge_id=challenge.id).all()
    
    # Find USD position (Cash)
    usd_pos = next((p for p in positions if p.symbol == "USD"), None)

    # Calculate Total Equity (Binance-style)
    # Total = USD_Qty + Sum(Asset_Qty * Asset_Current_Price)
    
    asset_positions = [p for p in positions if p.symbol != "USD"]
    
    total_asset_value = 0.0
    payload = []
    
    for pos in asset_positions:
        # Fetch live price for total equity calculation
        current_price = get_live_price(pos.symbol)
        if current_price == 0:
            current_price = pos.avg_price # Fallback to avg price if fetch fails
            
        market_value = pos.quantity * current_price
        total_asset_value += market_value
        
        payload.append({
            "symbol": pos.symbol,
            "quantity": pos.quantity,
            "avgPrice": pos.avg_price,
            "marketValue": market_value, 
            "currentPrice": current_price
        })

    # Determine Cash Balance
    if usd_pos:
        cash_balance = usd_pos.quantity
    else:
        # Legacy fallback: current_balance holds the Cash amount
        # For legacy users without a USD position, current_balance is their available cash.
        cash_balance = challenge.current_balance

    total_equity = cash_balance + total_asset_value

    return jsonify({
        "positions": payload, 
        "cashBalance": cash_balance,
        "totalEquity": total_equity,
        "challengeId": challenge.id
    })
