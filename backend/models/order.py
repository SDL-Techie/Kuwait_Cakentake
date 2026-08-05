# # from extensions import db
# # from datetime import datetime


# # class Order(db.Model):
# #     __tablename__ = "orders"

# #     id = db.Column(db.Integer, primary_key=True)

# #     # ==========================================
# #     # CUSTOMER
# #     # ==========================================

# #     user_id = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=False
# #     )

# #     created_by = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     order_number = db.Column(
# #         db.String(50),
# #         unique=True,
# #         nullable=False
# #     )

# #     # direct_order | agent_order | partner_order
# #     order_type = db.Column(
# #         db.String(30),
# #         default="direct_order",
# #         nullable=False
# #     )


# #     # ==========================================
# #     # SALES AGENT CUSTOMER SNAPSHOT
# #     # ==========================================

# #     customer_name = db.Column(
# #     db.String(150),
# #     nullable=True
# #     )

# #     customer_phone = db.Column(
# #     db.String(30),
# #     nullable=True
# #     )

# #     customer_email = db.Column(
# #     db.String(120),
# #     nullable=True
# #     )

# #     customer_alt_phone = db.Column(
# #     db.String(30),
# #     nullable=True
# #     )


  

# #     # ==========================================
# #     # DELIVERY
# #     # ==========================================

# #     # address_id = db.Column(
# #     #     db.Integer,
# #     #     db.ForeignKey("addresses.id"),
# #     #     nullable=False
# #     # )

# #     # delivery_area = db.relationship(
# #     # "Area",
# #     # lazy="joined"
# #     # )


 

# #     # delivery_date = db.Column(
# #     #     db.Date,
# #     #     nullable=True
# #     # )

# #     address_id = db.Column(
# #     db.Integer,
# #     db.ForeignKey("addresses.id"),
# #     nullable=False
# #     )

# #     delivery_address_json = db.Column(
# #     db.JSON,
# #     nullable=True
# #     )

# #     delivery_area_id = db.Column(
# #     db.Integer,
# #     db.ForeignKey("areas.id"),
# #     nullable=True,
# #     index=True
# #     )


# #     delivery_area = db.relationship(
# #     "Area",
# #     foreign_keys=[delivery_area_id]
# #  )


# #     delivery_date = db.Column(
# #     db.Date,
# #     nullable=True
# #     )

# #     delivery_time_slot = db.Column(
# #         db.String(100),
# #         nullable=True
# #     )

# #     # ==========================================
# #     # ORDER STATUS
# #     # ==========================================
# #     # See constants/order_status.py ORDER_STATUS / ALLOWED_TRANSITIONS
# #     # for the full canonical list of values this can hold.

# #     status = db.Column(
# #         db.String(50),
# #         default="PENDING",
# #         nullable=False
# #     )

# #     rejection_reason = db.Column(
# #         db.Text,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # PAYMENT
# #     # ==========================================
# #     # payment_method: "COD" | "UPI" | "CARD" | "STRIPE" ...
# #     # payment_status: "PENDING" | "COMPLETED" | "FAILED"

# #     payment_method = db.Column(
# #         db.String(50),
# #         nullable=True
# #     )

# #     payment_status = db.Column(
# #         db.String(50),
# #         default="PENDING",
# #         nullable=False
# #     )

# #     # stripe_session_id = db.Column(
# #     #     db.String(255),
# #     #     nullable=True
# #     # )

# #     payment_gateway = db.Column(
# #     db.String(50),
# #     nullable=True
# #    )
# # # Examples:
# # # RAZORPAY
# # # TAP

# #     gateway_order_id = db.Column(
# #     db.String(255),
# #     nullable=True
# #     )

# #     gateway_payment_id = db.Column(
# #     db.String(255),
# #     nullable=True
# #     )

# #     gateway_transaction_id = db.Column(
# #     db.String(255),
# #     nullable=True
# #     )

# #     gateway_response = db.Column(
# #     db.JSON,
# #     nullable=True
# #     )

# #     # ==========================================
# #     # AMOUNTS
# #     # ==========================================

# #     total = db.Column(
# #         db.Numeric(10, 2),
# #         nullable=False
# #     )

# #     subtotal = db.Column(
# #         db.Numeric(10, 2),
# #         default=0
# #     )

# #     discount = db.Column(
# #         db.Numeric(10, 2),
# #         default=0
# #     )

# #     grand_total = db.Column(
# #         db.Numeric(10, 2),
# #         default=0
# #     )

# #     loyalty_coupon = db.Column(
# #         db.String(100),
# #         nullable=True
# #     )

# #     delivery_charge = db.Column(
# #         db.Numeric(10, 2),
# #         default=0
# #     )

# #     # Order-level addons (stored as JSON array of { addon_id, quantity, price, total })
# #     order_addons_json = db.Column(
# #         db.JSON,
# #         nullable=True
# #     )

# #     order_addons_total = db.Column(
# #         db.Numeric(10, 2),
# #         default=0
# #     )

# #     currency = db.Column(
# #         db.String(10),
# #         default="KWD"
# #     )

# #     coupon_id = db.Column(
# #         db.Integer,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # KITCHEN WORKFLOW
# #     # ==========================================

# #     kitchen_staff_id = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )


# #     kitchen_assigned_by = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     kitchen_assigned_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     preparation_started_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     preparation_started_by = db.Column(
# #     db.Integer,
# #     db.ForeignKey("users.id"),
# #     nullable=True
# #     )

