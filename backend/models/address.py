from extensions import db


class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Admin created delivery area
    #
    # nullable=True is used initially because existing address records may not
    # have an area_id. After old records are updated, this can be changed to
    # nullable=False in a later migration.
    area_id = db.Column(
        db.Integer,
        db.ForeignKey("areas.id"),
        nullable=True,
        index=True
    )

    street = db.Column(
        db.String(255),
        nullable=False
    )

    # Kuwait-style address information
    block = db.Column(db.String(100), nullable=True)
    avenue = db.Column(db.String(100), nullable=True)
    building = db.Column(db.String(100), nullable=True)
    floor = db.Column(db.String(50), nullable=True)
    apartment = db.Column(db.String(50), nullable=True)

    delivery_notes = db.Column(
        db.Text,
        nullable=True
    )

    country = db.Column(
        db.String(100),
        default="Kuwait",
        nullable=False
    )

    user = db.relationship(
        "User",
        back_populates="addresses"
    )

    area = db.relationship(
        "Area",
        back_populates="addresses"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "area_id": self.area_id,
            "area": self.area.to_dict() if self.area else None,
            "street": self.street,
            "block": self.block,
            "avenue": self.avenue,
            "building": self.building,
            "floor": self.floor,
            "apartment": self.apartment,
            "delivery_notes": self.delivery_notes,
            "country": self.country,
        }