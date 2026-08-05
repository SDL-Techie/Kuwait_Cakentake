from extensions import db
from datetime import datetime


class Wishlist(db.Model):
    __tablename__ = "wishlists"

    id = db.Column(db.Integer, primary_key=True)

    # Who added to wishlist
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Which product
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    # Timestamp (better naming clarity)
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Prevent duplicate wishlist entries
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_user_product_wishlist"
        ),
    )

    # Relationships
    user = db.relationship(
        "User",
        backref=db.backref("wishlists", lazy=True)
    )

    product = db.relationship(
        "Product",
        backref=db.backref("wishlists", lazy=True)
    )

    # Response helper
    def to_dict(self, currency="INR"):
        product = self.product.to_dict(currency) if self.product else None
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,

            "product_name": self.product.name if self.product else None,
            "product_price": product["price"] if product else None,
            "product_image": self.product.image_url if self.product else None,
            "currency": currency,

            "created_at": self.created_at.isoformat() if self.created_at else None
        }