# #     preparation_started_user = db.relationship(
# #     "User",
# #     foreign_keys=[preparation_started_by],
# #     lazy="joined"
# #     )

# #     completed_by_kitchen_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # DELIVERY AGENT WORKFLOW  (owner/shop manager -> delivery agent)
# #     # ==========================================
# #     # The delivery agent is the dispatcher who picks a driver. This is
# #     # intentionally a SEPARATE column from driver_id below — these are
# #     # two different roles (DELIVERY_AGENT vs DRIVER) and must never
# #     # share a foreign key.

# #     delivery_agent_id = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     delivery_agent_assigned_by = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     delivery_agent_assigned_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # DRIVER WORKFLOW  (delivery agent -> driver)
# #     # ==========================================

# #     driver_id = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     driver_assigned_by = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     driver_assigned_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     driver_accepted_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     out_for_delivery_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     delivered_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # DELIVERY PROOF  (driver -> delivery agent)
# #     # ==========================================

# #     delivery_photo = db.Column(
# #         db.String(500),
# #         nullable=True
# #     )

# #     delivery_notes = db.Column(
# #         db.Text,
# #         nullable=True
# #     )

# #     customer_confirmation_name = db.Column(
# #         db.String(150),
# #         nullable=True
# #     )

# #     customer_confirmation_phone = db.Column(
# #         db.String(30),
# #         nullable=True
# #     )


# #     custom_cake_json = db.Column(
# #     db.JSON,
# #     nullable=True
# #     )

# #     # When the driver submits proof of drop-off (photo / notes), before the
# #     # delivery agent gives the final confirmation.
# #     driver_submitted_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # FINAL CONFIRMATION  (delivery agent -> admin / shop manager)
# #     # ==========================================

# #     delivery_confirmed_by = db.Column(
# #         db.Integer,
# #         db.ForeignKey("users.id"),
# #         nullable=True
# #     )

# #     delivery_confirmed_at = db.Column(
# #         db.DateTime,
# #         nullable=True
# #     )

# #     # ==========================================
# #     # AUDIT
# #     # ==========================================

# #     order_date = db.Column(
# #         db.DateTime,
# #         default=datetime.utcnow
# #     )

# #     created_at = db.Column(
# #         db.DateTime,
# #         default=datetime.utcnow
# #     )

# #     updated_at = db.Column(
# #         db.DateTime,
# #         default=datetime.utcnow,
# #         onupdate=datetime.utcnow
# #     )

# #     # ==========================================
# #     # GREETING CARD
# #     # ==========================================

# #     greeting_message = db.Column(db.Text, nullable=True)
# #     greeting_from = db.Column(db.String(150), nullable=True)
# #     greeting_to = db.Column(db.String(150), nullable=True)

# #     # ==========================================
# #     # IMAGES & SOURCE
# #     # ==========================================

# #     delivery_images = db.Column(db.JSON, default=list)
# #     order_source_id = db.Column(
# #         db.Integer,
# #         db.ForeignKey("order_sources.id"),
# #         nullable=True
# #     )

# #     order_source = db.Column(
# #     db.String(50),
# #     nullable=True
# #     )

# #     # ==========================================
# #     # DRIVER SETTLEMENT (kept from original, fixed: now properly inside class)
# #     # ==========================================

# #     is_driver_settled = db.Column(
# #         db.Boolean,
# #         default=False
# #     )

# #     driver_settlement_id = db.Column(
# #         db.Integer,
# #         db.ForeignKey("driver_settlements.id"),
# #         nullable=True
# #     )

# #     # ==========================================
# #     # RELATIONSHIPS
# #     # ==========================================

# #     customer = db.relationship(
# #         "User",
# #         foreign_keys=[user_id],
# #         lazy="joined",
# #         back_populates="orders"
# #     )

# #     creator = db.relationship(
# #         "User",
# #         foreign_keys=[created_by],
# #         lazy="joined"
# #     )

# #     kitchen_staff = db.relationship(
# #         "User",
# #         foreign_keys=[kitchen_staff_id],
# #         lazy="joined"
# #     )

# #     delivery_agent = db.relationship(
# #         "User",
# #         foreign_keys=[delivery_agent_id],
# #         lazy="joined"
# #     )

# #     driver = db.relationship(
# #         "User",
# #         foreign_keys=[driver_id],
# #         lazy="joined"
# #     )

# #     address = db.relationship(
# #         "Address",
# #         lazy="joined"
# #     )

# #     items = db.relationship(
# #         "OrderItem",
# #         back_populates="order",
# #         cascade="all, delete-orphan",
# #         lazy="selectin"
# #     )

# #     finance_synced = db.Column(
# #     db.Boolean,
# #     default=False,
# #     nullable=False
# #     )

# #     # ==========================================
# #     # RESPONSE
# #     # ==========================================

# #     def _user_brief(self, user):
# #         if not user:
# #             return None
# #         return {
# #             "id": user.id,
# #             "first_name": user.first_name,
# #             "last_name": user.last_name,
# #             "name": f"{user.first_name} {user.last_name}".strip(),
# #             "email": user.email,
# #             "phone_no": user.phone_no,
# #             "role": user.role,
# #         }

# #     def to_dict(self):
# #         return {
# #             "id": self.id,
# #             "order_number": self.order_number,
# #             "order_type": self.order_type,
# #             "order_source": self.order_source,

