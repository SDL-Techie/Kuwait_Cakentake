from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.inventory import Inventory, RawMaterial, Purchase, Supplier, InventoryConsumption
from services.inventory_service import get_or_create_inventory, consume_material, get_low_stock, get_out_of_stock
from middleware.role import role_required

inventory_bp = Blueprint("inventory", __name__)


# # ─── INVENTORY ───────────────────────────────────────────────────────────────

# @inventory_bp.route("/inventory", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_inventory():
#     items = Inventory.query.all()
#     return jsonify({"inventory": [i.to_dict() for i in items]}), 200


# @inventory_bp.route("/inventory/low-stock", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def low_stock():
#     items = get_low_stock()
#     return jsonify({"inventory": [i.to_dict() for i in items]}), 200


# @inventory_bp.route("/inventory/out-of-stock", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def out_of_stock():
#     items = get_out_of_stock()
#     return jsonify({"inventory": [i.to_dict() for i in items]}), 200


# @inventory_bp.route("/inventory/<int:material_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_inventory(material_id):
#     inv = get_or_create_inventory(material_id)
#     data = request.get_json()
#     if "quantity" in data:
#         inv.quantity = data["quantity"]
#     if "low_stock_threshold" in data:
#         inv.low_stock_threshold = data["low_stock_threshold"]
#     db.session.commit()
#     return jsonify({"message": "Inventory updated", "inventory": inv.to_dict()}), 200


# @inventory_bp.route("/inventory/consume", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
# def consume():
#     data = request.get_json()
#     result = consume_material(
#         data["material_id"],
#         data["quantity"],
#         data.get("order_id"),
#         data.get("notes")
#     )
#     if "error" in result:
#         return jsonify(result), 400
#     return jsonify(result), 200


# @inventory_bp.route("/inventory/consumption-report", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def consumption_report():
#     logs = InventoryConsumption.query.order_by(InventoryConsumption.consumed_at.desc()).limit(100).all()
#     return jsonify({"consumption": [l.to_dict() for l in logs]}), 200


# @inventory_bp.route("/inventory/material-usage", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def material_usage():
#     from sqlalchemy import func
#     results = db.session.query(
#         InventoryConsumption.material_id,
#         func.sum(InventoryConsumption.quantity_used).label("total_used")
#     ).group_by(InventoryConsumption.material_id).all()
#     return jsonify({"usage": [{"material_id": r[0], "total_used": float(r[1])} for r in results]}), 200


# # ─── RAW MATERIALS ───────────────────────────────────────────────────────────

# @inventory_bp.route("/materials", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_materials():
#     materials = RawMaterial.query.all()
#     return jsonify({"materials": [m.to_dict() for m in materials]}), 200


# @inventory_bp.route("/materials", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_material():
#     data = request.get_json()
#     material = RawMaterial(
#         name=data["name"],
#         unit=data["unit"],
#         cost_per_unit=data.get("cost_per_unit", 0),
#         supplier_id=data.get("supplier_id")
#     )
#     db.session.add(material)
#     db.session.commit()
#     return jsonify({"message": "Material created", "material": material.to_dict()}), 201


# @inventory_bp.route("/materials/<int:material_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_material(material_id):
#     material = RawMaterial.query.get_or_404(material_id)
#     data = request.get_json()
#     for field in ["name", "unit", "cost_per_unit", "supplier_id"]:
#         if field in data:
#             setattr(material, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Material updated", "material": material.to_dict()}), 200


# @inventory_bp.route("/materials/<int:material_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_material(material_id):
#     material = RawMaterial.query.get_or_404(material_id)
#     db.session.delete(material)
#     db.session.commit()
#     return jsonify({"message": "Material deleted"}), 200


# @inventory_bp.route("/materials/<int:material_id>/inventory", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def material_inventory(material_id):
#     inv = get_or_create_inventory(material_id)
#     return jsonify({"inventory": inv.to_dict()}), 200


# # ─── PURCHASES ───────────────────────────────────────────────────────────────

