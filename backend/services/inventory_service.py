from extensions import db
from models.inventory import Inventory, InventoryConsumption, RawMaterial


def get_or_create_inventory(material_id):
    inv = Inventory.query.filter_by(material_id=material_id).first()
    if not inv:
        inv = Inventory(material_id=material_id, quantity=0)
        db.session.add(inv)
        db.session.commit()
    return inv


def consume_material(material_id, quantity_used, order_id=None, notes=None):
    inv = get_or_create_inventory(material_id)

    if float(inv.quantity) < float(quantity_used):
        return {"error": "Insufficient stock"}

    inv.quantity = float(inv.quantity) - float(quantity_used)

    log = InventoryConsumption(
        material_id=material_id,
        order_id=order_id,
        quantity_used=quantity_used,
        notes=notes
    )
    db.session.add(log)
    db.session.commit()
    return {"success": True, "remaining": float(inv.quantity)}


def get_low_stock():
    items = db.session.query(Inventory).filter(
        Inventory.quantity <= Inventory.low_stock_threshold
    ).all()
    return items


def get_out_of_stock():
    items = Inventory.query.filter(Inventory.quantity <= 0).all()
    return items