# #             "customer": self._user_brief(self.customer),
# #             "customer_name": self.customer_name,
# # "customer_phone": self.customer_phone,
# # "customer_email": self.customer_email,
# # "customer_alt_phone": self.customer_alt_phone,

# #             "status": self.status,
# #             "rejection_reason": self.rejection_reason,

# #             "payment_method": self.payment_method,
# #             "payment_status": self.payment_status,
# #             "finance_synced": self.finance_synced,

# #             "total": float(self.total),
# #             "subtotal": float(self.subtotal or 0),
# #             "delivery_charge": float(self.delivery_charge or 0),
# #             "discount": float(self.discount or 0),
# #             "grand_total": float(self.grand_total or 0),
# #             "loyalty_coupon": self.loyalty_coupon,
# #             "currency": self.currency,

# #             "order_addons": self.order_addons_json or [],
# #             "order_addons_total": float(self.order_addons_total or 0),

# #             "kitchen_staff_id": self.kitchen_staff_id,
# #             "kitchen_staff": self._user_brief(self.kitchen_staff),
# #             "kitchen_assigned_at": (
# #                 self.kitchen_assigned_at.isoformat()
# #                 if self.kitchen_assigned_at else None
# #             ),
# #             "preparation_started_at": (
# #                 self.preparation_started_at.isoformat()
# #                 if self.preparation_started_at else None
# #             ),
# #             "preparation_started_by": self._user_brief(
# #             self.preparation_started_user
# #             ),

# #             "completed_by_kitchen_at": (
# #                 self.completed_by_kitchen_at.isoformat()
# #                 if self.completed_by_kitchen_at else None
# #             ),

# #             # Delivery agent (dispatcher) — distinct from driver
# #             "delivery_agent_id": self.delivery_agent_id,
# #             "delivery_agent": self._user_brief(self.delivery_agent),
# #             "delivery_agent_assigned_at": (
# #                 self.delivery_agent_assigned_at.isoformat()
# #                 if self.delivery_agent_assigned_at else None
# #             ),

# #             # Driver — distinct from delivery agent
# #             "driver_id": self.driver_id,
# #             "driver": self._user_brief(self.driver),
# #             "driver_assigned_at": (
# #                 self.driver_assigned_at.isoformat()
# #                 if self.driver_assigned_at else None
# #             ),
# #             "driver_accepted_at": (
# #                 self.driver_accepted_at.isoformat()
# #                 if self.driver_accepted_at else None
# #             ),
# #             "driver_submitted_at": (
# #                 self.driver_submitted_at.isoformat()
# #                 if self.driver_submitted_at else None
# #             ),

# #             "out_for_delivery_at": (
# #                 self.out_for_delivery_at.isoformat()
# #                 if self.out_for_delivery_at else None
# #             ),
# #             "order_date": (
# #                self.order_date.isoformat()
# #                if self.order_date
# #               else None
# #              ),

# #             "delivery_photo": self.delivery_photo,
# #             "delivery_notes": self.delivery_notes,

# #             "customer_confirmation_name":
# #                 self.customer_confirmation_name,

# #             "customer_confirmation_phone":
# #                 self.customer_confirmation_phone,

# #             "delivered_at": (
# #                 self.delivered_at.isoformat()
# #                 if self.delivered_at else None
# #             ),

# #             "delivery_address_json": self.delivery_address_json,

# #             "delivery_confirmed_by": self.delivery_confirmed_by,
# #             "delivery_confirmed_at": (
# #                 self.delivery_confirmed_at.isoformat()
# #                 if self.delivery_confirmed_at else None
# #             ),

# #             # "delivery_address": {
# #             #     "id": self.address.id,
# #             #     "street": self.address.street,
# #             #     "city": self.address.city,
# #             #     "state": self.address.state,
# #             #     "pincode": self.address.pincode,
# #             #     "country": self.address.country
# #             # } if self.address else None,

# #             "delivery_address": self.address.to_dict() if self.address else None,
# #             "delivery_date": (
# #                 self.delivery_date.isoformat()
# #                 if self.delivery_date else None
# #             ),
# #             "delivery_time_slot": self.delivery_time_slot,
# #             "delivery_area_id": self.delivery_area_id,
# #             "delivery_area": (
# #              self.delivery_area.to_dict()
# #             if self.delivery_area
# #              else None
# #             ),
# #             "payment_gateway": self.payment_gateway,
# #             "gateway_order_id": self.gateway_order_id,
# #             "gateway_payment_id": self.gateway_payment_id,
# #             "gateway_transaction_id": self.gateway_transaction_id,
# #             "gateway_response": self.gateway_response,
# #             "created_at": self.created_at.isoformat(),
# #             "updated_at": self.updated_at.isoformat(),
# #             "created_by": self._user_brief(self.creator),
# #             "greeting_message": self.greeting_message,
# #             "greeting_from": self.greeting_from,
# #             "greeting_to": self.greeting_to,
# #             "delivery_images": self.delivery_images or [],
# #             "order_source_id": self.order_source_id,
# #             "custom_cake_json": self.custom_cake_json,
# #             "is_driver_settled": self.is_driver_settled,
# #             "driver_settlement_id": self.driver_settlement_id,

# #             "items": [
# #                 item.to_dict()
# #                 for item in self.items
# #             ]
# #         }



# from extensions import db
# from datetime import datetime


# class Order(db.Model):
#     __tablename__ = "orders"

#     id = db.Column(db.Integer, primary_key=True)

#     # ==========================================
#     # CUSTOMER
#     # ==========================================

#     user_id = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=False
#     )

