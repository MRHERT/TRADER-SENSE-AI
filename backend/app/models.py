from datetime import datetime

from app import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    plan_name = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="ACTIVE")
    starting_balance = db.Column(db.Float, nullable=False)
    current_balance = db.Column(db.Float, nullable=False)
    current_equity = db.Column(db.Float, nullable=False)
    profit_target = db.Column(db.Float, nullable=False, default=10.0)
    max_daily_loss_pct = db.Column(db.Float, nullable=False, default=5.0)
    max_total_loss_pct = db.Column(db.Float, nullable=False, default=5.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    yesterday_equity = db.Column(db.Float, nullable=True)
    last_equity_update = db.Column(db.DateTime, default=datetime.utcnow)


class Position(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey("challenge.id"), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    avg_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey("challenge.id"), nullable=False)
    symbol = db.Column(db.String(50), nullable=False)
    side = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    pnl = db.Column(db.Float, default=0.0)


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    plan_name = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="DH")
    status = db.Column(db.String(20), default="completed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PayPalConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(200), nullable=False)
    client_secret = db.Column(db.String(200), nullable=False)
    mode = db.Column(db.String(20), nullable=False, default="sandbox")


class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AdminRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    role = db.Column(db.String(20), nullable=False, default="admin")
