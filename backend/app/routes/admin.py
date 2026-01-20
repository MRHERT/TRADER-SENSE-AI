from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from app import db
from app.challenge_engine import ChallengeAccount, VIRTUAL_START_BALANCE
from app.models import AdminRole, Challenge, PayPalConfig, Payment, Trade, User


admin_bp = Blueprint("admin", __name__)


SUPER_ADMIN_EMAIL = "yassine.blog1@gmail.com"


def _get_current_user_id():
    identity = get_jwt_identity()
    return int(identity) if identity is not None else None


def _get_user_role(user: User) -> str:
    if user.email.lower() == SUPER_ADMIN_EMAIL:
        return "super_admin"
    entry = AdminRole.query.filter_by(user_id=user.id).first()
    if entry and entry.role in {"admin", "super_admin"}:
        return entry.role
    return "user"


def _require_admin() -> bool:
    user_id = _get_current_user_id()
    if not user_id:
        return False
    user = User.query.get(user_id)
    if not user:
        return False
    role = _get_user_role(user)
    return role in {"admin", "super_admin"}


def _require_superadmin() -> bool:
    user_id = _get_current_user_id()
    if not user_id:
        return False
    user = User.query.get(user_id)
    if not user:
        return False
    role = _get_user_role(user)
    return role == "super_admin"


@admin_bp.route("/paypal-config", methods=["GET"])
@jwt_required()
def get_paypal_config():
    if not _require_admin():
        return jsonify({"message": "Forbidden"}), 403

    config = PayPalConfig.query.first()
    if not config:
        return jsonify({"config": None})

    return jsonify(
        {
            "config": {
                "clientId": config.client_id,
                "mode": config.mode,
            }
        }
    )


@admin_bp.route("/paypal-config", methods=["POST"])
@jwt_required()
def set_paypal_config():
    if not _require_admin():
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    client_id = (data.get("clientId") or "").strip()
    client_secret = (data.get("clientSecret") or "").strip()
    mode = (data.get("mode") or "sandbox").strip()

    if not client_id or not client_secret:
        return jsonify({"message": "clientId and clientSecret are required."}), 400

    config = PayPalConfig.query.first()
    if not config:
        config = PayPalConfig(
            client_id=client_id,
            client_secret=client_secret,
            mode=mode,
        )
        db.session.add(config)
    else:
        config.client_id = client_id
        config.client_secret = client_secret
        config.mode = mode

    db.session.commit()

    return jsonify({"message": "PayPal configuration saved."})


@admin_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_admin():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    role = _get_user_role(user)

    payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }

    return jsonify({"user": payload})


@admin_bp.route("/challenges", methods=["GET"])
@jwt_required()
def get_challenge_overview():
    if not _require_admin():
        return jsonify({"message": "Forbidden"}), 403

    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)

    users = db.session.query(User).order_by(User.id).all()
    rows = []
    for user in users:
        account = db.session.query(ChallengeAccount).filter_by(user_id=user.id).first()
        challenge = (
            db.session.query(Challenge)
            .filter(Challenge.user_id == user.id)
            .order_by(Challenge.created_at.desc())
            .first()
        )
        if challenge:
            balance = challenge.current_balance
            starting_balance = challenge.starting_balance
            equity = challenge.current_equity
            plan_name = challenge.plan_name
        elif account:
            balance = account.current_equity
            starting_balance = account.starting_equity
            equity = account.current_equity
            plan_name = "N/A"
        else:
            balance = VIRTUAL_START_BALANCE
            starting_balance = VIRTUAL_START_BALANCE
            equity = VIRTUAL_START_BALANCE
            plan_name = "N/A"

        raw_status = account.status if account else (challenge.status if challenge else "ACTIVE")
        status = "ACTIVE" if raw_status == "ONGOING" else raw_status

        today_trades = (
            db.session.query(Trade)
            .join(Challenge, Trade.challenge_id == Challenge.id)
            .filter(Challenge.user_id == user.id, Trade.created_at >= start, Trade.created_at <= now)
            .all()
        )
        today_pnl = sum(t.pnl for t in today_trades)
        daily_pnl_pct = (today_pnl / starting_balance * 100.0) if starting_balance else 0.0

        rows.append(
            {
                "userId": user.id,
                "name": user.name,
                "email": user.email,
                "balance": balance,
                "equity": equity,
                "startingBalance": starting_balance,
                "planName": plan_name,
                "status": status,
                "dailyPnlPct": daily_pnl_pct,
            }
        )

    return jsonify({"rows": rows})


