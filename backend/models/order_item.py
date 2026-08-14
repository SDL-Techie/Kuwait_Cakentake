# from extensions import db
# from datetime import datetime


# class OrderItem(db.Model):
#     __tablename__ = "order_items"

#     id = db.Column(
#         db.Integer,
#         primary_key=True, autoincrement=True)

#     order_id = db.Column(
#         db.Integer,
#         db.ForeignKey("orders.id"),
#         nullable=False
#     )

#     product_id = db.Column(
#         db.Integer,
#         db.ForeignKey("products.id"),
#         nullable=False
#     )

#     agent_product_id = db.Column(
#         db.Integer,
#         db.ForeignKey("agent_products.id", ondelete="SET NULL"),
#         nullable=True,
#         index=True
#     )

#     quantity = db.Column(
#         db.Integer,
#         nullable=False,
#         default=1
#     )

#     price = db.Column(
#         db.Numeric(10, 2),
#         nullable=False
#     )

    
#     line_total = db.Column(
#         db.Numeric(10, 2),
#         nullable=True
#     )

    
#     custom_json = db.Column(
#         db.JSON,
#         nullable=True
#     )

#     created_at = db.Column(
#         db.DateTime,
#         default=datetime.utcnow
#     )

#     updated_at = db.Column(
#         db.DateTime,
#         default=datetime.utcnow,
#         onupdate=datetime.utcnow
#     )


    
#     order = db.relationship(
#         "Order",
#         back_populates="items"
#     )

#     product = db.relationship(
#         "Product",
#         lazy="joined"
#     )

#     agent_product = db.relationship(
#         "AgentProduct",
#         lazy="joined"
#     )

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "order_id": self.order_id,
#             "product_id": self.product_id,

#             "product": {
#                 "id": self.product.id,
#                 "name": self.product.name,
#                 "description": self.product.description,
#                 "image_url": self.product.image_url,
#                 "price": float(self.product.price)
#             } if self.product else None,

#             "agent_product": {
#                 "id": self.agent_product.id,
#                 "name": self.agent_product.name,
#                 "description": self.agent_product.description,
#                 "image": self.agent_product.image,
#                 "price": float(self.agent_product.price)
#             } if self.agent_product else None,

#             "quantity": self.quantity,
#             "price": float(self.price),

#             "line_total": (
#                 float(self.line_total)
#                 if self.line_total is not None
#                 else float(self.price) * self.quantity
#             ),

#             "custom_json": self.custom_json,

#             "created_at": (
#                 self.created_at.isoformat()
#                 if self.created_at else None
#             ),

#             "updated_at": (
#                 self.updated_at.isoformat()
#                 if self.updated_at else None
#             )
#         }


from extensions import db
from datetime import datetime


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(
        db.Integer,
        primary_key=True, autoincrement=True)

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=True   # ← CHANGED: was nullable=False. Agent-exclusive
                        #   line items have no products.id, only
                        #   agent_product_id below.
    )

    # ── NEW: separate FK for agent-exclusive products ──────────────────
    agent_product_id = db.Column(
        db.Integer,
        db.ForeignKey("agent_products.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    price = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    
    line_total = db.Column(
        db.Numeric(10, 2),
        nullable=True
    )

    
    custom_json = db.Column(
        db.JSON,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


    
    order = db.relationship(
        "Order",
        back_populates="items"
    )

    product = db.relationship(
        "Product",
        lazy="joined"
    )

    # ── NEW: relationship to AgentProduct ───────────────────────────────
    agent_product = db.relationship(
        "AgentProduct",
        lazy="joined"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "agent_product_id": self.agent_product_id,  # ← NEW
            "product_name": (self.product.name if self.product else (self.agent_product.name if self.agent_product else None)),
            "product_image": (self.product.image_url if self.product else (self.agent_product.image if self.agent_product else None)),

            "product": {
                "id": self.product.id,
                "name": self.product.name,
                "description": self.product.description,
                "image_url": self.product.image_url,
                "price": float(self.product.price)
            } if self.product else None,

            # ── NEW: agent-exclusive product payload ────────────────────
            "agent_product": {
                "id": self.agent_product.id,
                "name": self.agent_product.name,
                "description": self.agent_product.description,
                "image": self.agent_product.image,
                "price": float(self.agent_product.price)
            } if self.agent_product else None,

            "quantity": self.quantity,
            "price": float(self.price),

            "line_total": (
                float(self.line_total)
                if self.line_total is not None
                else float(self.price) * self.quantity
            ),

            "custom_json": self.custom_json,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            ),

            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at else None
            )
        }