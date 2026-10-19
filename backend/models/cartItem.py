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
    message_on_cake = db.Column(db.String(80), nullable=True)
    addons = db.Column(JSON)
    total_price = db.Column(db.Numeric(10,3))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product")
    variant = db.relationship("Variant")
    flavor = db.relationship("Flavor")

    def to_dict(self, currency="KWD"):
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

        # Use the amount snapshotted when the item was added, rather than
        # silently repricing the basket after catalog prices are edited.
        # total_price is a BASE-currency unit price, including chosen options.
        # Existing carts without a snapshot fall back to current catalog prices.
        decimals = 3 if currency.upper() == "KWD" else 2
        base_price = float(product_data.get("price") or 0)
        variant_extra = float(convert(self.variant.price_modifier or 0, currency) or 0) if self.variant else 0
        flavor_extra = float(convert(self.flavor.price_modifier or 0, currency) or 0) if self.flavor else 0
        addon_extra = sum(float(convert(a.get("price", 0), currency) or 0) for a in (self.addons or []))
        current_unit = base_price + variant_extra + flavor_extra + addon_extra
        snapshotted_unit = convert(self.total_price, currency) if self.total_price is not None else None
        unit_price = round(float(snapshotted_unit) if snapshotted_unit is not None else current_unit, decimals)
        original_base = product_data.get("original_price")
        original_price = round(float(original_base) + variant_extra + flavor_extra + addon_extra, decimals) if original_base is not None else None

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
            "product": product_data,
            "promotion": product_data.get("promotion"),
            "product_name": self.product.name,
            "name": self.product.name,
            "image_url": self.product.image_url,

            "variant_id": self.variant_id,
            "variant": self.variant.name if self.variant else None,

            "flavor_id": self.flavor_id,
            "flavor": self.flavor.name if self.flavor else None,

            "shape": self.shape,
            "message_on_cake": self.message_on_cake or "",
            "addons": converted_addons,

            "quantity": self.quantity,
            "unit_price": unit_price,
            "original_price": original_price,
            "has_discount": has_discount,
            "subtotal": round(unit_price * self.quantity, decimals),
            "currency": currency,
        }