from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings/currency", methods=["PUT"])
@jwt_required()
def update_currency():

    user_id = int(get_jwt_identity())

    body = request.get_json()

    currency_code = body.get("currency_code", "INR")

    if currency_code not in ["INR", "USD", "AED","KWD"]:
        return jsonify({
            "error": "Invalid currency"
        }), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    user.currency_code = currency_code

    db.session.commit()

    return jsonify({
        "success": True,
        "currency_code": user.currency_code
    }), 200


@settings_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "currency_code": user.currency_code or "INR"
    }), 200