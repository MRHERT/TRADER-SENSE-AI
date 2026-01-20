from app import create_app, db
from app.models import User, Challenge, Trade, Position, Payment, ChatMessage, AdminRole

app = create_app()
with app.app_context():
    keep_ids = set()

    # 1. Find Admin/SuperAdmin candidates
    # Look for 'admin' in email
    admins = User.query.filter(User.email.ilike('%admin%')).all()
    for u in admins:
        keep_ids.add(u.id)
        print(f"Keeping Admin-candidate: {u.email} (ID: {u.id})")

    # 2. Fill the rest up to 4 users
    remaining_slots = 4 - len(keep_ids)
    if remaining_slots > 0:
        others = User.query.filter(User.id.notin_(keep_ids)).limit(remaining_slots).all()
        for u in others:
            keep_ids.add(u.id)
            print(f"Keeping User: {u.email} (ID: {u.id})")

    print(f"IDs to keep: {keep_ids}")

    # 3. Identify users to delete
    users_to_delete = User.query.filter(User.id.notin_(keep_ids)).all()
    delete_ids = [u.id for u in users_to_delete]
    
    print(f"Deleting {len(delete_ids)} users: {delete_ids}")
    
    if delete_ids:
        try:
            # Delete related data
            print("Deleting ChatMessages...")
            ChatMessage.query.filter(ChatMessage.user_id.in_(delete_ids)).delete(synchronize_session=False)
            
            print("Deleting Payments...")
            Payment.query.filter(Payment.user_id.in_(delete_ids)).delete(synchronize_session=False)
            
            print("Deleting AdminRoles...")
            AdminRole.query.filter(AdminRole.user_id.in_(delete_ids)).delete(synchronize_session=False)
            
            # For Challenges, we need to delete Trades and Positions first
            print("Finding Challenges to delete...")
            challenges = Challenge.query.filter(Challenge.user_id.in_(delete_ids)).all()
            challenge_ids = [c.id for c in challenges]
            
            if challenge_ids:
                print(f"Deleting Trades for {len(challenge_ids)} challenges...")
                Trade.query.filter(Trade.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)
                
                print("Deleting Positions...")
                Position.query.filter(Position.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)
                
                print("Deleting Challenges...")
                Challenge.query.filter(Challenge.id.in_(challenge_ids)).delete(synchronize_session=False)
            
            # Finally delete users
            print("Deleting Users...")
            User.query.filter(User.id.in_(delete_ids)).delete(synchronize_session=False)
            
            db.session.commit()
            print("Cleanup complete.")
        except Exception as e:
            db.session.rollback()
            print(f"Error during cleanup: {e}")
    else:
        print("No users to delete.")
