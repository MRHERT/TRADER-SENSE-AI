from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return (
            jsonify({"message": "Name, email and password are required."}),
            400,
        )

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "Email is already registered."}), 400

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(days=7),
        additional_claims={"email": user.email, "name": user.name},
    )

    return (
        jsonify(
            {
                "token": access_token,
                "user": {"id": user.id, "name": user.name, "email": user.email},
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(days=7),
        additional_claims={"email": user.email, "name": user.name},
    )

    return jsonify(
        {
            "token": access_token,
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user = User.query.get(int(identity)) if identity is not None else None

    if not user:
        return jsonify({"message": "User not found."}), 404

    return jsonify({"id": user.id, "name": user.name, "email": user.email})

