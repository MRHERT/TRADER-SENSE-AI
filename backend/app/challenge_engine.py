from datetime import datetime, timezone

from flask import Blueprint
from sqlalchemy import event
from sqlalchemy.orm import object_session

from app import db
from app.models import Challenge, Trade


class ChallengeAccount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    starting_equity = db.Column(db.Float, nullable=False, default=5000.0)
    current_equity = db.Column(db.Float, nullable=False, default=5000.0)
    status = db.Column(db.String(20), nullable=False, default="ACTIVE")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


challenge_engine_bp = Blueprint("challenge_engine", __name__)


VIRTUAL_START_BALANCE = 5000.0
DAILY_MAX_LOSS_PCT = 5.0
TOTAL_MAX_LOSS_PCT = 10.0
PROFIT_TARGET_PCT = 10.0


def _get_or_create_account(session, user_id: int) -> ChallengeAccount:
    account = session.query(ChallengeAccount).filter_by(user_id=user_id).first()
    if not account:
        account = ChallengeAccount(
            user_id=user_id,
            starting_equity=VIRTUAL_START_BALANCE,
            current_equity=VIRTUAL_START_BALANCE,
            status="ACTIVE",
        )
        session.add(account)
        session.flush()
    return account


def _evaluate_account_for_user(session, user_id: int) -> None:
    account = _get_or_create_account(session, user_id)
    starting = account.starting_equity or VIRTUAL_START_BALANCE
    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)

    today_trades = (
        session.query(Trade)
        .join(Challenge, Trade.challenge_id == Challenge.id)
        .filter(Challenge.user_id == user_id, Trade.created_at >= start, Trade.created_at <= now)
        .all()
    )
    today_pnl = sum(t.pnl for t in today_trades)

    all_trades = (
        session.query(Trade)
        .join(Challenge, Trade.challenge_id == Challenge.id)
        .filter(Challenge.user_id == user_id)
        .all()
    )
    total_pnl = sum(t.pnl for t in all_trades)

    equity = starting + total_pnl
    account.current_equity = equity

    daily_loss_pct = abs(min(today_pnl, 0.0)) / starting * 100.0 if today_pnl < 0 else 0.0
    total_loss_pct = max(0.0, (starting - equity)) / starting * 100.0
    profit_pct = max(0.0, (equity - starting)) / starting * 100.0

    if daily_loss_pct >= DAILY_MAX_LOSS_PCT or total_loss_pct >= TOTAL_MAX_LOSS_PCT:
        account.status = "FAILED"
    elif profit_pct >= PROFIT_TARGET_PCT:
        account.status = "SUCCESSFUL"
    else:
        account.status = "ACTIVE"

    challenge = (
        session.query(Challenge)
        .filter(Challenge.user_id == user_id)
        .order_by(Challenge.created_at.desc())
        .first()
    )
    if challenge:
        if account.status in {"ACTIVE", "SUCCESSFUL", "FAILED"}:
            challenge.status = account.status


@event.listens_for(Trade, "after_insert")
def _after_trade_insert(mapper, connection, target) -> None:
    session = object_session(target) or db.session
    challenge = session.query(Challenge).filter_by(id=target.challenge_id).first()
    if not challenge:
        return
    _evaluate_account_for_user(session, challenge.user_id)

