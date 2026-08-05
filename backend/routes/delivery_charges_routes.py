from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func
from extensions import db
from models.delivery_charge import DeliveryCharge
from models.user import User
from middleware.role import role_required

delivery_charges_bp = Blueprint("delivery_charges", __name__)


# GET /delivery-charges
@delivery_charges_bp.route("/delivery-charges", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def get_delivery_charges():
    charges = DeliveryCharge.query.order_by(DeliveryCharge.created_at.desc()).all()
    return jsonify({"delivery_charges": [c.to_dict() for c in charges]}), 200


# GET /delivery-charges/day-wise
@delivery_charges_bp.route("/delivery-charges/day-wise", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delivery_charges_day_wise():
    results = db.session.query(
        func.date(DeliveryCharge.created_at).label("date"),
        func.count(DeliveryCharge.id).label("count"),
        func.sum(DeliveryCharge.charge_amount).label("total_charge"),
        func.sum(DeliveryCharge.driver_share).label("total_driver_share")
    ).group_by(
        func.date(DeliveryCharge.created_at)
    ).order_by(
        func.date(DeliveryCharge.created_at).desc()
    ).all()

    return jsonify({
        "day_wise": [
            {
                "date":               str(r[0]),
                "count":              r[1],
                "total_charge":       float(r[2] or 0),
                "total_driver_share": float(r[3] or 0),
            }
            for r in results
        ]
    }), 200


# GET /delivery-charges/driver-wise
@delivery_charges_bp.route("/delivery-charges/driver-wise", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delivery_charges_driver_wise():
    results = db.session.query(
        DeliveryCharge.driver_id,
        func.count(DeliveryCharge.id).label("deliveries"),
        func.sum(DeliveryCharge.charge_amount).label("total_charge"),
        func.sum(DeliveryCharge.driver_share).label("total_driver_share"),
        func.sum(
            db.case((DeliveryCharge.is_paid == True, DeliveryCharge.driver_share), else_=0)
        ).label("paid_amount"),
        func.sum(
            db.case((DeliveryCharge.is_paid == False, DeliveryCharge.driver_share), else_=0)
        ).label("pending_amount")
    ).group_by(DeliveryCharge.driver_id).all()

    driver_wise = []
    for r in results:
        driver = User.query.get(r[0]) if r[0] else None
        driver_wise.append({
            "driver_id":          r[0],
            "driver_name":        f"{driver.first_name} {driver.last_name}" if driver else "Unassigned",
            "deliveries":         r[1],
            "total_charge":       float(r[2] or 0),
            "total_driver_share": float(r[3] or 0),
            "paid_amount":        float(r[4] or 0),
            "pending_amount":     float(r[5] or 0),
        })

    return jsonify({"driver_wise": driver_wise}), 200


@delivery_charges_bp.route("/delivery-charges/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delivery_charges_dashboard():
    today = datetime.utcnow().date()
    since_30 = datetime.utcnow() - timedelta(days=30)

    total_charge = db.session.query(func.sum(DeliveryCharge.charge_amount)).scalar() or 0
    total_driver_share = db.session.query(func.sum(DeliveryCharge.driver_share)).scalar() or 0
    total_paid = db.session.query(func.sum(DeliveryCharge.driver_share)).filter_by(is_paid=True).scalar() or 0
    total_pending = db.session.query(func.sum(DeliveryCharge.driver_share)).filter_by(is_paid=False).scalar() or 0

    today_charges = DeliveryCharge.query.filter(
        func.date(DeliveryCharge.created_at) == today
    ).all()
    today_count = len(today_charges)
    today_total = sum(float(c.charge_amount) for c in today_charges)

    driver_rows = db.session.query(
        DeliveryCharge.driver_id,
        func.count(DeliveryCharge.id).label("deliveries"),
        func.sum(DeliveryCharge.driver_share).label("total_share")
    ).group_by(DeliveryCharge.driver_id).order_by(func.count(DeliveryCharge.id).desc()).limit(5).all()

    top_drivers = []
    for r in driver_rows:
        driver = User.query.get(r[0]) if r[0] else None
        top_drivers.append({
            "driver_id": r[0],
            "driver_name": f"{driver.first_name} {driver.last_name}" if driver else "Unassigned",
            "deliveries": r[1],
            "total_share": float(r[2] or 0)
        })

    chart_rows = db.session.query(
        func.date(DeliveryCharge.created_at).label("date"),
        func.sum(DeliveryCharge.charge_amount).label("total")
    ).filter(DeliveryCharge.created_at >= since_30).group_by(
        func.date(DeliveryCharge.created_at)
    ).order_by(func.date(DeliveryCharge.created_at)).all()

    recent = DeliveryCharge.query.order_by(DeliveryCharge.created_at.desc()).limit(5).all()

    return jsonify({
        "total_charge_collected": float(total_charge),
        "total_driver_share": float(total_driver_share),
        "total_paid_to_drivers": float(total_paid),
        "total_pending_payment": float(total_pending),
        "total_deliveries": DeliveryCharge.query.count(),
        "today": {"deliveries": today_count, "charge_collected": today_total},
        "top_drivers": top_drivers,
        "chart": [{"date": str(r[0]), "total": float(r[1] or 0)} for r in chart_rows],
        "recent_charges": [c.to_dict() for c in recent]
    }), 200


# GET /delivery-charges/report
@delivery_charges_bp.route("/delivery-charges/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delivery_charges_report():
    total_charge = db.session.query(
        func.sum(DeliveryCharge.charge_amount)
    ).scalar() or 0

    total_driver_share = db.session.query(
        func.sum(DeliveryCharge.driver_share)
    ).scalar() or 0

    total_paid = db.session.query(
        func.sum(DeliveryCharge.driver_share)
    ).filter_by(is_paid=True).scalar() or 0

    total_pending = db.session.query(
        func.sum(DeliveryCharge.driver_share)
    ).filter_by(is_paid=False).scalar() or 0

    return jsonify({
        "total_charge_collected": float(total_charge),
        "total_driver_share":     float(total_driver_share),
        "total_paid_to_drivers":  float(total_paid),
        "total_pending_payment":  float(total_pending),
        "total_deliveries":       DeliveryCharge.query.count(),
        "paid_deliveries":        DeliveryCharge.query.filter_by(is_paid=True).count(),
        "pending_deliveries":     DeliveryCharge.query.filter_by(is_paid=False).count(),
    }), 200


# POST /delivery-charges/pay-driver
@delivery_charges_bp.route("/delivery-charges/pay-driver", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def pay_driver():
    """
    Pay one driver for one or many delivery charges at once.
    Body: { "driver_id": 9, "charge_ids": [1, 2, 3], "notes": "July settlement" }
    If charge_ids is omitted, all unpaid charges for that driver are settled.
    """
    data = request.get_json()
    if not data or "driver_id" not in data:
        return jsonify({"error": "'driver_id' is required"}), 400

    driver_id  = data["driver_id"]
    charge_ids = data.get("charge_ids")       # optional list
    notes      = data.get("notes")
    paid_by    = int(get_jwt_identity())
    paid_at    = datetime.utcnow()

    query = DeliveryCharge.query.filter_by(driver_id=driver_id, is_paid=False)
    if charge_ids:
        query = query.filter(DeliveryCharge.id.in_(charge_ids))

    charges = query.all()
    if not charges:
        return jsonify({"error": "No unpaid delivery charges found for this driver"}), 404

    total_paid = 0.0
    for charge in charges:
        charge.is_paid  = True
        charge.paid_at  = paid_at
        charge.paid_by  = paid_by
        charge.notes    = notes or charge.notes
        total_paid     += float(charge.driver_share)

    db.session.commit()

    return jsonify({
        "message":          f"Paid {len(charges)} delivery charge(s) to driver {driver_id}",
        "driver_id":        driver_id,
        "charges_settled":  len(charges),
        "total_paid":       round(total_paid, 2),
        "paid_at":          paid_at.isoformat(),
    }), 200


# PUT /delivery-charges/:id
@delivery_charges_bp.route("/delivery-charges/<int:charge_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_delivery_charge(charge_id):
    charge = DeliveryCharge.query.get_or_404(charge_id)
    data   = request.get_json()
    for field in ["charge_amount", "driver_share", "driver_id", "notes"]:
        if field in data:
            setattr(charge, field, data[field])
    db.session.commit()
    return jsonify({"message": "Delivery charge updated", "delivery_charge": charge.to_dict()}), 200
