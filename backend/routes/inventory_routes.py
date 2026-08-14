from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from extensions import db
from middleware.role import role_required
from models.inventory import (
    Inventory,
    InventoryConsumption,
    Purchase,
    RawMaterial,
    Supplier,
)
from services.inventory_service import (
    consume_material,
    get_low_stock,
    get_or_create_inventory,
    get_out_of_stock,
)

inventory_bp = Blueprint("inventory", __name__)
MANAGEMENT_ROLES = ["ADMIN", "SHOP_MANAGER"]


def _json():
    return request.get_json(silent=True) or {}


def _positive_number(value, label, allow_zero=False):
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{label} must be a number")
    if allow_zero:
        if number < 0:
            raise ValueError(f"{label} cannot be negative")
    elif number <= 0:
        raise ValueError(f"{label} must be greater than 0")
    return number


def _optional_int(value, label):
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid {label}")


def _validate_supplier(supplier_id):
    supplier_id = _optional_int(supplier_id, "supplier")
    if supplier_id is None:
        return None
    supplier = db.session.get(Supplier, supplier_id)
    if not supplier:
        raise LookupError("Supplier not found")
    return supplier_id


def _validate_material(material_id):
    material_id = _optional_int(material_id, "material")
    if material_id is None:
        raise ValueError("material_id is required")
    material = db.session.get(RawMaterial, material_id)
    if not material:
        raise LookupError("Material not found")
    return material


# ─── INVENTORY ───────────────────────────────────────────────────────────────

@inventory_bp.route("/inventory", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def get_inventory():
    items = Inventory.query.order_by(Inventory.updated_at.desc()).all()
    return jsonify({"inventory": [item.to_dict() for item in items]}), 200


@inventory_bp.route("/inventory/low-stock", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def low_stock():
    items = get_low_stock()
    return jsonify({"inventory": [item.to_dict() for item in items]}), 200


@inventory_bp.route("/inventory/out-of-stock", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def out_of_stock():
    items = get_out_of_stock()
    return jsonify({"inventory": [item.to_dict() for item in items]}), 200


@inventory_bp.route("/inventory/<int:material_id>", methods=["PUT"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def update_inventory(material_id):
    if not db.session.get(RawMaterial, material_id):
        return jsonify({"error": "Material not found"}), 404

    data = _json()
    inv = get_or_create_inventory(material_id)
    try:
        if "quantity" in data:
            inv.quantity = _positive_number(data["quantity"], "quantity", allow_zero=True)
        if "low_stock_threshold" in data:
            inv.low_stock_threshold = _positive_number(
                data["low_stock_threshold"], "low_stock_threshold", allow_zero=True
            )
        db.session.commit()
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400

    return jsonify({"message": "Inventory updated", "inventory": inv.to_dict()}), 200


@inventory_bp.route("/inventory/consume", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def consume():
    data = _json()
    try:
        material = _validate_material(data.get("material_id"))
        quantity = _positive_number(data.get("quantity"), "quantity")
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = consume_material(
        material.id,
        quantity,
        data.get("order_id"),
        data.get("notes"),
    )
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200


@inventory_bp.route("/inventory/consumption-report", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def consumption_report():
    limit = min(max(request.args.get("limit", default=100, type=int) or 100, 1), 500)
    logs = (
        InventoryConsumption.query
        .order_by(InventoryConsumption.consumed_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({"consumption": [log.to_dict() for log in logs]}), 200


@inventory_bp.route("/inventory/material-usage", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def material_usage():
    rows = (
        db.session.query(
            InventoryConsumption.material_id,
            func.sum(InventoryConsumption.quantity_used).label("total_used"),
        )
        .group_by(InventoryConsumption.material_id)
        .all()
    )
    return jsonify({
        "usage": [
            {"material_id": row[0], "total_used": float(row[1] or 0)}
            for row in rows
        ]
    }), 200


# ─── RAW MATERIALS ───────────────────────────────────────────────────────────

@inventory_bp.route("/materials", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def get_materials():
    materials = RawMaterial.query.order_by(RawMaterial.name.asc()).all()
    return jsonify({"materials": [material.to_dict() for material in materials]}), 200


@inventory_bp.route("/materials", methods=["POST"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def create_material():
    data = _json()
    name = str(data.get("name") or "").strip()
    unit = str(data.get("unit") or "").strip()
    if not name or not unit:
        return jsonify({"error": "name and unit are required"}), 400

    if RawMaterial.query.filter(func.lower(RawMaterial.name) == name.lower()).first():
        return jsonify({"error": "A material with this name already exists"}), 409

    try:
        supplier_id = _validate_supplier(data.get("supplier_id"))
        cost = _positive_number(data.get("cost_per_unit", 0), "cost_per_unit", allow_zero=True)
        threshold = _positive_number(data.get("low_stock_threshold", 10), "low_stock_threshold", allow_zero=True)
        opening_qty = _positive_number(data.get("opening_quantity", 0), "opening_quantity", allow_zero=True)
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    material = RawMaterial(
        name=name,
        unit=unit,
        cost_per_unit=cost,
        supplier_id=supplier_id,
    )
    db.session.add(material)
    db.session.flush()
    inv = Inventory(
        material_id=material.id,
        quantity=opening_qty,
        low_stock_threshold=threshold,
    )
    db.session.add(inv)
    db.session.commit()
    return jsonify({"message": "Material created", "material": material.to_dict()}), 201


@inventory_bp.route("/materials/<int:material_id>", methods=["PUT"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def update_material(material_id):
    material = db.session.get(RawMaterial, material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    data = _json()
    try:
        if "name" in data:
            name = str(data.get("name") or "").strip()
            if not name:
                raise ValueError("name cannot be empty")
            duplicate = RawMaterial.query.filter(
                func.lower(RawMaterial.name) == name.lower(),
                RawMaterial.id != material_id,
            ).first()
            if duplicate:
                return jsonify({"error": "A material with this name already exists"}), 409
            material.name = name
        if "unit" in data:
            unit = str(data.get("unit") or "").strip()
            if not unit:
                raise ValueError("unit cannot be empty")
            material.unit = unit
        if "cost_per_unit" in data:
            material.cost_per_unit = _positive_number(data["cost_per_unit"], "cost_per_unit", allow_zero=True)
        if "supplier_id" in data:
            material.supplier_id = _validate_supplier(data.get("supplier_id"))
        if "low_stock_threshold" in data:
            inv = get_or_create_inventory(material_id)
            inv.low_stock_threshold = _positive_number(data["low_stock_threshold"], "low_stock_threshold", allow_zero=True)
        db.session.commit()
    except LookupError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    return jsonify({"message": "Material updated", "material": material.to_dict()}), 200


@inventory_bp.route("/materials/<int:material_id>", methods=["DELETE"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def delete_material(material_id):
    material = db.session.get(RawMaterial, material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    if Purchase.query.filter_by(material_id=material_id).first():
        return jsonify({"error": "Cannot delete a material that has purchase history"}), 409
    if InventoryConsumption.query.filter_by(material_id=material_id).first():
        return jsonify({"error": "Cannot delete a material that has consumption history"}), 409
    inv = Inventory.query.filter_by(material_id=material_id).first()
    if inv:
        db.session.delete(inv)
    db.session.delete(material)
    db.session.commit()
    return jsonify({"message": "Material deleted"}), 200


@inventory_bp.route("/materials/<int:material_id>/inventory", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def material_inventory(material_id):
    if not db.session.get(RawMaterial, material_id):
        return jsonify({"error": "Material not found"}), 404
    inv = get_or_create_inventory(material_id)
    return jsonify({"inventory": inv.to_dict()}), 200


# ─── PURCHASES ───────────────────────────────────────────────────────────────

@inventory_bp.route("/purchases", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def get_purchases():
    purchases = Purchase.query.order_by(Purchase.purchased_at.desc()).all()
    return jsonify({"purchases": [purchase.to_dict() for purchase in purchases]}), 200


@inventory_bp.route("/purchases", methods=["POST"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def create_purchase():
    data = _json()
    try:
        material = _validate_material(data.get("material_id"))
        supplier_id = _validate_supplier(data.get("supplier_id"))
        quantity = _positive_number(data.get("quantity"), "quantity")
        unit_price = _positive_number(data.get("unit_price"), "unit_price", allow_zero=True)
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    payment_source = str(data.get("payment_source") or "OTHER").strip().upper()
    if payment_source not in {"CASH", "BANK", "OTHER"}:
        return jsonify({"error": "payment_source must be CASH, BANK or OTHER"}), 400

    purchase = Purchase(
        supplier_id=supplier_id,
        material_id=material.id,
        quantity=quantity,
        unit_price=unit_price,
        total_amount=quantity * unit_price,
        payment_source=payment_source,
        reference=str(data.get("reference") or "").strip() or None,
        purchased_by=int(get_jwt_identity()),
        notes=str(data.get("notes") or "").strip() or None,
    )
    try:
        db.session.add(purchase)
        inv = get_or_create_inventory(material.id)
        inv.quantity = float(inv.quantity or 0) + quantity
        if unit_price >= 0:
            material.cost_per_unit = unit_price
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    return jsonify({"message": "Purchase recorded", "purchase": purchase.to_dict()}), 201


@inventory_bp.route("/purchases/<int:purchase_id>", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def get_purchase(purchase_id):
    purchase = db.session.get(Purchase, purchase_id)
    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    return jsonify({"purchase": purchase.to_dict()}), 200


@inventory_bp.route("/purchases/<int:purchase_id>", methods=["PUT"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def update_purchase(purchase_id):
    purchase = db.session.get(Purchase, purchase_id)
    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    data = _json()

    old_material_id = purchase.material_id
    old_quantity = float(purchase.quantity or 0)
    try:
        new_material = _validate_material(data.get("material_id", purchase.material_id))
        supplier_id = _validate_supplier(data.get("supplier_id", purchase.supplier_id))
        new_quantity = _positive_number(data.get("quantity", purchase.quantity), "quantity")
        new_unit_price = _positive_number(data.get("unit_price", purchase.unit_price), "unit_price", allow_zero=True)
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    old_inv = get_or_create_inventory(old_material_id)
    if new_material.id == old_material_id:
        adjusted = float(old_inv.quantity or 0) - old_quantity + new_quantity
        if adjusted < 0:
            return jsonify({"error": "Purchase update would make inventory negative"}), 400
        old_inv.quantity = adjusted
    else:
        remaining_old = float(old_inv.quantity or 0) - old_quantity
        if remaining_old < 0:
            return jsonify({"error": "Cannot move this purchase because current stock is lower than the original purchase quantity"}), 400
        old_inv.quantity = remaining_old
        new_inv = get_or_create_inventory(new_material.id)
        new_inv.quantity = float(new_inv.quantity or 0) + new_quantity

    payment_source = str(data.get("payment_source", purchase.payment_source or "OTHER")).strip().upper()
    if payment_source not in {"CASH", "BANK", "OTHER"}:
        return jsonify({"error": "payment_source must be CASH, BANK or OTHER"}), 400

    purchase.material_id = new_material.id
    purchase.supplier_id = supplier_id
    purchase.quantity = new_quantity
    purchase.unit_price = new_unit_price
    purchase.total_amount = new_quantity * new_unit_price
    purchase.payment_source = payment_source
    purchase.reference = str(data.get("reference", purchase.reference) or "").strip() or None
    purchase.notes = str(data.get("notes", purchase.notes) or "").strip() or None
    new_material.cost_per_unit = new_unit_price

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    return jsonify({"message": "Purchase updated successfully", "purchase": purchase.to_dict()}), 200


@inventory_bp.route("/purchases/<int:purchase_id>", methods=["DELETE"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def delete_purchase(purchase_id):
    purchase = db.session.get(Purchase, purchase_id)
    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    inventory = get_or_create_inventory(purchase.material_id)
    remaining = float(inventory.quantity or 0) - float(purchase.quantity or 0)
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


@inventory_bp.route("/purchases/report", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def purchase_report():
    total = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
    count = Purchase.query.count()
    return jsonify({"total_purchases": count, "total_amount": float(total)}), 200


@inventory_bp.route("/purchases/supplier/<int:supplier_id>", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def purchases_by_supplier(supplier_id):
    if not db.session.get(Supplier, supplier_id):
        return jsonify({"error": "Supplier not found"}), 404
    purchases = (
        Purchase.query.filter_by(supplier_id=supplier_id)
        .order_by(Purchase.purchased_at.desc())
        .all()
    )
    return jsonify({"purchases": [purchase.to_dict() for purchase in purchases]}), 200


@inventory_bp.route("/purchases/dashboard", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def purchases_dashboard():
    today = datetime.utcnow().date()
    month_start = datetime(today.year, today.month, 1)
    since_30 = datetime.utcnow() - timedelta(days=30)

    total_amount = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
    total_count = Purchase.query.count()
    today_total = db.session.query(func.sum(Purchase.total_amount)).filter(
        func.date(Purchase.purchased_at) == today
    ).scalar() or 0
    month_total = db.session.query(func.sum(Purchase.total_amount)).filter(
        Purchase.purchased_at >= month_start
    ).scalar() or 0

    supplier_rows = (
        db.session.query(
            Purchase.supplier_id,
            func.count(Purchase.id).label("orders"),
            func.sum(Purchase.total_amount).label("total"),
        )
        .group_by(Purchase.supplier_id)
        .order_by(func.sum(Purchase.total_amount).desc())
        .limit(5)
        .all()
    )
    top_suppliers = []
    for row in supplier_rows:
        supplier = db.session.get(Supplier, row[0]) if row[0] else None
        top_suppliers.append({
            "supplier_id": row[0],
            "supplier_name": supplier.name if supplier else "Unknown",
            "orders": row[1],
            "total": float(row[2] or 0),
        })

    chart_rows = (
        db.session.query(
            func.date(Purchase.purchased_at).label("date"),
            func.sum(Purchase.total_amount).label("total"),
        )
        .filter(Purchase.purchased_at >= since_30)
        .group_by(func.date(Purchase.purchased_at))
        .order_by(func.date(Purchase.purchased_at))
        .all()
    )
    recent = Purchase.query.order_by(Purchase.purchased_at.desc()).limit(5).all()

    return jsonify({
        "total_amount": float(total_amount),
        "total_count": total_count,
        "today_total": float(today_total),
        "month_total": float(month_total),
        "low_stock_count": len(get_low_stock()),
        "out_of_stock_count": len(get_out_of_stock()),
        "top_suppliers": top_suppliers,
        "chart": [{"date": str(row[0]), "total": float(row[1] or 0)} for row in chart_rows],
        "recent_purchases": [purchase.to_dict() for purchase in recent],
    }), 200


# ─── SUPPLIERS ───────────────────────────────────────────────────────────────

@inventory_bp.route("/suppliers", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def get_suppliers():
    suppliers = Supplier.query.order_by(Supplier.name.asc()).all()
    return jsonify({"suppliers": [supplier.to_dict() for supplier in suppliers]}), 200


@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def get_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404
    return jsonify({"supplier": supplier.to_dict()}), 200


@inventory_bp.route("/suppliers", methods=["POST"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def create_supplier():
    data = _json()
    name = str(data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Supplier name is required"}), 400
    if Supplier.query.filter(func.lower(Supplier.name) == name.lower()).first():
        return jsonify({"error": "A supplier with this name already exists"}), 409
    email = str(data.get("email") or "").strip() or None
    if email and "@" not in email:
        return jsonify({"error": "Enter a valid email address"}), 400
    supplier = Supplier(
        name=name,
        contact_name=str(data.get("contact_name") or "").strip() or None,
        phone=str(data.get("phone") or "").strip() or None,
        email=email,
        address=str(data.get("address") or "").strip() or None,
        is_active=bool(data.get("is_active", True)),
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier created", "supplier": supplier.to_dict()}), 201


@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["PUT"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def update_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404
    data = _json()
    if "name" in data:
        name = str(data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Supplier name cannot be empty"}), 400
        duplicate = Supplier.query.filter(
            func.lower(Supplier.name) == name.lower(), Supplier.id != supplier_id
        ).first()
        if duplicate:
            return jsonify({"error": "A supplier with this name already exists"}), 409
        supplier.name = name
    if "email" in data:
        email = str(data.get("email") or "").strip() or None
        if email and "@" not in email:
            return jsonify({"error": "Enter a valid email address"}), 400
        supplier.email = email
    for field in ["contact_name", "phone", "address"]:
        if field in data:
            setattr(supplier, field, str(data.get(field) or "").strip() or None)
    if "is_active" in data:
        supplier.is_active = bool(data.get("is_active"))
    db.session.commit()
    return jsonify({"message": "Supplier updated", "supplier": supplier.to_dict()}), 200


@inventory_bp.route("/suppliers/<int:supplier_id>", methods=["DELETE"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def delete_supplier(supplier_id):
    supplier = db.session.get(Supplier, supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404
    if Purchase.query.filter_by(supplier_id=supplier_id).first() or RawMaterial.query.filter_by(supplier_id=supplier_id).first():
        supplier.is_active = False
        db.session.commit()
        return jsonify({
            "message": "Supplier has history and was deactivated instead of deleted",
            "supplier": supplier.to_dict(),
        }), 200
    db.session.delete(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200


@inventory_bp.route("/suppliers/<int:supplier_id>/report", methods=["GET"])
@jwt_required()
@role_required(MANAGEMENT_ROLES)
def supplier_report(supplier_id):
    supplier = db.session.get(Supplier, supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404
    total = db.session.query(func.sum(Purchase.total_amount)).filter_by(supplier_id=supplier_id).scalar() or 0
    count = Purchase.query.filter_by(supplier_id=supplier_id).count()
    return jsonify({
        "supplier_id": supplier_id,
        "supplier": supplier.to_dict(),
        "total_purchases": count,
        "total_amount": float(total),
    }), 200