from extensions import db

class PointSetting(db.Model):
    __tablename__ = "point_settings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    min_purchase = db.Column(
        db.Float,
        nullable=False
    )

    points_earned = db.Column(
        db.Integer,
        nullable=False
    )

    points_needed = db.Column(
        db.Integer,
        nullable=False
    )

    reward_percentage = db.Column(
        db.Float,
        nullable=False
    )

    coupon_validity_days = db.Column(
        db.Integer,
        nullable=False
    )