# @inventory_bp.route("/purchases", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_purchases():
#     purchases = Purchase.query.order_by(Purchase.purchased_at.desc()).all()
#     return jsonify({"purchases": [p.to_dict() for p in purchases]}), 200


# @inventory_bp.route("/purchases", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_purchase():
#     from flask_jwt_extended import get_jwt_identity
#     data = request.get_json()
#     quantity = float(data["quantity"])
#     unit_price = float(data["unit_price"])
#     purchase = Purchase(
#         supplier_id=data.get("supplier_id"),
#         material_id=data["material_id"],
#         quantity=quantity,
#         unit_price=unit_price,
#         total_amount=quantity * unit_price,
#         purchased_by=int(get_jwt_identity()),
#         notes=data.get("notes")
#     )
#     db.session.add(purchase)
#     # Update inventory
#     inv = get_or_create_inventory(data["material_id"])
#     inv.quantity = float(inv.quantity) + quantity
#     db.session.commit()
#     return jsonify({"message": "Purchase recorded", "purchase": purchase.to_dict()}), 201


# @inventory_bp.route("/purchases/<int:purchase_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_purchase(purchase_id):
#     purchase = Purchase.query.get_or_404(purchase_id)
#     return jsonify({"purchase": purchase.to_dict()}), 200


# @inventory_bp.route("/purchases/report", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def purchase_report():
#     from sqlalchemy import func
#     total = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
#     count = Purchase.query.count()
#     return jsonify({"total_purchases": count, "total_amount": float(total)}), 200


# @inventory_bp.route("/purchases/supplier/<int:supplier_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def purchases_by_supplier(supplier_id):
#     purchases = Purchase.query.filter_by(supplier_id=supplier_id).all()
#     return jsonify({"purchases": [p.to_dict() for p in purchases]}), 200


# @inventory_bp.route("/purchases/dashboard", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def purchases_dashboard():
#     from datetime import datetime, timedelta
#     from sqlalchemy import func

#     today = datetime.utcnow().date()
#     month_start = today.replace(day=1)
#     since_30 = datetime.utcnow() - timedelta(days=30)

#     total_amount = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
#     total_count = Purchase.query.count()

#     today_total = db.session.query(func.sum(Purchase.total_amount)).filter(
#         func.date(Purchase.purchased_at) == today
#     ).scalar() or 0

#     month_total = db.session.query(func.sum(Purchase.total_amount)).filter(
#         Purchase.purchased_at >= month_start
#     ).scalar() or 0

#     supplier_rows = db.session.query(
#         Purchase.supplier_id,
#         func.count(Purchase.id).label("orders"),
#         func.sum(Purchase.total_amount).label("total")
#     ).group_by(Purchase.supplier_id).order_by(func.sum(Purchase.total_amount).desc()).limit(5).all()

#     top_suppliers = []
#     for r in supplier_rows:
#         supplier = Supplier.query.get(r[0]) if r[0] else None
#         top_suppliers.append({
#             "supplier_id": r[0],
#             "supplier_name": supplier.name if supplier else "Unknown",
#             "orders": r[1],
#             "total": float(r[2] or 0)
#         })

#     chart_rows = db.session.query(
#         func.date(Purchase.purchased_at).label("date"),
#         func.sum(Purchase.total_amount).label("total")
#     ).filter(Purchase.purchased_at >= since_30).group_by(
#         func.date(Purchase.purchased_at)
#     ).order_by(func.date(Purchase.purchased_at)).all()

#     recent = Purchase.query.order_by(Purchase.purchased_at.desc()).limit(5).all()

#     return jsonify({
#         "total_amount": float(total_amount),
#         "total_count": total_count,
#         "today_total": float(today_total),
#         "month_total": float(month_total),
#         "low_stock_count": len(get_low_stock()),
#         "out_of_stock_count": len(get_out_of_stock()),
#         "top_suppliers": top_suppliers,
#         "chart": [{"date": str(r[0]), "total": float(r[1] or 0)} for r in chart_rows],
#         "recent_purchases": [p.to_dict() for p in recent]
#     }), 200


# # ─── SUPPLIERS ───────────────────────────────────────────────────────────────

# @inventory_bp.route("/suppliers", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_suppliers():
#     suppliers = Supplier.query.all()
#     return jsonify({"suppliers": [s.to_dict() for s in suppliers]}), 200


# @inventory_bp.route("/suppliers/<int:supplier_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_supplier(supplier_id):
#     supplier = Supplier.query.get_or_404(supplier_id)
#     return jsonify({"supplier": supplier.to_dict()}), 200


# @inventory_bp.route("/suppliers", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_supplier():
#     data = request.get_json()
#     supplier = Supplier(**{k: v for k, v in data.items() if k in ["name", "contact_name", "phone", "email", "address"]})
#     db.session.add(supplier)
#     db.session.commit()
#     return jsonify({"message": "Supplier created", "supplier": supplier.to_dict()}), 201


# @inventory_bp.route("/suppliers/<int:supplier_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_supplier(supplier_id):
#     supplier = Supplier.query.get_or_404(supplier_id)
#     data = request.get_json()
#     for field in ["name", "contact_name", "phone", "email", "address", "is_active"]:
#         if field in data:
#             setattr(supplier, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Supplier updated", "supplier": supplier.to_dict()}), 200


# @inventory_bp.route("/suppliers/<int:supplier_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_supplier(supplier_id):
#     supplier = Supplier.query.get_or_404(supplier_id)
#     db.session.delete(supplier)
#     db.session.commit()
#     return jsonify({"message": "Supplier deleted"}), 200


# @inventory_bp.route("/suppliers/<int:supplier_id>/report", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def supplier_report(supplier_id):
#     from sqlalchemy import func
#     total = db.session.query(func.sum(Purchase.total_amount)).filter_by(supplier_id=supplier_id).scalar() or 0
#     count = Purchase.query.filter_by(supplier_id=supplier_id).count()
#     return jsonify({"supplier_id": supplier_id, "total_purchases": count, "total_amount": float(total)}), 200

# # PUT /purchases/:id
@inventory_bp.route("/purchases/<int:purchase_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    data = request.get_json(silent=True) or {}

    old_quantity = float(purchase.quantity or 0)

    try:
        new_quantity = float(data.get("quantity", purchase.quantity))
        new_unit_price = float(data.get("unit_price", purchase.unit_price))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid quantity or unit price"}), 400

    if new_quantity <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400
    if new_unit_price < 0:
        return jsonify({"error": "Unit price cannot be negative"}), 400

    inventory = get_or_create_inventory(purchase.material_id)
    adjusted_quantity = (
        float(inventory.quantity or 0)
        - old_quantity
        + new_quantity
    )
    if adjusted_quantity < 0:
        return jsonify({
            "error": "Purchase update would make inventory negative"
        }), 400

    supplier_id = data.get("supplier_id", purchase.supplier_id)
    if supplier_id:
        try:
            supplier_id = int(supplier_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid supplier"}), 400
        if not Supplier.query.get(supplier_id):
            return jsonify({"error": "Supplier not found"}), 404

    inventory.quantity = adjusted_quantity
    purchase.supplier_id = supplier_id
    purchase.quantity = new_quantity
    purchase.unit_price = new_unit_price
    purchase.total_amount = new_quantity * new_unit_price
    purchase.notes = data.get("notes", purchase.notes)
    purchase.reference = data.get("reference", purchase.reference)
    purchase.payment_source = "OTHER"

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({
        "message": "Purchase updated successfully",
        "purchase": purchase.to_dict(),
    }), 200


@inventory_bp.route("/purchases/<int:purchase_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    inventory = get_or_create_inventory(purchase.material_id)

    remaining = (
        float(inventory.quantity or 0)
        - float(purchase.quantity or 0)
    )
    if remaining < 0:
        return jsonify({
            "error": "Cannot delete this purchase because current inventory is lower than the purchase quantity"
        }), 400

    inventory.quantity = remaining

    try:
        db.session.delete(purchase)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({
        "message": "Purchase deleted successfully"
    }), 200