#     created_by = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     order_number = db.Column(
#         db.String(50),
#         unique=True,
#         nullable=False
#     )

#     # direct_order | agent_order | partner_order
#     order_type = db.Column(
#         db.String(30),
#         default="direct_order",
#         nullable=False
#     )


#     # ==========================================
#     # SALES AGENT CUSTOMER SNAPSHOT
#     # ==========================================

#     customer_name = db.Column(
#     db.String(150),
#     nullable=True
#     )

#     customer_phone = db.Column(
#     db.String(30),
#     nullable=True
#     )

#     customer_email = db.Column(
#     db.String(120),
#     nullable=True
#     )

#     customer_alt_phone = db.Column(
#     db.String(30),
#     nullable=True
#     )


  

#     # ==========================================
#     # DELIVERY
#     # ==========================================

#     # address_id = db.Column(
#     #     db.Integer,
#     #     db.ForeignKey("addresses.id"),
#     #     nullable=False
#     # )

#     # delivery_area = db.relationship(
#     # "Area",
#     # lazy="joined"
#     # )


 

#     # delivery_date = db.Column(
#     #     db.Date,
#     #     nullable=True
#     # )

#     address_id = db.Column(
#     db.Integer,
#     db.ForeignKey("addresses.id"),
#     nullable=True
#     )

#     delivery_address_json = db.Column(
#     db.JSON,
#     nullable=True
#     )

#     delivery_area_id = db.Column(
#     db.Integer,
#     db.ForeignKey("areas.id"),
#     nullable=True,
#     index=True
#     )


#     delivery_area = db.relationship(
#     "Area",
#     foreign_keys=[delivery_area_id]
#  )


#     delivery_date = db.Column(
#     db.Date,
#     nullable=True
#     )

#     delivery_time_slot = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     # ==========================================
#     # ORDER STATUS
#     # ==========================================
#     # See constants/order_status.py ORDER_STATUS / ALLOWED_TRANSITIONS
#     # for the full canonical list of values this can hold.

#     status = db.Column(
#         db.String(50),
#         default="PENDING",
#         nullable=False
#     )

#     rejection_reason = db.Column(
#         db.Text,
#         nullable=True
#     )

#     # ==========================================
#     # PAYMENT
#     # ==========================================
#     # payment_method: "COD" | "UPI" | "CARD" | "STRIPE" ...
#     # payment_status: "PENDING" | "COMPLETED" | "FAILED"

#     payment_method = db.Column(
#         db.String(50),
#         nullable=True
#     )

#     payment_status = db.Column(
#         db.String(50),
#         default="PENDING",
#         nullable=False
#     )

#     # stripe_session_id = db.Column(
#     #     db.String(255),
#     #     nullable=True
#     # )

#     payment_gateway = db.Column(
#     db.String(50),
#     nullable=True
#    )
# # Examples:
# # RAZORPAY
# # TAP

#     gateway_order_id = db.Column(
#     db.String(255),
#     nullable=True
#     )

#     gateway_payment_id = db.Column(
#     db.String(255),
#     nullable=True
#     )

#     gateway_transaction_id = db.Column(
#     db.String(255),
#     nullable=True
#     )

#     gateway_response = db.Column(
#     db.JSON,
#     nullable=True
#     )

#     # ==========================================
#     # AMOUNTS
#     # ==========================================

#     total = db.Column(
#         db.Numeric(10, 2),
#         nullable=False
#     )

#     subtotal = db.Column(
#         db.Numeric(10, 2),
#         default=0
#     )

#     discount = db.Column(
#         db.Numeric(10, 2),
#         default=0
#     )

#     grand_total = db.Column(
#         db.Numeric(10, 2),
#         default=0
#     )

#     loyalty_coupon = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     delivery_charge = db.Column(
#         db.Numeric(10, 2),
#         default=0
#     )

#     # Order-level addons (stored as JSON array of { addon_id, quantity, price, total })
#     order_addons_json = db.Column(
#         db.JSON,
#         nullable=True
#     )

#     order_addons_total = db.Column(
#         db.Numeric(10, 2),
#         default=0
#     )

#     currency = db.Column(
#         db.String(10),
#         default="KWD"
#     )

#     coupon_id = db.Column(
#         db.Integer,
#         nullable=True
#     )

#     # ==========================================
#     # KITCHEN WORKFLOW
#     # ==========================================

#     kitchen_staff_id = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )


#     kitchen_assigned_by = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     kitchen_assigned_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     preparation_started_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     preparation_started_by = db.Column(
#     db.Integer,
#     db.ForeignKey("users.id"),
#     nullable=True
#     )

#     preparation_started_user = db.relationship(
#     "User",
#     foreign_keys=[preparation_started_by],
#     lazy="joined"
#     )

#     completed_by_kitchen_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # ==========================================
#     # DELIVERY AGENT WORKFLOW  (owner/shop manager -> delivery agent)
#     # ==========================================
#     # The delivery agent is the dispatcher who picks a driver. This is
#     # intentionally a SEPARATE column from driver_id below — these are
#     # two different roles (DELIVERY_AGENT vs DRIVER) and must never
#     # share a foreign key.

#     delivery_agent_id = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     delivery_agent_assigned_by = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     delivery_agent_assigned_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # ==========================================
#     # DRIVER WORKFLOW  (delivery agent -> driver)
#     # ==========================================

