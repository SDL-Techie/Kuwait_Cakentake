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

    variants = db.Column(db.JSON, nullable=True)
    flavours = db.Column(db.JSON, nullable=True)

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

    @staticmethod
    def _options(raw):
        """[{name, price_modifier}] from strings or dicts (older rows used strings)."""
        out = []
        for entry in raw or []:
            if isinstance(entry, str) and entry.strip():
                out.append({"name": entry.strip(), "price_modifier": 0.0})
            elif isinstance(entry, dict) and str(entry.get("name") or "").strip():
                try:
                    modifier = float(entry.get("price_modifier") or 0)
                except (TypeError, ValueError):
                    modifier = 0.0
                out.append({"name": str(entry["name"]).strip(), "price_modifier": modifier})
        return out

    def to_dict(self):
        # Client report: exclusive cakes showed no image and "no variants /
        # flavours" in the agent order screen. The screens read the same keys
        # as normal products (image_url, variants[].id/is_active/flavors[]),
        # so those are provided here in addition to the original keys.
        flavours = [
            {"id": idx + 1, "name": f["name"], "price_modifier": f["price_modifier"], "is_active": True}
            for idx, f in enumerate(self._options(self.flavours))
        ]
        variants = [
            {
                "id": idx + 1,
                "product_id": self.id,
                "name": v["name"],
                "price_modifier": v["price_modifier"],
                "is_active": True,
                "flavors": [dict(f, variant_id=idx + 1) for f in flavours],
            }
            for idx, v in enumerate(self._options(self.variants))
        ]
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "product_type": "AGENT",
            "name": self.name,
            "description": self.description,
            "price": float(self.price) if self.price is not None else 0,
            "variants": variants,
            "flavours": flavours,
            "flavors": flavours,
            "image": self.image,
            "image_url": self.image,
            "cloudinary_public_id": self.cloudinary_public_id,
            "is_active": self.is_active,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }