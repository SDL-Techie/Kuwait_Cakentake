import os
import cloudinary
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask import send_from_directory, make_response, jsonify
from flask import send_from_directory, make_response, jsonify
from sqlalchemy import text, inspect
from flask_migrate import upgrade as _run_upgrade, stamp as _run_stamp
from sqlalchemy import text

from config import Config
from extensions import db
from seeders.admin_seeder import seed_admin
from seeders.currency_seeder import seed_currency_rates

# ─── Models (ensure all tables are registered) ───────────────────────────────
from models.user import User
from models.product import Product
from models.category import Category
from models.address import Address
from models.order import Order
from models.order_item import OrderItem
from models.order_status_history import OrderStatusHistory
from models.cart import Cart
from models.cartItem import CartItem
from models.coupon import Coupon
from models.currency_rate import CurrencyRate
from models.pincode import Pincode  # renamed from legacy DeliveryCharge
from models.point_setting import PointSetting
from models.wishlist import Wishlist

# New models
from models.customer import Customer
from models.loyalty import LoyaltyConfig, LoyaltyLedger
from models.variant import Variant, Flavor, Addon
from models.combo import Combo
from models.promotion import Promotion, PromotionFreeItem, PromoCode
from models.area import Area
from models.inventory import RawMaterial, Inventory, InventoryConsumption, Supplier, Purchase
from models.bank_charge import BankCharge
from models.delivery_charge import DeliveryCharge
from models.misc import (
    Expense, CashDrawerTransaction, BankTransaction,
    Notification, Permission, Brand, Partner,
    DeliverySlot, OrderSource, CustomOrder, AuditLog,
    DriverSettlement, SubCategory
)
from models.agent import AgentMenu, AgentMenuProduct, AgentMenuAssignment
from models.push_token import PushToken
from models.notification_campaign import NotificationCampaign
from models.notification_recipient import NotificationRecipient

# ─── Existing Routes ─────────────────────────────────────────────────────────
from routes.auth_routes import auth_bp
from routes.category_routes import category_bp
from routes.product_routes import product_bp
from routes.upload_routes import upload_bp
from routes.order_routes import order_bp
from routes.delivery_charge_routes import delivery_charge_bp
from routes.wishlist_route import wishlist_bp
from routes.address_route import address_bp
from routes.cart_route import cart_bp
from routes.settings_route import settings_bp
from routes.reward_route import reward_bp
from routes.pointsetting_routes import point_setting_bp
from routes.payment_rotes import payment_bp
from routes.agent_routes import agent_bp
from routes.ownerpaymentstatus_routes import owner_payment_bp

# ─── New Routes ──────────────────────────────────────────────────────────────
from routes.users_routes import users_bp
from routes.customer_routes import customers_bp
from routes.kitchen_routes import kitchen_bp
from routes.delivery_routes import delivery_bp
from routes.driver_routes import driver_bp
from routes.subcategory_routes import subcategory_bp
from routes.variant_routes import variant_bp
from routes.combo_routes import combo_bp
from routes.promotion_routes import promotion_bp
from routes.area_routes import area_bp
from routes.loyalty_routes import loyalty_bp
from routes.inventory_routes import inventory_bp
from routes.finance_routes import finance_bp
from routes.dashboard_routes import dashboard_bp
from routes.misc_routes import misc_bp
from routes.reports_routes import reports_bp
from routes.bank_charges_routes import bank_charges_bp
from routes.delivery_charges_routes import delivery_charges_bp
from routes.backup_route import backup_bp
from routes.blog_routes import blog_bp
from routes.notification_campaign_routes import notification_campaign_bp
from tasks.notification_scheduler import start_notification_scheduler



# app = Flask(__name__)

app = Flask(__name__, static_folder='dist', static_url_path='')
app.config.from_object(Config)

# ─── Cloudinary ──────────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name=app.config["CLOUDINARY_CLOUD_NAME"],
    api_key=app.config["CLOUDINARY_API_KEY"],
    api_secret=app.config["CLOUDINARY_API_SECRET"],
    secure=True
)

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS(app, resources={r"/*": {"origins": "*"}})

# ─── JWT ─────────────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

@jwt.unauthorized_loader
def unauthorized_callback(reason):
    print("UNAUTHORIZED:", reason)
    return jsonify({"msg": reason}), 401

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    print("INVALID TOKEN:", reason)
    return jsonify({"msg": reason}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("TOKEN EXPIRED")
    return jsonify({"msg": "Token expired"}), 401


# ─── Database ────────────────────────────────────────────────────────────────
db.init_app(app)
migrate = Migrate(app, db)

# ─── Register Existing Blueprints ────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(category_bp)
app.register_blueprint(product_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(order_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(delivery_charge_bp)
app.register_blueprint(address_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(settings_bp)
app.register_blueprint(reward_bp)
app.register_blueprint(point_setting_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(agent_bp)
app.register_blueprint(owner_payment_bp)

# ─── Register New Blueprints ─────────────────────────────────────────────────
app.register_blueprint(users_bp)
app.register_blueprint(customers_bp)
app.register_blueprint(kitchen_bp)
app.register_blueprint(delivery_bp)
app.register_blueprint(driver_bp)
app.register_blueprint(subcategory_bp)
app.register_blueprint(variant_bp)
app.register_blueprint(combo_bp)
app.register_blueprint(promotion_bp)
app.register_blueprint(area_bp)
app.register_blueprint(loyalty_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(finance_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(misc_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(bank_charges_bp)
app.register_blueprint(delivery_charges_bp)
app.register_blueprint(blog_bp)
app.register_blueprint(notification_campaign_bp)
app.register_blueprint(backup_bp)


@app.route("/")
def home():
    return {"message": "Cake N Take Backend Running", "version": "2.0"}

# Serve frontend assets only when a compiled dist directory is present.
@app.route("/<path:filename>")
def static_files(filename):
    static_root = app.static_folder
    if static_root and os.path.isfile(os.path.join(static_root, filename)):
        response = make_response(send_from_directory(static_root, filename))
        if filename.endswith((".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg")):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response
    return jsonify({"error": "Not found"}), 404


from sqlalchemy import text

# def initialize_database():
#     """Optional local bootstrap. Production should use `flask db upgrade`."""
#     with app.app_context():
#         db.create_all()
#         seed_admin()
#         seed_currency_rates()

#         # Ensure order id sequence starts at 15001 for clean numbering in new installs.
#         # This only runs for PostgreSQL and will only adjust the sequence when there
#         # are no existing orders or the maximum id is less than 15001.
#         try:
#             engine_name = db.session.bind.dialect.name
#             if engine_name == 'postgresql':
#                 max_id = db.session.execute(text("SELECT MAX(id) FROM orders;")) .scalar()
#                 if not max_id or int(max_id) < 15001:
#                     # setval(seq, 15000) makes the next nextval() return 15001
#                     db.session.execute(text("SELECT setval(pg_get_serial_sequence('orders','id'), 15000);"))
#                     db.session.commit()

           
#         except Exception:
#             # Don't let sequence setup break initialization; log silently in this context.
#             try:
#                 db.session.rollback()
#             except Exception:
#                 pass


# ORDERS_SEQUENCE_FLOOR = 15999


# def initialize_database():
#     """
#     Runs automatically on every boot (guarded by AUTO_INITIALIZE_DATABASE).
#     Safe to run on every deploy/restart — every step checks state first
#     and only acts if something is actually missing or behind.
#     """
#     with app.app_context():
#         inspector = inspect(db.engine)
#         existing_tables = set(inspector.get_table_names())

#         try:
#             if "alembic_version" not in existing_tables:
#                 if existing_tables:
#                     _run_stamp()
#                 else:
#                     _run_upgrade()
#             else:
#                 _run_upgrade()
#         except Exception as exc:
#             print("Migration step failed during startup:", str(exc))
#             db.session.rollback()

#         seed_admin()
#         seed_currency_rates()

#         # try:
#         #     if db.session.bind.dialect.name == "postgresql" and "orders" in existing_tables:
#         #         max_id = db.session.execute(text("SELECT MAX(id) FROM orders")).scalar() or 0
#         #         seq_name = db.session.execute(
#         #             text("SELECT pg_get_serial_sequence('orders', 'id')")
#         #         ).scalar()
#         #         current_seq_val = db.session.execute(
#         #             text(f"SELECT last_value FROM {seq_name}")
#         #         ).scalar() or 0

#         #         target = max(ORDERS_SEQUENCE_FLOOR, max_id)
#         #         if current_seq_val < target:
#         #             db.session.execute(
#         #                 text("SELECT setval(pg_get_serial_sequence('orders','id'), :target, true)"),
#         #                 {"target": target},
#         #             )
#         #             db.session.commit()
#         # except Exception as exc:
#         #     print("Order sequence bootstrap failed:", str(exc))
#         #     db.session.rollback()


#     try:
#         if "orders" in existing_tables:
#           engine = db.engine

#           if engine.dialect.name == "postgresql":

#             max_id = db.session.execute(
#                 text("SELECT COALESCE(MAX(id), 0) FROM orders")
#             ).scalar() or 0

#             seq_name = db.session.execute(
#                 text("""
#                     SELECT pg_get_serial_sequence('orders', 'id')
#                 """)
#             ).scalar()

#             if seq_name:
#                 current_seq_val = db.session.execute(
#                     text(f"SELECT last_value FROM {seq_name}")
#                 ).scalar() or 0

#                 target = max(ORDERS_SEQUENCE_FLOOR, int(max_id))

#                 if int(current_seq_val) < target:
#                     db.session.execute(
#                         text("""
#                             SELECT setval(
#                                 pg_get_serial_sequence('orders', 'id'),
#                                 :target,
#                                 true
#                             )
#                         """),
#                         {"target": target},
#                     )

#                     db.session.commit()

#                     print(
#                         f"Order sequence updated successfully. "
#                         f"Next order ID will be {target + 1}"
#                     )
#                 else:
#                     print(
#                         f"Order sequence already correct. "
#                         f"Next order ID will be {int(current_seq_val) + 1}"
#                     )

#     except Exception as exc:
#      print("Order sequence bootstrap failed:", str(exc))
#      db.session.rollback()

# if os.getenv("AUTO_INITIALIZE_DATABASE", "false").lower() in {"1", "true", "yes"}:
#     initialize_database()

ORDERS_SEQUENCE_FLOOR = 15999


def initialize_database():
    """
    Runs automatically on every boot.
    Safe to run on every deploy/restart.
    """

    with app.app_context():

        inspector = inspect(db.engine)
        existing_tables = set(inspector.get_table_names())

        # ─────────────────────────────────────────────
        # DATABASE MIGRATIONS
        # ─────────────────────────────────────────────
        try:
            if "alembic_version" not in existing_tables:
                if existing_tables:
                    _run_stamp()
                else:
                    _run_upgrade()
            else:
                _run_upgrade()

        except Exception as exc:
            print(
                "Migration step failed during startup:",
                str(exc)
            )
            db.session.rollback()

        # ─────────────────────────────────────────────
        # SEED DATA
        # ─────────────────────────────────────────────
        seed_admin()
        seed_currency_rates()

        # ─────────────────────────────────────────────
        # AUTOMATIC ORDER ID SEQUENCE
        # ─────────────────────────────────────────────
        try:

            if "orders" in existing_tables:

                engine = db.engine

                if engine.dialect.name == "postgresql":

                    # Get highest existing order ID
                    max_id = db.session.execute(
                        text(
                            "SELECT COALESCE(MAX(id), 0) "
                            "FROM orders"
                        )
                    ).scalar() or 0

                    # Get PostgreSQL sequence name
                    seq_name = db.session.execute(
                        text(
                            """
                            SELECT pg_get_serial_sequence(
                                'orders',
                                'id'
                            )
                            """
                        )
                    ).scalar()

                    if seq_name:

                        # Get current sequence value
                        current_seq_val = db.session.execute(
                            text(
                                f"SELECT last_value FROM {seq_name}"
                            )
                        ).scalar() or 0

                        # 15999 means NEXT ID = 16000
                        target = max(
                            ORDERS_SEQUENCE_FLOOR,
                            int(max_id)
                        )

                        # Only move sequence forward
                        if int(current_seq_val) < target:

                            db.session.execute(
                                text(
                                    """
                                    SELECT setval(
                                        pg_get_serial_sequence(
                                            'orders',
                                            'id'
                                        ),
                                        :target,
                                        true
                                    )
                                    """
                                ),
                                {
                                    "target": target
                                }
                            )

                            db.session.commit()

                            print(
                                "===================================="
                            )
                            print(
                                "ORDER SEQUENCE UPDATED"
                            )
                            print(
                                f"Current maximum order ID: {max_id}"
                            )
                            print(
                                f"Sequence set to: {target}"
                            )
                            print(
                                f"NEXT ORDER ID: {target + 1}"
                            )
                            print(
                                "===================================="
                            )

                        else:

                            print(
                                "Order sequence already correct."
                            )

                            print(
                                f"Current sequence: "
                                f"{int(current_seq_val)}"
                            )

                            print(
                                f"Next order ID: "
                                f"{int(current_seq_val) + 1}"
                            )

        except Exception as exc:

            print(
                "Order sequence bootstrap failed:",
                str(exc)
            )

            db.session.rollback()


if os.getenv(
    "AUTO_INITIALIZE_DATABASE",
    "false"
).lower() in {"1", "true", "yes"}:

    initialize_database()

notification_scheduler = None
if app.config.get("NOTIFICATION_SCHEDULER_MODE") == "embedded":
    flask_debug = os.environ.get("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"}
    is_reloader_child = os.environ.get("WERKZEUG_RUN_MAIN") == "true"
    if not flask_debug or is_reloader_child:
        notification_scheduler = start_notification_scheduler(app)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )