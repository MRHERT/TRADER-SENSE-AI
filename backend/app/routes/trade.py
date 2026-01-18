from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import Challenge, Trade

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

    trade = Trade(
        challenge_id=challenge.id,
        symbol=symbol,
        side=side,
        quantity=quantity,
        price=price,
        pnl=pnl,
    )
    db.session.add(trade)

    challenge.current_balance += pnl
    challenge.current_equity += pnl

    start, end = _today_bounds()
    today_trades = (
        Trade.query.filter(
            Trade.challenge_id == challenge.id,
            Trade.created_at >= start,
            Trade.created_at <= end,
        ).all()
    )
    today_pnl = sum(t.pnl for t in today_trades)

    starting_balance = challenge.starting_balance or 1.0
    daily_loss_pct = (
        abs(min(today_pnl, 0)) / starting_balance * 100.0
        if today_pnl < 0
        else 0.0
    )
    total_loss_pct = (
        max(0.0, (challenge.starting_balance - challenge.current_equity))
        / starting_balance
        * 100.0
    )
    profit_pct = (
        max(0.0, (challenge.current_equity - challenge.starting_balance))
        / starting_balance
        * 100.0
    )

    if daily_loss_pct >= challenge.max_daily_loss_pct or total_loss_pct >= challenge.max_total_loss_pct:
        challenge.status = "FAILED"
    elif profit_pct >= challenge.profit_target:
        challenge.status = "PASSED"

    db.session.commit()

    challenge_payload = {
        "id": challenge.id,
        "status": challenge.status,
        "planName": challenge.plan_name,
        "startingBalance": challenge.starting_balance,
        "currentBalance": challenge.current_balance,
        "currentEquity": challenge.current_equity,
        "profitTarget": challenge.profit_target,
        "dailyLossLimit": challenge.max_daily_loss_pct,
        "totalLossLimit": challenge.max_total_loss_pct,
        "todayPnL": today_pnl,
    }

    trade_payload = {
        "id": trade.id,
        "symbol": trade.symbol,
        "side": trade.side,
        "quantity": trade.quantity,
        "price": trade.price,
        "pnl": trade.pnl,
    }

    return jsonify({"challenge": challenge_payload, "trade": trade_payload})
