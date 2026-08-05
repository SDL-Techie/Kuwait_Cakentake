from extensions import db
from datetime import datetime


class Variant(db.Model):
    __tablename__ = "variants"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=True)
    name = db.Column(db.String(100), nullable=False)   # e.g. "Size"
    price_modifier = db.Column(db.Numeric(10, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # product = db.relationship("Product", backref="variants", lazy="joined")
    product = db.relationship(
    "Product",
    back_populates="variants"
    )
    flavors = db.relationship("Flavor", backref="variant", lazy="selectin", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "name": self.name,
            "price_modifier": float(self.price_modifier),
            "is_active": self.is_active,
            "flavors": [f.to_dict() for f in self.flavors]
        }


class Flavor(db.Model):
    __tablename__ = "flavors"

    id = db.Column(db.Integer, primary_key=True)
    variant_id = db.Column(db.Integer, db.ForeignKey("variants.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price_modifier = db.Column(db.Numeric(10, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "variant_id": self.variant_id,
            "name": self.name,
            "price_modifier": float(self.price_modifier),
            "is_active": self.is_active
        }


class Addon(db.Model):
    __tablename__ = "addons"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric(10, 2), default=0)
    image_url = db.Column(db.String(500), nullable=True)  
    is_predefined = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": float(self.price),
            "image_url": self.image_url,
            "is_predefined": self.is_predefined,
            "is_active": self.is_active
        }
