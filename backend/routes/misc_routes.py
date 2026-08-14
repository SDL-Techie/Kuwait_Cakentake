# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models.misc import (
#     Notification, AuditLog, Partner, Brand,
#     DriverSettlement, CustomOrder, OrderSource
# )
# from models.order import Order
from models.delivery_charge import DeliveryCharge
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
    """Proof-approved delivered orders that have not been paid yet.

    There is intentionally no pending amount. Owner / Shop Manager decides the
    payment amount independently for every selected order at payment time.
    """
    charges = DeliveryCharge.query.filter_by(
        driver_id=driver_id,
        is_paid=False,
    ).join(Order, Order.id == DeliveryCharge.order_id).filter(
        Order.status == "DELIVERED",
        Order.delivery_confirmed_at.isnot(None),
        Order.driver_settlement_id.is_(None),
    ).order_by(Order.delivered_at.desc()).all()

    return jsonify({
        "driver_id": driver_id,
        "pending_orders": len(charges),
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
            }
            for charge in charges
        ],
    }), 200


@misc_bp.route("/driver-settlements/pay", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def pay_settlement():
    """Mark selected proof-approved driver orders as paid.

    Cash Drawer / Bank are intentionally not part of driver settlement.
    """
    from datetime import datetime

    data = request.get_json(silent=True) or {}
    driver_id = data.get("driver_id")
    payments = data.get("payments") or []
    reference = data.get("reference")
    notes = data.get("notes")

    if not driver_id:
        return jsonify({"error": "driver_id is required"}), 400
    if not isinstance(payments, list) or not payments:
        return jsonify({
            "error": "Select at least one pending order and enter its payment amount"
        }), 400

    normalized = []
    seen = set()
    for item in payments:
        try:
            order_id = int(item.get("order_id"))
            amount = float(item.get("amount"))
        except (TypeError, ValueError, AttributeError):
            return jsonify({
                "error": "Each payment requires a valid order_id and amount"
            }), 400

        if order_id in seen:
            return jsonify({
                "error": f"Order {order_id} was selected more than once"
            }), 400
        if amount <= 0:
            return jsonify({
                "error": f"Payment amount for order {order_id} must be greater than zero"
            }), 400

        seen.add(order_id)
        normalized.append((order_id, round(amount, 3)))

    order_ids = [row[0] for row in normalized]
    charges = DeliveryCharge.query.filter(
        DeliveryCharge.driver_id == driver_id,
        DeliveryCharge.order_id.in_(order_ids),
        DeliveryCharge.is_paid.is_(False),
    ).join(Order, Order.id == DeliveryCharge.order_id).filter(
        Order.status == "DELIVERED",
        Order.delivery_confirmed_at.isnot(None),
        Order.driver_settlement_id.is_(None),
    ).all()

    by_order = {charge.order_id: charge for charge in charges}
    missing = [order_id for order_id in order_ids if order_id not in by_order]
    if missing:
        return jsonify({
            "error": "Some orders are not eligible. Proof must be approved and the order must still be unpaid.",
            "ineligible_order_ids": missing,
        }), 400

    total_amount = round(sum(amount for _, amount in normalized), 3)
    paid_by = int(get_jwt_identity())

    settlement = DriverSettlement(
        driver_id=driver_id,
        amount=total_amount,
        orders_count=len(normalized),
        status="PAID",
        paid_at=datetime.utcnow(),
        paid_by=paid_by,
        payment_source="OTHER",
        reference=reference,
        notes=notes,
    )
    db.session.add(settlement)
    db.session.flush()

    paid_orders = []
    for order_id, amount in normalized:
        charge = by_order[order_id]
        order = charge.order
        charge.driver_share = amount
        charge.is_paid = True
        charge.paid_at = datetime.utcnow()
        charge.paid_by = paid_by
        charge.notes = notes or f"Paid through Driver Settlement #{settlement.id}"
        order.is_driver_settled = True
        order.driver_settlement_id = settlement.id
        paid_orders.append({
            "order_id": order.id,
            "order_number": order.order_number,
            "amount": amount,
        })

    db.session.commit()

    return jsonify({
        "message": "Selected driver orders marked as paid successfully",
        "settlement": settlement.to_dict(),
        "paid_orders": paid_orders,
        "paid_orders_count": len(paid_orders),
        "total_paid": total_amount,
    }), 201


@misc_bp.route("/driver-settlements/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def settlement_report():
    query = DriverSettlement.query
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    driver_id = request.args.get("driver_id", type=int)
    if start_date:
        query = query.filter(func.date(DriverSettlement.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(DriverSettlement.created_at) <= end_date)
    if driver_id:
        query = query.filter(DriverSettlement.driver_id == driver_id)
    rows = query.order_by(DriverSettlement.created_at.desc()).all()
    total = sum(float(row.amount or 0) for row in rows if row.status == "PAID")
    return jsonify({
        "total_paid": total,
        "count": len(rows),
        "settlements": [row.to_dict() for row in rows],
    }), 200


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