#     driver_id = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     driver_assigned_by = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     driver_assigned_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     driver_accepted_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     out_for_delivery_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     delivered_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # ==========================================
#     # DELIVERY PROOF  (driver -> delivery agent)
#     # ==========================================

#     delivery_photo = db.Column(
#         db.String(500),
#         nullable=True
#     )

#     delivery_notes = db.Column(
#         db.Text,
#         nullable=True
#     )

#     customer_confirmation_name = db.Column(
#         db.String(150),
#         nullable=True
#     )

#     customer_confirmation_phone = db.Column(
#         db.String(30),
#         nullable=True
#     )


#     custom_cake_json = db.Column(
#     db.JSON,
#     nullable=True
#     )

#     # When the driver submits proof of drop-off (photo / notes), before the
#     # delivery agent gives the final confirmation.
#     driver_submitted_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # ==========================================
#     # FINAL CONFIRMATION  (delivery agent -> admin / shop manager)
#     # ==========================================

#     delivery_confirmed_by = db.Column(
#         db.Integer,
#         db.ForeignKey("users.id"),
#         nullable=True
#     )

#     delivery_confirmed_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # ==========================================
#     # AUDIT
#     # ==========================================

#     order_date = db.Column(
#         db.DateTime,
#         default=datetime.utcnow
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

#     # ==========================================
#     # GREETING CARD
#     # ==========================================

#     greeting_message = db.Column(db.Text, nullable=True)
#     greeting_from = db.Column(db.String(150), nullable=True)
#     greeting_to = db.Column(db.String(150), nullable=True)

#     # ==========================================
#     # IMAGES & SOURCE
#     # ==========================================

#     delivery_images = db.Column(db.JSON, default=list)
#     order_source_id = db.Column(
#         db.Integer,
#         db.ForeignKey("order_sources.id"),
#         nullable=True
#     )

#     order_source = db.Column(
#     db.String(50),
#     nullable=True
#     )

#     # ==========================================
#     # DRIVER SETTLEMENT (kept from original, fixed: now properly inside class)
#     # ==========================================

#     is_driver_settled = db.Column(
#         db.Boolean,
#         default=False
#     )

#     driver_settlement_id = db.Column(
#         db.Integer,
#         db.ForeignKey("driver_settlements.id"),
#         nullable=True
#     )

#     # ==========================================
#     # RELATIONSHIPS
#     # ==========================================

#     customer = db.relationship(
#         "User",
#         foreign_keys=[user_id],
#         lazy="joined",
#         back_populates="orders"
#     )

#     creator = db.relationship(
#         "User",
#         foreign_keys=[created_by],
#         lazy="joined"
#     )

#     kitchen_staff = db.relationship(
#         "User",
#         foreign_keys=[kitchen_staff_id],
#         lazy="joined"
#     )

#     delivery_agent = db.relationship(
#         "User",
#         foreign_keys=[delivery_agent_id],
#         lazy="joined"
#     )

#     driver = db.relationship(
#         "User",
#         foreign_keys=[driver_id],
#         lazy="joined"
#     )

#     address = db.relationship(
#         "Address",
#         lazy="joined"
#     )

#     items = db.relationship(
#         "OrderItem",
#         back_populates="order",
#         cascade="all, delete-orphan",
#         lazy="selectin"
#     )

#     finance_synced = db.Column(
#     db.Boolean,
#     default=False,
#     nullable=False
#     )

#     # ==========================================
#     # RESPONSE
#     # ==========================================

#     def _user_brief(self, user):
#         if not user:
#             return None
#         return {
#             "id": user.id,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "name": f"{user.first_name} {user.last_name}".strip(),
#             "email": user.email,
#             "phone_no": user.phone_no,
#             "role": user.role,
#         }

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "order_number": self.order_number,
#             "order_type": self.order_type,
#             "order_source": self.order_source,

#             "customer": self._user_brief(self.customer),
#             "customer_name": self.customer_name,
# "customer_phone": self.customer_phone,
# "customer_email": self.customer_email,
# "customer_alt_phone": self.customer_alt_phone,

#             "status": self.status,
#             "rejection_reason": self.rejection_reason,

#             "payment_method": self.payment_method,
#             "payment_status": self.payment_status,
#             "finance_synced": self.finance_synced,

#             "total": float(self.total),
#             "subtotal": float(self.subtotal or 0),
#             "delivery_charge": float(self.delivery_charge or 0),
#             "discount": float(self.discount or 0),
#             "grand_total": float(self.grand_total or 0),
#             "loyalty_coupon": self.loyalty_coupon,
#             "currency": self.currency,

#             "order_addons": self.order_addons_json or [],
#             "order_addons_total": float(self.order_addons_total or 0),

#             "kitchen_staff_id": self.kitchen_staff_id,
#             "kitchen_staff": self._user_brief(self.kitchen_staff),
#             "kitchen_assigned_at": (
#                 self.kitchen_assigned_at.isoformat()
#                 if self.kitchen_assigned_at else None
#             ),
#             "preparation_started_at": (
#                 self.preparation_started_at.isoformat()
#                 if self.preparation_started_at else None
#             ),
#             "preparation_started_by": self._user_brief(
#             self.preparation_started_user
#             ),

#             "completed_by_kitchen_at": (
#                 self.completed_by_kitchen_at.isoformat()
#                 if self.completed_by_kitchen_at else None
#             ),

#             # Delivery agent (dispatcher) — distinct from driver
#             "delivery_agent_id": self.delivery_agent_id,
#             "delivery_agent": self._user_brief(self.delivery_agent),
#             "delivery_agent_assigned_at": (
#                 self.delivery_agent_assigned_at.isoformat()
#                 if self.delivery_agent_assigned_at else None
#             ),

#             # Driver — distinct from delivery agent
#             "driver_id": self.driver_id,
#             "driver": self._user_brief(self.driver),
#             "driver_assigned_at": (
#                 self.driver_assigned_at.isoformat()
#                 if self.driver_assigned_at else None
#             ),
#             "driver_accepted_at": (
#                 self.driver_accepted_at.isoformat()
#                 if self.driver_accepted_at else None
#             ),
#             "driver_submitted_at": (
#                 self.driver_submitted_at.isoformat()
#                 if self.driver_submitted_at else None
#             ),

#             "out_for_delivery_at": (
#                 self.out_for_delivery_at.isoformat()
#                 if self.out_for_delivery_at else None
#             ),
#             "order_date": (
#                self.order_date.isoformat()
#                if self.order_date
#               else None
#              ),

#             "delivery_photo": self.delivery_photo,
#             "delivery_notes": self.delivery_notes,

#             "customer_confirmation_name":
#                 self.customer_confirmation_name,

#             "customer_confirmation_phone":
#                 self.customer_confirmation_phone,

#             "delivered_at": (
#                 self.delivered_at.isoformat()
#                 if self.delivered_at else None
#             ),

#             "delivery_address_json": self.delivery_address_json,

#             "delivery_confirmed_by": self.delivery_confirmed_by,
#             "delivery_confirmed_at": (
#                 self.delivery_confirmed_at.isoformat()
#                 if self.delivery_confirmed_at else None
#             ),

#             # "delivery_address": {
#             #     "id": self.address.id,
#             #     "street": self.address.street,
#             #     "city": self.address.city,
#             #     "state": self.address.state,
#             #     "pincode": self.address.pincode,
#             #     "country": self.address.country
#             # } if self.address else None,

#             "delivery_address": self.address.to_dict() if self.address else None,
#             "delivery_date": (
#                 self.delivery_date.isoformat()
#                 if self.delivery_date else None
#             ),
#             "delivery_time_slot": self.delivery_time_slot,
#             "delivery_area_id": self.delivery_area_id,
#             "delivery_area": (
#              self.delivery_area.to_dict()
#             if self.delivery_area
#              else None
#             ),
#             "payment_gateway": self.payment_gateway,
#             "gateway_order_id": self.gateway_order_id,
#             "gateway_payment_id": self.gateway_payment_id,
#             "gateway_transaction_id": self.gateway_transaction_id,
#             "gateway_response": self.gateway_response,
#             "created_at": self.created_at.isoformat(),
#             "updated_at": self.updated_at.isoformat(),
#             "created_by": self._user_brief(self.creator),
#             "greeting_message": self.greeting_message,
#             "greeting_from": self.greeting_from,
#             "greeting_to": self.greeting_to,
#             "delivery_images": self.delivery_images or [],
#             "order_source_id": self.order_source_id,
#             "custom_cake_json": self.custom_cake_json,
#             "is_driver_settled": self.is_driver_settled,
#             "driver_settlement_id": self.driver_settlement_id,

#             "items": [
#                 item.to_dict()
#                 for item in self.items
#             ]
#         }



from extensions import db
from datetime import datetime


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)

    # ==========================================
    # CUSTOMER
    # ==========================================

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    order_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    # direct_order | agent_order | partner_order
    order_type = db.Column(
        db.String(30),
        default="direct_order",
        nullable=False
    )


    # ==========================================
    # SALES AGENT CUSTOMER SNAPSHOT
    # ==========================================

    customer_name = db.Column(
    db.String(150),
    nullable=True
    )

    customer_phone = db.Column(
    db.String(30),
    nullable=True
    )

    customer_email = db.Column(
    db.String(120),
    nullable=True
    )

    customer_alt_phone = db.Column(
    db.String(30),
    nullable=True
    )


  

    # ==========================================
    # DELIVERY
    # ==========================================

    # address_id = db.Column(
    #     db.Integer,
    #     db.ForeignKey("addresses.id"),
    #     nullable=False
    # )

    # delivery_area = db.relationship(
    # "Area",
    # lazy="joined"
    # )


 

    # delivery_date = db.Column(
    #     db.Date,
    #     nullable=True
    # )

    address_id = db.Column(
    db.Integer,
    db.ForeignKey("addresses.id"),
    nullable=True
    )

    delivery_address_json = db.Column(
    db.JSON,
    nullable=True
    )

    delivery_area_id = db.Column(
    db.Integer,
    db.ForeignKey("areas.id"),
    nullable=True,
    index=True
    )


    delivery_area = db.relationship(
    "Area",
    foreign_keys=[delivery_area_id]
 )


    delivery_date = db.Column(
    db.Date,
    nullable=True
    )

    delivery_time_slot = db.Column(
        db.String(100),
        nullable=True
    )

    # New: delivery_method and pickup fields to support pickup orders
    # delivery_method values: 'DELIVERY' | 'PICKUP'
    delivery_method = db.Column(
        db.String(20),
        default="DELIVERY",
        nullable=False,
    )

    pickup_date = db.Column(
        db.Date,
        nullable=True
    )

    pickup_time_slot = db.Column(
        db.String(100),
        nullable=True
    )

    # ==========================================
    # ORDER STATUS
    # ==========================================
    # See constants/order_status.py ORDER_STATUS / ALLOWED_TRANSITIONS
    # for the full canonical list of values this can hold.

    status = db.Column(
        db.String(50),
        default="PENDING",
        nullable=False
    )

    rejection_reason = db.Column(
        db.Text,
        nullable=True
    )

    # ==========================================
    # PAYMENT
    # ==========================================
    # payment_method: "COD" | "UPI" | "CARD" | "STRIPE" ...
    # payment_status: "PENDING" | "COMPLETED" | "FAILED"

    payment_method = db.Column(
        db.String(50),
        nullable=True
    )

    payment_status = db.Column(
        db.String(50),
        default="PENDING",
        nullable=False
    )

    # stripe_session_id = db.Column(
    #     db.String(255),
    #     nullable=True
    # )

    payment_gateway = db.Column(
    db.String(50),
    nullable=True
   )
