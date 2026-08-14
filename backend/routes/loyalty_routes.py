from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.loyalty import LoyaltyConfig, LoyaltyLedger
from models.user import User
from services.loyalty_service import get_loyalty_config, redeem_loyalty_points
from middleware.role import role_required
from services.loyalty_service import (
    get_loyalty_config,
    redeem_loyalty_points,
    add_loyalty_points
)

loyalty_bp = Blueprint("loyalty", __name__)


@loyalty_bp.route("/loyalty-config", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_config():
    data = request.get_json()

    # Prevent creating multiple configs
    existing = LoyaltyConfig.query.first()
    if existing:
        return jsonify({
            "error": "Loyalty configuration already exists. Use Update instead."
        }), 400

    # config = LoyaltyConfig(
    #     points_per_order=data["points_per_order"],
    #     points_value=data["points_value"],
    #     min_redemption=data["min_redemption"],
    #     max_redemption_percent=data["max_redemption_percent"],
    #     is_active=data.get("is_active", True)
    # )

    config = LoyaltyConfig(
    min_order_amount=data["min_order_amount"],
    points_per_min_order=data["points_per_min_order"],
    min_points=data["min_points"],
    reward_percent=data["reward_percent"],
    is_active=data.get("is_active", True)
    )

    db.session.add(config)
    db.session.commit()

    return jsonify({
        "message": "Loyalty configuration created successfully",
        "config": config.to_dict()
    }), 201


@loyalty_bp.route("/loyalty-config", methods=["GET"])
@jwt_required()
def get_config():
    config = get_loyalty_config()
    return jsonify({"config": config.to_dict()}), 200


@loyalty_bp.route("/loyalty-config", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_config():
    config = get_loyalty_config()
    data = request.get_json()
    # for field in ["points_per_order", "points_value", "min_redemption", "max_redemption_percent", "is_active"]:
    for field in [
    "min_order_amount",
    "points_per_min_order",
    "min_points",
    "reward_percent",
    "is_active"
]:
        if field in data:
            setattr(config, field, data[field])
    db.session.commit()
    return jsonify({"message": "Loyalty config updated", "config": config.to_dict()}), 200


@loyalty_bp.route("/loyalty-points/<int:customer_id>", methods=["GET"])
@jwt_required()
def get_points(customer_id):
    user = User.query.get_or_404(customer_id)
    return jsonify({"customer_id": customer_id, "points": user.loyalty_points or 0}), 200


@loyalty_bp.route("/loyalty-points/<int:customer_id>/redeem", methods=["POST"])
@jwt_required()
def redeem_points(customer_id):
    data = request.get_json()
    points = data.get("points")
    if not points:
        return jsonify({"error": "points is required"}), 400
    result = redeem_loyalty_points(customer_id, points, data.get("order_id"))
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200


@loyalty_bp.route("/loyalty-points/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def loyalty_report():
    total_earned = db.session.query(
        db.func.sum(LoyaltyLedger.points)
    ).filter(LoyaltyLedger.transaction_type == "EARN").scalar() or 0

    total_redeemed = db.session.query(
        db.func.sum(LoyaltyLedger.points)
    ).filter(LoyaltyLedger.transaction_type == "REDEEM").scalar() or 0

    return jsonify({
        "total_earned": total_earned,
        "total_redeemed": abs(total_redeemed),
        "net_outstanding": total_earned - abs(total_redeemed)
    }), 200


@loyalty_bp.route("/loyalty/ledger", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_ledger():
    page = request.args.get("page", 1, type=int)
    ledger = LoyaltyLedger.query.order_by(
        LoyaltyLedger.created_at.desc()
    ).paginate(page=page, per_page=50, error_out=False)
    return jsonify({"ledger": [l.to_dict() for l in ledger.items], "total": ledger.total}), 200


@loyalty_bp.route("/loyalty/ledger/<int:customer_id>", methods=["GET"])
@jwt_required()
def get_customer_ledger(customer_id):
    ledger = LoyaltyLedger.query.filter_by(customer_id=customer_id).order_by(
        LoyaltyLedger.created_at.desc()
    ).all()
    return jsonify({"ledger": [l.to_dict() for l in ledger]}), 200


@loyalty_bp.route("/loyalty-points/add", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def add_points():

    data = request.get_json()

    customer_id = data.get("customer_id")
    points = data.get("points")
    order_id = data.get("order_id")

    if not customer_id or not points:
        return jsonify({
            "error": "customer_id and points are required"
        }), 400

    if order_id:
        existing = LoyaltyLedger.query.filter_by(
            customer_id=customer_id,
            order_id=order_id,
            transaction_type="EARN"
        ).first()

        if existing:
            return jsonify({
                "error": "Points already added for this order"
            }), 400

    ledger = add_loyalty_points(
        customer_id=customer_id,
        points=points,
        order_id=order_id,
        description=f"Earned {points} loyalty points"
    )

    if not ledger:
        return jsonify({
            "error": "Customer not found"
        }), 404

    db.session.commit()

    return jsonify({
        "message": "Points added successfully",
        "ledger": ledger.to_dict()
    }), 200

    data = request.get_json()

    customer_id = data.get("customer_id")
    points = data.get("points")
    order_id = data.get("order_id")

    if not customer_id or not points:
        return jsonify({
            "error": "customer_id and points are required"
        }), 400

    ledger = add_loyalty_points(
        customer_id=customer_id,
        points=points,
        order_id=order_id,
        description=f"Earned {points} loyalty points"
    )

    db.session.commit()

    if not ledger:
        return jsonify({
            "error": "Customer not found"
        }), 404

    return jsonify({
        "message": "Points added successfully",
        "ledger": ledger.to_dict()
    }), 200

@loyalty_bp.route("/loyalty/customer/<int:customer_id>", methods=["GET"])
@jwt_required()
def get_customer_loyalty(customer_id):

    user = User.query.get_or_404(customer_id)
    config = get_loyalty_config()

    available_points = user.loyalty_points or 0

    can_redeem = (
        config.is_active and
        available_points >= config.min_points
    )

    remaining_points = (
        available_points - config.min_points
        if can_redeem else
        available_points
    )

    return jsonify({
        "customer_id": customer_id,
        "available_points": available_points,
        "min_points": config.min_points,
        "reward_percent": config.reward_percent,
        "can_redeem": can_redeem,
        "remaining_points_after_redeem": remaining_points,
        "message": (
            "Reward available"
            if can_redeem
            else f"You need {config.min_points - available_points} more points."
        )
    }), 200