from extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON
from utils.currency import convert


class CartItem(db.Model):
    __tablename__ = "cart_items"

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey("carts.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    variant_id = db.Column(db.Integer, db.ForeignKey("variants.id"), nullable=True)
    flavor_id = db.Column(db.Integer, db.ForeignKey("flavors.id"), nullable=True)
    shape = db.Column(db.String(50), nullable=True)
    addons = db.Column(JSON)
    total_price = db.Column(db.Numeric(10,2))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product")
    variant = db.relationship("Variant")
    flavor = db.relationship("Flavor")

    def to_dict(self, currency="INR"):
        # unit_price = convert(self.total_price, currency) or 0

        # original_price = convert(self.product.original_price, currency) or unit_price

        # active_promotion = next(
        #     (p for p in (self.product.promotions or []) if getattr(p, "is_active", False)),
        #     None
        # )
        # has_discount = (
        #     active_promotion is not None
        #     and original_price > unit_price
        # )

        product_data = self.product.to_dict(currency)

        unit_price = product_data["price"]
        original_price = product_data["original_price"]

        has_discount = (
         product_data.get("promotion") is not None
         and original_price is not None
         and original_price > unit_price
        )


        converted_addons = [
            {**a, "price": convert(a.get("price", 0), currency)}
            for a in (self.addons or [])
        ]

        return {
            "id": self.id,
            "product_id": self.product.id,
            "name": self.product.name,
            "image_url": self.product.image_url,

            "variant_id": self.variant_id,
            "variant": self.variant.name if self.variant else None,

            "flavor_id": self.flavor_id,
            "flavor": self.flavor.name if self.flavor else None,

            "shape": self.shape,
            "addons": converted_addons,

            "quantity": self.quantity,
            "unit_price": unit_price,
            "original_price": original_price,
            "has_discount": has_discount,
            "subtotal": round(unit_price * self.quantity, 2),
            "currency": currency,
        }