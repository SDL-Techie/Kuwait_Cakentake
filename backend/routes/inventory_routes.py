# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required
# from extensions import db
# from models.inventory import Inventory, RawMaterial, Purchase, Supplier, InventoryConsumption
# from services.inventory_service import get_or_create_inventory, consume_material, get_low_stock, get_out_of_stock
# from middleware.role import role_required

# inventory_bp = Blueprint("inventory", __name__)

# # # PUT /purchases/:id
# @inventory_bp.route("/purchases/<int:purchase_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_purchase(purchase_id):
#     purchase = Purchase.query.get_or_404(purchase_id)
#     data = request.get_json(silent=True) or {}

#     old_quantity = float(purchase.quantity or 0)

#     try:
#         new_quantity = float(data.get("quantity", purchase.quantity))
#         new_unit_price = float(data.get("unit_price", purchase.unit_price))
#     except (TypeError, ValueError):
#         return jsonify({"error": "Invalid quantity or unit price"}), 400

#     if new_quantity <= 0:
#         return jsonify({"error": "Quantity must be greater than 0"}), 400
#     if new_unit_price < 0:
#         return jsonify({"error": "Unit price cannot be negative"}), 400

#     inventory = get_or_create_inventory(purchase.material_id)
#     adjusted_quantity = (
#         float(inventory.quantity or 0)
#         - old_quantity
#         + new_quantity
#     )
#     if adjusted_quantity < 0:
#         return jsonify({
#             "error": "Purchase update would make inventory negative"
#         }), 400

#     supplier_id = data.get("supplier_id", purchase.supplier_id)
#     if supplier_id:
#         try:
#             supplier_id = int(supplier_id)
#         except (TypeError, ValueError):
#             return jsonify({"error": "Invalid supplier"}), 400
#         if not Supplier.query.get(supplier_id):
#             return jsonify({"error": "Supplier not found"}), 404

#     inventory.quantity = adjusted_quantity
#     purchase.supplier_id = supplier_id
#     purchase.quantity = new_quantity
#     purchase.unit_price = new_unit_price
#     purchase.total_amount = new_quantity * new_unit_price
#     purchase.notes = data.get("notes", purchase.notes)
#     purchase.reference = data.get("reference", purchase.reference)
#     purchase.payment_source = "OTHER"

#     try:
#         db.session.commit()
#     except Exception:
#         db.session.rollback()
#         raise

#     return jsonify({
#         "message": "Purchase updated successfully",
#         "purchase": purchase.to_dict(),
#     }), 200


# @inventory_bp.route("/purchases/<int:purchase_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_purchase(purchase_id):
#     purchase = Purchase.query.get_or_404(purchase_id)
#     inventory = get_or_create_inventory(purchase.material_id)

#     remaining = (
#         float(inventory.quantity or 0)
#         - float(purchase.quantity or 0)
#     )
#     if remaining < 0:
#         return jsonify({
#             "error": "Cannot delete this purchase because current inventory is lower than the purchase quantity"
#         }), 400

#     inventory.quantity = remaining

#     try:
#         db.session.delete(purchase)
#         db.session.commit()
#     except Exception:
#         db.session.rollback()
#         raise

#     return jsonify({
#         "message": "Purchase deleted successfully"
#     }), 200



from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.inventory import (
    Inventory, RawMaterial, Purchase, Supplier, InventoryConsumption,
    VALID_CATEGORIES,
)
from services.inventory_service import (
    get_or_create_inventory, consume_material, get_low_stock, get_out_of_stock,
)
from middleware.role import role_required

inventory_bp = Blueprint("inventory", __name__)

VALID_PAYMENT_SOURCES = ("CASH", "BANK", "OTHER")


# ═══════════════════════════════════════════════════════════════════════════
# RAW MATERIALS
# ═══════════════════════════════════════════════════════════════════════════

# GET /materials
@inventory_bp.route("/materials", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def list_materials():
    materials = RawMaterial.query.order_by(RawMaterial.name).all()
    return jsonify({"materials": [m.to_dict() for m in materials]}), 200


# POST /materials
@inventory_bp.route("/materials", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_material():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    unit = (data.get("unit") or "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not unit:
        return jsonify({"error": "Unit is required"}), 400

    category = data.get("category", "Dry Staples")
    if category not in VALID_CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    try:
        cost_per_unit = float(data.get("cost_per_unit", 0) or 0)
        opening_quantity = float(data.get("opening_quantity", 0) or 0)
        low_stock_threshold = float(data.get("low_stock_threshold", 10) or 10)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numeric field"}), 400

    if cost_per_unit < 0 or opening_quantity < 0 or low_stock_threshold < 0:
        return jsonify({"error": "Numeric fields cannot be negative"}), 400

    supplier_id = data.get("supplier_id")
    if supplier_id:
        try:
            supplier_id = int(supplier_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid supplier"}), 400
        if not Supplier.query.get(supplier_id):
            return jsonify({"error": "Supplier not found"}), 404

    material = RawMaterial(
        name=name,
        unit=unit,
        cost_per_unit=cost_per_unit,
        category=category,
        supplier_id=supplier_id,
    )
    db.session.add(material)
    db.session.flush()  # get material.id before commit

    inventory = Inventory(
        material_id=material.id,
        quantity=opening_quantity,
        low_stock_threshold=low_stock_threshold,
    )
    db.session.add(inventory)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Material created successfully", "material": material.to_dict()}), 201


# PUT /materials/:id
@inventory_bp.route("/materials/<int:material_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_material(material_id):
    material = RawMaterial.query.get_or_404(material_id)
    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name cannot be empty"}), 400
        material.name = name

    if "unit" in data:
        unit = (data.get("unit") or "").strip()
        if not unit:
            return jsonify({"error": "Unit cannot be empty"}), 400
        material.unit = unit

    if "cost_per_unit" in data:
        try:
            cost_per_unit = float(data.get("cost_per_unit"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid cost_per_unit"}), 400
        if cost_per_unit < 0:
            return jsonify({"error": "cost_per_unit cannot be negative"}), 400
        material.cost_per_unit = cost_per_unit

    if "category" in data:
        category = data.get("category")
        if category not in VALID_CATEGORIES:
            return jsonify({"error": "Invalid category"}), 400
        material.category = category

    if "supplier_id" in data:
        supplier_id = data.get("supplier_id")
        if supplier_id:
            try:
                supplier_id = int(supplier_id)
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid supplier"}), 400
            if not Supplier.query.get(supplier_id):
                return jsonify({"error": "Supplier not found"}), 404
        material.supplier_id = supplier_id

    # Optional convenience: allow updating the reorder threshold from this endpoint too
    if "low_stock_threshold" in data:
        inventory = get_or_create_inventory(material.id)
        try:
            threshold = float(data.get("low_stock_threshold"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid low_stock_threshold"}), 400
        if threshold < 0:
            return jsonify({"error": "low_stock_threshold cannot be negative"}), 400
        inventory.low_stock_threshold = threshold

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Material updated successfully", "material": material.to_dict()}), 200


# DELETE /materials/:id
@inventory_bp.route("/materials/<int:material_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_material(material_id):
    material = RawMaterial.query.get_or_404(material_id)

    has_purchases = Purchase.query.filter_by(material_id=material_id).first() is not None
    has_consumption = InventoryConsumption.query.filter_by(material_id=material_id).first() is not None
    if has_purchases or has_consumption:
        return jsonify({
            "error": "Cannot delete a material with existing purchase or consumption history"
        }), 409

    if material.inventory:
        db.session.delete(material.inventory)
    db.session.delete(material)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Material deleted successfully"}), 200


# GET /materials/:id/inventory
@inventory_bp.route("/materials/<int:material_id>/inventory", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_material_inventory(material_id):
    RawMaterial.query.get_or_404(material_id)
    inventory = get_or_create_inventory(material_id)
    return jsonify({"inventory": inventory.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════════════════
# INVENTORY
# ═══════════════════════════════════════════════════════════════════════════

# GET /inventory
@inventory_bp.route("/inventory", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def list_inventory():
    items = Inventory.query.all()
    return jsonify({"inventory": [i.to_dict() for i in items]}), 200


# GET /inventory/low-stock
@inventory_bp.route("/inventory/low-stock", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def low_stock():
    items = get_low_stock()
    return jsonify({"inventory": [i.to_dict() for i in items]}), 200


# GET /inventory/out-of-stock
@inventory_bp.route("/inventory/out-of-stock", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def out_of_stock():
    items = get_out_of_stock()
    return jsonify({"inventory": [i.to_dict() for i in items]}), 200


# PUT /inventory/:material_id
@inventory_bp.route("/inventory/<int:material_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_inventory_route(material_id):
    RawMaterial.query.get_or_404(material_id)
    inventory = get_or_create_inventory(material_id)
    data = request.get_json(silent=True) or {}

    if "quantity" in data:
        try:
            quantity = float(data.get("quantity"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid quantity"}), 400
        if quantity < 0:
            return jsonify({"error": "Quantity cannot be negative"}), 400
        inventory.quantity = quantity

    if "low_stock_threshold" in data:
        try:
            threshold = float(data.get("low_stock_threshold"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid low_stock_threshold"}), 400
        if threshold < 0:
            return jsonify({"error": "low_stock_threshold cannot be negative"}), 400
        inventory.low_stock_threshold = threshold

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Inventory updated successfully", "inventory": inventory.to_dict()}), 200


# POST /inventory/consume
# @inventory_bp.route("/inventory/consume", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
# def consume_material_route():
#     data = request.get_json(silent=True) or {}

#     material_id = data.get("material_id")
#     if not material_id:
#         return jsonify({"error": "material_id is required"}), 400
#     try:
#         material_id = int(material_id)
#         quantity = float(data.get("quantity"))
#     except (TypeError, ValueError):
#         return jsonify({"error": "Invalid material_id or quantity"}), 400

#     if quantity <= 0:
#         return jsonify({"error": "Quantity must be greater than 0"}), 400

#     RawMaterial.query.get_or_404(material_id)

#     try:
#         remaining = consume_material(
#             material_id=material_id,
#             quantity=quantity,
#             order_id=data.get("order_id"),
#             notes=data.get("notes"),
#         )
#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400

#     return jsonify({"success": True, "remaining": remaining}), 200



# POST /inventory/consume
@inventory_bp.route("/inventory/consume", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def consume_material_route():
    data = request.get_json(silent=True) or {}

    material_id = data.get("material_id")
    if not material_id:
        return jsonify({"error": "material_id is required"}), 400
    try:
        material_id = int(material_id)
        quantity_used = float(data.get("quantity"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid material_id or quantity"}), 400

    if quantity_used <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400

    RawMaterial.query.get_or_404(material_id)

    result = consume_material(
        material_id=material_id,
        quantity_used=quantity_used,
        order_id=data.get("order_id"),
        notes=data.get("notes"),
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify(result), 200

# GET /inventory/consumption-report
@inventory_bp.route("/inventory/consumption-report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def consumption_report():
    limit = request.args.get("limit", 100, type=int)
    logs = (
        InventoryConsumption.query.order_by(InventoryConsumption.consumed_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({"consumption": [c.to_dict() for c in logs]}), 200


# GET /inventory/material-usage
@inventory_bp.route("/inventory/material-usage", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def material_usage():
    rows = (
        db.session.query(
            InventoryConsumption.material_id,
            db.func.sum(InventoryConsumption.quantity_used).label("total_used"),
        )
        .group_by(InventoryConsumption.material_id)
        .all()
    )
    return jsonify({
        "usage": [{"material_id": r.material_id, "total_used": float(r.total_used)} for r in rows]
    }), 200


# ═══════════════════════════════════════════════════════════════════════════
# SUPPLIERS
# ═══════════════════════════════════════════════════════════════════════════

# GET /suppliers
@inventory_bp.route("/suppliers", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def list_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name).all()
    return jsonify({"suppliers": [s.to_dict() for s in suppliers]}), 200


# POST /suppliers   <-- this was the missing route causing your 405
@inventory_bp.route("/suppliers", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_supplier():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    supplier = Supplier(
        name=name,
        contact_name=data.get("contact_name"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address"),
        is_active=data.get("is_active", True),
    )
    db.session.add(supplier)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Supplier created successfully", "supplier": supplier.to_dict()}), 201


# GET /suppliers/:id
@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_supplier(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)
    return jsonify({"supplier": supplier.to_dict()}), 200


# PUT /suppliers/:id
@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_supplier(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)
    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name cannot be empty"}), 400
        supplier.name = name

    for field in ("contact_name", "phone", "email", "address"):
        if field in data:
            setattr(supplier, field, data.get(field))

    if "is_active" in data:
        supplier.is_active = bool(data.get("is_active"))

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Supplier updated successfully", "supplier": supplier.to_dict()}), 200


# DELETE /suppliers/:id  (soft-delete if it has history)
@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_supplier(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)

    has_purchases = Purchase.query.filter_by(supplier_id=supplier_id).first() is not None
    has_materials = RawMaterial.query.filter_by(supplier_id=supplier_id).first() is not None

    if has_purchases or has_materials:
        supplier.is_active = False
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise
        return jsonify({"message": "Supplier deactivated (has history)", "supplier": supplier.to_dict()}), 200

    db.session.delete(supplier)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Supplier deleted successfully"}), 200


# GET /suppliers/:id/report
@inventory_bp.route("/suppliers/<int:supplier_id>/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def supplier_report(supplier_id):
    supplier = Supplier.query.get_or_404(supplier_id)
    purchases = Purchase.query.filter_by(supplier_id=supplier_id).all()
    total_amount = sum(float(p.total_amount) for p in purchases)

    return jsonify({
        "supplier_id": supplier_id,
        "supplier": supplier.to_dict(),
        "total_purchases": len(purchases),
        "total_amount": total_amount,
    }), 200


# ═══════════════════════════════════════════════════════════════════════════
# PURCHASES
# ═══════════════════════════════════════════════════════════════════════════

# GET /purchases
@inventory_bp.route("/purchases", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def list_purchases():
    purchases = Purchase.query.order_by(Purchase.purchased_at.desc()).all()
    return jsonify({"purchases": [p.to_dict() for p in purchases]}), 200


# POST /purchases
@inventory_bp.route("/purchases", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_purchase():
    data = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()

    material_id = data.get("material_id")
    if not material_id:
        return jsonify({"error": "material_id is required"}), 400
    try:
        material_id = int(material_id)
        quantity = float(data.get("quantity"))
        unit_price = float(data.get("unit_price"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid material_id, quantity, or unit_price"}), 400

    if quantity <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400
    if unit_price < 0:
        return jsonify({"error": "Unit price cannot be negative"}), 400

    RawMaterial.query.get_or_404(material_id)

    supplier_id = data.get("supplier_id")
    if supplier_id:
        try:
            supplier_id = int(supplier_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid supplier"}), 400
        if not Supplier.query.get(supplier_id):
            return jsonify({"error": "Supplier not found"}), 404

    payment_source = data.get("payment_source", "OTHER")
    if payment_source not in VALID_PAYMENT_SOURCES:
        return jsonify({"error": "Invalid payment source"}), 400

    purchase = Purchase(
        supplier_id=supplier_id,
        material_id=material_id,
        quantity=quantity,
        unit_price=unit_price,
        total_amount=quantity * unit_price,
        payment_source=payment_source,
        reference=data.get("reference"),
        notes=data.get("notes"),
        purchased_by=user_id,
    )
    db.session.add(purchase)

    # Increase inventory on purchase
    inventory = get_or_create_inventory(material_id)
    inventory.quantity = float(inventory.quantity or 0) + quantity

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({"message": "Purchase recorded successfully", "purchase": purchase.to_dict()}), 201


# GET /purchases/:id
@inventory_bp.route("/purchases/<int:purchase_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    return jsonify({"purchase": purchase.to_dict()}), 200


# PUT /purchases/:id
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

    payment_source = data.get("payment_source", purchase.payment_source)
    if payment_source not in VALID_PAYMENT_SOURCES:
        return jsonify({"error": "Invalid payment source"}), 400

    inventory.quantity = adjusted_quantity
    purchase.supplier_id = supplier_id
    purchase.quantity = new_quantity
    purchase.unit_price = new_unit_price
    purchase.total_amount = new_quantity * new_unit_price
    purchase.notes = data.get("notes", purchase.notes)
    purchase.reference = data.get("reference", purchase.reference)
    purchase.payment_source = payment_source

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return jsonify({
        "message": "Purchase updated successfully",
        "purchase": purchase.to_dict(),
    }), 200


# DELETE /purchases/:id
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

    return jsonify({"message": "Purchase deleted successfully"}), 200


# GET /purchases/report
@inventory_bp.route("/purchases/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def purchase_report():
    purchases = Purchase.query.all()
    return jsonify({
        "total_purchases": len(purchases),
        "total_amount": sum(float(p.total_amount) for p in purchases),
    }), 200


# GET /purchases/supplier/:supplier_id
@inventory_bp.route("/purchases/supplier/<int:supplier_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def purchases_by_supplier(supplier_id):
    Supplier.query.get_or_404(supplier_id)
    purchases = Purchase.query.filter_by(supplier_id=supplier_id).order_by(Purchase.purchased_at.desc()).all()
    return jsonify({"purchases": [p.to_dict() for p in purchases]}), 200


# GET /purchases/dashboard
@inventory_bp.route("/purchases/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def purchases_dashboard():
    from datetime import date

    purchases = Purchase.query.order_by(Purchase.purchased_at.desc()).all()
    today = date.today()

    total_amount = sum(float(p.total_amount) for p in purchases)
    today_total = sum(
        float(p.total_amount) for p in purchases
        if p.purchased_at and p.purchased_at.date() == today
    )
    month_total = sum(
        float(p.total_amount) for p in purchases
        if p.purchased_at and p.purchased_at.year == today.year and p.purchased_at.month == today.month
    )

    low_stock_count = len(get_low_stock())
    out_of_stock_count = len(get_out_of_stock())

    supplier_totals = {}
    for p in purchases:
        key = p.supplier_id
        name = p.supplier.name if p.supplier else "Unknown"
        entry = supplier_totals.setdefault(key, {"supplier_id": key, "supplier_name": name, "orders": 0, "total": 0.0})
        entry["orders"] += 1
        entry["total"] += float(p.total_amount)
    top_suppliers = sorted(supplier_totals.values(), key=lambda x: x["total"], reverse=True)[:5]

    chart_map = {}
    for p in purchases:
        if not p.purchased_at:
            continue
        day = p.purchased_at.date().isoformat()
        chart_map[day] = chart_map.get(day, 0.0) + float(p.total_amount)
    chart = [{"date": d, "total": t} for d, t in sorted(chart_map.items())]

    return jsonify({
        "total_amount": total_amount,
        "total_count": len(purchases),
        "today_total": today_total,
        "month_total": month_total,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "top_suppliers": top_suppliers,
        "chart": chart,
        "recent_purchases": [p.to_dict() for p in purchases[:10]],
    }), 200

