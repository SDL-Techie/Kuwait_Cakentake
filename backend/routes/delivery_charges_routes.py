from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date, time
from sqlalchemy import func, or_
from extensions import db
from models.delivery_charge import DeliveryCharge
from models.user import User
from models.order import Order
from middleware.role import role_required

delivery_charges_bp = Blueprint("delivery_charges", __name__)


def _parse_date(value, field_name):
    if not value:
        return None

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError(
            f"{field_name} must be in YYYY-MM-DD format"
        ) from exc


def _user_name(user):
    if not user:
        return "Unknown"

    first_name = getattr(user, "first_name", None)
    last_name = getattr(user, "last_name", None)

    full_name = " ".join(
        part for part in [first_name, last_name] if part
    ).strip()

    return (
        full_name
        or getattr(user, "name", None)
        or getattr(user, "full_name", None)
        or "Unknown"
    )


def _get_driver(order):
    driver = getattr(order, "driver", None)

    if driver:
        return driver

    driver_id = getattr(order, "driver_id", None)

    if not driver_id:
        return None

    return db.session.get(User, driver_id)


def _get_customer(order):
    customer = getattr(order, "customer", None)

    if customer:
        return customer

    user = getattr(order, "user", None)

    if user:
        return user

    user_id = getattr(order, "user_id", None)

    if not user_id:
        return None

    return db.session.get(User, user_id)


def _approved_delivery_query():
    return (
        db.session.query(Order, DeliveryCharge)
        .outerjoin(
            DeliveryCharge,
            DeliveryCharge.order_id == Order.id,
        )
        .filter(
            Order.status == "DELIVERED",
            Order.driver_id.isnot(None),
            Order.delivery_confirmed_at.isnot(None),
        )
    )


def _delivery_paid_details(order, charge):
    is_paid = bool(
        getattr(charge, "is_paid", False)
        if charge
        else getattr(order, "is_driver_settled", False)
    )

    paid_amount = 0.0

    if is_paid and charge:
        paid_amount = float(
            getattr(charge, "driver_share", 0)
            or getattr(charge, "charge_amount", 0)
            or 0
        )

    return is_paid, paid_amount

# GET /delivery-charges
@delivery_charges_bp.route("/delivery-charges", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def get_delivery_charges():
    charges = DeliveryCharge.query.order_by(DeliveryCharge.created_at.desc()).all()
    return jsonify({"delivery_charges": [c.to_dict() for c in charges]}), 200


# GET /delivery-charges/day-wise
@delivery_charges_bp.route(
    "/delivery-charges/day-wise",
    methods=["GET"],
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_charges_day_wise():
    try:
        start_date = _parse_date(
            request.args.get("start_date"),
            "start_date",
        )

        end_date = _parse_date(
            request.args.get("end_date"),
            "end_date",
        )

        if start_date and end_date and start_date > end_date:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": (
                            "start_date cannot be after end_date"
                        ),
                    }
                ),
                400,
            )

        query = _approved_delivery_query()

        if start_date:
            query = query.filter(
                Order.delivered_at
                >= datetime.combine(start_date, time.min)
            )

        if end_date:
            query = query.filter(
                Order.delivered_at
                <= datetime.combine(end_date, time.max)
            )

        records = (
            query.order_by(
                Order.delivered_at.desc(),
                Order.id.desc(),
            )
            .all()
        )

        grouped = {}

        for order, charge in records:
            report_datetime = (
                getattr(order, "delivered_at", None)
                or getattr(
                    order,
                    "delivery_confirmed_at",
                    None,
                )
            )

            if not report_datetime:
                continue

            date_key = report_datetime.date().isoformat()

            if date_key not in grouped:
                grouped[date_key] = {
                    "date": date_key,
                    "deliveries": 0,
                    "count": 0,
                    "paid_orders": 0,
                    "pending_orders": 0,
                    "paid_amount": 0.0,
                    "driver_ids": set(),
                    "orders": [],
                }

            day_row = grouped[date_key]

            driver = _get_driver(order)
            customer = _get_customer(order)

            driver_id = getattr(order, "driver_id", None)

            is_paid, paid_amount = _delivery_paid_details(
                order,
                charge,
            )

            day_row["deliveries"] += 1
            day_row["count"] += 1

            if driver_id:
                day_row["driver_ids"].add(driver_id)

            if is_paid:
                day_row["paid_orders"] += 1
                day_row["paid_amount"] += paid_amount
            else:
                day_row["pending_orders"] += 1

            day_row["orders"].append(
                {
                    "order_id": order.id,
                    "order_number": (
                        getattr(order, "order_number", None)
                        or f"Order #{order.id}"
                    ),
                    "customer_name": _user_name(customer),
                    "driver_id": driver_id,
                    "driver_name": _user_name(driver),
                    "status": getattr(
                        order,
                        "status",
                        "DELIVERED",
                    ),
                    "delivered_at": (
                        order.delivered_at.isoformat()
                        if getattr(
                            order,
                            "delivered_at",
                            None,
                        )
                        else None
                    ),
                    "proof_approved_at": (
                        order.delivery_confirmed_at.isoformat()
                        if getattr(
                            order,
                            "delivery_confirmed_at",
                            None,
                        )
                        else None
                    ),
                    "is_paid": is_paid,
                    "paid_amount": round(
                        paid_amount,
                        3,
                    ),
                    "paid_at": (
                        charge.paid_at.isoformat()
                        if charge
                        and getattr(
                            charge,
                            "paid_at",
                            None,
                        )
                        else None
                    ),
                }
            )

        day_wise = []

        for day_row in grouped.values():
            driver_ids = day_row.pop("driver_ids")

            day_row["drivers_count"] = len(driver_ids)
            day_row["paid_amount"] = round(
                day_row["paid_amount"],
                3,
            )

            day_wise.append(day_row)

        day_wise.sort(
            key=lambda item: item["date"],
            reverse=True,
        )

        return (
            jsonify(
                {
                    "success": True,
                    "count": len(day_wise),
                    "day_wise": day_wise,
                }
            ),
            200,
        )

    except ValueError as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": str(exc),
                }
            ),
            400,
        )

    except Exception as exc:
        db.session.rollback()

        print(
            "DELIVERY CHARGES DAY WISE ERROR:",
            str(exc),
        )

        return (
            jsonify(
                {
                    "success": False,
                    "error": (
                        "Unable to load day-wise report"
                    ),
                }
            ),
            500,
        )

