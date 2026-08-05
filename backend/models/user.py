# from extensions import db
# from werkzeug.security import generate_password_hash, check_password_hash
# from datetime import datetime


# class User(db.Model):
#     __tablename__ = "users"

#     id = db.Column(db.Integer, primary_key=True)

#     first_name = db.Column(db.String(100), nullable=False)
#     last_name = db.Column(db.String(100), nullable=False)

#     phone_no = db.Column(db.String(15), unique=True, nullable=False)
#     email = db.Column(db.String(100), unique=True, nullable=False)

#     password = db.Column(db.String(255), nullable=False)

#     role = db.Column(db.String(20), default="USER")
#     currency_code = db.Column(db.String(10), default="INR", nullable=False)
#     loyalty_points = db.Column(db.Integer, default=0)

#     # ── Driver-only fields ──────────────────────────────────────────────
#     # availability_status: "ONLINE" | "BUSY" | "OFFLINE"
#     # Only meaningful when role == "DRIVER", but harmless on other roles.
#     availability_status = db.Column(
#         db.String(20),
#         default="OFFLINE",
#         nullable=False
#     )

#     rating = db.Column(
#         db.Float,
#         default=0.0
#     )

#     coupons = db.relationship("Coupon", backref="user", lazy=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     # User -> Orders (as customer)
#     orders = db.relationship(
#         "Order",
#         foreign_keys="Order.user_id",
#         back_populates="customer",
#         lazy=True,
#         cascade="all, delete-orphan"
#     )

#     # User -> Addresses
#     addresses = db.relationship(
#         "Address",
#         back_populates="user",
#         lazy=True,
#         cascade="all, delete-orphan"
#     )

#     cart = db.relationship(
#         "Cart",
#         back_populates="user",
#         uselist=False,
#         cascade="all, delete-orphan"
#     )

#     def set_password(self, password):
#         self.password = generate_password_hash(password)

#     def check_password(self, password):
#         return check_password_hash(self.password, password)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "first_name": self.first_name,
#             "last_name": self.last_name,
#             "email": self.email,
#             "phone_no": self.phone_no,
#             "role": self.role,
#             "currency_code": self.currency_code,
#             "availability_status": self.availability_status,
#             "status": self.availability_status,  # alias for frontend convenience
#             "rating": float(self.rating or 0),
#             "created_at": self.created_at.isoformat() if self.created_at else None
#         }



from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

    phone_no = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    password = db.Column(db.String(255), nullable=False)

    role = db.Column(db.String(20), default="USER")
    currency_code = db.Column(db.String(10), default="INR", nullable=False)
    loyalty_points = db.Column(db.Integer, default=0)

    # ── Driver-only fields ──────────────────────────────────────────────
    # availability_status: "ONLINE" | "BUSY" | "OFFLINE"
    # Only meaningful when role == "DRIVER", but harmless on other roles.
    availability_status = db.Column(
        db.String(20),
        default="OFFLINE",
        nullable=False
    )

    rating = db.Column(
        db.Float,
        default=0.0
    )

    # ── Generic staff/account fields (used by AGENT role; harmless on others) ──
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Who created this account (e.g. the Owner/ADMIN who created an Agent).
    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    # Default discount percentage automatically applied to orders created
    # by this user when they act as an AGENT (Step 5 of the Agent Module).
    default_discount = db.Column(db.Numeric(5, 2), default=0, nullable=False)

    creator = db.relationship(
        "User",
        remote_side=[id],
        foreign_keys=[created_by]
    )

    coupons = db.relationship("Coupon", backref="user", lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # User -> Orders (as customer)
    orders = db.relationship(
        "Order",
        foreign_keys="Order.user_id",
        back_populates="customer",
        lazy=True,
        cascade="all, delete-orphan"
    )

    # User -> Addresses
    addresses = db.relationship(
        "Address",
        back_populates="user",
        lazy=True,
        cascade="all, delete-orphan"
    )

    cart = db.relationship(
        "Cart",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone_no": self.phone_no,
            "role": self.role,
            "currency_code": self.currency_code,
            "availability_status": self.availability_status,
            "status": self.availability_status,  # alias for frontend convenience
            "rating": float(self.rating or 0),
            "is_active": self.is_active,
            "created_by": self.created_by,
            "default_discount": float(self.default_discount or 0),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }