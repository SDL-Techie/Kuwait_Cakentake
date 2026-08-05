# from extensions import db
# from datetime import datetime


# class Expense(db.Model):
#     __tablename__ = "expenses"

#     id = db.Column(db.Integer, primary_key=True)
#     category = db.Column(db.String(100), nullable=False)
#     description = db.Column(db.Text, nullable=True)
#     amount = db.Column(db.Numeric(10, 2), nullable=False)
#     paid_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
#     expense_date = db.Column(db.DateTime, default=datetime.utcnow)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     payer = db.relationship("User", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "category": self.category,
#             "description": self.description,
#             "amount": float(self.amount),
#             "paid_by": self.paid_by,
#             "expense_date": self.expense_date.isoformat() if self.expense_date else None
#         }


# class CashDrawerTransaction(db.Model):
#     __tablename__ = "cash_drawer_transactions"

#     id = db.Column(db.Integer, primary_key=True)
#     transaction_type = db.Column(db.String(20), nullable=False)  # ADD / DEPOSIT / WITHDRAW
#     amount = db.Column(db.Numeric(10, 2), nullable=False)
#     balance_after = db.Column(db.Numeric(10, 2), nullable=False)
#     reference = db.Column(db.String(255), nullable=True)
#     notes = db.Column(db.Text, nullable=True)
#     performed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     user = db.relationship("User", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "transaction_type": self.transaction_type,
#             "amount": float(self.amount),
#             "balance_after": float(self.balance_after),
#             "reference": self.reference,
#             "notes": self.notes,
#             "performed_by": self.performed_by,
#             "created_at": self.created_at.isoformat() if self.created_at else None
#         }


# class BankTransaction(db.Model):
#     __tablename__ = "bank_transactions"

#     id = db.Column(db.Integer, primary_key=True)
#     transaction_type = db.Column(db.String(20), nullable=False)  # DEPOSIT / WITHDRAW
#     amount = db.Column(db.Numeric(10, 2), nullable=False)
#     balance_after = db.Column(db.Numeric(10, 2), nullable=False)
#     reference = db.Column(db.String(255), nullable=True)
#     notes = db.Column(db.Text, nullable=True)
#     is_reconciled = db.Column(db.Boolean, default=False)
#     performed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     user = db.relationship("User", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "transaction_type": self.transaction_type,
#             "amount": float(self.amount),
#             "balance_after": float(self.balance_after),
#             "reference": self.reference,
#             "notes": self.notes,
#             "is_reconciled": self.is_reconciled,
#             "created_at": self.created_at.isoformat() if self.created_at else None
#         }


# class Notification(db.Model):
#     __tablename__ = "notifications"

#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
#     title = db.Column(db.String(200), nullable=False)
#     message = db.Column(db.Text, nullable=False)
#     is_read = db.Column(db.Boolean, default=False)
#     notification_type = db.Column(db.String(50), nullable=True)
#     reference_id = db.Column(db.Integer, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "user_id": self.user_id,
#             "title": self.title,
#             "message": self.message,
#             "is_read": self.is_read,
#             "notification_type": self.notification_type,
#             "reference_id": self.reference_id,
#             "created_at": self.created_at.isoformat() if self.created_at else None
#         }


# class Permission(db.Model):
#     __tablename__ = "permissions"

#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
#     module = db.Column(db.String(100), nullable=False)
#     can_view = db.Column(db.Boolean, default=False)
#     can_create = db.Column(db.Boolean, default=False)
#     can_edit = db.Column(db.Boolean, default=False)
#     can_delete = db.Column(db.Boolean, default=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     user = db.relationship("User", backref="permissions", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "user_id": self.user_id,
#             "module": self.module,
#             "can_view": self.can_view,
#             "can_create": self.can_create,
#             "can_edit": self.can_edit,
#             "can_delete": self.can_delete
#         }


