# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required
# from extensions import db
# from models.inventory import Inventory, RawMaterial, Purchase, Supplier, InventoryConsumption
# from services.inventory_service import get_or_create_inventory, consume_material, get_low_stock, get_out_of_stock
# from middleware.role import role_required

# inventory_bp = Blueprint("inventory", __name__)


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
# @inventory_bp.route("/purchases/<int:purchase_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_purchase(purchase_id):
#     purchase = Purchase.query.get_or_404(purchase_id)
#     data = request.get_json()

#     # If quantity or unit_price changes, reverse old inventory and apply new
#     old_qty = float(purchase.quantity)
#     new_qty = float(data.get("quantity", old_qty))
#     qty_diff = new_qty - old_qty

#     for field in ["supplier_id", "material_id", "notes"]:
#         if field in data:
#             setattr(purchase, field, data[field])

#     if "quantity" in data or "unit_price" in data:
#         new_unit_price = float(data.get("unit_price", purchase.unit_price))
#         purchase.quantity     = new_qty
#         purchase.unit_price   = new_unit_price
#         purchase.total_amount = new_qty * new_unit_price

#         # Adjust inventory
#         if qty_diff != 0:
#             inv = get_or_create_inventory(purchase.material_id)
#             inv.quantity = float(inv.quantity) + qty_diff

#     db.session.commit()
#     return jsonify({"message": "Purchase updated", "purchase": purchase.to_dict()}), 200


# # DELETE /purchases/:id
# @inventory_bp.route("/purchases/<int:purchase_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN"])
# def delete_purchase(purchase_id):
#     purchase = Purchase.query.get_or_404(purchase_id)

#     # Reverse inventory when deleting purchase
#     inv = get_or_create_inventory(purchase.material_id)
#     inv.quantity = max(0, float(inv.quantity) - float(purchase.quantity))

#     db.session.delete(purchase)
#     db.session.commit()
#     return jsonify({"message": "Purchase deleted and inventory reversed"}), 200



from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.inventory import Inventory, RawMaterial, Purchase, Supplier, InventoryConsumption
from services.inventory_service import get_or_create_inventory, consume_material, get_low_stock, get_out_of_stock
from middleware.role import role_required
from models.misc import BankTransaction
from services.cash_service import add_transaction

inventory_bp = Blueprint("inventory", __name__)


# ─── INVENTORY ───────────────────────────────────────────────────────────────

@inventory_bp.route("/inventory", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER","KITCHEN_STAFF"])
def get_inventory():
    items = Inventory.query.all()
    return jsonify({"inventory": [i.to_dict() for i in items]}), 200


@inventory_bp.route("/inventory/low-stock", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def low_stock():
    items = get_low_stock()
    return jsonify({"inventory": [i.to_dict() for i in items]}), 200


@inventory_bp.route("/inventory/out-of-stock", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def out_of_stock():
    items = get_out_of_stock()
    return jsonify({"inventory": [i.to_dict() for i in items]}), 200


@inventory_bp.route("/inventory/<int:material_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_inventory(material_id):
    inv = get_or_create_inventory(material_id)
    data = request.get_json()
    if "quantity" in data:
        inv.quantity = data["quantity"]
    if "low_stock_threshold" in data:
        inv.low_stock_threshold = data["low_stock_threshold"]
    db.session.commit()
    return jsonify({"message": "Inventory updated", "inventory": inv.to_dict()}), 200


@inventory_bp.route("/inventory/consume", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def consume():
    data = request.get_json()
    result = consume_material(
        data["material_id"],
        data["quantity"],
        data.get("order_id"),
        data.get("notes")
    )
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200


@inventory_bp.route("/inventory/consumption-report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def consumption_report():
    logs = InventoryConsumption.query.order_by(InventoryConsumption.consumed_at.desc()).limit(100).all()
    return jsonify({"consumption": [l.to_dict() for l in logs]}), 200


@inventory_bp.route("/inventory/material-usage", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def material_usage():
    from sqlalchemy import func
    results = db.session.query(
        InventoryConsumption.material_id,
        func.sum(InventoryConsumption.quantity_used).label("total_used")
    ).group_by(InventoryConsumption.material_id).all()
    return jsonify({"usage": [{"material_id": r[0], "total_used": float(r[1])} for r in results]}), 200


# ─── RAW MATERIALS ───────────────────────────────────────────────────────────

@inventory_bp.route("/materials", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_materials():
    materials = RawMaterial.query.all()
    return jsonify({"materials": [m.to_dict() for m in materials]}), 200


@inventory_bp.route("/materials", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_material():
    data = request.get_json()
    material = RawMaterial(
        name=data["name"],
        unit=data["unit"],
        cost_per_unit=data.get("cost_per_unit", 0),
        supplier_id=data.get("supplier_id")
    )
    db.session.add(material)
    db.session.commit()
    return jsonify({"message": "Material created", "material": material.to_dict()}), 201


@inventory_bp.route("/materials/<int:material_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_material(material_id):
    material = RawMaterial.query.get_or_404(material_id)
    data = request.get_json()
    for field in ["name", "unit", "cost_per_unit", "supplier_id"]:
        if field in data:
            setattr(material, field, data[field])
    db.session.commit()
    return jsonify({"message": "Material updated", "material": material.to_dict()}), 200


@inventory_bp.route("/materials/<int:material_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_material(material_id):
    material = RawMaterial.query.get_or_404(material_id)
    db.session.delete(material)
    db.session.commit()
    return jsonify({"message": "Material deleted"}), 200


@inventory_bp.route("/materials/<int:material_id>/inventory", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def material_inventory(material_id):
    inv = get_or_create_inventory(material_id)
    return jsonify({"inventory": inv.to_dict()}), 200


# ─── PURCHASES ───────────────────────────────────────────────────────────────

@inventory_bp.route("/purchases", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_purchases():
    purchases = Purchase.query.order_by(Purchase.purchased_at.desc()).all()
    return jsonify({"purchases": [p.to_dict() for p in purchases]}), 200

def _bank_balance():
    last = BankTransaction.query.order_by(BankTransaction.id.desc()).first()
    return float(last.balance_after) if last else 0.0

@inventory_bp.route("/purchases", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_purchase():
    from flask_jwt_extended import get_jwt_identity
    from services.cash_service import add_transaction
    from models.misc import BankTransaction

    data = request.get_json()

    quantity = float(data["quantity"])
    unit_price = float(data["unit_price"])
    total_amount = quantity * unit_price

    payment_source = data.get("payment_source", "CASH")
    reference = data.get("reference")

    purchase = Purchase(
        supplier_id=data.get("supplier_id"),
        material_id=data["material_id"],
        quantity=quantity,
        unit_price=unit_price,
        total_amount=total_amount,
        purchased_by=int(get_jwt_identity()),
        notes=data.get("notes"),
        payment_source=payment_source,
        reference=reference
    )

    db.session.add(purchase)

    # Update Inventory
    inv = get_or_create_inventory(data["material_id"])
    inv.quantity = float(inv.quantity) + quantity

    # CASH PAYMENT
    if payment_source == "CASH":
        result = add_transaction(
            "WITHDRAW",
            total_amount,
            notes=f"Purchase - Material #{data['material_id']}",
            performed_by=int(get_jwt_identity())
        )

        if "error" in result:
            db.session.rollback()
            return jsonify(result), 400

    # BANK PAYMENT
    elif payment_source == "BANK":
        current = _bank_balance()

        if total_amount > current:
            db.session.rollback()
            return jsonify({"error": "Insufficient bank balance"}), 400

        txn = BankTransaction(
            transaction_type="WITHDRAW",
            amount=total_amount,
            balance_after=current - total_amount,
            reference=reference,
            notes=f"Purchase - Material #{data['material_id']}",
            performed_by=int(get_jwt_identity())
        )

        db.session.add(txn)

    db.session.commit()

    return jsonify({
        "message": "Purchase recorded",
        "purchase": purchase.to_dict()
    }), 201

@inventory_bp.route("/purchases/<int:purchase_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    return jsonify({"purchase": purchase.to_dict()}), 200


@inventory_bp.route("/purchases/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def purchase_report():
    from sqlalchemy import func
    total = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
    count = Purchase.query.count()
    return jsonify({"total_purchases": count, "total_amount": float(total)}), 200


@inventory_bp.route("/purchases/supplier/<int:supplier_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def purchases_by_supplier(supplier_id):
    purchases = Purchase.query.filter_by(supplier_id=supplier_id).all()
    return jsonify({"purchases": [p.to_dict() for p in purchases]}), 200


@inventory_bp.route("/purchases/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def purchases_dashboard():
    from datetime import datetime, timedelta
    from sqlalchemy import func

    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    since_30 = datetime.utcnow() - timedelta(days=30)

    total_amount = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
    total_count = Purchase.query.count()

    today_total = db.session.query(func.sum(Purchase.total_amount)).filter(
        func.date(Purchase.purchased_at) == today
    ).scalar() or 0

    month_total = db.session.query(func.sum(Purchase.total_amount)).filter(
        Purchase.purchased_at >= month_start
    ).scalar() or 0

    supplier_rows = db.session.query(
        Purchase.supplier_id,
        func.count(Purchase.id).label("orders"),
        func.sum(Purchase.total_amount).label("total")
    ).group_by(Purchase.supplier_id).order_by(func.sum(Purchase.total_amount).desc()).limit(5).all()

    top_suppliers = []
    for r in supplier_rows:
        supplier = Supplier.query.get(r[0]) if r[0] else None
        top_suppliers.append({
            "supplier_id": r[0],
            "supplier_name": supplier.name if supplier else "Unknown",
            "orders": r[1],
            "total": float(r[2] or 0)
        })

    chart_rows = db.session.query(
        func.date(Purchase.purchased_at).label("date"),
        func.sum(Purchase.total_amount).label("total")
    ).filter(Purchase.purchased_at >= since_30).group_by(
        func.date(Purchase.purchased_at)
    ).order_by(func.date(Purchase.purchased_at)).all()

    recent = Purchase.query.order_by(Purchase.purchased_at.desc()).limit(5).all()

    return jsonify({
        "total_amount": float(total_amount),
        "total_count": total_count,
        "today_total": float(today_total),
        "month_total": float(month_total),
        "low_stock_count": len(get_low_stock()),
        "out_of_stock_count": len(get_out_of_stock()),
        "top_suppliers": top_suppliers,
        "chart": [{"date": str(r[0]), "total": float(r[1] or 0)} for r in chart_rows],
        "recent_purchases": [p.to_dict() for p in recent]
    }), 200


# ─── SUPPLIERS ───────────────────────────────────────────────────────────────

@inventory_bp.route("/suppliers", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify({"suppliers": [s.to_dict() for s in suppliers]}), 200


@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_supplier(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)
    return jsonify({"supplier": supplier.to_dict()}), 200


@inventory_bp.route("/suppliers", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_supplier():
    data = request.get_json()
    supplier = Supplier(**{k: v for k, v in data.items() if k in ["name", "contact_name", "phone", "email", "address"]})
    db.session.add(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier created", "supplier": supplier.to_dict()}), 201


@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_supplier(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)
    data = request.get_json()
    for field in ["name", "contact_name", "phone", "email", "address", "is_active"]:
        if field in data:
            setattr(supplier, field, data[field])
    db.session.commit()
    return jsonify({"message": "Supplier updated", "supplier": supplier.to_dict()}), 200


@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_supplier(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)
    db.session.delete(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200


@inventory_bp.route("/suppliers/<int:supplier_id>/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def supplier_report(supplier_id):
    from sqlalchemy import func
    total = db.session.query(func.sum(Purchase.total_amount)).filter_by(supplier_id=supplier_id).scalar() or 0
    count = Purchase.query.filter_by(supplier_id=supplier_id).count()
    return jsonify({"supplier_id": supplier_id, "total_purchases": count, "total_amount": float(total)}), 200


# PUT /purchases/:id
@inventory_bp.route("/purchases/<int:purchase_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_purchase(purchase_id):
    from flask_jwt_extended import get_jwt_identity

    purchase = Purchase.query.get_or_404(purchase_id)
    data = request.get_json()

    # Old values
    old_qty = float(purchase.quantity)
    old_amount = float(purchase.total_amount)
    old_source = purchase.payment_source

    # New values
    new_qty = float(data.get("quantity", old_qty))
    new_unit_price = float(data.get("unit_price", purchase.unit_price))
    new_amount = new_qty * new_unit_price
    new_source = data.get("payment_source", old_source)

    # --------------------
    # Inventory Update
    # --------------------
    qty_diff = new_qty - old_qty

    if qty_diff != 0:
        inv = get_or_create_inventory(purchase.material_id)
        inv.quantity = float(inv.quantity) + qty_diff

    # --------------------
    # Rollback OLD payment
    # --------------------
    if old_source == "CASH":

        add_transaction(
            "DEPOSIT",
            old_amount,
            notes=f"Purchase Update Rollback #{purchase.id}",
            performed_by=int(get_jwt_identity())
        )

    elif old_source == "BANK":

        current = _bank_balance()

        db.session.add(
            BankTransaction(
                transaction_type="DEPOSIT",
                amount=old_amount,
                balance_after=current + old_amount,
                reference=purchase.reference,
                notes=f"Purchase Update Rollback #{purchase.id}",
                performed_by=int(get_jwt_identity())
            )
        )

    # --------------------
    # Apply NEW payment
    # --------------------
    if new_source == "CASH":

        result = add_transaction(
            "WITHDRAW",
            new_amount,
            notes=f"Purchase Update #{purchase.id}",
            performed_by=int(get_jwt_identity())
        )

        if "error" in result:
            db.session.rollback()
            return jsonify(result), 400

    elif new_source == "BANK":

        current = _bank_balance()

        if new_amount > current:
            db.session.rollback()
            return jsonify({"error": "Insufficient bank balance"}), 400

        db.session.add(
            BankTransaction(
                transaction_type="WITHDRAW",
                amount=new_amount,
                balance_after=current - new_amount,
                reference=data.get("reference"),
                notes=f"Purchase Update #{purchase.id}",
                performed_by=int(get_jwt_identity())
            )
        )

    # --------------------
    # Update Purchase
    # --------------------
    purchase.quantity = new_qty
    purchase.unit_price = new_unit_price
    purchase.total_amount = new_amount
    purchase.payment_source = new_source

    for field in ["supplier_id", "material_id", "notes", "reference"]:
        if field in data:
            setattr(purchase, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Purchase updated successfully",
        "purchase": purchase.to_dict()
    }), 200

# DELETE /purchases/:id
@inventory_bp.route("/purchases/<int:purchase_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_purchase(purchase_id):
    from flask_jwt_extended import get_jwt_identity

    purchase = Purchase.query.get_or_404(purchase_id)

    # --------------------
    # Reverse Inventory
    # --------------------
    inv = get_or_create_inventory(purchase.material_id)
    inv.quantity = max(
        0,
        float(inv.quantity) - float(purchase.quantity)
    )

    # --------------------
    # Refund Cash / Bank
    # --------------------
    if purchase.payment_source == "CASH":

        add_transaction(
            "DEPOSIT",
            float(purchase.total_amount),
            notes=f"Purchase Delete #{purchase.id}",
            performed_by=int(get_jwt_identity())
        )

    elif purchase.payment_source == "BANK":

        current = _bank_balance()

        db.session.add(
            BankTransaction(
                transaction_type="DEPOSIT",
                amount=float(purchase.total_amount),
                balance_after=current + float(purchase.total_amount),
                reference=purchase.reference,
                notes=f"Purchase Delete #{purchase.id}",
                performed_by=int(get_jwt_identity())
            )
        )

    db.session.delete(purchase)
    db.session.commit()

    return jsonify({
        "message": "Purchase deleted successfully"
    }), 200