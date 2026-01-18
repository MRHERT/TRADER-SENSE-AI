from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import ChatMessage, User


community_bp = Blueprint("community", __name__)


def _get_current_user_id():
    identity = get_jwt_identity()
    return int(identity) if identity is not None else None


@community_bp.route("/messages", methods=["GET"])
@jwt_required()
def get_messages():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    rows = (
        db.session.query(ChatMessage, User)
        .join(User, ChatMessage.user_id == User.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(50)
        .all()
    )

    messages = []
    for message, user in reversed(rows):
        messages.append(
            {
                "id": message.id,
                "userId": user.id,
                "userName": user.name,
                "content": message.content,
                "createdAt": message.created_at.isoformat() if message.created_at else None,
            }
        )

    return jsonify({"messages": messages})


@community_bp.route("/messages", methods=["POST"])
@jwt_required()
def post_message():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    content = (data.get("content") or "").strip()

    if not content:
        return jsonify({"message": "Message content is required."}), 400

    message = ChatMessage(user_id=user_id, content=content)
    db.session.add(message)
    db.session.commit()

    user = User.query.get(user_id)

    payload = {
        "id": message.id,
        "userId": user.id if user else None,
        "userName": user.name if user else "",
        "content": message.content,
        "createdAt": message.created_at.isoformat() if message.created_at else None,
    }

    return jsonify({"message": payload})