# class Brand(db.Model):
#     __tablename__ = "brands"

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(150), nullable=False)
#     logo_url = db.Column(db.String(500), nullable=True)
#     description = db.Column(db.Text, nullable=True)
#     is_active = db.Column(db.Boolean, default=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "logo_url": self.logo_url,
#             "description": self.description,
#             "is_active": self.is_active
#         }


# class Partner(db.Model):
#     __tablename__ = "partners"

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(150), nullable=False)
#     contact_name = db.Column(db.String(100), nullable=True)
#     phone = db.Column(db.String(20), nullable=True)
#     email = db.Column(db.String(100), nullable=True)
#     commission_percent = db.Column(db.Numeric(5, 2), default=0)
#     is_active = db.Column(db.Boolean, default=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "contact_name": self.contact_name,
#             "phone": self.phone,
#             "email": self.email,
#             "commission_percent": float(self.commission_percent),
#             "is_active": self.is_active
#         }


# class DeliverySlot(db.Model):
#     __tablename__ = "delivery_slots"

#     id = db.Column(db.Integer, primary_key=True)
#     label = db.Column(db.String(100), nullable=False)  # e.g. "10:00 AM - 12:00 PM"
#     start_time = db.Column(db.String(10), nullable=False)
#     end_time = db.Column(db.String(10), nullable=False)
#     max_orders = db.Column(db.Integer, default=20)
#     is_active = db.Column(db.Boolean, default=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "label": self.label,
#             "start_time": self.start_time,
#             "end_time": self.end_time,
#             "max_orders": self.max_orders,
#             "is_active": self.is_active
#         }


# class OrderSource(db.Model):
#     __tablename__ = "order_sources"

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     description = db.Column(db.Text, nullable=True)
#     is_active = db.Column(db.Boolean, default=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "description": self.description,
#             "is_active": self.is_active
#         }


# class CustomOrder(db.Model):
#     __tablename__ = "custom_orders"

#     id = db.Column(db.Integer, primary_key=True)
#     customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
#     description = db.Column(db.Text, nullable=False)
#     budget = db.Column(db.Numeric(10, 2), nullable=True)
#     delivery_date = db.Column(db.Date, nullable=True)
#     status = db.Column(db.String(30), default="PENDING")  # PENDING / APPROVED / REJECTED / CONVERTED
#     quoted_price = db.Column(db.Numeric(10, 2), nullable=True)
#     rejection_reason = db.Column(db.Text, nullable=True)
#     converted_order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
#     images = db.Column(db.JSON, default=list)
#     notes = db.Column(db.Text, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     customer = db.relationship("User", backref="custom_orders", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "customer_id": self.customer_id,
#             "description": self.description,
#             "budget": float(self.budget) if self.budget else None,
#             "delivery_date": self.delivery_date.isoformat() if self.delivery_date else None,
#             "status": self.status,
#             "quoted_price": float(self.quoted_price) if self.quoted_price else None,
#             "rejection_reason": self.rejection_reason,
#             "converted_order_id": self.converted_order_id,
#             "images": self.images or [],
#             "notes": self.notes,
#             "created_at": self.created_at.isoformat() if self.created_at else None,
#             "customer": {
#                 "id": self.customer.id,
#                 "first_name": self.customer.first_name,
#                 "last_name": self.customer.last_name,
#                 "email": self.customer.email
#             } if self.customer else None
#         }


# class AuditLog(db.Model):
#     __tablename__ = "audit_logs"

#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
#     action = db.Column(db.String(100), nullable=False)
#     module = db.Column(db.String(100), nullable=True)
#     reference_id = db.Column(db.Integer, nullable=True)
#     reference_type = db.Column(db.String(50), nullable=True)
#     details = db.Column(db.JSON, nullable=True)
#     ip_address = db.Column(db.String(50), nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     user = db.relationship("User", backref="audit_logs", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "user_id": self.user_id,
#             "action": self.action,
#             "module": self.module,
#             "reference_id": self.reference_id,
#             "reference_type": self.reference_type,
#             "details": self.details,
#             "ip_address": self.ip_address,
#             "created_at": self.created_at.isoformat() if self.created_at else None
#         }


# class DriverSettlement(db.Model):
#     __tablename__ = "driver_settlements"

#     id = db.Column(db.Integer, primary_key=True)
#     driver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
#     amount = db.Column(db.Numeric(10, 2), nullable=False)
#     orders_count = db.Column(db.Integer, default=0)
#     period_start = db.Column(db.DateTime, nullable=True)
#     period_end = db.Column(db.DateTime, nullable=True)
#     status = db.Column(db.String(20), default="PENDING")  # PENDING / PAID
#     paid_at = db.Column(db.DateTime, nullable=True)
#     paid_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
#     notes = db.Column(db.Text, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     driver = db.relationship("User", foreign_keys=[driver_id], lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "driver_id": self.driver_id,
#             "amount": float(self.amount),
#             "orders_count": self.orders_count,
#             "period_start": self.period_start.isoformat() if self.period_start else None,
#             "period_end": self.period_end.isoformat() if self.period_end else None,
#             "status": self.status,
#             "paid_at": self.paid_at.isoformat() if self.paid_at else None,
#             "driver": {
#                 "id": self.driver.id,
#                 "first_name": self.driver.first_name,
#                 "last_name": self.driver.last_name
#             } if self.driver else None
#         }


# class SubCategory(db.Model):
#     __tablename__ = "subcategories"

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(150), nullable=False)
#     category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
#     description = db.Column(db.Text, nullable=True)
#     image_url = db.Column(db.String(500), nullable=True)
#     is_active = db.Column(db.Boolean, default=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     category = db.relationship("Category", backref="subcategories", lazy="joined")

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "category_id": self.category_id,
#             "description": self.description,
#             "image_url": self.image_url,
#             "is_active": self.is_active
#         }


from extensions import db
from datetime import datetime


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)

    payment_source = db.Column(
        db.Enum("CASH", "BANK", name="expense_payment_source"),
        nullable=False,
        default="CASH"
    )

    reference = db.Column(db.String(100), nullable=True)

    paid_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    expense_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    payer = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "description": self.description,
            "amount": float(self.amount),
            "paid_by": self.paid_by,
            "expense_date": self.expense_date.isoformat() if self.expense_date else None,
            "payment_source": self.payment_source,
            "reference": self.reference,
        }


class CashDrawerTransaction(db.Model):
    __tablename__ = "cash_drawer_transactions"

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # ADD / DEPOSIT / WITHDRAW
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    balance_after = db.Column(db.Numeric(10, 2), nullable=False)
    reference = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    performed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "transaction_type": self.transaction_type,
            "amount": float(self.amount),
            "balance_after": float(self.balance_after),
            "reference": self.reference,
            "notes": self.notes,
            "performed_by": self.performed_by,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class BankTransaction(db.Model):
    __tablename__ = "bank_transactions"

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # DEPOSIT / WITHDRAW
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    balance_after = db.Column(db.Numeric(10, 2), nullable=False)
    reference = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_reconciled = db.Column(db.Boolean, default=False)
    performed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "transaction_type": self.transaction_type,
            "amount": float(self.amount),
            "balance_after": float(self.balance_after),
            "reference": self.reference,
            "notes": self.notes,
            "is_reconciled": self.is_reconciled,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    notification_type = db.Column(db.String(50), nullable=True)
    reference_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "notification_type": self.notification_type,
            "reference_id": self.reference_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Permission(db.Model):
    __tablename__ = "permissions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    module = db.Column(db.String(100), nullable=False)
    can_view = db.Column(db.Boolean, default=False)
    can_create = db.Column(db.Boolean, default=False)
    can_edit = db.Column(db.Boolean, default=False)
    can_delete = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="permissions", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "module": self.module,
            "can_view": self.can_view,
            "can_create": self.can_create,
            "can_edit": self.can_edit,
            "can_delete": self.can_delete
        }


class Brand(db.Model):
    __tablename__ = "brands"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    logo_url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "logo_url": self.logo_url,
            "description": self.description,
            "is_active": self.is_active
        }


