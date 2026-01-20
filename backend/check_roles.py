from app import create_app, db
from app.models import AdminRole

app = create_app()
with app.app_context():
    roles = AdminRole.query.all()
    print(f"Total admin roles: {len(roles)}")
    for r in roles:
        print(f"User ID: {r.user_id}, Role: {r.role}")
