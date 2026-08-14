# from extensions import db
# from datetime import datetime


# class Promotion(db.Model):
#     __tablename__ = "promotions"

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(150), nullable=False)
#     description = db.Column(db.Text, nullable=True)
#     product_id = db.Column(
#         db.Integer,
#         db.ForeignKey("products.id"),
#         nullable=False
#     )
#     product = db.relationship(
#         "Product",
#         back_populates="promotions"
#     )

#     promotion_type = db.Column(
#         db.String(30),
#         nullable=False,
#         default="DISCOUNT"
#     )


#     discount_type = db.Column(db.String(20), nullable=False)  # PERCENT / FLAT
#     discount_value = db.Column(db.Numeric(10, 2), nullable=False)
#     # min_order_value = db.Column(db.Numeric(10, 2), default=0)
#     is_active = db.Column(db.Boolean, default=False)
#     start_date = db.Column(db.DateTime, nullable=True)
#     end_date = db.Column(db.DateTime, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     free_items = db.relationship("PromotionFreeItem", backref="promotion", lazy="selectin", cascade="all, delete-orphan")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "description": self.description,
#             "promotion_type": self.promotion_type,
#             # "product": self.product.to_dict() if self.product else None,
#             "product": {
#     "id": self.product.id,
#     "name": self.product.name,
#     "image_url": self.product.image_url,
#     "price": float(self.product.price)
# } if self.product else None,
#             "product_id": self.product_id,
#             # "discount_type": self.discount_type,
#             # "discount_value": float(self.discount_value),
#             "discount_type": self.discount_type,
#             "discount_value": float(self.discount_value) if self.discount_value is not None else None,
#             # "min_order_value": float(self.min_order_value),
#             "is_active": self.is_active,
#             "start_date": self.start_date.isoformat() if self.start_date else None,
#             "end_date": self.end_date.isoformat() if self.end_date else None,
#             "free_items": [fi.to_dict() for fi in self.free_items]
#         }


# class PromotionFreeItem(db.Model):
#     __tablename__ = "promotion_free_items"

#     id = db.Column(db.Integer, primary_key=True)
#     promotion_id = db.Column(db.Integer, db.ForeignKey("promotions.id"), nullable=False)
#     product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
#     quantity = db.Column(db.Integer, default=1)

#     product = db.relationship("Product", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "promotion_id": self.promotion_id,
#             "product_id": self.product_id,
#             "quantity": self.quantity,
#             "product": self.product.to_dict() if self.product else None
#         }


# class PromoCode(db.Model):
#     __tablename__ = "promo_codes"

#     id = db.Column(db.Integer, primary_key=True)
#     code = db.Column(db.String(50), unique=True, nullable=False)
#     discount_type = db.Column(db.String(20), nullable=False)  # PERCENT / FLAT
#     discount_value = db.Column(db.Numeric(10, 2), nullable=False)
#     min_order_value = db.Column(db.Numeric(10, 2), default=0)
#     max_uses = db.Column(db.Integer, nullable=True)
#     used_count = db.Column(db.Integer, default=0)
#     is_active = db.Column(db.Boolean, default=True)
#     expires_at = db.Column(db.DateTime, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "code": self.code,
#             "discount_type": self.discount_type,
#             "discount_value": float(self.discount_value),
#             "min_order_value": float(self.min_order_value),
#             "max_uses": self.max_uses,
#             "used_count": self.used_count,
#             "is_active": self.is_active,
#             "expires_at": self.expires_at.isoformat() if self.expires_at else None
#         }




from extensions import db
from datetime import datetime


class Promotion(db.Model):
    __tablename__ = "promotions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )
    product = db.relationship(
        "Product",
        back_populates="promotions"
    )

    promotion_type = db.Column(
        db.String(30),
        nullable=False,
        default="DISCOUNT"
    )


    discount_type = db.Column(db.String(20), nullable=True)  # PERCENT / FLAT
    discount_value = db.Column(db.Numeric(10, 2), nullable=True)
    # min_order_value = db.Column(db.Numeric(10, 2), default=0)
    is_active = db.Column(db.Boolean, default=False)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    free_items = db.relationship("PromotionFreeItem", backref="promotion", lazy="selectin", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "promotion_type": self.promotion_type,
            # "product": self.product.to_dict() if self.product else None,
            "product": {
    "id": self.product.id,
    "name": self.product.name,
    "image_url": self.product.image_url,
    "price": float(self.product.price)
} if self.product else None,
            "product_id": self.product_id,
            # "discount_type": self.discount_type,
            # "discount_value": float(self.discount_value),
            "discount_type": self.discount_type,
            "discount_value": float(self.discount_value) if self.discount_value is not None else None,
            # "min_order_value": float(self.min_order_value),
            "is_active": self.is_active,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "free_items": [fi.to_dict() for fi in self.free_items]
        }


class PromotionFreeItem(db.Model):
    __tablename__ = "promotion_free_items"

    id = db.Column(db.Integer, primary_key=True)
    promotion_id = db.Column(db.Integer, db.ForeignKey("promotions.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, default=1)

    product = db.relationship("Product", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "promotion_id": self.promotion_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "product": self.product.to_dict() if self.product else None
        }


class PromoCode(db.Model):
    __tablename__ = "promo_codes"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_type = db.Column(db.String(20), nullable=False)  # PERCENT / FLAT
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    min_order_value = db.Column(db.Numeric(10, 2), default=0)
    max_uses = db.Column(db.Integer, nullable=True)
    used_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "discount_type": self.discount_type,
            "discount_value": float(self.discount_value),
            "min_order_value": float(self.min_order_value),
            "max_uses": self.max_uses,
            "used_count": self.used_count,
            "is_active": self.is_active,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }