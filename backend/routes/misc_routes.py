# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models.misc import (
#     Notification, AuditLog, Partner, Brand,
#     DriverSettlement, CustomOrder, OrderSource
# )
# from models.order import Order
# from middleware.role import role_required

# misc_bp = Blueprint("misc", __name__)


# # ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

# @misc_bp.route("/notifications", methods=["GET"])
# @jwt_required()
# def get_notifications():
#     user_id = int(get_jwt_identity())
#     notifs = Notification.query.filter_by(user_id=user_id).order_by(
#         Notification.created_at.desc()
#     ).all()
#     return jsonify({"notifications": [n.to_dict() for n in notifs]}), 200


# @misc_bp.route("/notifications/send", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def send_notification():
#     data = request.get_json()
#     notif = Notification(
#         user_id=data.get("user_id"),
#         title=data["title"],
#         message=data["message"],
#         notification_type=data.get("notification_type"),
#         reference_id=data.get("reference_id")
#     )
#     db.session.add(notif)
#     db.session.commit()
#     return jsonify({"message": "Notification sent", "notification": notif.to_dict()}), 201


# @misc_bp.route("/notifications/<int:notif_id>/read", methods=["PUT"])
# @jwt_required()
# def mark_notification_read(notif_id):
#     notif = Notification.query.get_or_404(notif_id)
#     notif.is_read = True
#     db.session.commit()
#     return jsonify({"message": "Notification marked as read"}), 200


# # ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

# @misc_bp.route("/audit-logs", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN"])
# def get_audit_logs():
#     logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(500).all()
#     return jsonify({"logs": [l.to_dict() for l in logs]}), 200


# @misc_bp.route("/audit-logs/user/<int:user_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN"])
# def audit_logs_by_user(user_id):
#     logs = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.created_at.desc()).all()
#     return jsonify({"logs": [l.to_dict() for l in logs]}), 200


# @misc_bp.route("/audit-logs/order/<int:order_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def audit_logs_by_order(order_id):
#     logs = AuditLog.query.filter_by(reference_id=order_id, reference_type="order").order_by(
#         AuditLog.created_at.desc()
#     ).all()
#     return jsonify({"logs": [l.to_dict() for l in logs]}), 200


# # ─── PARTNERS ────────────────────────────────────────────────────────────────

# @misc_bp.route("/partners", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_partners():
#     partners = Partner.query.all()
#     return jsonify({"partners": [p.to_dict() for p in partners]}), 200


# @misc_bp.route("/partners", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN"])
# def create_partner():
#     data = request.get_json()
#     partner = Partner(
#         name=data["name"],
#         contact_name=data.get("contact_name"),
#         phone=data.get("phone"),
#         email=data.get("email"),
#         commission_percent=data.get("commission_percent", 0)
#     )
#     db.session.add(partner)
#     db.session.commit()
#     return jsonify({"message": "Partner created", "partner": partner.to_dict()}), 201


# @misc_bp.route("/partners/<int:partner_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN"])
# def update_partner(partner_id):
#     partner = Partner.query.get_or_404(partner_id)
#     data = request.get_json()
#     for field in ["name", "contact_name", "phone", "email", "commission_percent", "is_active"]:
#         if field in data:
#             setattr(partner, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Partner updated", "partner": partner.to_dict()}), 200


# @misc_bp.route("/partners/<int:partner_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN"])
# def delete_partner(partner_id):
#     partner = Partner.query.get_or_404(partner_id)
#     db.session.delete(partner)
#     db.session.commit()
#     return jsonify({"message": "Partner deleted"}), 200


# @misc_bp.route("/partners/<int:partner_id>/orders", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def partner_orders(partner_id):
#     # Placeholder: extend Order model with partner_id if needed
#     return jsonify({"orders": [], "partner_id": partner_id}), 200


# @misc_bp.route("/partners/<int:partner_id>/report", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def partner_report(partner_id):
#     return jsonify({"partner_id": partner_id, "total_orders": 0, "commission": 0}), 200


# # ─── BRANDS ──────────────────────────────────────────────────────────────────

# @misc_bp.route("/brands", methods=["GET"])
# def get_brands():
#     brands = Brand.query.filter_by(is_active=True).all()
#     return jsonify({"brands": [b.to_dict() for b in brands]}), 200