@delivery_charges_bp.route(
    "/delivery-charges/day-wise/orders",
    methods=["GET"],
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_charges_day_wise_orders():
    try:
        selected_date = _parse_date(
            request.args.get("date"),
            "date",
        )

        if not selected_date:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": (
                            "date query parameter is required"
                        ),
                    }
                ),
                400,
            )

        start_datetime = datetime.combine(
            selected_date,
            time.min,
        )

        end_datetime = datetime.combine(
            selected_date,
            time.max,
        )

        records = (
            _approved_delivery_query()
            .filter(
                Order.delivered_at >= start_datetime,
                Order.delivered_at <= end_datetime,
            )
            .order_by(
                Order.delivered_at.desc(),
                Order.id.desc(),
            )
            .all()
        )

        orders = []

        for order, charge in records:
            driver = _get_driver(order)
            customer = _get_customer(order)

            is_paid, paid_amount = _delivery_paid_details(
                order,
                charge,
            )

            orders.append(
                {
                    "order_id": order.id,
                    "order_number": (
                        getattr(order, "order_number", None)
                        or f"Order #{order.id}"
                    ),
                    "customer_name": _user_name(customer),
                    "driver_id": getattr(
                        order,
                        "driver_id",
                        None,
                    ),
                    "driver_name": _user_name(driver),
                    "status": getattr(
                        order,
                        "status",
                        "DELIVERED",
                    ),
                    "delivered_at": (
                        order.delivered_at.isoformat()
                        if getattr(
                            order,
                            "delivered_at",
                            None,
                        )
                        else None
                    ),
                    "proof_approved_at": (
                        order.delivery_confirmed_at.isoformat()
                        if getattr(
                            order,
                            "delivery_confirmed_at",
                            None,
                        )
                        else None
                    ),
                    "is_paid": is_paid,
                    "paid_amount": round(
                        paid_amount,
                        3,
                    ),
                    "paid_at": (
                        charge.paid_at.isoformat()
                        if charge
                        and getattr(
                            charge,
                            "paid_at",
                            None,
                        )
                        else None
                    ),
                }
            )

        return (
            jsonify(
                {
                    "success": True,
                    "date": selected_date.isoformat(),
                    "count": len(orders),
                    "orders": orders,
                }
            ),
            200,
        )

    except ValueError as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": str(exc),
                }
            ),
            400,
        )

    except Exception as exc:
        db.session.rollback()

        print(
            "DAY WISE ORDER DETAILS ERROR:",
            str(exc),
        )

        return (
            jsonify(
                {
                    "success": False,
                    "error": (
                        "Unable to load day-wise orders"
                    ),
                }
            ),
            500,
        )