@admin_bp.route("/challenges/status", methods=["POST"])
@jwt_required()
def update_challenge_status():
    if not _require_admin():
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    user_id = data.get("userId")
    new_status = data.get("status")

    if not isinstance(user_id, int) or new_status not in {"ACTIVE", "SUCCESSFUL", "FAILED"}:
        return jsonify({"message": "Invalid payload"}), 400

    account = db.session.query(ChallengeAccount).filter_by(user_id=user_id).first()
    if not account:
        account = ChallengeAccount(user_id=user_id, starting_equity=VIRTUAL_START_BALANCE, current_equity=VIRTUAL_START_BALANCE)
        db.session.add(account)

    account.status = new_status

    challenge = (
        db.session.query(Challenge)
        .filter(Challenge.user_id == user_id)
        .order_by(Challenge.created_at.desc())
        .first()
    )
    if challenge:
        challenge.status = new_status

    db.session.commit()

    return jsonify({"message": "Status updated"})


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    if not _require_admin():
        return jsonify({"message": "Forbidden"}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    payload = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": _get_user_role(user),
            "createdAt": user.created_at.isoformat() if user.created_at else None,
        }
        for user in users
    ]

    return jsonify({"users": payload})


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def superadmin_stats():
    if not _require_admin():
        return jsonify({"message": "Forbidden"}), 403

    now = datetime.now(timezone.utc)
    year_ago = now - timedelta(days=365)

    total_users = db.session.query(func.count(User.id)).scalar() or 0

    active_challenges = (
        db.session.query(func.count(Challenge.id))
        .filter(Challenge.status.in_(["ACTIVE", "ONGOING"]))
        .scalar()
        or 0
    )

    active_users = (
        db.session.query(func.count(func.distinct(Challenge.user_id)))
        .filter(Challenge.status.in_(["ACTIVE", "SUCCESSFUL", "PASSED"]))
        .scalar()
        or 0
    )

    total_revenue = (
        db.session.query(func.coalesce(func.sum(Payment.amount), 0.0))
        .filter(Payment.status == "completed")
        .scalar()
        or 0.0
    )

    payments = (
        db.session.query(Payment)
        .filter(Payment.created_at >= year_ago)
        .order_by(Payment.created_at.asc())
        .all()
    )
    users_created = (
        db.session.query(User)
        .filter(User.created_at >= year_ago)
        .order_by(User.created_at.asc())
        .all()
    )

    month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    revenue_by_month = {}
    signups_by_month = {}

    for i in range(5, -1, -1):
        month = now.month - i
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        key = (year, month)
        revenue_by_month[key] = 0.0
        signups_by_month[key] = 0

    for payment in payments:
        if not payment.created_at:
            continue
        dt = payment.created_at
        key = (dt.year, dt.month)
        if key in revenue_by_month and payment.status == "completed":
            revenue_by_month[key] += float(payment.amount or 0.0)

    for user in users_created:
        if not user.created_at:
            continue
        dt = user.created_at
        key = (dt.year, dt.month)
        if key in signups_by_month:
            signups_by_month[key] += 1

    monthly_revenue = []
    user_signups = []
    for (year, month), value in sorted(revenue_by_month.items()):
        label = f"{month_labels[month - 1]}"
        monthly_revenue.append({"label": label, "value": round(value, 2)})
        user_signups.append({"label": label, "value": signups_by_month[(year, month)]})

    status_counts = {
        "ACTIVE": 0,
        "SUCCESS": 0,
        "FAILED": 0,
    }
    all_challenges = db.session.query(Challenge).all()
    for challenge in all_challenges:
        status = (challenge.status or "").upper()
        if status in {"ACTIVE", "ONGOING"}:
            status_counts["ACTIVE"] += 1
        elif status in {"SUCCESSFUL", "PASSED"}:
            status_counts["SUCCESS"] += 1
        elif status in {"FAILED"}:
            status_counts["FAILED"] += 1

    challenge_status_distribution = [
        {"status": "ACTIVE", "value": status_counts["ACTIVE"]},
        {"status": "SUCCESS", "value": status_counts["SUCCESS"]},
        {"status": "FAILED", "value": status_counts["FAILED"]},
    ]

    return jsonify(
        {
            "metrics": {
                "totalUsers": int(total_users),
                "activeUsers": int(active_users),
                "totalRevenue": float(total_revenue),
                "activeChallenges": int(active_challenges),
            },
            "charts": {
                "monthlyRevenue": monthly_revenue,
                "userSignups": user_signups,
                "challengeStatusDistribution": challenge_status_distribution,
            },
        }
    )


@admin_bp.route("/public-stats", methods=["GET"])
def public_stats():
    total_users = db.session.query(func.count(User.id)).scalar() or 0
    active_users = (
        db.session.query(func.count(func.distinct(Challenge.user_id)))
        .filter(Challenge.status.in_(["ACTIVE", "SUCCESSFUL", "PASSED"]))
        .scalar()
        or 0
    )
    return jsonify(
        {
            "totalUsers": int(total_users),
            "activeUsers": int(active_users),
        }
    )


@admin_bp.route("/users/role", methods=["POST"])
@jwt_required()
def update_user_role():
    if not _require_superadmin():
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    user_id = data.get("userId")
    role = (data.get("role") or "").strip()

    if not isinstance(user_id, int) or role not in {"user", "admin", "super_admin"}:
        return jsonify({"message": "Invalid payload"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.email.lower() == SUPER_ADMIN_EMAIL and role != "super_admin":
        return jsonify({"message": "Cannot change primary super admin role."}), 400

    entry = AdminRole.query.filter_by(user_id=user.id).first()
    if role == "user":
        if entry:
            db.session.delete(entry)
    else:
        if not entry:
            entry = AdminRole(user_id=user.id, role=role)
            db.session.add(entry)
        else:
            entry.role = role

    db.session.commit()

    updated_role = _get_user_role(user)
    payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": updated_role,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }

    return jsonify({"user": payload})
