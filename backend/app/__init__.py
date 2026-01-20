import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
    
    # Use DATABASE_URL if available (Render/Production), else fallback to SQLite
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        print(f" * Database Configured: {'PostgreSQL' if 'postgres' in database_url else 'Other'}")
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
    else:
        print(" * Database Configured: SQLite (Local)")
    
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///tradesense_pro.sql"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.challenge import challenge_bp
    from app.routes.trade import trade_bp
    from app.routes.payment import payment_bp
    from app.routes.leaderboard import leaderboard_bp
    from app.routes.community import community_bp
    from app.routes.market import market_bp
    from app.routes.admin import admin_bp
    from app.challenge_engine import challenge_engine_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(challenge_bp, url_prefix="/api/challenge")
    app.register_blueprint(trade_bp, url_prefix="/api/trade")
    app.register_blueprint(payment_bp, url_prefix="/api/payment")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
    app.register_blueprint(community_bp, url_prefix="/api/community")
    app.register_blueprint(market_bp, url_prefix="/api/market")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(challenge_engine_bp)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    frontend_dist = os.path.join(project_root, "dist")

    def _serve_index():
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(frontend_dist, "index.html")
        return "Frontend build not found. Run 'npm run build' in the frontend project.", 200

    @app.route("/health")
    def health_check():
        from sqlalchemy import text
        try:
            db.session.execute(text("SELECT 1"))
            return jsonify({"status": "healthy", "database": "connected"}), 200
        except Exception as e:
            return jsonify({"status": "unhealthy", "database": str(e)}), 500

    @app.route("/")
    @app.route("/dashboard")
    @app.route("/challenges")
    @app.route("/leaderboard")
    @app.route("/community")
    @app.route("/super-admin")
    @app.route("/superadmin")
    @app.route("/auth")
    def spa_routes():
        return _serve_index()

    @app.route("/assets/<path:path>")
    def assets(path):
        return send_from_directory(os.path.join(frontend_dist, "assets"), path)

    with app.app_context():
        db.create_all()

        from werkzeug.security import generate_password_hash
        from app.models import User

        admin_email = "yassine.blog1@gmail.com"
        admin_password = "SSS123"

        existing_admin = User.query.filter_by(email=admin_email).first()
        if not existing_admin:
            admin_user = User(
                name="Admin",
                email=admin_email,
                password_hash=generate_password_hash(admin_password),
            )
            db.session.add(admin_user)
            db.session.commit()

    return app

