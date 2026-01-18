from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import Challenge

challenge_bp = Blueprint("challenge", __name__)


def _get_current_user_id():
    identity = get_jwt_identity()
    return int(identity) if identity is not None else None


@challenge_bp.route("/current", methods=["GET"])
@jwt_required()
def get_current_challenge():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    challenge = (
        Challenge.query.filter_by(user_id=user_id)
        .order_by(Challenge.created_at.desc())
        .first()
    )

    if not challenge:
        return jsonify({"challenge": None})

    payload = {
        "id": challenge.id,
        "status": challenge.status,
        "planName": challenge.plan_name,
        "startingBalance": challenge.starting_balance,
        "currentBalance": challenge.current_balance,
        "currentEquity": challenge.current_equity,
        "profitTarget": challenge.profit_target,
        "dailyLossLimit": challenge.max_daily_loss_pct,
        "totalLossLimit": challenge.max_total_loss_pct,
    }

    return jsonify({"challenge": payload})


@challenge_bp.route("/start", methods=["POST"])
@jwt_required()
def start_challenge():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    plan_name = (data.get("planName") or "").strip()

    if not plan_name:
        return jsonify({"message": "planName is required"}), 400

    if plan_name == "Starter":
        starting_balance = 5000.0
    elif plan_name == "Pro":
        starting_balance = 25000.0
    elif plan_name == "Elite":
        starting_balance = 50000.0
    else:
        starting_balance = 5000.0

    active_existing = Challenge.query.filter_by(
        user_id=user_id, status="ACTIVE"
    ).first()
    if active_existing:
        return (
            jsonify({"message": "You already have an active challenge."}),
            400,
        )

    challenge = Challenge(
        user_id=user_id,
        plan_name=plan_name,
        status="ACTIVE",
        starting_balance=starting_balance,
        current_balance=starting_balance,
        current_equity=starting_balance,
        profit_target=10.0,
        max_daily_loss_pct=5.0,
        max_total_loss_pct=10.0,
    )
    db.session.add(challenge)
    db.session.commit()

    payload = {
        "id": challenge.id,
        "status": challenge.status,
        "planName": challenge.plan_name,
        "startingBalance": challenge.starting_balance,
        "currentBalance": challenge.current_balance,
        "currentEquity": challenge.current_equity,
        "profitTarget": challenge.profit_target,
        "dailyLossLimit": challenge.max_daily_loss_pct,
        "totalLossLimit": challenge.max_total_loss_pct,
    }

    return jsonify({"challenge": payload}), 201


@challenge_bp.route("/update_balance", methods=["POST"])
@jwt_required()
def update_balance():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    challenge_id = data.get("challengeId")
    balance = data.get("currentBalance")

    if not challenge_id or balance is None:
        return jsonify({"message": "Invalid payload."}), 400

    challenge = Challenge.query.filter_by(id=challenge_id, user_id=user_id).first()
    if not challenge:
        return jsonify({"message": "Challenge not found."}), 404

    challenge.current_balance = float(balance)

    db.session.commit()

    payload = {
        "id": challenge.id,
        "status": challenge.status,
        "planName": challenge.plan_name,
        "startingBalance": challenge.starting_balance,
        "currentBalance": challenge.current_balance,
        "currentEquity": challenge.current_equity,
        "profitTarget": challenge.profit_target,
        "dailyLossLimit": challenge.max_daily_loss_pct,
        "totalLossLimit": challenge.max_total_loss_pct,
    }

    return jsonify({"challenge": payload})