class Partner(db.Model):
    __tablename__ = "partners"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    contact_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    commission_percent = db.Column(db.Numeric(5, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact_name": self.contact_name,
            "phone": self.phone,
            "email": self.email,
            "commission_percent": float(self.commission_percent),
            "is_active": self.is_active
        }


class DeliverySlot(db.Model):
    __tablename__ = "delivery_slots"

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), nullable=False)  # e.g. "10:00 AM - 12:00 PM"
    start_time = db.Column(db.String(10), nullable=False)
    end_time = db.Column(db.String(10), nullable=False)
    max_orders = db.Column(db.Integer, default=20)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.label,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "max_orders": self.max_orders,
            "is_active": self.is_active
        }


class OrderSource(db.Model):
    __tablename__ = "order_sources"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active
        }


class CustomOrder(db.Model):
    __tablename__ = "custom_orders"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    description = db.Column(db.Text, nullable=False)
    budget = db.Column(db.Numeric(10, 2), nullable=True)
    delivery_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(30), default="PENDING")  # PENDING / APPROVED / REJECTED / CONVERTED
    quoted_price = db.Column(db.Numeric(10, 2), nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    converted_order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
    images = db.Column(db.JSON, default=list)
    notes = db.Column(db.Text, nullable=True)
    # ─── Build-Your-Own-Cake structured fields (chatbot custom order form) ───
    # Kept as one JSON column instead of a new table/model so existing
    # CustomOrder consumers (admin custom-orders screen, approve/reject,
    # convert-to-order) keep working untouched. Shape:
    # { baseCakeId, cakeSize, flavor, dietaryOptions, customDesign,
    #   deliveryTime, deliveryAddress, customerName, customerEmail, customerPhone }
    details = db.Column(db.JSON, nullable=True)
    source = db.Column(db.String(30), default="ADMIN")  # ADMIN / CHATBOT
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = db.relationship("User", backref="custom_orders", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "description": self.description,
            "budget": float(self.budget) if self.budget else None,
            "delivery_date": self.delivery_date.isoformat() if self.delivery_date else None,
            "status": self.status,
            "quoted_price": float(self.quoted_price) if self.quoted_price else None,
            "rejection_reason": self.rejection_reason,
            "converted_order_id": self.converted_order_id,
            "images": self.images or [],
            "notes": self.notes,
            "details": self.details or {},
            "source": self.source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "customer": {
                "id": self.customer.id,
                "first_name": self.customer.first_name,
                "last_name": self.customer.last_name,
                "email": self.customer.email
            } if self.customer else None
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    module = db.Column(db.String(100), nullable=True)
    reference_id = db.Column(db.Integer, nullable=True)
    reference_type = db.Column(db.String(50), nullable=True)
    details = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="audit_logs", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "module": self.module,
            "reference_id": self.reference_id,
            "reference_type": self.reference_type,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class DriverSettlement(db.Model):
    __tablename__ = "driver_settlements"

    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    orders_count = db.Column(db.Integer, default=0)
    period_start = db.Column(db.DateTime, nullable=True)
    period_end = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default="PENDING")  # PENDING / PAID
    paid_at = db.Column(db.DateTime, nullable=True)
    paid_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    payment_source = db.Column(db.String(20), default="CASH")
    reference = db.Column(db.String(100))
    driver = db.relationship("User", foreign_keys=[driver_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "driver_id": self.driver_id,
            "amount": float(self.amount),
            "orders_count": self.orders_count,
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "driver": {
                "id": self.driver.id,
                "first_name": self.driver.first_name,
                "last_name": self.driver.last_name
            } if self.driver else None
        }


class SubCategory(db.Model):
    __tablename__ = "subcategories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    category = db.relationship("Category", backref="subcategories", lazy="joined")
    products = db.relationship(
        "Product",
        back_populates="subcategory"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category_id": self.category_id,
            "description": self.description,
            "image_url": self.image_url,
            "is_active": self.is_active
        }