# @misc_bp.route("/brands", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_brand():
#     data = request.get_json()
#     brand = Brand(
#         name=data["name"],
#         logo_url=data.get("logo_url"),
#         description=data.get("description")
#     )
#     db.session.add(brand)
#     db.session.commit()
#     return jsonify({"message": "Brand created", "brand": brand.to_dict()}), 201


# @misc_bp.route("/brands/<int:brand_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_brand(brand_id):
#     brand = Brand.query.get_or_404(brand_id)
#     data = request.get_json()
#     for field in ["name", "logo_url", "description", "is_active"]:
#         if field in data:
#             setattr(brand, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Brand updated", "brand": brand.to_dict()}), 200


# @misc_bp.route("/brands/<int:brand_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_brand(brand_id):
#     brand = Brand.query.get_or_404(brand_id)
#     db.session.delete(brand)
#     db.session.commit()
#     return jsonify({"message": "Brand deleted"}), 200


# # ─── DRIVER SETTLEMENTS ──────────────────────────────────────────────────────

# @misc_bp.route("/driver-settlements", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_settlements():
#     settlements = DriverSettlement.query.order_by(DriverSettlement.created_at.desc()).all()
#     return jsonify({"settlements": [s.to_dict() for s in settlements]}), 200


# @misc_bp.route("/driver-settlements/<int:driver_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_driver_settlements(driver_id):
#     settlements = DriverSettlement.query.filter_by(driver_id=driver_id).all()
#     return jsonify({"settlements": [s.to_dict() for s in settlements]}), 200


# @misc_bp.route("/driver-settlements/pay", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def pay_settlement():
#     from datetime import datetime
#     data = request.get_json()
#     settlement = DriverSettlement(
#         driver_id=data["driver_id"],
#         amount=data["amount"],
#         orders_count=data.get("orders_count", 0),
#         period_start=datetime.fromisoformat(data["period_start"]) if data.get("period_start") else None,
#         period_end=datetime.fromisoformat(data["period_end"]) if data.get("period_end") else None,
#         status="PAID",
#         paid_at=datetime.utcnow(),
#         paid_by=int(get_jwt_identity()),
#         notes=data.get("notes")
#     )
#     db.session.add(settlement)
#     db.session.commit()
#     return jsonify({"message": "Settlement paid", "settlement": settlement.to_dict()}), 201


# @misc_bp.route("/driver-settlements/report", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def settlement_report():
#     from sqlalchemy import func
#     total = db.session.query(func.sum(DriverSettlement.amount)).filter_by(status="PAID").scalar() or 0
#     return jsonify({"total_paid": float(total)}), 200


# # ─── CUSTOM ORDERS ───────────────────────────────────────────────────────────

# @misc_bp.route("/custom-orders", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
# def get_custom_orders():
#     orders = CustomOrder.query.order_by(CustomOrder.created_at.desc()).all()
#     return jsonify({"custom_orders": [o.to_dict() for o in orders]}), 200


# @misc_bp.route("/custom-orders", methods=["POST"])
# @jwt_required()
# def create_custom_order():
#     data = request.get_json()
#     co = CustomOrder(
#         customer_id=data["customer_id"],
#         description=data["description"],
#         budget=data.get("budget"),
#         notes=data.get("notes")
#     )
#     db.session.add(co)
#     db.session.commit()
#     return jsonify({"message": "Custom order submitted", "custom_order": co.to_dict()}), 201


# @misc_bp.route("/custom-orders/<int:co_id>", methods=["GET"])
# @jwt_required()
# def get_custom_order(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     return jsonify({"custom_order": co.to_dict()}), 200


# @misc_bp.route("/custom-orders/<int:co_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_custom_order(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     data = request.get_json()
#     for field in ["description", "budget", "notes", "quoted_price", "delivery_date"]:
#         if field in data:
#             setattr(co, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Custom order updated", "custom_order": co.to_dict()}), 200


# @misc_bp.route("/custom-orders/<int:co_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_custom_order(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     db.session.delete(co)
#     db.session.commit()
#     return jsonify({"message": "Custom order deleted"}), 200


