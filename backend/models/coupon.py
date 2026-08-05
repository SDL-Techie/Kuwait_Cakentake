from extensions import db
from datetime import datetime

class Coupon(db.Model):
    __tablename__ = "coupons"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    coupon_code = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    discount_percentage = db.Column(
        db.Float,
        nullable=False
    )

    is_used = db.Column(
        db.Boolean,
        default=False
    )

    expiry_date = db.Column(
        db.DateTime,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )