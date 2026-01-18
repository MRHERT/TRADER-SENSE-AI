from flask import Blueprint, jsonify
from sqlalchemy import func, case

from app import db
from app.models import Challenge, Trade, User

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.route("/monthly", methods=["GET"])
def monthly_leaderboard():
    subquery = (
        db.session.query(
            Challenge.user_id.label("user_id"),
            (
                (Challenge.current_equity - Challenge.starting_balance)
                / func.nullif(Challenge.starting_balance, 0)
                * 100.0
            ).label("profit_pct"),
        )
        .filter(Challenge.status.in_(["ACTIVE", "PASSED"]))
        .subquery()
    )

    profit_per_user = (
        db.session.query(
            User.id,
            User.name,
            func.coalesce(func.avg(subquery.c.profit_pct), 0.0).label("profit_pct"),
        )
        .join(subquery, User.id == subquery.c.user_id)
        .group_by(User.id, User.name)
        .subquery()
    )

    trade_stats = (
        db.session.query(
            Trade.challenge_id,
            func.count(Trade.id).label("trades"),
            func.sum(case((Trade.pnl > 0, 1), else_=0)).label("wins"),
        )
        .group_by(Trade.challenge_id)
        .subquery()
    )

    rows = (
        db.session.query(
            User.name,
            profit_per_user.c.profit_pct,
            func.coalesce(func.sum(trade_stats.c.trades), 0).label("trades"),
            func.coalesce(
                func.sum(trade_stats.c.wins)
                / func.nullif(func.sum(trade_stats.c.trades), 0)
                * 100.0,
                0.0,
            ).label("win_rate"),
        )
        .join(profit_per_user, profit_per_user.c.id == User.id)
        .outerjoin(Challenge, Challenge.user_id == User.id)
        .outerjoin(trade_stats, trade_stats.c.challenge_id == Challenge.id)
        .group_by(User.name, profit_per_user.c.profit_pct)
        .order_by(profit_per_user.c.profit_pct.desc())
        .limit(10)
        .all()
    )

    leaderboard = []
    for idx, row in enumerate(rows, start=1):
        leaderboard.append(
            {
                "rank": idx,
                "name": row.name,
                "profit": float(row.profit_pct or 0.0),
                "trades": int(row.trades or 0),
                "winRate": round(float(row.win_rate or 0.0), 1),
            }
        )

    return jsonify({"leaderboard": leaderboard})
