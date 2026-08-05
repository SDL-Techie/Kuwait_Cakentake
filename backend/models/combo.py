from extensions import db
from datetime import datetime


combo_products = db.Table(
    "combo_products",
    db.Column("combo_id", db.Integer, db.ForeignKey("combos.id"), primary_key=True),
    db.Column("product_id", db.Integer, db.ForeignKey("products.id"), primary_key=True),
    db.Column("quantity", db.Integer, default=1)
)


class Combo(db.Model):
    __tablename__ = "combos"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    image_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = db.relationship("Product", secondary=combo_products, lazy="selectin")

    def to_dict(self, include_items=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": float(self.price),
            "discount_amount": float(self.discount_amount),
            "image_url": self.image_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_items:
            data["products"] = [p.to_dict() for p in self.products]
        return data