# @misc_bp.route("/custom-orders/<int:co_id>/upload-image", methods=["POST"])
# @jwt_required()
# def upload_custom_order_image(co_id):
#     import cloudinary.uploader
#     co = CustomOrder.query.get_or_404(co_id)
#     file = request.files.get("image")
#     if not file:
#         return jsonify({"error": "No image provided"}), 400
#     result = cloudinary.uploader.upload(file, folder="custom_orders")
#     images = co.images or []
#     images.append({"url": result["secure_url"], "public_id": result["public_id"]})
#     co.images = images
#     db.session.commit()
#     return jsonify({"message": "Image uploaded", "image_url": result["secure_url"]}), 200


# @misc_bp.route("/custom-orders/<int:co_id>/images", methods=["GET"])
# @jwt_required()
# def get_custom_order_images(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     return jsonify({"images": co.images or []}), 200


# @misc_bp.route("/custom-orders/<int:co_id>/images/<string:image_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_custom_order_image(co_id, image_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     co.images = [img for img in (co.images or []) if img.get("public_id") != image_id]
#     db.session.commit()
#     return jsonify({"message": "Image deleted"}), 200


# @misc_bp.route("/custom-orders/<int:co_id>/approve", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def approve_custom_order(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     data = request.get_json() or {}
#     co.status = "APPROVED"
#     co.quoted_price = data.get("quoted_price", co.quoted_price)
#     db.session.commit()
#     return jsonify({"message": "Custom order approved", "custom_order": co.to_dict()}), 200


# @misc_bp.route("/custom-orders/<int:co_id>/reject", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def reject_custom_order(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     data = request.get_json() or {}
#     co.status = "REJECTED"
#     co.rejection_reason = data.get("reason")
#     db.session.commit()
#     return jsonify({"message": "Custom order rejected"}), 200


# @misc_bp.route("/custom-orders/<int:co_id>/convert-to-order", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def convert_to_order(co_id):
#     co = CustomOrder.query.get_or_404(co_id)
#     if co.status != "APPROVED":
#         return jsonify({"error": "Custom order must be APPROVED first"}), 400
#     co.status = "CONVERTED"
#     db.session.commit()
#     return jsonify({"message": "Converted to order. Proceed to create order manually.", "custom_order": co.to_dict()}), 200


# # ─── ORDER SOURCES ───────────────────────────────────────────────────────────

# @misc_bp.route("/order-sources", methods=["GET"])
# @jwt_required()
# def get_order_sources():
#     sources = OrderSource.query.filter_by(is_active=True).all()
#     return jsonify({"sources": [s.to_dict() for s in sources]}), 200


# @misc_bp.route("/order-sources", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_order_source():
#     data = request.get_json()
#     source = OrderSource(name=data["name"], description=data.get("description"))
#     db.session.add(source)
#     db.session.commit()
#     return jsonify({"message": "Order source created", "source": source.to_dict()}), 201


# @misc_bp.route("/order-sources/<int:source_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_order_source(source_id):
#     source = OrderSource.query.get_or_404(source_id)
#     data = request.get_json()
#     for field in ["name", "description", "is_active"]:
#         if field in data:
#             setattr(source, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Order source updated", "source": source.to_dict()}), 200


# @misc_bp.route("/order-sources/<int:source_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_order_source(source_id):
#     source = OrderSource.query.get_or_404(source_id)
#     db.session.delete(source)
#     db.session.commit()
#     return jsonify({"message": "Order source deleted"}), 200


# # ─── WHATSAPP ────────────────────────────────────────────────────────────────

# @misc_bp.route("/whatsapp/send-order", methods=["POST"])
# @jwt_required()
# def whatsapp_send_order():
#     # Integrate with WhatsApp API / n8n webhook
#     data = request.get_json()
#     return jsonify({"message": "WhatsApp order notification queued", "order_id": data.get("order_id")}), 200


# @misc_bp.route("/whatsapp/send-payment-link", methods=["POST"])
# @jwt_required()
# def whatsapp_send_payment_link():
#     data = request.get_json()
#     return jsonify({"message": "Payment link sent via WhatsApp", "order_id": data.get("order_id")}), 200


# @misc_bp.route("/whatsapp/send-delivery-update", methods=["POST"])
# @jwt_required()
# def whatsapp_send_delivery_update():
#     data = request.get_json()
#     return jsonify({"message": "Delivery update sent via WhatsApp", "order_id": data.get("order_id")}), 200


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.misc import (
    Notification,
    AuditLog,
    Partner,
    Brand,
    DriverSettlement,
    CustomOrder,
    OrderSource,
    CashDrawerTransaction,
    BankTransaction
)
from models.order import Order
from middleware.role import role_required
from sqlalchemy import func

