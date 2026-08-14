from datetime import datetime

from extensions import db


class AgentProduct(db.Model):
    """
    Products created exclusively for an Agent.

    These products are NOT part of the normal bakery Product table.
    Only the assigned agent can view and sell them.
    """

    __tablename__ = "agent_products"

    id = db.Column(db.Integer, primary_key=True)

    # Agent who owns this product
    agent_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Owner/Admin who created this product
    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True,
    )

    name = db.Column(
        db.String(200),
        nullable=False,
    )

    description = db.Column(
        db.Text,
        nullable=True,
    )

    price = db.Column(
        db.Numeric(10, 3),
        nullable=False,
    )

    image = db.Column(
        db.String(500),
        nullable=True,
    )

    cloudinary_public_id = db.Column(
        db.String(255),
        nullable=True,
    )

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # ---------------- Relationships ---------------- #

    agent = db.relationship(
        "User",
        foreign_keys=[agent_id],
        lazy="joined",
    )

    creator = db.relationship(
        "User",
        foreign_keys=[created_by],
        lazy="joined",
    )

    # ---------------- Serializer ---------------- #

    def to_dict(self):
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "name": self.name,
            "description": self.description,
            "price": float(self.price) if self.price is not None else 0,
            "image": self.image,
            "cloudinary_public_id": self.cloudinary_public_id,
            "is_active": self.is_active,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }