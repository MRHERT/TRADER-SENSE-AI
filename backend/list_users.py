from app import create_app, db
from app.models import User, AdminRole

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    print("ID | Name | Email | Roles")
    print("-" * 50)
    for u in users:
        roles = AdminRole.query.filter_by(user_id=u.id).all()
        role_str = ", ".join([r.role for r in roles]) if roles else "User"
        print(f"{u.id} | {u.name} | {u.email} | {role_str}")