misc_bp = Blueprint("misc", __name__)


# ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────────

@misc_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).all()
    return jsonify({"notifications": [n.to_dict() for n in notifs]}), 200


@misc_bp.route("/notifications/send", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def send_notification():
    data = request.get_json()
    notif = Notification(
        user_id=data.get("user_id"),
        title=data["title"],
        message=data["message"],
        notification_type=data.get("notification_type"),
        reference_id=data.get("reference_id")
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify({"message": "Notification sent", "notification": notif.to_dict()}), 201


@misc_bp.route("/notifications/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read"}), 200


# ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

@misc_bp.route("/audit-logs", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(500).all()
    return jsonify({"logs": [l.to_dict() for l in logs]}), 200


@misc_bp.route("/audit-logs/user/<int:user_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def audit_logs_by_user(user_id):
    logs = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.created_at.desc()).all()
    return jsonify({"logs": [l.to_dict() for l in logs]}), 200


@misc_bp.route("/audit-logs/order/<int:order_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def audit_logs_by_order(order_id):
    logs = AuditLog.query.filter_by(reference_id=order_id, reference_type="order").order_by(
        AuditLog.created_at.desc()
    ).all()
    return jsonify({"logs": [l.to_dict() for l in logs]}), 200


# ─── PARTNERS ────────────────────────────────────────────────────────────────

@misc_bp.route("/partners", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_partners():
    partners = Partner.query.all()
    return jsonify({"partners": [p.to_dict() for p in partners]}), 200


@misc_bp.route("/partners", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def create_partner():
    data = request.get_json()
    partner = Partner(
        name=data["name"],
        contact_name=data.get("contact_name"),
        phone=data.get("phone"),
        email=data.get("email"),
        commission_percent=data.get("commission_percent", 0)
    )
    db.session.add(partner)
    db.session.commit()
    return jsonify({"message": "Partner created", "partner": partner.to_dict()}), 201


@misc_bp.route("/partners/<int:partner_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN"])
def update_partner(partner_id):
    partner = Partner.query.get_or_404(partner_id)
    data = request.get_json()
    for field in ["name", "contact_name", "phone", "email", "commission_percent", "is_active"]:
        if field in data:
            setattr(partner, field, data[field])
    db.session.commit()
    return jsonify({"message": "Partner updated", "partner": partner.to_dict()}), 200


@misc_bp.route("/partners/<int:partner_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_partner(partner_id):
    partner = Partner.query.get_or_404(partner_id)
    db.session.delete(partner)
    db.session.commit()
    return jsonify({"message": "Partner deleted"}), 200


@misc_bp.route("/partners/<int:partner_id>/orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def partner_orders(partner_id):
    # Placeholder: extend Order model with partner_id if needed
    return jsonify({"orders": [], "partner_id": partner_id}), 200


@misc_bp.route("/partners/<int:partner_id>/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def partner_report(partner_id):
    return jsonify({"partner_id": partner_id, "total_orders": 0, "commission": 0}), 200


# ─── BRANDS ──────────────────────────────────────────────────────────────────

@misc_bp.route("/brands", methods=["GET"])
def get_brands():
    brands = Brand.query.filter_by(is_active=True).all()
    return jsonify({"brands": [b.to_dict() for b in brands]}), 200


@misc_bp.route("/brands", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_brand():
    data = request.get_json()
    brand = Brand(
        name=data["name"],
        logo_url=data.get("logo_url"),
        description=data.get("description")
    )
    db.session.add(brand)
    db.session.commit()
    return jsonify({"message": "Brand created", "brand": brand.to_dict()}), 201


@misc_bp.route("/brands/<int:brand_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_brand(brand_id):
    brand = Brand.query.get_or_404(brand_id)
    data = request.get_json()
    for field in ["name", "logo_url", "description", "is_active"]:
        if field in data:
            setattr(brand, field, data[field])
    db.session.commit()
    return jsonify({"message": "Brand updated", "brand": brand.to_dict()}), 200


@misc_bp.route("/brands/<int:brand_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_brand(brand_id):
    brand = Brand.query.get_or_404(brand_id)
    db.session.delete(brand)
    db.session.commit()
    return jsonify({"message": "Brand deleted"}), 200


# ─── DRIVER SETTLEMENTS ──────────────────────────────────────────────────────

@misc_bp.route("/driver-settlements", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_settlements():
    settlements = DriverSettlement.query.order_by(DriverSettlement.created_at.desc()).all()
    return jsonify({"settlements": [s.to_dict() for s in settlements]}), 200


@misc_bp.route("/driver-settlements/<int:driver_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_driver_settlements(driver_id):
    settlements = DriverSettlement.query.filter_by(driver_id=driver_id).all()
    return jsonify({"settlements": [s.to_dict() for s in settlements]}), 200

@misc_bp.route("/driver-settlements/pending/<int:driver_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def pending_settlement(driver_id):

    # Delivered orders which are not yet settled
    orders = Order.query.filter(
        Order.driver_id == driver_id,
        Order.status == "DELIVERED",
        Order.is_driver_settled == False
    ).all()

    total_orders = len(orders)

    total_amount = sum(
        float(getattr(order, "driver_amount", 0) or 0)
        for order in orders
    )

    already_paid = db.session.query(
        func.sum(DriverSettlement.amount)
    ).filter(
        DriverSettlement.driver_id == driver_id
    ).scalar() or 0

    pending = total_amount

    return jsonify({
        "driver_id": driver_id,
        "total_orders": total_orders,
        "delivery_amount": float(total_amount),
        "already_paid": float(already_paid),
        "pending_amount": float(pending),
        "orders": [
            {
                "order_id": order.id,
                "amount": float(getattr(order, "driver_amount", 0) or 0)
            }
            for order in orders
        ]
    }), 200

@misc_bp.route("/driver-settlements/pay", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def pay_settlement():
    from datetime import datetime

    data = request.get_json()

    driver_id = data["driver_id"]
    amount = float(data["amount"])
    payment_source = data.get("payment_source", "CASH").upper()
    reference = data.get("reference")
    notes = data.get("notes")

    orders = Order.query.filter(
    Order.driver_id == driver_id,
    Order.status == "DELIVERED",
    Order.is_driver_settled == False
).all()

    pending_amount = sum(
    float(getattr(o, "driver_amount", 0) or 0)
    for o in orders
)

    if pending_amount <= 0:
     return jsonify({
        "error": "No pending settlement available"
    }), 400

    if amount > pending_amount:
     return jsonify({
        "error": f"Settlement amount cannot exceed pending amount ({pending_amount})"
    }), 400
    # ----------------------------
    # Create Settlement
    # ----------------------------
    settlement = DriverSettlement(
        driver_id=driver_id,
        amount=amount,
        orders_count=data.get("orders_count", 0),
        period_start=datetime.fromisoformat(data["period_start"])
        if data.get("period_start") else None,
        period_end=datetime.fromisoformat(data["period_end"])
        if data.get("period_end") else None,
        status="PAID",
        paid_at=datetime.utcnow(),
        paid_by=int(get_jwt_identity()),
        payment_source=payment_source,
        reference=reference,
        notes=notes
    )

    db.session.add(settlement)
    db.session.flush()

    # ----------------------------
    # Mark Orders Settled
    # ----------------------------
    orders = Order.query.filter(
        Order.driver_id == driver_id,
        Order.status == "DELIVERED",
        Order.is_driver_settled == False
    ).all()

    for order in orders:
        order.is_driver_settled = True
        order.driver_settlement_id = settlement.id

    # ----------------------------
    # Reduce Cash Drawer / Bank
    # ----------------------------
    if payment_source == "CASH":

        last_txn = CashDrawerTransaction.query.order_by(
            CashDrawerTransaction.id.desc()
        ).first()

        current_balance = (
            float(last_txn.balance_after)
            if last_txn else 0
        )

        if amount > current_balance:
            db.session.rollback()
            return jsonify({
                "error": "Insufficient cash drawer balance"
            }), 400

        new_balance = current_balance - amount

        cash_txn = CashDrawerTransaction(
            transaction_type="WITHDRAW",
            amount=amount,
            balance_after=new_balance,
            reference=f"Driver Settlement #{settlement.id}",
            notes=f"Settlement paid to Driver {driver_id}",
            performed_by=int(get_jwt_identity())
        )

        db.session.add(cash_txn)

    elif payment_source == "BANK":

        last_txn = BankTransaction.query.order_by(
            BankTransaction.id.desc()
        ).first()

        current_balance = (
            float(last_txn.balance_after)
            if last_txn else 0
        )

        if amount > current_balance:
            db.session.rollback()
            return jsonify({
                "error": "Insufficient bank balance"
            }), 400

        new_balance = current_balance - amount

        bank_txn = BankTransaction(
            transaction_type="WITHDRAW",
            amount=amount,
            balance_after=new_balance,
            reference=f"Driver Settlement #{settlement.id}",
            notes=f"Settlement paid to Driver {driver_id}",
            performed_by=int(get_jwt_identity())
        )

        db.session.add(bank_txn)

    else:
        db.session.rollback()
        return jsonify({
            "error": "Invalid payment source"
        }), 400

    db.session.commit()

    return jsonify({
        "message": "Driver settlement paid successfully.",
        "settlement": settlement.to_dict()
    }), 201

@misc_bp.route("/driver-settlements/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def settlement_report():
    from sqlalchemy import func
    total = db.session.query(func.sum(DriverSettlement.amount)).filter_by(status="PAID").scalar() or 0
    return jsonify({"total_paid": float(total)}), 200


# ─── CUSTOM ORDERS ───────────────────────────────────────────────────────────

@misc_bp.route("/custom-orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def get_custom_orders():
    orders = CustomOrder.query.order_by(CustomOrder.created_at.desc()).all()
    return jsonify({"custom_orders": [o.to_dict() for o in orders]}), 200

@misc_bp.route("/custom-orders", methods=["POST"])
@jwt_required()
def create_custom_order():
    from datetime import datetime
    data = request.get_json() or {}

    # ─── customer_id always comes from the verified JWT, never from the
    #     request body — keeps this endpoint safe to call from the chatbot
    #     (n8n) without trusting whatever the AI/client sends. ──────────────
    customer_id = int(get_jwt_identity())

    # ─── Build-Your-Own-Cake (chatbot) structured fields ─────────────────────
    details_fields = [
        "baseCakeId", "cakeSize", "flavor", "dietaryOptions",
        "customDesign", "deliveryTime", "deliveryAddress",
        "customerName", "customerEmail", "customerPhone"
    ]
    details = {k: data[k] for k in details_fields if k in data}

    description = data.get("description")
    if not description:
        parts = []
        if data.get("flavor"):
            parts.append(f"{data['flavor']} flavor")
        if data.get("cakeSize"):
            parts.append(f"{data['cakeSize']} size")
        if data.get("dietaryOptions"):
            parts.append(str(data["dietaryOptions"]))
        description = "Custom cake order" + (
            " — " + ", ".join(parts) if parts else ""
        )

    delivery_date = None
    if data.get("deliveryDate"):
        try:
            delivery_date = datetime.strptime(
                data["deliveryDate"], "%Y-%m-%d"
            ).date()
        except (ValueError, TypeError):
            delivery_date = None

    co = CustomOrder(
        customer_id=customer_id,
        description=description,
        budget=data.get("budget"),
        delivery_date=delivery_date,
        notes=data.get("specialInstructions") or data.get("notes"),
        details=details or None,
        source="CHATBOT" if data.get("source") == "chatbot" else "ADMIN"
    )
    db.session.add(co)
    db.session.commit()
    return jsonify({"message": "Custom order submitted", "custom_order": co.to_dict()}), 201


@misc_bp.route("/custom-orders/<int:co_id>", methods=["GET"])
@jwt_required()
def get_custom_order(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    return jsonify({"custom_order": co.to_dict()}), 200


@misc_bp.route("/custom-orders/<int:co_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_custom_order(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    data = request.get_json()
    for field in ["description", "budget", "notes", "quoted_price", "delivery_date"]:
        if field in data:
            setattr(co, field, data[field])
    db.session.commit()
    return jsonify({"message": "Custom order updated", "custom_order": co.to_dict()}), 200


@misc_bp.route("/custom-orders/<int:co_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_custom_order(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    db.session.delete(co)
    db.session.commit()
    return jsonify({"message": "Custom order deleted"}), 200


@misc_bp.route("/custom-orders/<int:co_id>/upload-image", methods=["POST"])
@jwt_required()
def upload_custom_order_image(co_id):
    import cloudinary.uploader
    co = CustomOrder.query.get_or_404(co_id)
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400
    result = cloudinary.uploader.upload(file, folder="custom_orders")
    images = co.images or []
    images.append({"url": result["secure_url"], "public_id": result["public_id"]})
    co.images = images
    db.session.commit()
    return jsonify({"message": "Image uploaded", "image_url": result["secure_url"]}), 200


@misc_bp.route("/custom-orders/<int:co_id>/images", methods=["GET"])
@jwt_required()
def get_custom_order_images(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    return jsonify({"images": co.images or []}), 200


@misc_bp.route("/custom-orders/<int:co_id>/images/<string:image_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_custom_order_image(co_id, image_id):
    co = CustomOrder.query.get_or_404(co_id)
    co.images = [img for img in (co.images or []) if img.get("public_id") != image_id]
    db.session.commit()
    return jsonify({"message": "Image deleted"}), 200


@misc_bp.route("/custom-orders/<int:co_id>/approve", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def approve_custom_order(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    data = request.get_json() or {}
    co.status = "APPROVED"
    co.quoted_price = data.get("quoted_price", co.quoted_price)
    db.session.commit()
    return jsonify({"message": "Custom order approved", "custom_order": co.to_dict()}), 200


@misc_bp.route("/custom-orders/<int:co_id>/reject", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def reject_custom_order(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    data = request.get_json() or {}
    co.status = "REJECTED"
    co.rejection_reason = data.get("reason")
    db.session.commit()
    return jsonify({"message": "Custom order rejected"}), 200


@misc_bp.route("/custom-orders/<int:co_id>/convert-to-order", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def convert_to_order(co_id):
    co = CustomOrder.query.get_or_404(co_id)
    if co.status != "APPROVED":
        return jsonify({"error": "Custom order must be APPROVED first"}), 400
    co.status = "CONVERTED"
    db.session.commit()
    return jsonify({"message": "Converted to order. Proceed to create order manually.", "custom_order": co.to_dict()}), 200


# ─── ORDER SOURCES ───────────────────────────────────────────────────────────

@misc_bp.route("/order-sources", methods=["GET"])
@jwt_required()
def get_order_sources():
    sources = OrderSource.query.filter_by(is_active=True).all()
    return jsonify({"sources": [s.to_dict() for s in sources]}), 200


@misc_bp.route("/order-sources", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_order_source():
    data = request.get_json()
    source = OrderSource(name=data["name"], description=data.get("description"))
    db.session.add(source)
    db.session.commit()
    return jsonify({"message": "Order source created", "source": source.to_dict()}), 201


@misc_bp.route("/order-sources/<int:source_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_order_source(source_id):
    source = OrderSource.query.get_or_404(source_id)
    data = request.get_json()
    for field in ["name", "description", "is_active"]:
        if field in data:
            setattr(source, field, data[field])
    db.session.commit()
    return jsonify({"message": "Order source updated", "source": source.to_dict()}), 200


@misc_bp.route("/order-sources/<int:source_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_order_source(source_id):
    source = OrderSource.query.get_or_404(source_id)
    db.session.delete(source)
    db.session.commit()
    return jsonify({"message": "Order source deleted"}), 200


# ─── WHATSAPP ────────────────────────────────────────────────────────────────

@misc_bp.route("/whatsapp/send-order", methods=["POST"])
@jwt_required()
def whatsapp_send_order():
    # Integrate with WhatsApp API / n8n webhook
    data = request.get_json()
    return jsonify({"message": "WhatsApp order notification queued", "order_id": data.get("order_id")}), 200


@misc_bp.route("/whatsapp/send-payment-link", methods=["POST"])
@jwt_required()
def whatsapp_send_payment_link():
    data = request.get_json()
    return jsonify({"message": "Payment link sent via WhatsApp", "order_id": data.get("order_id")}), 200


@misc_bp.route("/whatsapp/send-delivery-update", methods=["POST"])
@jwt_required()
def whatsapp_send_delivery_update():
    data = request.get_json()
    return jsonify({"message": "Delivery update sent via WhatsApp", "order_id": data.get("order_id")}), 200