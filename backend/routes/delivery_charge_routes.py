from flask import Blueprint
from flask import request
from flask import jsonify

from extensions import db
from models.pincode import Pincode as DeliveryCharge
from services.postal_service import get_postal_details

delivery_charge_bp = Blueprint(
    "delivery_charge_bp",
    __name__,
    url_prefix="/api"
)

@delivery_charge_bp.route(
    "/delivery/postal-details",
    methods=["POST"]
)
def postal_details():

    body = request.get_json()

    country_code = body.get("country_code")
    postal_code = body.get("postal_code")

    details = get_postal_details(
        country_code,
        postal_code
    )

    if not details:
        return jsonify({
            "success": False,
            "message": "Invalid Postal Code"
        }), 400

    return jsonify({
        "success": True,
        "data": details
    }), 200
@delivery_charge_bp.route(
    "/delivery/save",
    methods=["POST"]
)
def save_delivery_charge():

    body = request.get_json()

    country_code = body.get("country_code")
    postal_code = body.get("postal_code")
    delivery_amount = body.get("delivery_amount")

    details = get_postal_details(
        country_code,
        postal_code
    )

    if not details:
        return jsonify({
            "success": False,
            "message": "Invalid Postal Code"
        }), 400

    # Check existing postal code
    existing = DeliveryCharge.query.filter_by(
        postal_code=postal_code
    ).first()

    if existing:

        existing.country = details["country"]
        existing.state = details["state"]
        existing.city = details["city"]
        existing.delivery_amount = delivery_amount

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Delivery charge updated"
        }), 200

    # Create new record
    delivery_charge = DeliveryCharge(
        country=details["country"],
        state=details["state"],
        city=details["city"],
        postal_code=postal_code,
        delivery_amount=delivery_amount
    )

    db.session.add(delivery_charge)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Delivery charge saved"
    }), 201

@delivery_charge_bp.route(
    "/delivery-charges",
    methods=["GET"]
)
def get_delivery_charges():

    charges = DeliveryCharge.query.all()

    return jsonify({
        "success": True,
        "data": [
            charge.to_dict()
            for charge in charges
        ]
    }), 200

@delivery_charge_bp.route(
    "/delivery-charges/<postal_code>",
    methods=["GET"]
)
def get_delivery_charge_by_postal_code(postal_code):

    charge = DeliveryCharge.query.filter_by(
        postal_code=postal_code
    ).first()

    if not charge:
        return jsonify({
            "success": False,
            "message": "Delivery charge not found"
        }), 404

    return jsonify({
        "success": True,
        "data": charge.to_dict()
    }), 200

# ─── /api/pincode routes (alias for delivery charges, used by pincode.service.ts) ─
@delivery_charge_bp.route(
    "/pincode",
    methods=["GET"]
)
def get_pincodes():
    charges = DeliveryCharge.query.all()
    return jsonify({
        "success": True,
        "data": [c.to_dict() for c in charges]
    }), 200


@delivery_charge_bp.route(
    "/pincode",
    methods=["POST"]
)
def create_pincode():
    body = request.get_json() or {}
    pincode_str = body.get("pincode")
    delivery_charge = body.get("delivery_charge")

    if not pincode_str or delivery_charge is None:
        return jsonify({"success": False, "message": "pincode and delivery_charge are required"}), 400

    existing = DeliveryCharge.query.filter_by(postal_code=pincode_str).first()
    if existing:
        existing.delivery_amount = delivery_charge
        db.session.commit()
        return jsonify({"success": True, "message": "Pincode updated", "data": existing.to_dict()}), 200

    new_pincode = DeliveryCharge(
        country=body.get("country", ""),
        state=body.get("state", ""),
        city=body.get("city", ""),
        postal_code=pincode_str,
        delivery_amount=delivery_charge
    )
    db.session.add(new_pincode)
    db.session.commit()
    return jsonify({"success": True, "message": "Pincode created", "data": new_pincode.to_dict()}), 201


@delivery_charge_bp.route(
    "/pincode/<string:pincode>",
    methods=["GET"]
)
def get_pincode_by_code(pincode):
    charge = DeliveryCharge.query.filter_by(postal_code=pincode).first()
    if not charge:
        return jsonify({"success": False, "message": "Pincode not found"}), 404
    return jsonify({"success": True, "data": charge.to_dict()}), 200