# GET /delivery-charges/driver-wise
@delivery_charges_bp.route("/delivery-charges/driver-wise", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_charges_driver_wise():
    # Only proof-approved orders are eligible for settlement/reporting.
    eligible_orders = Order.query.filter(
        Order.status == "DELIVERED",
        Order.driver_id.isnot(None),
        Order.delivery_confirmed_at.isnot(None),
    ).all()
    synced_missing_records = 0
    for order in eligible_orders:
        if DeliveryCharge.query.filter_by(order_id=order.id).first():
            continue
        db.session.add(DeliveryCharge(
            order_id=order.id,
            driver_id=order.driver_id,
            charge_amount=float(order.delivery_charge or 0),
            driver_share=0 if not order.is_driver_settled else float(getattr(order, "driver_amount", 0) or 0),
            is_paid=bool(order.is_driver_settled),
            paid_at=order.delivered_at if order.is_driver_settled else None,
            notes="Auto-synced from proof-approved delivered order",
        ))
        synced_missing_records += 1
    if synced_missing_records:
        db.session.commit()

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    driver_id = request.args.get("driver_id", type=int)
    query = db.session.query(
        DeliveryCharge.driver_id,
        func.count(DeliveryCharge.id).label("deliveries"),
        func.sum(db.case((DeliveryCharge.is_paid.is_(True), 1), else_=0)).label("paid_orders"),
        func.sum(db.case((DeliveryCharge.is_paid.is_(False), 1), else_=0)).label("pending_orders"),
        func.sum(db.case((DeliveryCharge.is_paid.is_(True), DeliveryCharge.driver_share), else_=0)).label("paid_amount"),
    )
    if start_date:
        query = query.filter(func.date(DeliveryCharge.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(DeliveryCharge.created_at) <= end_date)
    if driver_id:
        query = query.filter(DeliveryCharge.driver_id == driver_id)
    rows = query.group_by(DeliveryCharge.driver_id).all()

    result = []
    for row in rows:
        driver = User.query.get(row.driver_id) if row.driver_id else None
        result.append({
            "driver_id": row.driver_id,
            "driver_name": (f"{driver.first_name or ''} {driver.last_name or ''}".strip() if driver else "Unassigned"),
            "deliveries": int(row.deliveries or 0),
            "paid_orders": int(row.paid_orders or 0),
            "pending_orders": int(row.pending_orders or 0),
            "paid_amount": float(row.paid_amount or 0),
        })
    return jsonify({
        "driver_wise": result,
        "count": len(result),
        "synced_missing_records": synced_missing_records,
    }), 200


@delivery_charges_bp.route("/delivery-charges/driver/<int:driver_id>/orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def driver_delivery_charge_orders(driver_id):
    status = str(request.args.get("status") or "PENDING").upper()
    if status not in {"PENDING", "PAID"}:
        return jsonify({"error": "status must be PENDING or PAID"}), 400
    query = DeliveryCharge.query.filter_by(driver_id=driver_id, is_paid=(status == "PAID")).join(
        Order, Order.id == DeliveryCharge.order_id
    ).filter(Order.delivery_confirmed_at.isnot(None))
    rows = query.order_by(DeliveryCharge.paid_at.desc() if status == "PAID" else Order.delivered_at.desc()).all()
    return jsonify({
        "driver_id": driver_id,
        "status": status,
        "count": len(rows),
        "orders": [
            {
                "charge_id": charge.id,
                "order_id": charge.order.id,
                "order_number": charge.order.order_number,
                "customer_name": (
                    f"{charge.order.customer.first_name or ''} {charge.order.customer.last_name or ''}".strip()
                    if getattr(charge.order, "customer", None) else "Customer"
                ),
                "delivered_at": charge.order.delivered_at.isoformat() if charge.order.delivered_at else None,
                "proof_approved_at": charge.order.delivery_confirmed_at.isoformat() if charge.order.delivery_confirmed_at else None,
                "proof_url": charge.order.delivery_photo,
                "paid_at": charge.paid_at.isoformat() if charge.paid_at else None,
                "paid_amount": float(charge.driver_share or 0) if charge.is_paid else None,
                "is_paid": bool(charge.is_paid),
            }
            for charge in rows
        ],
    }), 200


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
        "pending_orders": DeliveryCharge.query.filter_by(is_paid=False).count(),
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


    return jsonify({
        "total_charge_collected": float(total_charge),
        "total_driver_share":     float(total_driver_share),
        "total_paid_to_drivers":  float(total_paid),
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
