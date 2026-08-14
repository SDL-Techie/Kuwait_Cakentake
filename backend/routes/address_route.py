from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.address import Address
from models.area import Area
from models.user import User


address_bp = Blueprint("address", __name__)


def get_current_user_id():
    """
    JWT identity may be returned as string or integer.
    Convert it safely to integer.
    """
    identity = get_jwt_identity()

    try:
        return int(identity)
    except (TypeError, ValueError):
        return None


def clean_optional_text(value):
    """
    Convert empty strings into None and trim normal strings.
    """
    if value is None:
        return None

    value = str(value).strip()

    return value if value else None


def get_active_area(area_id):
    """
    Return an active delivery area or None.
    """
    try:
        parsed_area_id = int(area_id)
    except (TypeError, ValueError):
        return None

    return Area.query.filter_by(
        id=parsed_area_id,
        is_active=True
    ).first()


# ---------------------------------------------------------------------------
# CREATE ADDRESS
# ---------------------------------------------------------------------------

@address_bp.route("/addresses", methods=["POST"])
@jwt_required()
def create_address():
    data = request.get_json(silent=True) or {}

    current_user_id = get_current_user_id()

    if not current_user_id:
        return jsonify({
            "error": "Invalid authenticated user"
        }), 401

    user = User.query.get(current_user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    area_id = data.get("area_id")
    street = str(data.get("street", "")).strip()

    if not area_id:
        return jsonify({
            "error": "Area is required"
        }), 400

    if not street:
        return jsonify({
            "error": "Street is required"
        }), 400

    area = get_active_area(area_id)

    if not area:
        return jsonify({
            "error": "Selected area is not available for delivery",
            "delivery_available": False
        }), 400

    address = Address(
        user_id=current_user_id,
        area_id=area.id,
        street=street,
        block=clean_optional_text(data.get("block")),
        avenue=clean_optional_text(data.get("avenue")),
        building=clean_optional_text(data.get("building")),
        floor=clean_optional_text(data.get("floor")),
        apartment=clean_optional_text(data.get("apartment")),
        delivery_notes=clean_optional_text(
            data.get("delivery_notes")
        ),
        country=str(
            data.get("country") or "Kuwait"
        ).strip()
    )

    try:
        db.session.add(address)
        db.session.commit()

        return jsonify({
            "message": "Address added successfully",
            "address": address.to_dict()
        }), 201

    except Exception as error:
        db.session.rollback()
        print("Create address error:", str(error))

        return jsonify({
            "error": "Unable to add address"
        }), 500


# ---------------------------------------------------------------------------
# GET CURRENT USER ADDRESSES
# ---------------------------------------------------------------------------

@address_bp.route("/addresses/my-addresses", methods=["GET"])
@jwt_required()
def get_my_addresses():
    current_user_id = get_current_user_id()

    if not current_user_id:
        return jsonify({
            "error": "Invalid authenticated user"
        }), 401

    addresses = Address.query.filter_by(
        user_id=current_user_id
    ).order_by(Address.id.desc()).all()

    return jsonify({
        "user_id": current_user_id,
        "addresses": [
            address.to_dict()
            for address in addresses
        ]
    }), 200


# ---------------------------------------------------------------------------
# GET USER ADDRESSES
#
# Kept for compatibility with your existing frontend.
# A normal user may only access their own addresses.
# ---------------------------------------------------------------------------

@address_bp.route(
    "/users/<int:user_id>/addresses",
    methods=["GET"]
)
@jwt_required()
def get_user_addresses(user_id):
    current_user_id = get_current_user_id()

    if not current_user_id:
        return jsonify({
            "error": "Invalid authenticated user"
        }), 401

    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({
            "error": "User not found"
        }), 404

    staff_roles = {
        "ADMIN",
        "SHOP_MANAGER",
        "SALES_AGENT"
    }

    if (
        current_user.id != user_id
        and current_user.role not in staff_roles
    ):
        return jsonify({
            "error": "You are not allowed to view these addresses"
        }), 403

    addresses = Address.query.filter_by(
        user_id=user_id
    ).order_by(Address.id.desc()).all()

    return jsonify({
        "user_id": user_id,
        "addresses": [
            address.to_dict()
            for address in addresses
        ]
    }), 200


# ---------------------------------------------------------------------------
# GET SINGLE ADDRESS
# ---------------------------------------------------------------------------

@address_bp.route(
    "/addresses/<int:address_id>",
    methods=["GET"]
)
@jwt_required()
def get_address(address_id):
    current_user_id = get_current_user_id()

    if not current_user_id:
        return jsonify({
            "error": "Invalid authenticated user"
        }), 401

    current_user = User.query.get(current_user_id)
    address = Address.query.get(address_id)

    if not address:
        return jsonify({
            "error": "Address not found"
        }), 404

    staff_roles = {
        "ADMIN",
        "SHOP_MANAGER",
        "SALES_AGENT"
    }

    if (
        address.user_id != current_user_id
        and current_user.role not in staff_roles
    ):
        return jsonify({
            "error": "You are not allowed to view this address"
        }), 403

    return jsonify({
        "address": address.to_dict()
    }), 200


# ---------------------------------------------------------------------------
# UPDATE ADDRESS
# ---------------------------------------------------------------------------

@address_bp.route(
    "/addresses/<int:address_id>",
    methods=["PUT"]
)
@jwt_required()
def update_address(address_id):
    current_user_id = get_current_user_id()

    if not current_user_id:
        return jsonify({
            "error": "Invalid authenticated user"
        }), 401

    current_user = User.query.get(current_user_id)
    address = Address.query.get(address_id)

    if not address:
        return jsonify({
            "error": "Address not found"
        }), 404

    staff_roles = {
        "ADMIN",
        "SHOP_MANAGER",
        "SALES_AGENT"
    }

    if (
        address.user_id != current_user_id
        and current_user.role not in staff_roles
    ):
        return jsonify({
            "error": "You are not allowed to update this address"
        }), 403

    data = request.get_json(silent=True) or {}

    if "area_id" in data:
        area = get_active_area(data.get("area_id"))

        if not area:
            return jsonify({
                "error": "Selected area is not available for delivery",
                "delivery_available": False
            }), 400

        address.area_id = area.id

    if "street" in data:
        street = str(data.get("street") or "").strip()

        if not street:
            return jsonify({
                "error": "Street cannot be empty"
            }), 400

        address.street = street

    optional_fields = [
        "block",
        "avenue",
        "building",
        "floor",
        "apartment",
        "delivery_notes"
    ]

    for field in optional_fields:
        if field in data:
            setattr(
                address,
                field,
                clean_optional_text(data.get(field))
            )

    if "country" in data:
        country = str(
            data.get("country") or ""
        ).strip()

        address.country = country or "Kuwait"

    try:
        db.session.commit()

        return jsonify({
            "message": "Address updated successfully",
            "address": address.to_dict()
        }), 200

    except Exception as error:
        db.session.rollback()
        print("Update address error:", str(error))

        return jsonify({
            "error": "Unable to update address"
        }), 500


# ---------------------------------------------------------------------------
# DELETE ADDRESS
# ---------------------------------------------------------------------------

@address_bp.route(
    "/addresses/<int:address_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_address(address_id):
    current_user_id = get_current_user_id()

    if not current_user_id:
        return jsonify({
            "error": "Invalid authenticated user"
        }), 401

    current_user = User.query.get(current_user_id)
    address = Address.query.get(address_id)

    if not address:
        return jsonify({
            "error": "Address not found"
        }), 404

    staff_roles = {
        "ADMIN",
        "SHOP_MANAGER"
    }

    if (
        address.user_id != current_user_id
        and current_user.role not in staff_roles
    ):
        return jsonify({
            "error": "You are not allowed to delete this address"
        }), 403

    try:
        db.session.delete(address)
        db.session.commit()

        return jsonify({
            "message": "Address deleted successfully"
        }), 200

    except Exception as error:
        db.session.rollback()
        print("Delete address error:", str(error))

        return jsonify({
            "error": "Unable to delete address"
        }), 500