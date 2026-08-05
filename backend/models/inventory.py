from extensions import db
from datetime import datetime


class RawMaterial(db.Model):
    __tablename__ = "raw_materials"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    unit = db.Column(db.String(30), nullable=False)   # kg, litre, pcs
    cost_per_unit = db.Column(db.Numeric(10, 2), default=0)
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    supplier = db.relationship("Supplier", backref="materials", lazy="joined")
    inventory = db.relationship("Inventory", back_populates="material", uselist=False, lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "unit": self.unit,
            "cost_per_unit": float(self.cost_per_unit),
            "supplier_id": self.supplier_id,
            "inventory": self.inventory.to_dict() if self.inventory else None
        }


class Inventory(db.Model):
    __tablename__ = "inventory"

    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey("raw_materials.id"), nullable=False, unique=True)
    quantity = db.Column(db.Numeric(12, 3), default=0)
    low_stock_threshold = db.Column(db.Numeric(12, 3), default=10)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    material = db.relationship("RawMaterial", back_populates="inventory")

    def to_dict(self):
        return {
        "id": self.id,
        "material_id": self.material_id,
        "quantity": float(self.quantity),
        "low_stock_threshold": float(self.low_stock_threshold),
        "updated_at": self.updated_at.isoformat() if self.updated_at else None,

        "material": {
            "id": self.material.id,
            "name": self.material.name,
            "unit": self.material.unit,
            "cost_per_unit": float(self.material.cost_per_unit)
        } if self.material else None
    }


class InventoryConsumption(db.Model):
    __tablename__ = "inventory_consumption"

    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey("raw_materials.id"), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
    quantity_used = db.Column(db.Numeric(12, 3), nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    consumed_at = db.Column(db.DateTime, default=datetime.utcnow)

    material = db.relationship("RawMaterial", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "material_id": self.material_id,
            "order_id": self.order_id,
            "quantity_used": float(self.quantity_used),
            "notes": self.notes,
            "consumed_at": self.consumed_at.isoformat() if self.consumed_at else None
        }


class Supplier(db.Model):
    __tablename__ = "suppliers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    contact_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    address = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact_name": self.contact_name,
            "phone": self.phone,
            "email": self.email,
            "address": self.address,
            "is_active": self.is_active
        }


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"), nullable=True)
    material_id = db.Column(db.Integer, db.ForeignKey("raw_materials.id"), nullable=False)
    quantity = db.Column(db.Numeric(12, 3), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    purchased_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)

    supplier = db.relationship("Supplier", lazy="joined")
    material = db.relationship("RawMaterial", lazy="joined")
    purchaser = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "supplier_id": self.supplier_id,
            "material_id": self.material_id,
            "quantity": float(self.quantity),
            "unit_price": float(self.unit_price),
            "total_amount": float(self.total_amount),
            "notes": self.notes,
            "purchased_at": self.purchased_at.isoformat() if self.purchased_at else None,
            "supplier": self.supplier.to_dict() if self.supplier else None,
            "material": {"id": self.material.id, "name": self.material.name} if self.material else None
        }
