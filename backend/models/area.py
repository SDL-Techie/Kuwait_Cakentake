# # # from extensions import db
# # # from datetime import datetime


# # # class Area(db.Model):
# # #     __tablename__ = "areas"

# # #     id = db.Column(db.Integer, primary_key=True)
# # #     name = db.Column(db.String(150), nullable=False)
# # #     city = db.Column(db.String(100), nullable=True)
# # #     state = db.Column(db.String(100), nullable=True)
# # #     pincode = db.Column(db.String(20), nullable=True)
# # #     delivery_charge = db.Column(db.Numeric(10, 2), default=0)
# # #     min_order_value = db.Column(db.Numeric(10, 2), default=0)
# # #     currency = db.Column(db.String(10), default="AED", nullable=False)
# # #     is_active = db.Column(db.Boolean, default=True)
# # #     created_at = db.Column(db.DateTime, default=datetime.utcnow)
# # #     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# # #     def to_dict(self):
# # #         return {
# # #             "id": self.id,
# # #             "name": self.name,
# # #             "city": self.city,
# # #             "state": self.state,
# # #             "pincode": self.pincode,
# # #             "delivery_charge": float(self.delivery_charge),
# # #             "min_order_value": float(self.min_order_value),
# # #             "currency": self.currency, 
# # #             "is_active": self.is_active,
# # #             "created_at": self.created_at.isoformat() if self.created_at else None
# # #         }



# # from extensions import db
# # from datetime import datetime


# # class Area(db.Model):
# #     __tablename__ = "areas"

# #     id = db.Column(db.Integer, primary_key=True)

# #     # The only thing that identifies an area for delivery purposes. No
# #     # pincode/postal code — Kuwait doesn't use one for this. Unique so two
# #     # areas can't silently collide (e.g. two "Salmiya" rows).
# #     name = db.Column(db.String(150), nullable=False, unique=True)

# #     delivery_charge = db.Column(db.Numeric(10, 3), default=0)
# #     min_order_value = db.Column(db.Numeric(10, 3), default=0)
# #     currency = db.Column(db.String(10), default="KWD", nullable=False)

# #     is_active = db.Column(db.Boolean, default=True)

# #     created_at = db.Column(db.DateTime, default=datetime.utcnow)
# #     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# #     def to_dict(self):
# #         return {
# #             "id": self.id,
# #             "name": self.name,
# #             "delivery_charge": float(self.delivery_charge),
# #             "min_order_value": float(self.min_order_value),
# #             "currency": self.currency,
# #             "is_active": self.is_active,
# #             "created_at": self.created_at.isoformat() if self.created_at else None,
# #         }


# from datetime import datetime

# from extensions import db


# class Area(db.Model):
#     __tablename__ = "areas"

#     id = db.Column(
#         db.Integer,
#         primary_key=True
#     )

#     name = db.Column(
#         db.String(150),
#         nullable=False,
#         unique=True,
#         index=True
#     )

#     delivery_charge = db.Column(
#         db.Numeric(10, 3),
#         default=0,
#         nullable=False
#     )

#     min_order_value = db.Column(
#         db.Numeric(10, 3),
#         default=0,
#         nullable=False
#     )

#     currency = db.Column(
#         db.String(10),
#         default="KWD",
#         nullable=False
#     )

#     is_active = db.Column(
#         db.Boolean,
#         default=True,
#         nullable=False
#     )

#     created_at = db.Column(
#         db.DateTime,
#         default=datetime.utcnow,
#         nullable=False
#     )

#     updated_at = db.Column(
#         db.DateTime,
#         default=datetime.utcnow,
#         onupdate=datetime.utcnow,
#         nullable=False
#     )

#     # Area -> Addresses
#     addresses = db.relationship(
#         "Address",
#         back_populates="area",
#         lazy=True
#     )

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "delivery_charge": float(self.delivery_charge or 0),
#             "min_order_value": float(self.min_order_value or 0),
#             "currency": self.currency,
#             "is_active": self.is_active,
#             "created_at": (
#                 self.created_at.isoformat()
#                 if self.created_at
#                 else None
#             ),
#             "updated_at": (
#                 self.updated_at.isoformat()
#                 if self.updated_at
#                 else None
#             ),
#         }




from datetime import datetime

from extensions import db


class Area(db.Model):
    __tablename__ = "areas"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False,
        unique=True,
        index=True
    )

    delivery_charge = db.Column(
        db.Numeric(10, 3),
        default=0,
        nullable=False
    )

    min_order_value = db.Column(
        db.Numeric(10, 3),
        default=0,
        nullable=False
    )

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

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

    # Area -> Addresses
    addresses = db.relationship(
        "Address",
        back_populates="area",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "delivery_charge": float(self.delivery_charge or 0),
            "min_order_value": float(self.min_order_value or 0),
            "is_active": self.is_active,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
        }