# Examples:
# RAZORPAY
# TAP

    gateway_order_id = db.Column(
    db.String(255),
    nullable=True
    )

    gateway_payment_id = db.Column(
    db.String(255),
    nullable=True
    )

    gateway_transaction_id = db.Column(
    db.String(255),
    nullable=True
    )

    gateway_response = db.Column(
    db.JSON,
    nullable=True
    )

    # ==========================================
    # AMOUNTS
    # ==========================================

    total = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    subtotal = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    discount = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    grand_total = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    loyalty_coupon = db.Column(
        db.String(100),
        nullable=True
    )

    delivery_charge = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    # Order-level addons (stored as JSON array of { addon_id, quantity, price, total })
    order_addons_json = db.Column(
        db.JSON,
        nullable=True
    )

    order_addons_total = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    currency = db.Column(
        db.String(10),
        default="KWD"
    )

    coupon_id = db.Column(
        db.Integer,
        nullable=True
    )

    # ==========================================
    # KITCHEN WORKFLOW
    # ==========================================

    kitchen_staff_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )


    kitchen_assigned_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    kitchen_assigned_at = db.Column(
        db.DateTime,
        nullable=True
    )

    preparation_started_at = db.Column(
        db.DateTime,
        nullable=True
    )

    preparation_started_by = db.Column(
    db.Integer,
    db.ForeignKey("users.id"),
    nullable=True
    )

    preparation_started_user = db.relationship(
    "User",
    foreign_keys=[preparation_started_by],
    lazy="joined"
    )

    completed_by_kitchen_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # ==========================================
    # DELIVERY AGENT WORKFLOW  (owner/shop manager -> delivery agent)
    # ==========================================
    # The delivery agent is the dispatcher who picks a driver. This is
    # intentionally a SEPARATE column from driver_id below — these are
    # two different roles (DELIVERY_AGENT vs DRIVER) and must never
    # share a foreign key.

    delivery_agent_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    delivery_agent_assigned_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    delivery_agent_assigned_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # ==========================================
    # DRIVER WORKFLOW  (delivery agent -> driver)
    # ==========================================

    driver_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    driver_assigned_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    driver_assigned_at = db.Column(
        db.DateTime,
        nullable=True
    )

    driver_accepted_at = db.Column(
        db.DateTime,
        nullable=True
    )

    out_for_delivery_at = db.Column(
        db.DateTime,
        nullable=True
    )

    delivered_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # ==========================================
    # DELIVERY PROOF  (driver -> delivery agent)
    # ==========================================

    delivery_photo = db.Column(
        db.String(500),
        nullable=True
    )

    delivery_notes = db.Column(
        db.Text,
        nullable=True
    )

    customer_confirmation_name = db.Column(
        db.String(150),
        nullable=True
    )

    customer_confirmation_phone = db.Column(
        db.String(30),
        nullable=True
    )


    custom_cake_json = db.Column(
    db.JSON,
    nullable=True
    )

    # When the driver submits proof of drop-off (photo / notes), before the
    # delivery agent gives the final confirmation.
    driver_submitted_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # ==========================================
    # FINAL CONFIRMATION  (delivery agent -> admin / shop manager)
    # ==========================================

    delivery_confirmed_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    delivery_confirmed_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # ==========================================
    # AUDIT
    # ==========================================

    order_date = db.Column(
        db.DateTime,
        default=datetime.utcnow
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

    # ==========================================
    # GREETING CARD
    # ==========================================

    greeting_message = db.Column(db.Text, nullable=True)
    greeting_from = db.Column(db.String(150), nullable=True)
    greeting_to = db.Column(db.String(150), nullable=True)

    # ==========================================
    # IMAGES & SOURCE
    # ==========================================

    delivery_images = db.Column(db.JSON, default=list)
    order_source_id = db.Column(
        db.Integer,
        db.ForeignKey("order_sources.id"),
        nullable=True
    )

    order_source = db.Column(
    db.String(50),
    nullable=True
    )

    # ==========================================
    # DRIVER SETTLEMENT (kept from original, fixed: now properly inside class)
    # ==========================================

    is_driver_settled = db.Column(
        db.Boolean,
        default=False
    )

    driver_settlement_id = db.Column(
        db.Integer,
        db.ForeignKey("driver_settlements.id"),
        nullable=True
    )

    # ==========================================
    # RELATIONSHIPS
    # ==========================================

    customer = db.relationship(
        "User",
        foreign_keys=[user_id],
        lazy="joined",
        back_populates="orders"
    )

    creator = db.relationship(
        "User",
        foreign_keys=[created_by],
        lazy="joined"
    )

    kitchen_staff = db.relationship(
        "User",
        foreign_keys=[kitchen_staff_id],
        lazy="joined"
    )

    delivery_agent = db.relationship(
        "User",
        foreign_keys=[delivery_agent_id],
        lazy="joined"
    )

    driver = db.relationship(
        "User",
        foreign_keys=[driver_id],
        lazy="joined"
    )

    address = db.relationship(
        "Address",
        lazy="joined"
    )

    items = db.relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    finance_synced = db.Column(
    db.Boolean,
    default=False,
    nullable=False
    )

    # ==========================================
    # RESPONSE
    # ==========================================

    def _user_brief(self, user):
        if not user:
            return None
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone_no": user.phone_no,
            "role": user.role,
        }

    def to_dict(self):
        return {
            "id": self.id,
            "order_number": self.order_number,
            "order_type": self.order_type,
            "order_source": self.order_source,

            "customer": self._user_brief(self.customer),
            "customer_name": self.customer_name,
"customer_phone": self.customer_phone,
"customer_email": self.customer_email,
"customer_alt_phone": self.customer_alt_phone,

            "status": self.status,
            "rejection_reason": self.rejection_reason,

            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "finance_synced": self.finance_synced,

            "total": float(self.total),
            "subtotal": float(self.subtotal or 0),
            "delivery_charge": float(self.delivery_charge or 0),
            "discount": float(self.discount or 0),
            "grand_total": float(self.grand_total or 0),
            "loyalty_coupon": self.loyalty_coupon,
            "currency": self.currency,

            "order_addons": self.order_addons_json or [],
            "order_addons_total": float(self.order_addons_total or 0),

            "kitchen_staff_id": self.kitchen_staff_id,
            "kitchen_staff": self._user_brief(self.kitchen_staff),
            "kitchen_assigned_at": (
                self.kitchen_assigned_at.isoformat()
                if self.kitchen_assigned_at else None
            ),
            "preparation_started_at": (
                self.preparation_started_at.isoformat()
                if self.preparation_started_at else None
            ),
            "preparation_started_by": self._user_brief(
            self.preparation_started_user
            ),

            "completed_by_kitchen_at": (
                self.completed_by_kitchen_at.isoformat()
                if self.completed_by_kitchen_at else None
            ),

            # Delivery agent (dispatcher) — distinct from driver
            "delivery_agent_id": self.delivery_agent_id,
            "delivery_agent": self._user_brief(self.delivery_agent),
            "delivery_agent_assigned_at": (
                self.delivery_agent_assigned_at.isoformat()
                if self.delivery_agent_assigned_at else None
            ),

            # Driver — distinct from delivery agent
            "driver_id": self.driver_id,
            "driver": self._user_brief(self.driver),
            "driver_assigned_at": (
                self.driver_assigned_at.isoformat()
                if self.driver_assigned_at else None
            ),
            "driver_accepted_at": (
                self.driver_accepted_at.isoformat()
                if self.driver_accepted_at else None
            ),
            "driver_submitted_at": (
                self.driver_submitted_at.isoformat()
                if self.driver_submitted_at else None
            ),

            "out_for_delivery_at": (
                self.out_for_delivery_at.isoformat()
                if self.out_for_delivery_at else None
            ),
            "order_date": (
               self.order_date.isoformat()
               if self.order_date
              else None
             ),

            "delivery_photo": self.delivery_photo,
            "delivery_notes": self.delivery_notes,

            "customer_confirmation_name":
                self.customer_confirmation_name,

            "customer_confirmation_phone":
                self.customer_confirmation_phone,

            "delivered_at": (
                self.delivered_at.isoformat()
                if self.delivered_at else None
            ),

            "delivery_address_json": self.delivery_address_json,

            "delivery_confirmed_by": self.delivery_confirmed_by,
            "delivery_confirmed_at": (
                self.delivery_confirmed_at.isoformat()
                if self.delivery_confirmed_at else None
            ),

            # "delivery_address": {
            #     "id": self.address.id,
            #     "street": self.address.street,
            #     "city": self.address.city,
            #     "state": self.address.state,
            #     "pincode": self.address.pincode,
            #     "country": self.address.country
            # } if self.address else None,

            "delivery_address": self.address.to_dict() if self.address else None,
            "delivery_method": self.delivery_method,
            "pickup_date": (
                self.pickup_date.isoformat() if self.pickup_date else None
            ),
            "pickup_time_slot": self.pickup_time_slot,
            "delivery_date": (
                self.delivery_date.isoformat()
                if self.delivery_date else None
            ),
            "delivery_time_slot": self.delivery_time_slot,
            "delivery_area_id": self.delivery_area_id,
            "delivery_area": (
             self.delivery_area.to_dict()
            if self.delivery_area
             else None
            ),
            "payment_gateway": self.payment_gateway,
            "gateway_order_id": self.gateway_order_id,
            "gateway_payment_id": self.gateway_payment_id,
            "gateway_transaction_id": self.gateway_transaction_id,
            "gateway_response": self.gateway_response,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "created_by": self._user_brief(self.creator),
            "greeting_message": self.greeting_message,
            "greeting_from": self.greeting_from,
            "greeting_to": self.greeting_to,
            "delivery_images": self.delivery_images or [],
            "order_source_id": self.order_source_id,
            "custom_cake_json": self.custom_cake_json,
            "is_driver_settled": self.is_driver_settled,
            "driver_settlement_id": self.driver_settlement_id,

            "items": [
                item.to_dict()
                for item in self.items
            ]
        }