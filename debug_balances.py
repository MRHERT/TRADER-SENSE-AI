
from app import create_app, db
from app.models import Challenge, User, Position

app = create_app()

with app.app_context():
    challenges = Challenge.query.all()
    print(f"Found {len(challenges)} challenges.")
    for c in challenges:
        user = User.query.get(c.user_id)
        positions = Position.query.filter_by(challenge_id=c.id).all()
        usd_pos = next((p for p in positions if p.symbol == "USD"), None)
        
        print(f"User: {user.username} (ID: {c.user_id})")
        print(f"  Challenge ID: {c.id}")
        print(f"  Current Balance: {c.current_balance}")
        print(f"  Current Equity: {c.current_equity}")
        print(f"  USD Position: {usd_pos.quantity if usd_pos else 'None'}")
        print(f"  Asset Positions: {len(positions) - (1 if usd_pos else 0)}")
        print("-" * 30)
