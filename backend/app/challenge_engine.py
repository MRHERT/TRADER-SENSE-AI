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
TOTAL_MAX_LOSS_PCT = 5.0
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
        # session.flush() removed to avoid InvalidRequestError during event handling
    return account


def _evaluate_account_for_user(session, user_id: int) -> None:
    # 1. Get the main Challenge record (Source of Truth for Equity)
    challenge = (
        session.query(Challenge)
        .filter(Challenge.user_id == user_id)
        .order_by(Challenge.created_at.desc())
        .first()
    )
    
    if not challenge:
        return

    # 2. Get the legacy account for status tracking compatibility
    account = _get_or_create_account(session, user_id)
    
    starting = challenge.starting_balance
    current_equity = challenge.current_equity

    # 3. Calculate Daily PnL (Realized Only - limitation of no daily snapshot in DB)
    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)

    today_trades = (
        session.query(Trade)
        .join(Challenge, Trade.challenge_id == Challenge.id)
        .filter(Challenge.user_id == user_id, Trade.created_at >= start, Trade.created_at <= now)
        .all()
    )
    today_realized_pnl = sum(t.pnl for t in today_trades)
    
    # NOTE: Daily Loss here only tracks Realized Loss because we don't have 'start_of_day_equity' in DB.
    # To fully implement "Daily Equity Drawdown", we would need a new column or table.
    # We proceed with Realized Daily Loss + Total Equity Loss.

    daily_loss_pct = abs(min(today_realized_pnl, 0.0)) / starting * 100.0 if today_realized_pnl < 0 else 0.0
    
    # Total Loss is based on Current Equity (Realized + Unrealized)
    total_loss_pct = max(0.0, (starting - current_equity)) / starting * 100.0
    
    # Profit Target is based on Current Equity
    profit_pct = max(0.0, (current_equity - starting)) / starting * 100.0

    # 4. Determine Status
    new_status = "ACTIVE"
    if daily_loss_pct >= DAILY_MAX_LOSS_PCT:
        new_status = "FAILED"
    elif total_loss_pct >= TOTAL_MAX_LOSS_PCT:
        new_status = "FAILED"
    elif profit_pct >= PROFIT_TARGET_PCT:
        new_status = "SUCCESSFUL"
    
    # 5. Update Status if changed (and not already final)
    if challenge.status == "ACTIVE":
        if new_status != "ACTIVE":
            challenge.status = new_status
            account.status = new_status
            session.add(challenge)
            session.add(account)
            # session.commit() # Caller handles commit usually, but if called from event, be careful.


@event.listens_for(Trade, "after_insert")
def _after_trade_insert(mapper, connection, target) -> None:
    session = object_session(target) or db.session
    challenge = session.query(Challenge).filter_by(id=target.challenge_id).first()
    if not challenge:
        return
    _evaluate_account_for_user(session, challenge.user_id)

