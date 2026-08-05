from extensions import db
from datetime import datetime


class AgentMenu(db.Model):
    """
    A private, owner-curated menu (e.g. "Corporate Menu", "Wedding Menu").
    Products are NOT duplicated here — see AgentMenuProduct, which is just
    a link table into the existing `products` table.
    """
    __tablename__ = "agent_menus"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)

    is_active = db.Column(db.Boolean, default=True, nullable=False)

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    creator = db.relationship(
        "User",
        foreign_keys=[created_by],
        lazy="joined"
    )

    products = db.relationship(
        "AgentMenuProduct",
        back_populates="menu",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    assignments = db.relationship(
        "AgentMenuAssignment",
        back_populates="menu",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def to_dict(self, currency="KWD", include_products=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active,
            "created_by": self.created_by,
            "assigned_agent_ids": [a.agent_id for a in self.assignments],
            "product_count": len(self.products),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_products:
            data["products"] = [
                mp.product.to_dict(currency)
                for mp in self.products
                if mp.product is not None
            ]
        return data


class AgentMenuProduct(db.Model):
    """
    Link table: which existing Product rows belong to a given AgentMenu.
    Reuses the existing Product model — never duplicates a product row.
    """
    __tablename__ = "agent_menu_products"

    id = db.Column(db.Integer, primary_key=True)

    agent_menu_id = db.Column(
        db.Integer,
        db.ForeignKey("agent_menus.id", ondelete="CASCADE"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    menu = db.relationship("AgentMenu", back_populates="products")
    product = db.relationship("Product", lazy="joined")

    __table_args__ = (
        db.UniqueConstraint(
            "agent_menu_id", "product_id",
            name="uq_agent_menu_product"
        ),
    )


class AgentMenuAssignment(db.Model):
    """
    Which Agent (User with role=AGENT) can see a given AgentMenu.
    Private by design: only assigned agents can see it.
    """
    __tablename__ = "agent_menu_assignments"

    id = db.Column(db.Integer, primary_key=True)

    agent_menu_id = db.Column(
        db.Integer,
        db.ForeignKey("agent_menus.id", ondelete="CASCADE"),
        nullable=False
    )

    agent_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    assigned_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    menu = db.relationship("AgentMenu", back_populates="assignments")
    agent = db.relationship(
        "User",
        foreign_keys=[agent_id],
        lazy="joined"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "agent_menu_id", "agent_id",
            name="uq_agent_menu_assignment"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "agent_menu_id": self.agent_menu_id,
            "agent_id": self.agent_id,
            "agent": self.agent.to_dict() if self.agent else None,
            "assigned_by": self.assigned_by,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
        }
