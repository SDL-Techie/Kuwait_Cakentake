# import random
# from datetime import datetime, timezone
# from decimal import Decimal, InvalidOperation
# from models.area import Area
# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from werkzeug.security import generate_password_hash
# from extensions import db
# from config import Config
# from models.currency_rate import CurrencyRate
 
# from models.order import Order, utc_now
# from models.order_item import OrderItem
# from models.product import Product
# from models.variant import Addon
# from models.user import User
# from models.address import Address
 
# from services.loyalty_service import (
#     add_loyalty_points,
#     get_loyalty_config,
#     redeem_loyalty_points,
# )
# from models.loyalty import LoyaltyLedger
# from services.notification_service import send_order_notification
# from services.push_notification_service import send_transactional_push
# from middleware.role import role_required
# from services.order_history_service import log_order_status
# from services.tap_service import create_knet_charge, create_tap_charge
# from utils.phone import normalize_phone, phone_variants, PhoneError
 
 
# order_bp = Blueprint("order", __name__)
 
# # ─── UTILS ─────────────────────────────────────────────────────────────────
 
# def get_current_user():
#     user_id = get_jwt_identity()
#     return User.query.get(int(user_id))
 
 
# def normalize_custom_cakes(data):
#     """Return a list of custom-cake dicts.
 
#     Accepts the new `custom_cakes` (array) and falls back to the legacy
#     single `custom_cake` (object) so older clients keep working.
#     """
#     raw = data.get("custom_cakes")
#     if raw is None:
#         raw = data.get("custom_cake")
#     if not raw:
#         return []
#     if isinstance(raw, dict):
#         raw = [raw]
#     if not isinstance(raw, list):
#         raise ValueError("custom_cakes must be an array")
#     cakes = []
#     for idx, cake in enumerate(raw):
#         if not isinstance(cake, dict):
#             raise ValueError(f"Invalid custom cake at position {idx + 1}")
#         cakes.append(cake)
#     return cakes
 
 
# def generate_order_number():
#     return f"CT-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000,9999)}"
 
 
# # ─── SALES-AGENT ADDRESS HELPERS ───────────────────────────────────────────
# # The create-order form sends: address_line1 (= Block), address_line2
# # ("houseNo, street"), landmark, city, state, country, area_id and (new)
# # explicit block / house_no / street / delivery_notes. These helpers read ALL
# # of those spellings so nothing the agent types is thrown away.
 
# _ADDRESS_ALIASES = {
#     "street":         ["street", "street_name", "streetName"],
#     "block":          ["block", "block_no", "blockNo"],
#     "avenue":         ["avenue", "avenue_name", "avenueName"],
#     "building":       ["building", "building_name", "buildingName", "building_no"],
#     "floor":          ["floor"],
#     "apartment":      ["apartment", "apt", "flat", "flat_no", "flatNo"],
#     "house_no":       ["house_no", "houseNo", "house_number", "house",
#                        "house_flat_no", "houseFlatNo"],
#     "landmark":       ["landmark"],
#     # NOTE: the generic "notes" key is deliberately NOT an alias any more.
#     # Clients send the cake writing / order notes as "notes", which used to be
#     # saved into the address "Delivery Notes" field (client report 13/10/2026).
#     "delivery_notes": ["delivery_notes", "deliveryNotes", "address_notes",
#                        "addressNotes"],
#     "country":        ["country", "country_name"],
# }
# _ADDRESS_SKIP_KEYS = {
#     "items", "custom_cake", "custom_cakes", "order_addons", "cart",
#     "greeting_message", "greeting_from", "greeting_to",
#     "notes", "order_notes", "agent_notes", "cake_message", "message",
# }

# # Pickup orders the shop can hand over. READY / ASSIGNED_TO_AGENT cover older
# # pickup orders that were wrongly routed to dispatch before this fix.
# PICKUP_COLLECTABLE = {"PICKUP_READY", "READY", "ASSIGNED_TO_AGENT"}

# # Payment methods accepted anywhere an order's payment is recorded.
# # CREDIT = agent orders that are settled later from the agent payment screen.
# ALLOWED_PAYMENT_METHODS = {"COD", "CARD", "STRIPE", "KNET", "UPI", "LINK", "CREDIT"}


# def extract_order_notes(data):
#     """Free-text order notes ("ORDER NOTES") from any client spelling."""
#     for key in ("order_notes", "orderNotes", "agent_notes", "notes"):
#         value = data.get(key) if isinstance(data, dict) else None
#         if value is not None and _addr_clean(value):
#             return str(value).strip()
#     return ""


# def extract_cake_message(data):
#     """Order-level writing on the cake when a client sends it outside greeting_message."""
#     for key in ("greeting_message", "cake_message", "cakeMessage", "message_on_cake", "writing"):
#         value = data.get(key) if isinstance(data, dict) else None
#         if value is not None and _addr_clean(value):
#             return str(value).strip()
#     return ""


# def with_order_notes(snapshot, notes):
#     """Store order notes inside delivery_address_json (no schema change needed)."""
#     if not notes:
#         return snapshot
#     snap = dict(snapshot) if isinstance(snapshot, dict) else {}
#     snap["order_notes"] = notes
#     return snap

 
 
# def _addr_clean(value):
#     """Trimmed string; '' for empty / placeholder values such as '-' or ',,'."""
#     if value is None:
#         return ""
#     if isinstance(value, dict):
#         value = value.get("name")
#         if value is None:
#             return ""
#     text = str(value).strip()
#     return "" if not text or set(text) <= set(" ,.-") else text
 
 
# def _addr_find(root, keys, max_depth=4):
#     """Breadth-first: top-level keys win, then nested dicts/lists."""
#     queue = [(root, 0)]
#     while queue:
#         node, depth = queue.pop(0)
#         if isinstance(node, dict):
#             for key in keys:
#                 text = _addr_clean(node.get(key))
#                 if text:
#                     return text
#             if depth < max_depth:
#                 for child in node.values():
#                     if isinstance(child, (dict, list)):
#                         queue.append((child, depth + 1))
#         elif isinstance(node, list) and depth < max_depth:
#             for child in node:
#                 if isinstance(child, (dict, list)):
#                     queue.append((child, depth + 1))
#     return ""
 
 
# def extract_address_fields(data):
#     root = {k: v for k, v in (data or {}).items() if k not in _ADDRESS_SKIP_KEYS}
#     fields = {name: _addr_find(root, aliases)
#               for name, aliases in _ADDRESS_ALIASES.items()}
 
#     # Legacy packed format: address_line1 = block, address_line2 = "house, street"
#     line1 = _addr_find(root, ["address_line1", "addressLine1"])
#     line2 = _addr_find(root, ["address_line2", "addressLine2"])
#     parts = [x.strip() for x in line2.split(",") if x.strip()]
 
#     if not fields["block"] and line1:
#         fields["block"] = line1
#     # Only unpack the legacy "house, street" string when the form did NOT send
#     # explicit house_no / street (otherwise a lone street would be mistaken
#     # for a house number).
#     if not fields["house_no"] and not fields["street"] and parts:
#         if len(parts) > 1:
#             fields["house_no"] = parts[0]
#             fields["street"] = ", ".join(parts[1:])
#         else:
#             fields["street"] = parts[0]
#     if not fields["country"]:
#         fields["country"] = "Kuwait"
#     return fields
 
 
# def build_address_snapshot(fields, address, area, customer_origin, data):
#     """Copy of the address kept on the order itself (delivery_address_json)."""
#     snapshot = {
#         "street":         (address.street if address else "") or fields["street"],
#         "block":          (address.block if address else "") or fields["block"],
#         "avenue":         (address.avenue if address else "") or fields["avenue"],
#         "building":       (address.building if address else "") or fields["building"],
#         "floor":          (address.floor if address else "") or fields["floor"],
#         "apartment":      (address.apartment if address else "") or fields["apartment"],
#         "house_no":       fields["house_no"],
#         "landmark":       fields["landmark"],
#         "delivery_notes": (address.delivery_notes if address else "") or fields["delivery_notes"],
#         "country":        (address.country if address else "") or fields["country"],
#         "city":           _addr_find(data, ["city"]),
#         "state":          _addr_find(data, ["state"]),
#         "area":           area.name if area else None,
#         "customer_origin": customer_origin,
#     }
#     sent = data.get("delivery_address_json")
#     if isinstance(sent, dict):
#         for key, value in sent.items():
#             if _addr_clean(value) or key not in snapshot:
#                 snapshot[key] = value
#     return snapshot
 
 
# def build_n8n_payload(order):
#     return {
#         "body": {
#             "order": {
#                 "orderId": order.id,
#                 "total": float(order.total),
#                 "items": [
#                     {
#                         "name": item.product.name,
#                         "quantity": item.quantity,
#                         "price": float(item.price)
#                     } for item in order.items
#                 ]
#             },
#             "customer": {
#                 "name": f"{order.customer.first_name} {order.customer.last_name}",
#                 "email": order.customer.email,
#                 "phone": order.customer.phone_no
#             },
#             "admin": {
#                 "email": "orders@caketake.com",
#                 "phone": "9198778945"
#             }
#         }
#     }
 
 
# def notify_admins(message, order=None):
#     """Best-effort notification to admin / shop manager. Never raises."""
#     try:
#         send_order_notification({
#             "message": message,
#             "order_id": order.id if order else None,
#             "order_number": order.order_number if order else None,
#         })
#     except Exception as e:
#         print("Notification error:", str(e))
 
 
# def _order_push_data(order, notification_type):
#     return {
#         "action": "OPEN_ORDER",
#         "type": notification_type,
#         "target_id": order.id,
#         "order_id": order.id,
#         "order_number": order.order_number,
#         "status": order.status,
#     }
 
 
# def notify_order_recipients(order, user_ids, title, body, notification_type):
#     """Best-effort transactional push for one clearly defined audience."""
#     try:
#         send_transactional_push(
#             user_ids,
#             title,
#             body,
#             _order_push_data(order, notification_type),
#         )
#     except Exception as exc:
#         print("Transactional push error:", str(exc))
 
 
# def notify_customer(order, title, body, notification_type):
#     notify_order_recipients(
#         order,
#         [order.user_id],
#         title,
#         body,
#         notification_type,
#     )
 
 
# def notify_staff(order, user_ids, title, body, notification_type):
#     notify_order_recipients(
#         order,
#         user_ids,
#         title,
#         body,
#         notification_type,
#     )
 
 
 
# # ─── ASSIGN ORDER TO KITCHEN ───────────────────────────────────────────────
 
# def assign_order_to_kitchen(order, current_user):
#     """
#     Assign an order to the kitchen.
#     """
 
#     # Prevent assigning twice
#     if order.status == "ASSIGNED_TO_KITCHEN":
#         return
 
#     old_status = order.status
 
#     order.status = "ASSIGNED_TO_KITCHEN"
 
#     log_order_status(
#         order,
#         old_status,
#         "ASSIGNED_TO_KITCHEN",
#         current_user.id if current_user else None,
#         f"Order assigned to kitchen after {order.payment_method} payment"
#     )
 
 
# @order_bp.route("/orders", methods=["POST"])
# @jwt_required()
# def create_order():
#     user = get_current_user()
#     data = request.get_json(silent=True) or {}
 
#     use_loyalty = data.get("use_loyalty", False)
 
#     if not user:
#         return jsonify({"error": "Authenticated user not found"}), 401
 
#     delivery_method = str(data.get("delivery_method") or "DELIVERY").strip().upper()
#     if delivery_method not in {"DELIVERY", "PICKUP"}:
#         return jsonify({"error": "Invalid delivery_method. Must be DELIVERY or PICKUP"}), 400
 
#     items_data = data.get("items")
#     order_addons_data = data.get("order_addons") or []
 
#     try:
#         order_addons_total = Decimal(str(data.get("order_addons_total", 0) or 0))
#     except (InvalidOperation, TypeError, ValueError):
#         return jsonify({"error": "Invalid order_addons_total value"}), 400
 
#     if not isinstance(items_data, list) or not items_data:
#         return jsonify({"error": "Order must contain at least one item"}), 400
 
#     address = None
#     area = None
 
#     # ── DELIVERY: address + serviceable area are required ──
#     if delivery_method == "DELIVERY":
#         address_id = data.get("address_id")
#         if not address_id:
#             return jsonify({"error": "address_id is required for delivery orders"}), 400
 
#         address = Address.query.get(address_id)
#         if not address:
#             return jsonify({"error": "Address not found"}), 404
 
#         if user.role == "USER" and address.user_id != user.id:
#             return jsonify({"error": "This address does not belong to you"}), 403
 
#         if not address.area_id:
#             return jsonify({
#                 "error": (
#                     "This address does not have a delivery area. "
#                     "Please update the address and select an area."
#                 )
#             }), 400
 
#         area = Area.query.filter_by(id=address.area_id, is_active=True).first()
#         if not area:
#             return jsonify({
#                 "error": (
#                     "Delivery is not available for the selected area. "
#                     "Please contact CakeNTake customer support."
#                 ),
#                 "delivery_available": False
#             }), 400
 
#     # ── PICKUP: no address/area needed, but pickup date + time are required ──
#     else:
#         pickup_date_raw = data.get("pickup_date")
#         pickup_time_slot = data.get("pickup_time_slot")
#         if not pickup_date_raw:
#             return jsonify({"error": "pickup_date is required for pickup orders"}), 400
#         if not pickup_time_slot:
#             return jsonify({"error": "pickup_time_slot is required for pickup orders"}), 400
 
#     payment_method = str(data.get("payment_method") or "COD").strip().upper()
#     # Customers cannot choose CREDIT (that is reserved for agent orders).
#     allowed_payment_methods = ALLOWED_PAYMENT_METHODS - {"CREDIT"}
#     if payment_method not in allowed_payment_methods:
#         return jsonify({
#             "error": "Invalid payment method",
#             "allowed_payment_methods": sorted(allowed_payment_methods)
#         }), 400
 
#     try:
#         discount = Decimal(str(data.get("discount", 0) or 0))
#     except (InvalidOperation, TypeError, ValueError):
#         return jsonify({"error": "Invalid discount value"}), 400
 
#     if discount < 0:
#         return jsonify({"error": "Discount cannot be negative"}), 400
 
#     allowed_currencies = {"INR", "KWD", "AED", "USD", "SAR", "SGD"}
#     currency = str(data.get("currency") or "KWD").strip().upper()
#     if currency not in allowed_currencies:
#         currency = "KWD"
 
#     order = Order(
#         user_id=address.user_id if address else user.id,
#         created_by=user.id,
#         order_number=generate_order_number(),
#         order_type=data.get("order_type", "direct_order"),
#         notes=extract_order_notes(data) or None,
#         delivery_method=delivery_method,
 
#         # DELIVERY fields — None for pickup orders
#         address_id=address.id if address else None,
#         delivery_area_id=area.id if area else None,
#         delivery_date=(
#             datetime.strptime(data["delivery_date"], "%Y-%m-%d").date()
#             if delivery_method == "DELIVERY" and data.get("delivery_date")
#             else None
#         ),
#         delivery_time_slot=data.get("delivery_time_slot") if delivery_method == "DELIVERY" else None,
 
#         # PICKUP fields — None for delivery orders
#         pickup_date=(
#             datetime.strptime(data["pickup_date"], "%Y-%m-%d").date()
#             if delivery_method == "PICKUP" and data.get("pickup_date")
#             else None
#         ),
#         pickup_time_slot=data.get("pickup_time_slot") if delivery_method == "PICKUP" else None,
 
#         greeting_message=extract_cake_message(data) or None,
#         greeting_from=data.get("greeting_from") or None,
#         greeting_to=data.get("greeting_to") or None,
#         delivery_address_json=with_order_notes(None, extract_order_notes(data)) or None,
#         payment_method=payment_method,
#         payment_status="PENDING",
#         status="PENDING",
#         subtotal=0,
#         delivery_charge=0,
#         discount=discount,
#         grand_total=0,
#         total=0,
#         currency=currency
#     )
 
#     try:
#         db.session.add(order)
#         db.session.flush()
#         order.order_number = str(order.id)
 
#         subtotal = Decimal("0.000")
 
#         for index, item in enumerate(items_data):
#             if not isinstance(item, dict):
#                 raise ValueError(f"Invalid item at position {index + 1}")
 
#             product_id = item.get("product_id")
#             if not product_id:
#                 raise ValueError(f"product_id is required for item {index + 1}")
 
#             product = Product.query.get(product_id)
#             if not product:
#                 raise ValueError(f"Product {product_id} not found")
 
#             try:
#                 quantity = int(item.get("quantity", 1))
#             except (TypeError, ValueError):
#                 raise ValueError(f"Invalid quantity for product {product_id}")
 
#             if quantity <= 0:
#                 raise ValueError(f"Quantity must be greater than zero for product {product_id}")
 
#             rate = CurrencyRate.query.filter_by(currency_code=currency).first()
#             conversion_rate = Decimal(str(rate.rate if rate else 1))
 
#             try:
#                 incoming_price = item.get("price")
#                 if incoming_price is not None:
#                     price = Decimal(str(incoming_price))
#                 else:
#                     price = Decimal(str(product.price or 0)) * conversion_rate
#             except (InvalidOperation, TypeError, ValueError):
#                 raise ValueError(f"Invalid price for product {product_id}")
 
#             if price < 0:
#                 raise ValueError(f"Price cannot be negative for product {product_id}")
 
#             price_decimals = Decimal("0.001") if currency == "KWD" else Decimal("0.01")
#             price = price.quantize(price_decimals)
#             item_total = (price * Decimal(quantity)).quantize(price_decimals)
 
#             try:
#                 provided_total = Decimal(str(item.get("total", item_total)))
#             except (InvalidOperation, TypeError, ValueError):
#                 provided_total = item_total
 
#             total = item_total if provided_total != item_total else provided_total
#             subtotal += total
 
#             custom = item.get("custom_json") or {}
#             try:
#                 original_p = item.get("original_price")
#                 discounted_p = item.get("discounted_price")
#                 orig_val = float(original_p) if original_p is not None else None
#                 disc_val = float(discounted_p) if discounted_p is not None else None
#             except Exception:
#                 orig_val = None
#                 disc_val = None
 
#             custom = custom.copy() if isinstance(custom, dict) else {"raw": custom}
#             custom["pricing"] = {"original_price": orig_val, "discounted_price": disc_val}
 
#             db.session.add(OrderItem(
#                 order_id=order.id,
#                 product_id=product.id,
#                 quantity=quantity,
#                 price=price,
#                 line_total=total,
#                 custom_json=custom
#             ))
 
#         if order_addons_data and not isinstance(order_addons_data, list):
#             raise ValueError("order_addons must be an array")
 
#         order_addons = []
#         computed_addons_total = Decimal("0.00")
 
#         for idx, addon in enumerate(order_addons_data or []):
#             if not isinstance(addon, dict):
#                 raise ValueError(f"Invalid addon at position {idx + 1}")
 
#             addon_id = addon.get("addon_id")
#             if addon_id is None:
#                 raise ValueError(f"addon_id is required for addon {idx + 1}")
 
#             try:
#                 quantity = int(addon.get("quantity", 1))
#             except (TypeError, ValueError):
#                 raise ValueError(f"Invalid quantity for addon {addon_id}")
 
#             if quantity <= 0:
#                 raise ValueError(f"Addon quantity must be greater than zero for addon {addon_id}")
 
#             try:
#                 price = Decimal(str(addon.get("price", 0) or 0))
#                 total = Decimal(str(addon.get("total", 0) or 0))
#             except (InvalidOperation, TypeError, ValueError):
#                 raise ValueError(f"Invalid price or total for addon {addon_id}")
 
#             if price < 0 or total < 0:
#                 raise ValueError(f"Addon price and total cannot be negative for addon {addon_id}")
 
#             expected_total = (price * Decimal(quantity)).quantize(Decimal("0.01"))
#             if total != expected_total:
#                 total = expected_total
 
#             addon_obj = Addon.query.get(addon_id)
#             order_addons.append({
#                 "addon_id": addon_id,
#                 "addon_name": addon_obj.name if addon_obj else None,
#                 "quantity": quantity,
#                 "price": float(price),
#                 "total": float(total)
#             })
#             computed_addons_total += total
 
#         if order_addons and order_addons_total == 0:
#             order_addons_total = computed_addons_total
#         elif order_addons and order_addons_total != computed_addons_total:
#             order_addons_total = computed_addons_total
#         elif not order_addons:
#             order_addons_total = Decimal("0.00")
 
#         # ── Minimum order + delivery charge only apply to DELIVERY orders.
#         #    Pickup orders have no area, so there's nothing to check against
#         #    and delivery_charge is always 0. ──
#         if delivery_method == "DELIVERY":
#             minimum_order = Decimal(str(area.min_order_value or 0))
#             if subtotal < minimum_order:
#                 raise ValueError(
#                     f"Subtotal={subtotal}, Minimum={minimum_order}, Currency={currency}"
#                 )
#             delivery_charge = Decimal(str(area.delivery_charge or 0))
#         else:
#             delivery_charge = Decimal("0.00")
 
#         grand_total = subtotal + delivery_charge + order_addons_total - discount
 
#         if grand_total < 0:
#             raise ValueError("Discount cannot exceed the order total")
 
#         order.subtotal = subtotal
#         order.delivery_charge = delivery_charge
#         order.discount = discount
#         order.order_addons_json = order_addons
#         order.order_addons_total = order_addons_total
#         order.grand_total = grand_total
#         order.total = grand_total
#         order.currency = currency
#         order.loyalty_coupon = data.get("coupon_code") or data.get("promo_code") or data.get("loyalty_coupon")
 
#         if use_loyalty:
#             config = get_loyalty_config()
#             result = redeem_loyalty_points(
#                 customer_id=user.id,
#                 order_total=grand_total,
#                 order_id=order.id
#             )
#             if "error" in result:
#                 db.session.rollback()
#                 return jsonify(result), 400
 
#             discount_amount = Decimal(str(result["discount_amount"]))
#             order.discount += discount_amount
#             order.grand_total -= discount_amount
#             order.total = order.grand_total
 
#         db.session.commit()
 
#     except ValueError as error:
#         db.session.rollback()
#         return jsonify({"error": str(error)}), 400
 
#     except Exception as error:
#         db.session.rollback()
#         print("Create order error:", str(error))
#         return jsonify({"error": "Unable to create order"}), 500
 
#     try:
#         send_order_notification(build_n8n_payload(order))
#     except Exception as error:
#         print("Notification error:", str(error))
 
#     return jsonify({
#         "message": "Order created successfully",
#         "delivery": {
#             "area": area.to_dict() if area else None,
#             "delivery_charge": float(order.delivery_charge or 0),
#             "minimum_order_value": float(area.min_order_value or 0) if area else 0,
#             "currency": order.currency
#         },
#         "order": order.to_dict()
#     }), 201
 
# # ─── GET ALL ORDERS (ROLE BASED) ────────────────────────────────────────────
 
# @order_bp.route("/orders", methods=["GET"])
# @jwt_required()
# def get_orders():
 
#     user = get_current_user()
#     status = request.args.get("status")
#     source = (request.args.get("source") or "").strip().lower()
 
#     query = Order.query
 
#     if user.role == "USER":
#         query = query.filter_by(user_id=user.id)
 
#     elif user.role == "KITCHEN_STAFF":
#         query = query.filter(
#             Order.kitchen_staff_id == user.id,
#             Order.status.in_(["ASSIGNED_TO_KITCHEN", "PREPARING"])
#         )
 
#     elif user.role == "DELIVERY_AGENT":
#         query = query.filter(
#             db.or_(
#                 Order.delivery_agent_id == user.id,
#                 Order.status == "ASSIGNED_TO_AGENT"
#             )
#         )
 
#     elif user.role == "DRIVER":
#         query = query.filter(Order.driver_id == user.id)
 
#     elif user.role in ("ADMIN", "SHOP_MANAGER", "SALES_AGENT"):
#         pass  # full access
 
#     if status:
#         query = query.filter_by(status=status.upper())
 
#     # Canonical order-source filtering for Owner workflow.
#     if source:
#         source_types = {
#             "user": ["direct_order", "user_order", "customer_order"],
#             "shopmanager": ["shopmanager_order", "shop_manager_order"],
#             "salesagent": ["salesagent_order", "sales_agent_order"],
#             "agent": ["agent_order"],
#         }
#         if source not in source_types:
#             return jsonify({"error": "Invalid source filter"}), 400
#         query = query.filter(db.func.lower(Order.order_type).in_(source_types[source]))
 
#     orders = query.order_by(Order.created_at.desc()).all()
 
#     return jsonify({
#         "count": len(orders),
#         "orders": [o.to_dict() for o in orders]
#     }), 200
 
 
# # ─── GET SINGLE ORDER ────────────────────────────────────────────────────────
 
# @order_bp.route("/orders/<int:id>", methods=["GET"])
# @jwt_required()
# def get_order(id):
 
#     order = Order.query.get(id)
 
#     if not order:
#         return jsonify({"error": "Order not found"}), 404
 
#     current_user = get_current_user()
#     if current_user and current_user.role == "USER" and order.user_id != current_user.id:
#         return jsonify({"error": "This order does not belong to you"}), 403
 
#     payload = order.to_dict()
 
#     # Canonical proof and settlement fields for driver/order details screens.
#     if order.driver_settlement_id:
#         from models.misc import DriverSettlement
#         settlement = DriverSettlement.query.get(order.driver_settlement_id)
#         payload["driver_settlement"] = settlement.to_dict() if settlement else None
#     else:
#         payload["driver_settlement"] = None
 
#     payload["proof_status"] = (
#         "APPROVED" if order.delivery_confirmed_at
#         else "SUBMITTED" if order.driver_submitted_at
#         else "NOT_SUBMITTED"
#     )
 
#     return jsonify(payload), 200
 
 
# # ─── UPDATE ORDER (ADMIN / SHOP MANAGER) ────────────────────────────────────
 
# @order_bp.route("/orders/<int:id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_order(id):
 
#     order = Order.query.get(id)
#     if not order:
#         return jsonify({"error": "Order not found"}), 404
 
#     data = request.get_json()
 
#     order.status = data.get("status", order.status)
#     order.payment_status = data.get("payment_status", order.payment_status)
 
#     db.session.commit()
 
#     return jsonify({
#         "message": "Order updated successfully",
#         "order": order.to_dict()
#     }), 200
 
 
# # ─── DELETE ORDER (ADMIN) ────────────────────────────────────────────────────
 
# @order_bp.route("/orders/<int:id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN"])
# def delete_order(id):
 
#     order = Order.query.get(id)
 
#     if not order:
#         return jsonify({"error": "Order not found"}), 404
 
#     db.session.delete(order)
#     db.session.commit()
 
#     return jsonify({"message": "Order deleted successfully"}), 200
 
 
# # ─── TAP PAYMENT (replaces Stripe checkout) ─────────────────────────────────
 
# @order_bp.route("/orders/<int:order_id>/create-payment", methods=["POST"])
# @jwt_required()
# def create_order_payment(order_id):
 
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
 
#     if current_user.role == "USER" and order.user_id != current_user.id:
#         return jsonify({"error": "This order does not belong to you"}), 403
 
#     if order.payment_status == "PAID":
#         return jsonify({"error": "Order is already paid"}), 400
 
#     currency = str(order.currency or "KWD").strip().upper()
 
#     # KWD -> KNET (Tap's local Kuwait rail).
#     # Everything else -> Tap's hosted payment-selection portal.
#     if currency == "KWD":
#         result = create_knet_charge(order)
#     else:
#         result = create_tap_charge(order)
 
#     if "errors" in result:
#         return jsonify({
#             "error": "Unable to create payment",
#             "details": result["errors"]
#         }), 502
 
#     payment_url = (result.get("transaction") or {}).get("url")
 
#     if not payment_url:
#         return jsonify({
#             "error": "Payment gateway did not return a redirect URL",
#             "details": result
#         }), 502
 
#     order.payment_method = "KNET" if currency == "KWD" else "CARD"
#     db.session.commit()
 
#     return jsonify({
#         "payment_url": payment_url,
#         "charge_id": result.get("id")
#     }), 200
 
# # ─── USER ORDERS ─────────────────────────────────────────────────────────────
 
# @order_bp.route("/orders/user/<int:user_id>", methods=["GET"])
# @jwt_required()
# def get_user_orders(user_id):
 
#     orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
 
#     return jsonify({
#         "count": len(orders),
#         "orders": [o.to_dict() for o in orders]
#     }), 200
 
 
# # ══════════════════════════════════════════════════════════════════════════
# #  WORKFLOW: accept -> kitchen -> ready -> agent -> driver -> delivered
# # ══════════════════════════════════════════════════════════════════════════
 
# # ─── 1. ACCEPT ORDER (sets payment_status from COD / UPI) ──────────────────
 
# @order_bp.route("/orders/<int:id>/accept", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def accept_order(id):
#     order = Order.query.get_or_404(id)
 
#     if str(order.status or "").upper() != "PENDING":
#         return jsonify({"error": "Only pending orders can be accepted"}), 400
 
#     current_user = get_current_user()
#     data = request.get_json(silent=True) or {}
 
#     payment_method = str(
#         data.get("payment_method")
#         or order.payment_method
#         or "COD"
#     ).strip().upper()
 
#     if payment_method == "CASH":
#         payment_method = "COD"
 
#     allowed_methods = ALLOWED_PAYMENT_METHODS
#     if payment_method not in allowed_methods:
#         return jsonify({
#             "error": "Invalid payment method",
#             "allowed_payment_methods": sorted(allowed_methods),
#         }), 400
 
#     order.payment_method = payment_method
 
#     # Business rule:
#     # Every order accepted by Owner / Shop Manager goes to Kitchen immediately.
#     # Payment status is tracked separately and never blocks kitchen preparation.
#     assign_order_to_kitchen(order, current_user)
#     db.session.commit()
 
#     notify_customer(
#         order,
#         "Order accepted",
#         f"Your order {order.order_number} was accepted and sent to our kitchen.",
#         "ORDER_ACCEPTED",
#     )
 
#     kitchen_ids = [
#         user.id
#         for user in User.query.filter_by(
#             role="KITCHEN_STAFF",
#             is_active=True
#         ).all()
#     ]
 
#     notify_staff(
#         order,
#         kitchen_ids,
#         "New kitchen order",
#         f"Order {order.order_number} is ready to be prepared.",
#         "KITCHEN_ORDER_AVAILABLE",
#     )
 
#     notify_admins(
#         f"Order {order.order_number} accepted and sent to kitchen ({payment_method})",
#         order,
#     )
 
#     return jsonify({
#         "message": "Order accepted and sent to kitchen",
#         "order": order.to_dict(),
#     }), 200
 
# @order_bp.route("/orders/<int:order_id>/reject", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def reject_order(order_id):
 
#     order = Order.query.get_or_404(order_id)
#     data = request.get_json() or {}
 
#     if order.status != "PENDING":
#         return jsonify({"error": "Only pending orders can be rejected"}), 400
 
#     old_status = order.status
#     order.status = "REJECTED"
#     order.rejection_reason = data.get("reason")
 
#     log_order_status(order, old_status, "REJECTED", get_current_user().id, data.get("reason"))
 
#     db.session.commit()
 
#     return jsonify({
#         "message": "Order rejected",
#         "order": order.to_dict()
#     }), 200
 
 
# @order_bp.route("/orders/<int:order_id>/cancel", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT","USER"])
# def cancel_order(order_id):
#     order = Order.query.get_or_404(order_id)
#     if order.status in ("DELIVERED", "CANCELLED"):
#         return jsonify({"error": f"Cannot cancel an order that is {order.status}"}), 400
 
#     data = request.get_json() or {}
#     old_status = order.status
#     order.status = "CANCELLED"
#     order.rejection_reason = data.get("reason")
 
#     log_order_status(order, old_status, "CANCELLED", get_current_user().id, data.get("reason"))
 
#     db.session.commit()
#     return jsonify({"message": "Order cancelled", "order": order.to_dict()}), 200
 
 
# # ─── 2. ASSIGN TO KITCHEN ────────────────────────────────────────────────────
 
# @order_bp.route("/kitchen-staff", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_kitchen_staff():
#     staff = User.query.filter_by(role="KITCHEN_STAFF").all()
#     return jsonify([
#         {"id": s.id, "name": f"{s.first_name} {s.last_name}"}
#         for s in staff
#     ]), 200
 
 
# # ─── 3. KITCHEN: PREPARING -> READY ─────────────────────────────────────────
 
 
# @order_bp.route("/orders/<int:order_id>/start-preparation", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
# def start_preparation(order_id):
 
#     order = Order.query.get_or_404(order_id)
 
#     current_user = get_current_user()
 
#     if order.status != "ASSIGNED_TO_KITCHEN":
#      return jsonify({
#         "error": "Order must be ASSIGNED_TO_KITCHEN"
#      }), 400
 
#     order.status = "PREPARING"
#     order.preparation_started_at = utc_now()
#     order.preparation_started_by = current_user.id
#     order.kitchen_staff_id = current_user.id
    
#     log_order_status(
#     order,
#       "ASSIGNED_TO_KITCHEN",
#       "PREPARING",
#       current_user.id,
#        f"Preparation started by {current_user.first_name} {current_user.last_name}"
#        )
 
#     db.session.commit()
#     other_kitchen_ids = [
#         user.id
#         for user in User.query.filter_by(role="KITCHEN_STAFF", is_active=True).all()
#         if user.id != current_user.id
#     ]
#     notify_staff(
#         order,
#         other_kitchen_ids,
#         "Kitchen order claimed",
#         f"Order {order.order_number} was claimed by {current_user.first_name} {current_user.last_name}.",
#         "KITCHEN_ORDER_CLAIMED",
#     )
 
#     return jsonify({
#         "message": "Preparation started",
#         "order": order.to_dict()
#     }), 200
 
 
# @order_bp.route("/orders/<int:order_id>/ready", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
# def mark_ready(order_id):
 
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
 
#     if current_user.role == "KITCHEN_STAFF" and order.kitchen_staff_id != current_user.id:
#         return jsonify({"error": "Order not assigned to you"}), 403
 
#     # Admin / shop manager may also skip preparation (ASSIGNED_TO_KITCHEN -> ready).
#     allowed_from = {"PREPARING"}
#     if current_user.role in ("ADMIN", "SHOP_MANAGER"):
#         allowed_from.add("ASSIGNED_TO_KITCHEN")
#     if order.status not in allowed_from:
#         return jsonify({"error": "Order must be PREPARING before it can be marked READY"}), 400
 
#     old_status = order.status
 
#     order.completed_by_kitchen_at = utc_now()
#     if not order.preparation_started_by:
#         order.preparation_started_by = current_user.id
#         order.preparation_started_at = order.preparation_started_at or utc_now()

#     # PICKUP orders never go to a delivery agent: they wait at the shop until
#     # the customer collects them (kitchen, owner or shop manager completes).
#     if str(order.delivery_method or "DELIVERY").upper() == "PICKUP":
#         order.status = "PICKUP_READY"
#         log_order_status(
#             order, old_status, "PICKUP_READY", current_user.id,
#             "Pickup order ready — waiting for customer collection",
#         )
#         db.session.commit()
#         notify_customer(
#             order,
#             "Ready for pickup",
#             f"Your order {order.order_number} is ready for pickup.",
#             "PICKUP_READY",
#         )
#         return jsonify({
#             "message": "Pickup order is ready for customer collection",
#             "order": order.to_dict(),
#         }), 200
 
# # Find available delivery agent
#     # Prefer an ONLINE delivery agent, then any active one.
#     delivery_agent = (
#         User.query.filter_by(role="DELIVERY_AGENT", availability_status="ONLINE", is_active=True)
#         .order_by(User.id.asc()).first()
#         or User.query.filter_by(role="DELIVERY_AGENT", is_active=True)
#         .order_by(User.id.asc()).first()
#     )
#     if not delivery_agent:
#         # No delivery agent: keep the order READY so the owner / shop manager
#         # can assign a driver directly from Order Management.
#         order.status = "READY"
#         log_order_status(
#             order, old_status, "READY", current_user.id,
#             "Order ready — no delivery agent available for auto-assignment",
#         )
#         db.session.commit()
#         notify_admins(f"Order {order.order_number} is READY for dispatch", order)
#         return jsonify({"message": "Order marked READY", "order": order.to_dict()}), 200
 
#     order.delivery_agent_id = delivery_agent.id
#     order.delivery_agent_assigned_by = current_user.id
#     order.delivery_agent_assigned_at = utc_now()
 
#     order.status = "ASSIGNED_TO_AGENT"
 
#     log_order_status(
#     order,
#     old_status,
#     "ASSIGNED_TO_AGENT",
#     current_user.id,
#     f"Automatically assigned to delivery agent "
#     f"{delivery_agent.first_name} {delivery_agent.last_name}"
#     )
 
#     db.session.commit()
#     notify_staff(
#         order,
#         [delivery_agent.id],
#         "New delivery order",
#         f"Order {order.order_number} is ready. Please assign an available driver.",
#         "DELIVERY_AGENT_ORDER_ASSIGNED",
#     )
 
#     notify_admins(f"Order {order.order_number} is READY for dispatch", order)
 
#     return jsonify({
#         "message": "Order marked READY",
#         "order": order.to_dict()
#     }), 200
 
 
# # ─── 4. ASSIGN TO DELIVERY AGENT (owner/shop manager -> DELIVERY_AGENT) ─────
 
# @order_bp.route("/orders/<int:order_id>/assign-agent", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def assign_delivery_agent(order_id):
 
#     order = Order.query.get_or_404(order_id)
 
#     if order.status != "READY":
#         return jsonify({"error": "Order must be READY before assigning a delivery agent"}), 400
 
#     data = request.get_json()
#     agent_id = data.get("delivery_agent_id") or data.get("agent_id")
 
#     if not agent_id:
#         return jsonify({"error": "delivery_agent_id is required"}), 400
 
#     agent = User.query.get(agent_id)
#     if not agent:
#         return jsonify({"error": "Delivery agent not found"}), 404
#     if agent.role != "DELIVERY_AGENT":
#         return jsonify({"error": "Selected user is not a delivery agent"}), 400
 
#     old_status = order.status
#     current_user = get_current_user()
 
#     order.delivery_agent_id = agent.id
#     order.delivery_agent_assigned_by = current_user.id
#     order.delivery_agent_assigned_at = utc_now()
#     order.status = "ASSIGNED_TO_AGENT"
 
#     log_order_status(
#         order, old_status, "ASSIGNED_TO_AGENT", current_user.id,
#         f"Assigned to delivery agent {agent.first_name} {agent.last_name}"
#     )
 
#     db.session.commit()
 
#     notify_staff(
#         order,
#         [agent.id],
#         "New delivery order",
#         f"Order {order.order_number} is ready. Please assign an available driver.",
#         "DELIVERY_AGENT_ORDER_ASSIGNED",
#     )
 
#     notify_admins(
#         f"Order {order.order_number} assigned to delivery agent "
#         f"{agent.first_name} {agent.last_name}",
#         order
#     )
 
#     return jsonify({
#         "message": "Delivery agent assigned",
#         "order": order.to_dict()
#     }), 200
 
 
# @order_bp.route("/orders/<int:order_id>/reassign-agent", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def reassign_delivery_agent(order_id):
#     order = Order.query.get_or_404(order_id)
#     data = request.get_json()
 
#     agent = User.query.filter_by(
#         id=data.get("delivery_agent_id"), role="DELIVERY_AGENT"
#     ).first()
#     if not agent:
#         return jsonify({"error": "Delivery agent not found"}), 404
 
#     order.delivery_agent_id = agent.id
#     order.delivery_agent_assigned_by = get_current_user().id
#     order.delivery_agent_assigned_at = utc_now()
 
#     # Reassigning the agent also clears any driver previously picked by the
#     # old agent, since the new agent should choose their own driver.
#     order.driver_id = None
#     order.driver_assigned_by = None
#     order.driver_assigned_at = None
#     order.driver_accepted_at = None
#     if order.status in ("ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY"):
#         order.status = "ASSIGNED_TO_AGENT"
 
#     db.session.commit()
#     return jsonify({"message": "Delivery agent reassigned", "order": order.to_dict()}), 200
 
 
# @order_bp.route("/delivery-agents", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_delivery_agents():
#     agents = User.query.filter_by(role="DELIVERY_AGENT").all()
#     return jsonify([
#         {"id": a.id, "name": f"{a.first_name} {a.last_name}", "phone_no": a.phone_no}
#         for a in agents
#     ]), 200
 
 
# @order_bp.route("/orders/<int:order_id>/assign-driver", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def assign_driver(order_id):
 
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
 
#     # Owner / shop manager can dispatch a driver directly once the cake is
#     # ready (client report: shop manager only had "Cancel order"), and can
#     # re-assign while the driver has not accepted yet.
#     role = str(current_user.role or "").upper()
#     if str(order.delivery_method or "DELIVERY").upper() == "PICKUP":
#         return jsonify({"error": "Pickup orders are collected at the shop — no driver needed"}), 400
#     if role in ("ADMIN", "SHOP_MANAGER"):
#         allowed_from = {"READY", "ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER"}
#     else:
#         allowed_from = {"ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER"}
#     if order.status not in allowed_from:
#         return jsonify({
#             "error": "A driver can be assigned once the order is ready for dispatch"
#         }), 400
 
#     data = request.get_json(silent=True) or {}
#     driver_id = data.get("driver_id")
 
#     if not driver_id:
#         return jsonify({"error": "driver_id is required"}), 400
 
#     driver = User.query.get(driver_id)
 
#     if not driver:
#         return jsonify({"error": "Driver not found"}), 404
 
#     if driver.role != "DRIVER":
#         return jsonify({"error": "Selected user is not a driver"}), 400
 
#     old_status = order.status
 
#     # Record which delivery agent handled the order (only when one did it).
#     if role == "DELIVERY_AGENT":
#         order.delivery_agent_id = current_user.id
 
#     order.driver_id = driver.id
#     order.driver_assigned_by = current_user.id
#     order.driver_assigned_at = utc_now()
#     order.driver_accepted_at = None
#     order.status = "ASSIGNED_TO_DRIVER"
 
#     log_order_status(
#         order,
#         old_status,
#         "ASSIGNED_TO_DRIVER",
#         current_user.id,
#         f"Driver {driver.first_name} {driver.last_name} assigned by "
#         f"{current_user.first_name} {current_user.last_name}"
#     )
 
#     db.session.commit()
#     notify_staff(
#         order,
#         [driver.id],
#         "New delivery assigned",
#         f"Order {order.order_number} has been assigned to you. Please review and accept it.",
#         "DRIVER_ORDER_ASSIGNED",
#     )
 
#     notify_admins(
#         f"Order {order.order_number}: Driver {driver.first_name} {driver.last_name} assigned.",
#         order
#     )
 
#     return jsonify({
#         "message": "Driver assigned successfully",
#         "order": order.to_dict()
#     }), 200
 
# # ─── ROLE-SCOPED "MY ORDERS" LISTS ──────────────────────────────────────────
 
# @order_bp.route("/orders/kitchen/my-orders", methods=["GET"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF"])
# def get_my_kitchen_orders():
#     current_user = get_current_user()
#     orders = Order.query.filter(
#         Order.kitchen_staff_id == current_user.id,
#         Order.status.in_(["ASSIGNED_TO_KITCHEN", "PREPARING"])
#     ).order_by(Order.created_at.desc()).all()
 
#     return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/agent/my-orders", methods=["GET"])
# @jwt_required()
# @role_required(["DELIVERY_AGENT"])
# def get_my_agent_orders():
#     current_user = get_current_user()
#     orders = Order.query.filter(
#         Order.delivery_agent_id == current_user.id,
#         Order.status.in_([
#             "ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
#             "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"
#         ])
#     ).order_by(Order.created_at.desc()).all()
 
#     return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/driver/my-orders", methods=["GET"])
# @jwt_required()
# @role_required(["DRIVER"])
# def get_my_driver_orders():
#     current_user = get_current_user()
#     orders = Order.query.filter(
#         Order.driver_id == current_user.id,
#         Order.status.in_(["ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"])
#     ).order_by(Order.created_at.desc()).all()
 
#     return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/kitchen/<int:kitchen_staff_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_kitchen_assigned_orders(kitchen_staff_id):
#     orders = Order.query.filter_by(kitchen_staff_id=kitchen_staff_id).order_by(Order.created_at.desc()).all()
#     return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/agent/<int:agent_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_agent_assigned_orders(agent_id):
#     orders = Order.query.filter_by(delivery_agent_id=agent_id).order_by(Order.created_at.desc()).all()
#     return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/driver/<int:driver_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def get_driver_assigned_orders(driver_id):
#     orders = Order.query.filter_by(driver_id=driver_id).order_by(Order.created_at.desc()).all()
#     return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/status/<string:status>", methods=["GET"])
# @jwt_required()
# def orders_by_status(status):
#     orders = Order.query.filter_by(status=status.upper()).order_by(Order.created_at.desc()).all()
#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/customer/<int:customer_id>", methods=["GET"])
# @jwt_required()
# def orders_by_customer(customer_id):
 
#     current_user = get_current_user()
 
#     # Admins, shop managers and sales agents can view any customer's orders
#     if current_user.role in ["ADMIN", "SHOP_MANAGER", "SALES_AGENT","USER"]:
#         pass
 
#     else:
#         return jsonify({
#             "error": "Forbidden"
#         }), 403
 
#     orders = Order.query.filter_by(user_id=customer_id)\
#         .order_by(Order.created_at.desc()).all()
 
#     return jsonify({
#         "orders": [o.to_dict() for o in orders]
#     }), 200
 
# @order_bp.route("/orders/created-by/<int:agent_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def orders_by_creator(agent_id):
#     orders = Order.query.filter_by(created_by=agent_id).order_by(Order.created_at.desc()).all()
#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200
 
 
# @order_bp.route("/orders/<int:order_id>/history", methods=["GET"])
# @jwt_required()
# def order_history(order_id):
#     from models.order_status_history import OrderStatusHistory
#     history = OrderStatusHistory.query.filter_by(order_id=order_id).order_by(
#         OrderStatusHistory.created_at.desc()
#     ).all()
#     return jsonify({"history": [h.to_dict() for h in history]}), 200
 
 
# # ─── IMAGES ──────────────────────────────────────────────────────────────────
 
# @order_bp.route("/orders/<int:order_id>/upload-image", methods=["POST"])
# @jwt_required()
# def upload_order_image(order_id):
#     import cloudinary.uploader
#     order = Order.query.get_or_404(order_id)
#     file = request.files.get("image")
#     if not file:
#         return jsonify({"error": "No image provided"}), 400
#     result = cloudinary.uploader.upload(file, folder=f"orders/{order_id}")
#     images = order.delivery_images or []
#     images.append({"url": result["secure_url"], "public_id": result["public_id"]})
#     order.delivery_images = images
#     db.session.commit()
#     return jsonify({"message": "Image uploaded", "image_url": result["secure_url"]}), 200
 
 
# @order_bp.route("/orders/<int:order_id>/images", methods=["GET"])
# @jwt_required()
# def get_order_images(order_id):
#     order = Order.query.get_or_404(order_id)
#     return jsonify({"images": order.delivery_images or []}), 200
 
 
# @order_bp.route("/orders/<int:order_id>/images/<string:image_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_order_image(order_id, image_id):
#     order = Order.query.get_or_404(order_id)
#     order.delivery_images = [
#         img for img in (order.delivery_images or [])
#         if img.get("public_id") != image_id
#     ]
#     db.session.commit()
#     return jsonify({"message": "Image deleted"}), 200
 
 
# # ─── GREETING CARD ───────────────────────────────────────────────────────────
 
# @order_bp.route("/orders/<int:order_id>/greeting", methods=["POST"])
# @jwt_required()
# def add_greeting(order_id):
#     order = Order.query.get_or_404(order_id)
#     data = request.get_json()
#     order.greeting_message = data.get("message")
#     order.greeting_from = data.get("from")
#     order.greeting_to = data.get("to")
#     db.session.commit()
#     return jsonify({"message": "Greeting added", "order": order.to_dict()}), 201
 
 
# @order_bp.route("/orders/<int:order_id>/greeting", methods=["PUT"])
# @jwt_required()
# def update_greeting(order_id):
#     order = Order.query.get_or_404(order_id)
#     data = request.get_json()
#     if "message" in data:
#         order.greeting_message = data["message"]
#     if "from" in data:
#         order.greeting_from = data["from"]
#     if "to" in data:
#         order.greeting_to = data["to"]
#     db.session.commit()
#     return jsonify({"message": "Greeting updated", "order": order.to_dict()}), 200
 
 
# @order_bp.route("/orders/<int:order_id>/greeting", methods=["GET"])
# @jwt_required()
# def get_greeting(order_id):
#     order = Order.query.get_or_404(order_id)
#     return jsonify({
#         "message": order.greeting_message,
#         "from": order.greeting_from,
#         "to": order.greeting_to
#     }), 200
 
 
# # ─── 6. DRIVER ACCEPTS THE ORDER ────────────────────────────────────────────
 
# @order_bp.route("/orders/<int:order_id>/driver-accept", methods=["POST"])
# @jwt_required()
# @role_required(["DRIVER"])
# def driver_accept(order_id):
 
#     order        = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
 
#     if order.driver_id != current_user.id:
#         return jsonify({"error": "Order not assigned to you"}), 403
 
#     if order.status != "ASSIGNED_TO_DRIVER":
#         return jsonify({"error": "Order is not awaiting driver acceptance"}), 400
 
#     old_status = order.status
#     now        = utc_now()
 
#     order.driver_accepted_at = now
#     order.status             = "DRIVER_ACCEPTED"
#     log_order_status(order, old_status, "DRIVER_ACCEPTED", current_user.id)
 
#     # Immediately move to OUT_FOR_DELIVERY so the driver can start the trip
#     order.out_for_delivery_at = now
#     order.status              = "OUT_FOR_DELIVERY"
#     log_order_status(order, "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", current_user.id)
 
#     # ── FIX: mark driver BUSY so they don't appear in available-drivers list ──
#     current_user.availability_status = "BUSY"
 
#     db.session.commit()
#     notify_customer(
#         order,
#         "Out for delivery",
#         f"Your order {order.order_number} is now out for delivery.",
#         "OUT_FOR_DELIVERY",
#     )
 
#     notify_admins(
#         f"Order {order.order_number} accepted by driver "
#         f"{current_user.first_name} {current_user.last_name} — now out for delivery",
#         order,
#     )
 
#     return jsonify({
#         "message": "Delivery accepted, order is out for delivery",
#         "order": order.to_dict(),
#     }), 200
 
 
# # ─── 6b. DRIVER REJECTS THE ORDER ───────────────────────────────────────────
 
# @order_bp.route("/orders/<int:order_id>/driver-reject", methods=["POST"])
# @jwt_required()
# @role_required(["DRIVER"])
# def driver_reject(order_id):
 
#     order        = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
 
#     if order.driver_id != current_user.id:
#         return jsonify({"error": "Order not assigned to you"}), 403
 
#     old_status = order.status
 
#     order.driver_id          = None
#     order.driver_assigned_by = None
#     order.driver_assigned_at = None
#     order.driver_accepted_at = None
#     order.status             = "ASSIGNED_TO_AGENT"   # bounce back to delivery agent
 
#     # ── FIX: driver is free again ─────────────────────────────────────────────
#     current_user.availability_status = "ONLINE"
 
#     log_order_status(
#         order, old_status, "ASSIGNED_TO_AGENT",
#         current_user.id, "Rejected by driver"
#     )
#     db.session.commit()
 
#     notify_admins(
#         f"Driver rejected order {order.order_number}; returned to delivery agent",
#         order,
#     )
 
#     return jsonify({
#         "message": "Order rejected, returned to delivery agent",
#         "order": order.to_dict(),
#     }), 200
 
 
# # ─── 7. DRIVER COMPLETES THE DELIVERY ────────────────────────────────────────
# #
# # Client report (13/10/2026): after "Accept Order" the app asked for a proof
# # photo, and even after sending one the order stayed "On the way" with no
# # "Mark Delivered". Causes:
# #   * the proof endpoint only read JSON, so a multipart photo upload failed;
# #   * "Mark Delivered" (confirm-delivery) only worked from DELIVERY_SUBMITTED,
# #     a status the proof step never produced.
# # Now both endpoints accept JSON or multipart, the photo is optional, and a
# # driver can finish their own order from DRIVER_ACCEPTED / OUT_FOR_DELIVERY /
# # DELIVERY_SUBMITTED in one step.

# DRIVER_FINISHABLE = {"DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"}


# def _delivery_payload():
#     """Return (fields, uploaded_file) from a JSON or multipart request."""
#     data = request.get_json(silent=True)
#     if isinstance(data, dict):
#         return data, None
#     fields = request.form.to_dict() if request.form else {}
#     uploaded = None
#     for key in ("delivery_photo", "photo", "image", "file", "proof"):
#         candidate = request.files.get(key)
#         if candidate and candidate.filename:
#             uploaded = candidate
#             break
#     return fields, uploaded


# def _truthy(value):
#     return value is True or str(value).strip().lower() in {"1", "true", "yes", "on"}


# def _store_proof(order, fields, uploaded):
#     """Save photo/notes/confirmation details sent with the delivery."""
#     photo = _addr_clean(fields.get("delivery_photo") or fields.get("photo") or fields.get("image_url"))
#     if uploaded is not None:
#         try:
#             import cloudinary.uploader
#             result = cloudinary.uploader.upload(
#                 uploaded, folder="cakentake/delivery-proof", resource_type="image",
#             )
#             photo = result.get("secure_url") or photo
#         except Exception as exc:
#             print("Delivery proof upload error:", exc)
#     if photo:
#         order.delivery_photo = photo
#     notes = _addr_clean(fields.get("delivery_notes") or fields.get("notes"))
#     if notes:
#         order.delivery_notes = notes
#     name = _addr_clean(fields.get("customer_confirmation_name") or fields.get("customer_name"))
#     phone = _addr_clean(fields.get("customer_confirmation_phone") or fields.get("customer_phone"))
#     if name:
#         order.customer_confirmation_name = name
#     if phone:
#         order.customer_confirmation_phone = phone


# def _finalize_delivery(order, current_user, fields, note):
#     """Mark an order DELIVERED with every side effect in one place."""
#     old_status = order.status
#     now = utc_now()

#     if not order.driver_submitted_at:
#         order.driver_submitted_at = now
#     order.status = "DELIVERED"
#     order.delivered_at = now
#     order.delivery_confirmed_by = current_user.id
#     order.delivery_confirmed_at = now

#     # COD is marked paid only when the driver confirms the cash was collected.
#     if str(order.payment_method or "").upper() in ("COD", "CASH"):
#         if _truthy(fields.get("cash_collected")) and order.payment_status != "PAID":
#             order.payment_status = "PAID"

#     log_order_status(order, old_status, "DELIVERED", current_user.id, note)

#     if order.driver_id:
#         driver = User.query.get(order.driver_id)
#         if driver:
#             driver.availability_status = "ONLINE"

#     from models.delivery_charge import DeliveryCharge
#     if order.driver_id and not DeliveryCharge.query.filter_by(order_id=order.id).first():
#         db.session.add(DeliveryCharge(
#             order_id=order.id,
#             driver_id=order.driver_id,
#             charge_amount=order.delivery_charge or 0,
#             driver_share=0,
#             is_paid=False,
#             notes="Delivered; waiting for settlement amount",
#         ))

#     try:
#         config = get_loyalty_config()
#         subtotal = float(order.subtotal or 0)
#         if subtotal >= float(config.min_order_amount):
#             earned_points = (
#                 int(subtotal // float(config.min_order_amount))
#                 * config.points_per_min_order
#             )
#             existing = LoyaltyLedger.query.filter_by(
#                 customer_id=order.user_id, order_id=order.id, transaction_type="EARN"
#             ).first()
#             if not existing and earned_points > 0:
#                 add_loyalty_points(
#                     customer_id=order.user_id,
#                     points=earned_points,
#                     order_id=order.id,
#                     description=f"Earned points for delivered Order {order.order_number}",
#                 )
#     except Exception as exc:
#         print("Loyalty Error:", exc)

#     db.session.commit()

#     notify_customer(
#         order,
#         "Order delivered",
#         f"Your order {order.order_number} has been delivered successfully. Thank you for ordering with CakeNTake!",
#         "ORDER_DELIVERED",
#     )
#     reviewer_ids = [
#         u.id for u in User.query.filter(
#             User.role.in_(["ADMIN", "SHOP_MANAGER"]), User.is_active.is_(True),
#         ).all()
#     ]
#     notify_staff(
#         order, reviewer_ids, "Order delivered",
#         f"Order {order.order_number} was delivered and is ready for settlement review.",
#         "ORDER_READY_FOR_SETTLEMENT",
#     )
#     notify_admins(
#         f"Order {order.order_number} DELIVERED — {current_user.first_name} {current_user.last_name}",
#         order,
#     )


# @order_bp.route("/orders/<int:order_id>/delivery-proof", methods=["POST"])
# @jwt_required()
# @role_required(["DRIVER"])
# def upload_delivery_proof(order_id):
#     """Driver submits (optional) proof and the order is marked delivered."""
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()

#     if order.driver_id != current_user.id:
#         return jsonify({"error": "Order not assigned to you"}), 403
#     if order.status not in DRIVER_FINISHABLE:
#         return jsonify({"error": "Accept the order before marking it delivered"}), 400

#     fields, uploaded = _delivery_payload()
#     _store_proof(order, fields, uploaded)
#     _finalize_delivery(order, current_user, fields, "Driver marked the order delivered")

#     return jsonify({
#         "message": "Order marked as delivered",
#         "order": order.to_dict(),
#     }), 200


# # ─── 8. MARK DELIVERED (driver) / CONFIRM DELIVERY (owner, shop manager) ────

# @order_bp.route("/orders/<int:order_id>/confirm-delivery", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DRIVER", "DELIVERY_AGENT"])
# def confirm_delivery(order_id):
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
#     role = str(current_user.role or "").upper()

#     if role == "DRIVER" and order.driver_id != current_user.id:
#         return jsonify({"error": "Order not assigned to you"}), 403
#     if role == "DELIVERY_AGENT" and order.delivery_agent_id != current_user.id:
#         return jsonify({"error": "Order not assigned to you"}), 403
#     if order.status not in DRIVER_FINISHABLE:
#         return jsonify({"error": "Only orders that are out for delivery can be marked delivered"}), 400

#     fields, uploaded = _delivery_payload()
#     _store_proof(order, fields, uploaded)
#     note = (
#         "Driver marked the order delivered" if role == "DRIVER"
#         else f"Delivery confirmed by {role.replace('_', ' ').title()}"
#     )
#     _finalize_delivery(order, current_user, fields, note)

#     return jsonify({
#         "message": "Order marked as delivered",
#         "order": order.to_dict(),
#     }), 200


# @order_bp.route("/orders/sales-agent", methods=["POST"])
# @jwt_required()
# @role_required(["SALES_AGENT", "SHOP_MANAGER","ADMIN"])
# def create_sales_agent_order():
#     """Create a staff-assisted order for an existing or new customer.
 
#     SHOP_MANAGER and SALES_AGENT can use this route.  customer_id/address_id
#     may point at existing database records.  If customer_id is omitted, a
#     customer is found/created from the supplied contact details.  Delivery
#     orders require an existing address or enough area/address data to create
#     one.  Pickup orders do not require a delivery address.
#     """
#     data = request.get_json(silent=True) or {}
#     staff_user = get_current_user()
 
#     try:
#         allowed_currencies = {"INR", "KWD", "AED", "USD", "SAR", "SGD"}
#         currency = str(data.get("currency") or "KWD").strip().upper()
#         if currency not in allowed_currencies:
#             currency = "KWD"
 
#         delivery_method = str(
#             data.get("delivery_method") or "DELIVERY"
#         ).strip().upper()
#         if delivery_method not in {"DELIVERY", "PICKUP"}:
#             return jsonify({"error": "Invalid delivery method"}), 400
 
#         # "-" / blank means "not chosen yet" on the staff form -> collect later (COD).
#         payment_method = _addr_clean(data.get("payment_method")).upper() or "COD"
#         if payment_method == "CASH":
#             payment_method = "COD"
#         allowed_payment_methods = ALLOWED_PAYMENT_METHODS - {"CREDIT"}
#         if payment_method not in allowed_payment_methods:
#             return jsonify({
#                 "error": "Invalid payment method",
#                 "allowed_payment_methods": sorted(allowed_payment_methods),
#             }), 400
 
#         # ----------------------------------------------------------
#         # CUSTOMER: existing DB user OR create/find by contact data
#         # ----------------------------------------------------------
#         customer_id = data.get("customer_id") or data.get("user_id")
#         customer = None
 
#         if customer_id:
#             customer = User.query.get(int(customer_id))
#             if not customer or str(customer.role or "").upper() != "USER":
#                 return jsonify({"error": "Customer not found"}), 404
 
#         customer_origin = "EXISTING" if customer else "NEW"
 
#         customer_name = str(
#             data.get("customer_name")
#             or (
#                 f"{customer.first_name or ''} {customer.last_name or ''}".strip()
#                 if customer else ""
#             )
#         ).strip()
#         # ── Contact number validation (client report: incorrect numbers) ──
#         # A number typed on the form must be valid; a legacy number already
#         # stored on an existing customer is kept as-is when none is typed.
#         typed_phone = _addr_clean(data.get("customer_phone"))
#         if typed_phone:
#             try:
#                 customer_phone = normalize_phone(typed_phone, field="Customer phone")
#             except PhoneError as exc:
#                 return jsonify({"error": str(exc), "field": "customer_phone"}), 400
#         else:
#             customer_phone = str(customer.phone_no if customer else "").strip()
 
#         incoming_email = str(data.get("customer_email") or "").strip().lower()
#         customer_email = (
#             incoming_email
#             if incoming_email not in ("", "-")
#             else (customer.email if customer else None)
#         )
#         customer_alt_phone = None
#         typed_alt = _addr_clean(data.get("customer_alt_phone"))
#         if typed_alt:
#             try:
#                 customer_alt_phone = normalize_phone(typed_alt, field="Alternate phone")
#             except PhoneError as exc:
#                 return jsonify({"error": str(exc), "field": "customer_alt_phone"}), 400
 
#         # if not customer:
#         #     if not customer_name:
#         #         return jsonify({"error": "customer_name is required"}), 400
#         #     if not customer_phone:
#         #         return jsonify({"error": "customer_phone is required"}), 400
#         #     # if not customer_email:
#         #     #     return jsonify({"error": "customer_email is required"}), 400
 
#         #     customer = User.query.filter(
#         #         db.or_(
#         #             User.phone_no == customer_phone,
#         #             User.email == customer_email,
#         #         )
#         #     ).first()
 
#         #     if not customer:
#         #         name_parts = customer_name.split(None, 1)
#         #         first_name = name_parts[0]
#         #         last_name = name_parts[1] if len(name_parts) > 1 else "-"
#         #         customer = User(
#         #             first_name=first_name,
#         #             last_name=last_name,
#         #             email=customer_email,
#         #             phone_no=customer_phone,
#         #             password=generate_password_hash("Temp@12345"),
#         #             role="USER",
#         #             currency_code=currency,
#         #             loyalty_points=0,
#         #             availability_status="OFFLINE",
#         #             rating=0.0,
#         #         )
#         #         db.session.add(customer)
#         #         db.session.flush()
 
       
#         if not customer:
#             if not customer_name:
#                return jsonify({"error": "customer_name is required"}), 400
#             if not customer_phone:
#                return jsonify({"error": "customer_phone is required"}), 400
  
#             # Match the customer however their number was stored before
#             # (local 8 digits, 965..., +965...), so no duplicate is created.
#             lookup_filters = [User.phone_no.in_(phone_variants(customer_phone))]
#             if customer_email:
#               lookup_filters.append(User.email == customer_email)
 
#             customer = User.query.filter(
#                 db.func.upper(User.role) == "USER",
#                 db.or_(*lookup_filters),
#             ).first()
 
#             if not customer:
#              name_parts = customer_name.split(None, 1)
#              first_name = name_parts[0]
#              last_name = name_parts[1] if len(name_parts) > 1 else "-"
#              customer = User(
#                first_name=first_name,
#                last_name=last_name,
#                email=customer_email,
#                phone_no=customer_phone,
#                password=generate_password_hash("Temp@12345"),
#                role="USER",
#                currency_code=currency,
#                loyalty_points=0,
#                availability_status="OFFLINE",
#                rating=0.0,
#         )
#              db.session.add(customer)
#              db.session.flush()
       
#         # ----------------------------------------------------------
#         # ADDRESS / AREA
#         # ----------------------------------------------------------
#         address = None
#         area = None
#         fields = extract_address_fields(data)
 
#         address_id = data.get("address_id")
#         area_id = data.get("area_id")
 
#         if delivery_method == "DELIVERY":
#             if address_id:
#                 address = Address.query.get(int(address_id))
#                 if not address:
#                     return jsonify({"error": "Address not found"}), 404
#                 if address.user_id != customer.id:
#                     return jsonify({
#                         "error": "Selected address does not belong to this customer"
#                     }), 403
#                 area_id = address.area_id
 
#             if not area_id:
#                 return jsonify({"error": "area_id is required for delivery"}), 400
 
#             area = Area.query.filter_by(id=int(area_id), is_active=True).first()
#             if not area:
#                 return jsonify({"error": "Invalid delivery area"}), 400
 
#             if not address:
#                 # Address has no landmark / house_no columns, so fold them in:
#                 #   house_no -> building (Kuwait: house / building number)
#                 #   landmark -> appended to delivery_notes
#                 notes = fields["delivery_notes"]
#                 if fields["landmark"]:
#                     notes = (f"{notes} | " if notes else "") + f"Landmark: {fields['landmark']}"
 
#                 address = Address(
#                     user_id=customer.id,
#                     street=fields["street"],
#                     block=fields["block"],
#                     avenue=fields["avenue"],
#                     building=fields["building"] or fields["house_no"],
#                     floor=fields["floor"],
#                     apartment=fields["apartment"],
#                     delivery_notes=notes,
#                     country=fields["country"],
#                     area_id=area.id,
#                 )
#                 db.session.add(address)
#                 db.session.flush()
 
#         # ----------------------------------------------------------
#         # ITEMS
#         # ----------------------------------------------------------
#         items = data.get("items") or []
#         custom_cakes = normalize_custom_cakes(data)
#         if not isinstance(items, list):
#             return jsonify({"error": "items must be an array"}), 400
#         if not items and not custom_cakes:
#             return jsonify({
#                 "error": "Order must contain at least one item or a custom cake"
#             }), 400
 
#         role = str(staff_user.role or "").upper()
#         source = "SHOP_MANAGER" if role == "SHOP_MANAGER" else "SALES_AGENT"
#         order_type = (
#             "shopmanager_order" if role == "SHOP_MANAGER" else "salesagent_order"
#         )
 
#         delivery_charge = Decimal(str(area.delivery_charge or 0)) if area else Decimal("0")
 
#         raw_date = data.get("delivery_date") or data.get("pickup_date")
#         raw_slot = data.get("delivery_time_slot") or data.get("pickup_time_slot")
 
 
#         order = Order(
#             user_id=customer.id,
#             created_by=staff_user.id,
#             order_number=generate_order_number(),
#             order_type=order_type,
#             order_source=source,
#             notes=extract_order_notes(data) or None,
#             delivery_method=delivery_method,
#             customer_name=customer_name,
#             customer_phone=customer_phone,
#             customer_email=customer_email,
#             customer_alt_phone=customer_alt_phone,
#             delivery_address_json=with_order_notes(
#                 build_address_snapshot(fields, address, area, customer_origin, data)
#                 if delivery_method == "DELIVERY"
#                 else {"customer_origin": customer_origin},
#                 extract_order_notes(data),
#             ),
#             address_id=address.id if address else None,
#             delivery_area_id=area.id if area else None,
#             delivery_date=(
#                 datetime.strptime(raw_date, "%Y-%m-%d").date()
#                 if raw_date else None
#             ),
#             delivery_time_slot=raw_slot,
#             # Keep the real pickup date on pickup orders as well, so kitchen /
#             # receipts / app screens that read pickup_date show it.
#             pickup_date=(
#                 datetime.strptime(raw_date, "%Y-%m-%d").date()
#                 if raw_date and delivery_method == "PICKUP" else None
#             ),
#             pickup_time_slot=raw_slot if delivery_method == "PICKUP" else None,
#             greeting_message=extract_cake_message(data) or None,
#             greeting_from=data.get("greeting_from") or None,
#             greeting_to=data.get("greeting_to") or None,
#             status="PENDING",
#             payment_method=payment_method,
#             payment_status="PENDING",
#             subtotal=0,
#             delivery_charge=delivery_charge,
#             discount=Decimal("0"),
#             grand_total=0,
#             total=0,
#             currency=currency,
#         )
#         db.session.add(order)
 
#         db.session.flush()
#         # Canonical order number is the database order ID.
#         order.order_number = str(order.id)
 
#         subtotal = Decimal("0")
#         for index, item in enumerate(items):
#             if not isinstance(item, dict):
#                 raise ValueError(f"Invalid item at position {index + 1}")
#             product_id = item.get("product_id")
#             product = Product.query.get(product_id) if product_id else None
#             if not product:
#                 raise ValueError(f"Product {product_id} not found")
 
#             quantity = int(item.get("quantity", 1))
#             if quantity <= 0:
#                 raise ValueError("Quantity must be greater than zero")
 
#             incoming_price = item.get("price")
#             price = Decimal(str(incoming_price if incoming_price is not None else product.price or 0))
#             if price < 0:
#                 raise ValueError("Price cannot be negative")
 
#             decimals = Decimal("0.001") if currency == "KWD" else Decimal("0.01")
#             price = price.quantize(decimals)
#             line_total = (price * Decimal(quantity)).quantize(decimals)
#             subtotal += line_total
 
#             db.session.add(OrderItem(
#                 order_id=order.id,
#                 product_id=product.id,
#                 quantity=quantity,
#                 price=price,
#                 line_total=line_total,
#                 custom_json=item.get("custom_json"),
#             ))
 
#         if custom_cakes:
#             for cake_index, cake in enumerate(custom_cakes):
#                 cake_price = Decimal(str(cake.get("price") or 0))
#                 if cake_price < 0:
#                     raise ValueError(
#                         f"Custom cake {cake_index + 1}: price cannot be negative"
#                     )
#                 subtotal += cake_price
#             # Stored as a JSON array so every cake on the order is kept.
#             order.custom_cake_json = custom_cakes
 
#         minimum_order = Decimal(str(area.min_order_value or 0)) if area else Decimal("0")
#         if subtotal < minimum_order:
#             raise ValueError(
#                 f"Minimum order value is {currency} {minimum_order}"
#             )
 
#         grand_total = subtotal + delivery_charge
#         order.subtotal = subtotal
#         order.delivery_charge = delivery_charge
#         order.grand_total = grand_total
#         order.total = grand_total
 
#         db.session.commit()
 
#         # Both Owner and Shop Manager should immediately see staff-created
#         # orders in their pending workflow. Push is best-effort only.
#         try:
#             reviewer_ids = [
#                 u.id for u in User.query.filter(
#                     User.role.in_(["ADMIN", "SHOP_MANAGER"]),
#                     User.is_active.is_(True),
#                 ).all()
#             ]
#             notify_staff(
#                 order,
#                 reviewer_ids,
#                 "New order awaiting approval",
#                 f"{order.order_number} was created by {source.replace('_', ' ').title()}.",
#                 "NEW_ORDER",
#             )
#         except Exception as exc:
#             print("Staff order notification error:", str(exc))
 
#         return jsonify({
#             "message": "Staff order created successfully",
#             "order": order.to_dict(),
#         }), 201
 
#     except ValueError as exc:
#         db.session.rollback()
#         return jsonify({"error": str(exc)}), 400
#     except Exception as exc:
#         db.session.rollback()
#         print("Staff Order Error:", str(exc))
#         return jsonify({"error": "Unable to create staff order"}), 500
 
 
# # @order_bp.route("/orders/sales-agent", methods=["GET"])
# # @jwt_required()
# # @role_required(["SALES_AGENT" , "ADMIN" ])
# # def sales_agent_orders():
 
# #     agent = get_current_user()
 
# #     orders = Order.query.filter_by(
# #         created_by=agent.id
# #     ).order_by(Order.created_at.desc()).all()
 
# #     return jsonify({
# #         "orders":[o.to_dict() for o in orders]
# #     }),200
 
 
# @order_bp.route("/orders/sales-agent", methods=["GET"])
# @jwt_required()
# @role_required(["SALES_AGENT", "ADMIN"])
# def sales_agent_orders():
 
#     agent = get_current_user()
 
#     orders = Order.query.filter_by(
#         created_by=agent.id
#     ).order_by(Order.created_at.desc()).all()
 
#     payload = []
#     for o in orders:
#         row = o.to_dict()
 
#         if o.address_id:
#             addr = Address.query.get(o.address_id)
#             if addr:
#                 row["address"] = addr.to_dict()
 
#         payload.append(row)
 
#     return jsonify({"orders": payload}), 200
 
# @order_bp.route("/orders/pickup-ready", methods=["GET"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF"])
# def pickup_ready_orders():
#     orders=Order.query.filter(db.func.upper(Order.delivery_method)=="PICKUP",Order.status=="PICKUP_READY").order_by(Order.completed_by_kitchen_at.desc()).all()
#     return jsonify({"orders":[o.to_dict() for o in orders]}),200
 
# @order_bp.route("/orders/<int:order_id>/customer-received", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
# def mark_pickup_customer_received(order_id):
#     order=Order.query.get_or_404(order_id); current_user=get_current_user()
#     if str(order.delivery_method or "DELIVERY").upper()!="PICKUP": return jsonify({"error":"This is not a pickup order"}),400
#     if order.status not in PICKUP_COLLECTABLE: return jsonify({"error":"Pickup order is not ready"}),400
#     data = request.get_json(silent=True) or {}
#     if str(order.payment_method or "").strip().upper() in ("COD", "CASH"):
#         if data.get("cash_collected") is not True:
#             return jsonify({"error": "Confirm cash collection before completing pickup"}), 400
#         order.payment_status = "PAID"
#     old_status=order.status; now=utc_now(); order.status="DELIVERED"; order.delivered_at=now; order.delivery_confirmed_by=current_user.id; order.delivery_confirmed_at=now
#     log_order_status(order,old_status,"DELIVERED",current_user.id,"Customer received pickup order at shop")
#     db.session.commit(); notify_customer(order,"Order collected",f"Your pickup order {order.order_number} has been collected successfully.","PICKUP_COLLECTED")
#     return jsonify({"message":"Customer receipt confirmed","order":order.to_dict()}),200
 
 
# # ─── Merged compatibility endpoints ─────────────────────────────────────────
 
# @order_bp.route("/orders/<int:order_id>/pickup", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
# def pickup_order(order_id):
 
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
 
#     if str(order.delivery_method or "").upper() != "PICKUP":
#         return jsonify({
#             "error": "This is not a pickup order"
#         }), 400
 
#     if order.status not in PICKUP_COLLECTABLE:
#         return jsonify({
#             "error": "Order is not ready for pickup"
#         }), 400
 
#     old_status = order.status
 
#     order.status = "DELIVERED"
#     order.delivered_at = utc_now()
 
#     if order.payment_method == "COD":
#         order.payment_status = "PAID"
 
#     log_order_status(
#         order,
#         old_status,
#         "DELIVERED",
#         current_user.id,
#         "Customer collected pickup order"
#     )
 
#     db.session.commit()
 
#     return jsonify({
#         "message": "Pickup completed",
#         "order": order.to_dict()
#     }), 200
 
# @order_bp.route("/orders/<int:order_id>/mark-cod-paid", methods=["POST"])
# @jwt_required()
# @role_required(["DRIVER", "ADMIN", "SHOP_MANAGER"])
# def mark_cod_paid(order_id):
#        order = Order.query.get(order_id)
#        if not order:
#            return jsonify({"error": "Order not found"}), 404
 
#        if order.payment_method != "COD":
#            return jsonify({"error": "This order is not Cash on Delivery"}), 400
 
#        order.payment_status = "PAID"
#        db.session.commit()
 
#        return jsonify({
#            "message": "Payment marked as collected",
#            "order": order.to_dict()
#        }), 200  
 
# @order_bp.route("/orders/<int:order_id>/mark-payment-paid", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF", "DRIVER", "ADMIN", "SHOP_MANAGER"])
# def mark_payment_paid(order_id):
#     order = Order.query.get_or_404(order_id)
#     data = request.get_json(silent=True) or {}
 
#     method = (data.get("payment_method") or order.payment_method or "COD").upper()
 
#     allowed = ALLOWED_PAYMENT_METHODS
#     if method not in allowed:
#         return jsonify({"error": "Invalid payment method"}), 400
 
#     # Staff is confirming how payment was actually collected at the counter —
#     # update payment_method too, in case it differs from what was chosen at checkout.
#     order.payment_method = method
#     order.payment_status = "PAID"
 
#     db.session.commit()
 
#     return jsonify({
#         "message": "Payment marked as paid",
#         "order": order.to_dict()
#     }), 200
 
# @order_bp.route("/orders/<int:order_id>/pickup-complete", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
# def pickup_complete(order_id):
#     """
#     One-shot action for PICKUP orders: kitchen staff confirms how the
#     customer paid at the counter (COD or online) AND marks the order
#     DELIVERED, in a single call.
#     """
#     order = Order.query.get_or_404(order_id)
#     current_user = get_current_user()
#     data = request.get_json(silent=True) or {}
 
#     if str(order.delivery_method or "").upper() != "PICKUP":
#         return jsonify({
#             "error": "This is not a pickup order"
#         }), 400
 
#     if order.status not in PICKUP_COLLECTABLE:
#         return jsonify({
#             "error": "Order is not ready for pickup"
#         }), 400
 
#     method = (data.get("payment_method") or order.payment_method or "COD").upper()
#     allowed = ALLOWED_PAYMENT_METHODS
#     if method not in allowed:
#         return jsonify({"error": "Invalid payment method"}), 400
 
#     old_status = order.status
 
#     # Record how payment was actually collected and mark it paid
#     order.payment_method = method
#     order.payment_status = "PAID"
 
#     # Move straight to DELIVERED
#     order.status = "DELIVERED"
#     order.delivered_at = utc_now()
 
#     log_order_status(
#         order,
#         old_status,
#         "DELIVERED",
#         current_user.id,
#         f"Customer collected pickup order — payment confirmed via {method}"
#     )
 
#     db.session.commit()
 
#     return jsonify({
#         "message": "Order marked as delivered and payment collected",
#         "order": order.to_dict()
#     }), 200




import random
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from models.area import Area
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from extensions import db
from config import Config
from models.currency_rate import CurrencyRate
 
from models.order import Order, utc_now
from models.order_item import OrderItem
from models.product import Product
from models.variant import Addon
from models.user import User
from models.address import Address
 
from services.loyalty_service import (
    add_loyalty_points,
    get_loyalty_config,
    redeem_loyalty_points,
)
from models.loyalty import LoyaltyLedger
from services.notification_service import send_order_notification
from services.push_notification_service import send_transactional_push
from middleware.role import role_required
from services.order_history_service import log_order_status
from services.tap_service import create_knet_charge, create_tap_charge
from utils.phone import normalize_phone, phone_variants, PhoneError
 
 
order_bp = Blueprint("order", __name__)
 
# ─── UTILS ─────────────────────────────────────────────────────────────────
 
def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))
 
 
def normalize_custom_cakes(data):
    """Return a list of custom-cake dicts.
 
    Accepts the new `custom_cakes` (array) and falls back to the legacy
    single `custom_cake` (object) so older clients keep working.
    """
    raw = data.get("custom_cakes")
    if raw is None:
        raw = data.get("custom_cake")
    if not raw:
        return []
    if isinstance(raw, dict):
        raw = [raw]
    if not isinstance(raw, list):
        raise ValueError("custom_cakes must be an array")
    cakes = []
    for idx, cake in enumerate(raw):
        if not isinstance(cake, dict):
            raise ValueError(f"Invalid custom cake at position {idx + 1}")
        cakes.append(cake)
    return cakes
 
 
def generate_order_number():
    return f"CT-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000,9999)}"
 
 
# ─── SALES-AGENT ADDRESS HELPERS ───────────────────────────────────────────
# The create-order form sends: address_line1 (= Block), address_line2
# ("houseNo, street"), landmark, city, state, country, area_id and (new)
# explicit block / house_no / street / delivery_notes. These helpers read ALL
# of those spellings so nothing the agent types is thrown away.
 
_ADDRESS_ALIASES = {
    "street":         ["street", "street_name", "streetName"],
    "block":          ["block", "block_no", "blockNo"],
    "avenue":         ["avenue", "avenue_name", "avenueName"],
    "building":       ["building", "building_name", "buildingName", "building_no"],
    "floor":          ["floor"],
    "apartment":      ["apartment", "apt", "flat", "flat_no", "flatNo"],
    "house_no":       ["house_no", "houseNo", "house_number", "house",
                       "house_flat_no", "houseFlatNo"],
    "landmark":       ["landmark"],
    # NOTE: the generic "notes" key is deliberately NOT an alias any more.
    # Clients send the cake writing / order notes as "notes", which used to be
    # saved into the address "Delivery Notes" field (client report 13/10/2026).
    "delivery_notes": ["delivery_notes", "deliveryNotes", "address_notes",
                       "addressNotes"],
    "country":        ["country", "country_name"],
}
_ADDRESS_SKIP_KEYS = {
    "items", "custom_cake", "custom_cakes", "order_addons", "cart",
    "greeting_message", "greeting_from", "greeting_to",
    "notes", "order_notes", "agent_notes", "cake_message", "message",
}

# Pickup orders the shop can hand over. READY / ASSIGNED_TO_AGENT cover older
# pickup orders that were wrongly routed to dispatch before this fix.
PICKUP_COLLECTABLE = {"PICKUP_READY", "READY", "ASSIGNED_TO_AGENT"}

# Payment methods accepted anywhere an order's payment is recorded.
# CREDIT = agent orders that are settled later from the agent payment screen.
ALLOWED_PAYMENT_METHODS = {"COD", "CARD", "STRIPE", "KNET", "UPI", "LINK", "CREDIT"}


def extract_order_notes(data):
    """Free-text order notes ("ORDER NOTES") from any client spelling."""
    for key in ("order_notes", "orderNotes", "agent_notes", "notes"):
        value = data.get(key) if isinstance(data, dict) else None
        if value is not None and _addr_clean(value):
            return str(value).strip()
    return ""


def extract_cake_message(data):
    """Order-level writing on the cake when a client sends it outside greeting_message."""
    for key in ("greeting_message", "cake_message", "cakeMessage", "message_on_cake", "writing"):
        value = data.get(key) if isinstance(data, dict) else None
        if value is not None and _addr_clean(value):
            return str(value).strip()
    return ""


def with_order_notes(snapshot, notes):
    """Store order notes inside delivery_address_json (no schema change needed)."""
    if not notes:
        return snapshot
    snap = dict(snapshot) if isinstance(snapshot, dict) else {}
    snap["order_notes"] = notes
    return snap

 
 
def _addr_clean(value):
    """Trimmed string; '' for empty / placeholder values such as '-' or ',,'."""
    if value is None:
        return ""
    if isinstance(value, dict):
        value = value.get("name")
        if value is None:
            return ""
    text = str(value).strip()
    return "" if not text or set(text) <= set(" ,.-") else text
 
 
def _addr_find(root, keys, max_depth=4):
    """Breadth-first: top-level keys win, then nested dicts/lists."""
    queue = [(root, 0)]
    while queue:
        node, depth = queue.pop(0)
        if isinstance(node, dict):
            for key in keys:
                text = _addr_clean(node.get(key))
                if text:
                    return text
            if depth < max_depth:
                for child in node.values():
                    if isinstance(child, (dict, list)):
                        queue.append((child, depth + 1))
        elif isinstance(node, list) and depth < max_depth:
            for child in node:
                if isinstance(child, (dict, list)):
                    queue.append((child, depth + 1))
    return ""
 
 
def extract_address_fields(data):
    root = {k: v for k, v in (data or {}).items() if k not in _ADDRESS_SKIP_KEYS}
    fields = {name: _addr_find(root, aliases)
              for name, aliases in _ADDRESS_ALIASES.items()}
 
    # Legacy packed format: address_line1 = block, address_line2 = "house, street"
    line1 = _addr_find(root, ["address_line1", "addressLine1"])
    line2 = _addr_find(root, ["address_line2", "addressLine2"])
    parts = [x.strip() for x in line2.split(",") if x.strip()]
 
    if not fields["block"] and line1:
        fields["block"] = line1
    # Only unpack the legacy "house, street" string when the form did NOT send
    # explicit house_no / street (otherwise a lone street would be mistaken
    # for a house number).
    if not fields["house_no"] and not fields["street"] and parts:
        if len(parts) > 1:
            fields["house_no"] = parts[0]
            fields["street"] = ", ".join(parts[1:])
        else:
            fields["street"] = parts[0]
    if not fields["country"]:
        fields["country"] = "Kuwait"
    return fields
 
 
def build_address_snapshot(fields, address, area, customer_origin, data):
    """Copy of the address kept on the order itself (delivery_address_json)."""
    snapshot = {
        "street":         (address.street if address else "") or fields["street"],
        "block":          (address.block if address else "") or fields["block"],
        "avenue":         (address.avenue if address else "") or fields["avenue"],
        "building":       (address.building if address else "") or fields["building"],
        "floor":          (address.floor if address else "") or fields["floor"],
        "apartment":      (address.apartment if address else "") or fields["apartment"],
        "house_no":       fields["house_no"],
        "landmark":       fields["landmark"],
        "delivery_notes": (address.delivery_notes if address else "") or fields["delivery_notes"],
        "country":        (address.country if address else "") or fields["country"],
        "city":           _addr_find(data, ["city"]),
        "state":          _addr_find(data, ["state"]),
        "area":           area.name if area else None,
        "customer_origin": customer_origin,
    }
    sent = data.get("delivery_address_json")
    if isinstance(sent, dict):
        for key, value in sent.items():
            if _addr_clean(value) or key not in snapshot:
                snapshot[key] = value
    return snapshot
 
 
def build_n8n_payload(order):
    return {
        "body": {
            "order": {
                "orderId": order.id,
                "total": float(order.total),
                "items": [
                    {
                        "name": item.product.name,
                        "quantity": item.quantity,
                        "price": float(item.price)
                    } for item in order.items
                ]
            },
            "customer": {
                "name": f"{order.customer.first_name} {order.customer.last_name}",
                "email": order.customer.email,
                "phone": order.customer.phone_no
            },
            "admin": {
                "email": "orders@caketake.com",
                "phone": "9198778945"
            }
        }
    }
 
 
def notify_admins(message, order=None):
    """Best-effort notification to admin / shop manager. Never raises."""
    try:
        send_order_notification({
            "message": message,
            "order_id": order.id if order else None,
            "order_number": order.order_number if order else None,
        })
    except Exception as e:
        print("Notification error:", str(e))
 
 
def _order_push_data(order, notification_type):
    return {
        "action": "OPEN_ORDER",
        "type": notification_type,
        "target_id": order.id,
        "order_id": order.id,
        "order_number": order.order_number,
        "status": order.status,
    }
 
 
def notify_order_recipients(order, user_ids, title, body, notification_type):
    """Best-effort transactional push for one clearly defined audience."""
    try:
        send_transactional_push(
            user_ids,
            title,
            body,
            _order_push_data(order, notification_type),
        )
    except Exception as exc:
        print("Transactional push error:", str(exc))
 
 
def notify_customer(order, title, body, notification_type):
    notify_order_recipients(
        order,
        [order.user_id],
        title,
        body,
        notification_type,
    )
 
 
def notify_staff(order, user_ids, title, body, notification_type):
    notify_order_recipients(
        order,
        user_ids,
        title,
        body,
        notification_type,
    )
 
 
 
# ─── ASSIGN ORDER TO KITCHEN ───────────────────────────────────────────────
 
def assign_order_to_kitchen(order, current_user):
    """
    Assign an order to the kitchen.
    """
 
    # Prevent assigning twice
    if order.status == "ASSIGNED_TO_KITCHEN":
        return
 
    old_status = order.status
 
    order.status = "ASSIGNED_TO_KITCHEN"
 
    log_order_status(
        order,
        old_status,
        "ASSIGNED_TO_KITCHEN",
        current_user.id if current_user else None,
        f"Order assigned to kitchen after {order.payment_method} payment"
    )
 
 
@order_bp.route("/orders", methods=["POST"])
@jwt_required()
def create_order():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
 
    use_loyalty = data.get("use_loyalty", False)
 
    if not user:
        return jsonify({"error": "Authenticated user not found"}), 401
 
    delivery_method = str(data.get("delivery_method") or "DELIVERY").strip().upper()
    if delivery_method not in {"DELIVERY", "PICKUP"}:
        return jsonify({"error": "Invalid delivery_method. Must be DELIVERY or PICKUP"}), 400
 
    items_data = data.get("items")
    order_addons_data = data.get("order_addons") or []
 
    try:
        order_addons_total = Decimal(str(data.get("order_addons_total", 0) or 0))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({"error": "Invalid order_addons_total value"}), 400
 
    if not isinstance(items_data, list) or not items_data:
        return jsonify({"error": "Order must contain at least one item"}), 400
 
    address = None
    area = None
 
    # ── DELIVERY: address + serviceable area are required ──
    if delivery_method == "DELIVERY":
        address_id = data.get("address_id")
        if not address_id:
            return jsonify({"error": "address_id is required for delivery orders"}), 400
 
        address = Address.query.get(address_id)
        if not address:
            return jsonify({"error": "Address not found"}), 404
 
        if user.role == "USER" and address.user_id != user.id:
            return jsonify({"error": "This address does not belong to you"}), 403
 
        if not address.area_id:
            return jsonify({
                "error": (
                    "This address does not have a delivery area. "
                    "Please update the address and select an area."
                )
            }), 400
 
        area = Area.query.filter_by(id=address.area_id, is_active=True).first()
        if not area:
            return jsonify({
                "error": (
                    "Delivery is not available for the selected area. "
                    "Please contact CakeNTake customer support."
                ),
                "delivery_available": False
            }), 400
 
    # ── PICKUP: no address/area needed, but pickup date + time are required ──
    else:
        pickup_date_raw = data.get("pickup_date")
        pickup_time_slot = data.get("pickup_time_slot")
        if not pickup_date_raw:
            return jsonify({"error": "pickup_date is required for pickup orders"}), 400
        if not pickup_time_slot:
            return jsonify({"error": "pickup_time_slot is required for pickup orders"}), 400
 
    payment_method = str(data.get("payment_method") or "COD").strip().upper()
    # Customers cannot choose CREDIT (that is reserved for agent orders).
    allowed_payment_methods = ALLOWED_PAYMENT_METHODS - {"CREDIT"}
    if payment_method not in allowed_payment_methods:
        return jsonify({
            "error": "Invalid payment method",
            "allowed_payment_methods": sorted(allowed_payment_methods)
        }), 400
 
    try:
        discount = Decimal(str(data.get("discount", 0) or 0))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({"error": "Invalid discount value"}), 400
 
    if discount < 0:
        return jsonify({"error": "Discount cannot be negative"}), 400
 
    allowed_currencies = {"INR", "KWD", "AED", "USD", "SAR", "SGD"}
    currency = str(data.get("currency") or "KWD").strip().upper()
    if currency not in allowed_currencies:
        currency = "KWD"
 
    order = Order(
        user_id=address.user_id if address else user.id,
        created_by=user.id,
        order_number=generate_order_number(),
        order_type=data.get("order_type", "direct_order"),
        notes=extract_order_notes(data) or None,
        delivery_method=delivery_method,
 
        # DELIVERY fields — None for pickup orders
        address_id=address.id if address else None,
        delivery_area_id=area.id if area else None,
        delivery_date=(
            datetime.strptime(data["delivery_date"], "%Y-%m-%d").date()
            if delivery_method == "DELIVERY" and data.get("delivery_date")
            else None
        ),
        delivery_time_slot=data.get("delivery_time_slot") if delivery_method == "DELIVERY" else None,
 
        # PICKUP fields — None for delivery orders
        pickup_date=(
            datetime.strptime(data["pickup_date"], "%Y-%m-%d").date()
            if delivery_method == "PICKUP" and data.get("pickup_date")
            else None
        ),
        pickup_time_slot=data.get("pickup_time_slot") if delivery_method == "PICKUP" else None,
 
        greeting_message=extract_cake_message(data) or None,
        greeting_from=data.get("greeting_from") or None,
        greeting_to=data.get("greeting_to") or None,
        delivery_address_json=with_order_notes(None, extract_order_notes(data)) or None,
        payment_method=payment_method,
        payment_status="PENDING",
        status="PENDING",
        subtotal=0,
        delivery_charge=0,
        discount=discount,
        grand_total=0,
        total=0,
        currency=currency
    )
 
    try:
        db.session.add(order)
        db.session.flush()
        order.order_number = str(order.id)
 
        subtotal = Decimal("0.000")
 
        for index, item in enumerate(items_data):
            if not isinstance(item, dict):
                raise ValueError(f"Invalid item at position {index + 1}")
 
            product_id = item.get("product_id")
            if not product_id:
                raise ValueError(f"product_id is required for item {index + 1}")
 
            product = Product.query.get(product_id)
            if not product:
                raise ValueError(f"Product {product_id} not found")
 
            try:
                quantity = int(item.get("quantity", 1))
            except (TypeError, ValueError):
                raise ValueError(f"Invalid quantity for product {product_id}")
 
            if quantity <= 0:
                raise ValueError(f"Quantity must be greater than zero for product {product_id}")
 
            rate = CurrencyRate.query.filter_by(currency_code=currency).first()
            conversion_rate = Decimal(str(rate.rate if rate else 1))
 
            try:
                incoming_price = item.get("price")
                if incoming_price is not None:
                    price = Decimal(str(incoming_price))
                else:
                    price = Decimal(str(product.price or 0)) * conversion_rate
            except (InvalidOperation, TypeError, ValueError):
                raise ValueError(f"Invalid price for product {product_id}")
 
            if price < 0:
                raise ValueError(f"Price cannot be negative for product {product_id}")
 
            price_decimals = Decimal("0.001") if currency == "KWD" else Decimal("0.01")
            price = price.quantize(price_decimals)
            item_total = (price * Decimal(quantity)).quantize(price_decimals)
 
            try:
                provided_total = Decimal(str(item.get("total", item_total)))
            except (InvalidOperation, TypeError, ValueError):
                provided_total = item_total
 
            total = item_total if provided_total != item_total else provided_total
            subtotal += total
 
            custom = item.get("custom_json") or {}
            try:
                original_p = item.get("original_price")
                discounted_p = item.get("discounted_price")
                orig_val = float(original_p) if original_p is not None else None
                disc_val = float(discounted_p) if discounted_p is not None else None
            except Exception:
                orig_val = None
                disc_val = None
 
            custom = custom.copy() if isinstance(custom, dict) else {"raw": custom}
            custom["pricing"] = {"original_price": orig_val, "discounted_price": disc_val}
 
            db.session.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price=price,
                line_total=total,
                custom_json=custom
            ))
 
        if order_addons_data and not isinstance(order_addons_data, list):
            raise ValueError("order_addons must be an array")
 
        order_addons = []
        computed_addons_total = Decimal("0.00")
 
        for idx, addon in enumerate(order_addons_data or []):
            if not isinstance(addon, dict):
                raise ValueError(f"Invalid addon at position {idx + 1}")
 
            addon_id = addon.get("addon_id")
            if addon_id is None:
                raise ValueError(f"addon_id is required for addon {idx + 1}")
 
            try:
                quantity = int(addon.get("quantity", 1))
            except (TypeError, ValueError):
                raise ValueError(f"Invalid quantity for addon {addon_id}")
 
            if quantity <= 0:
                raise ValueError(f"Addon quantity must be greater than zero for addon {addon_id}")
 
            try:
                price = Decimal(str(addon.get("price", 0) or 0))
                total = Decimal(str(addon.get("total", 0) or 0))
            except (InvalidOperation, TypeError, ValueError):
                raise ValueError(f"Invalid price or total for addon {addon_id}")
 
            if price < 0 or total < 0:
                raise ValueError(f"Addon price and total cannot be negative for addon {addon_id}")
 
            expected_total = (price * Decimal(quantity)).quantize(Decimal("0.01"))
            if total != expected_total:
                total = expected_total
 
            addon_obj = Addon.query.get(addon_id)
            order_addons.append({
                "addon_id": addon_id,
                "addon_name": addon_obj.name if addon_obj else None,
                "quantity": quantity,
                "price": float(price),
                "total": float(total)
            })
            computed_addons_total += total
 
        if order_addons and order_addons_total == 0:
            order_addons_total = computed_addons_total
        elif order_addons and order_addons_total != computed_addons_total:
            order_addons_total = computed_addons_total
        elif not order_addons:
            order_addons_total = Decimal("0.00")
 
        # ── Minimum order + delivery charge only apply to DELIVERY orders.
        #    Pickup orders have no area, so there's nothing to check against
        #    and delivery_charge is always 0. ──
        if delivery_method == "DELIVERY":
            minimum_order = Decimal(str(area.min_order_value or 0))
            if subtotal < minimum_order:
                raise ValueError(
                    f"Subtotal={subtotal}, Minimum={minimum_order}, Currency={currency}"
                )
            delivery_charge = Decimal(str(area.delivery_charge or 0))
        else:
            delivery_charge = Decimal("0.00")
 
        grand_total = subtotal + delivery_charge + order_addons_total - discount
 
        if grand_total < 0:
            raise ValueError("Discount cannot exceed the order total")
 
        order.subtotal = subtotal
        order.delivery_charge = delivery_charge
        order.discount = discount
        order.order_addons_json = order_addons
        order.order_addons_total = order_addons_total
        order.grand_total = grand_total
        order.total = grand_total
        order.currency = currency
        order.loyalty_coupon = data.get("coupon_code") or data.get("promo_code") or data.get("loyalty_coupon")
 
        if use_loyalty:
            config = get_loyalty_config()
            result = redeem_loyalty_points(
                customer_id=user.id,
                order_total=grand_total,
                order_id=order.id
            )
            if "error" in result:
                db.session.rollback()
                return jsonify(result), 400
 
            discount_amount = Decimal(str(result["discount_amount"]))
            order.discount += discount_amount
            order.grand_total -= discount_amount
            order.total = order.grand_total
 
        db.session.commit()
 
    except ValueError as error:
        db.session.rollback()
        return jsonify({"error": str(error)}), 400
 
    except Exception as error:
        db.session.rollback()
        print("Create order error:", str(error))
        return jsonify({"error": "Unable to create order"}), 500
 
    try:
        send_order_notification(build_n8n_payload(order))
    except Exception as error:
        print("Notification error:", str(error))
 
    return jsonify({
        "message": "Order created successfully",
        "delivery": {
            "area": area.to_dict() if area else None,
            "delivery_charge": float(order.delivery_charge or 0),
            "minimum_order_value": float(area.min_order_value or 0) if area else 0,
            "currency": order.currency
        },
        "order": order.to_dict()
    }), 201
 
# ─── GET ALL ORDERS (ROLE BASED) ────────────────────────────────────────────
 
@order_bp.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
 
    user = get_current_user()
    status = request.args.get("status")
    source = (request.args.get("source") or "").strip().lower()
 
    query = Order.query
 
    if user.role == "USER":
        query = query.filter_by(user_id=user.id)
 
    elif user.role == "KITCHEN_STAFF":
        query = query.filter(
            Order.kitchen_staff_id == user.id,
            Order.status.in_(["ASSIGNED_TO_KITCHEN", "PREPARING"])
        )
 
    elif user.role == "DELIVERY_AGENT":
        query = query.filter(
            db.or_(
                Order.delivery_agent_id == user.id,
                Order.status == "ASSIGNED_TO_AGENT"
            )
        )
 
    elif user.role == "DRIVER":
        query = query.filter(Order.driver_id == user.id)
 
    elif user.role in ("ADMIN", "SHOP_MANAGER", "SALES_AGENT"):
        pass  # full access
 
    if status:
        query = query.filter_by(status=status.upper())
 
    # Canonical order-source filtering for Owner workflow.
    if source:
        source_types = {
            "user": ["direct_order", "user_order", "customer_order"],
            "shopmanager": ["shopmanager_order", "shop_manager_order"],
            "salesagent": ["salesagent_order", "sales_agent_order"],
            "agent": ["agent_order"],
        }
        if source not in source_types:
            return jsonify({"error": "Invalid source filter"}), 400
        query = query.filter(db.func.lower(Order.order_type).in_(source_types[source]))
 
    orders = query.order_by(Order.created_at.desc()).all()
 
    return jsonify({
        "count": len(orders),
        "orders": [o.to_dict() for o in orders]
    }), 200
 
 
# ─── GET SINGLE ORDER ────────────────────────────────────────────────────────
 
@order_bp.route("/orders/<int:id>", methods=["GET"])
@jwt_required()
def get_order(id):
 
    order = Order.query.get(id)
 
    if not order:
        return jsonify({"error": "Order not found"}), 404
 
    current_user = get_current_user()
    if current_user and current_user.role == "USER" and order.user_id != current_user.id:
        return jsonify({"error": "This order does not belong to you"}), 403
 
    payload = order.to_dict()
 
    # Canonical proof and settlement fields for driver/order details screens.
    if order.driver_settlement_id:
        from models.misc import DriverSettlement
        settlement = DriverSettlement.query.get(order.driver_settlement_id)
        payload["driver_settlement"] = settlement.to_dict() if settlement else None
    else:
        payload["driver_settlement"] = None
 
    payload["proof_status"] = (
        "APPROVED" if order.delivery_confirmed_at
        else "SUBMITTED" if order.driver_submitted_at
        else "NOT_SUBMITTED"
    )
 
    return jsonify(payload), 200
 
 
# ─── UPDATE ORDER (ADMIN / SHOP MANAGER) ────────────────────────────────────
 
@order_bp.route("/orders/<int:id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_order(id):
 
    order = Order.query.get(id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
 
    data = request.get_json()
 
    order.status = data.get("status", order.status)
    order.payment_status = data.get("payment_status", order.payment_status)
 
    db.session.commit()
 
    return jsonify({
        "message": "Order updated successfully",
        "order": order.to_dict()
    }), 200
 
 
# ─── DELETE ORDER (ADMIN) ────────────────────────────────────────────────────
 
@order_bp.route("/orders/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_order(id):
 
    order = Order.query.get(id)
 
    if not order:
        return jsonify({"error": "Order not found"}), 404
 
    db.session.delete(order)
    db.session.commit()
 
    return jsonify({"message": "Order deleted successfully"}), 200
 
 
# ─── TAP PAYMENT (replaces Stripe checkout) ─────────────────────────────────
 
@order_bp.route("/orders/<int:order_id>/create-payment", methods=["POST"])
@jwt_required()
def create_order_payment(order_id):
 
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()
 
    if current_user.role == "USER" and order.user_id != current_user.id:
        return jsonify({"error": "This order does not belong to you"}), 403
 
    if order.payment_status == "PAID":
        return jsonify({"error": "Order is already paid"}), 400
 
    currency = str(order.currency or "KWD").strip().upper()
 
    # KWD -> KNET (Tap's local Kuwait rail).
    # Everything else -> Tap's hosted payment-selection portal.
    if currency == "KWD":
        result = create_knet_charge(order)
    else:
        result = create_tap_charge(order)
 
    if "errors" in result:
        return jsonify({
            "error": "Unable to create payment",
            "details": result["errors"]
        }), 502
 
    payment_url = (result.get("transaction") or {}).get("url")
 
    if not payment_url:
        return jsonify({
            "error": "Payment gateway did not return a redirect URL",
            "details": result
        }), 502
 
    order.payment_method = "KNET" if currency == "KWD" else "CARD"
    db.session.commit()
 
    return jsonify({
        "payment_url": payment_url,
        "charge_id": result.get("id")
    }), 200
 
# ─── USER ORDERS ─────────────────────────────────────────────────────────────
 
@order_bp.route("/orders/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_orders(user_id):
 
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
 
    return jsonify({
        "count": len(orders),
        "orders": [o.to_dict() for o in orders]
    }), 200
 
 
# ══════════════════════════════════════════════════════════════════════════
#  WORKFLOW: accept -> kitchen -> ready -> agent -> driver -> delivered
# ══════════════════════════════════════════════════════════════════════════
 
# ─── 1. ACCEPT ORDER (sets payment_status from COD / UPI) ──────────────────
 
@order_bp.route("/orders/<int:id>/accept", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def accept_order(id):
    order = Order.query.get_or_404(id)
 
    if str(order.status or "").upper() != "PENDING":
        return jsonify({"error": "Only pending orders can be accepted"}), 400
 
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
 
    payment_method = str(
        data.get("payment_method")
        or order.payment_method
        or "COD"
    ).strip().upper()
 
    if payment_method == "CASH":
        payment_method = "COD"
 
    allowed_methods = ALLOWED_PAYMENT_METHODS
    if payment_method not in allowed_methods:
        return jsonify({
            "error": "Invalid payment method",
            "allowed_payment_methods": sorted(allowed_methods),
        }), 400
 
    order.payment_method = payment_method
 
    # Business rule:
    # Every order accepted by Owner / Shop Manager goes to Kitchen immediately.
    # Payment status is tracked separately and never blocks kitchen preparation.
    assign_order_to_kitchen(order, current_user)
    db.session.commit()
 
    notify_customer(
        order,
        "Order accepted",
        f"Your order {order.order_number} was accepted and sent to our kitchen.",
        "ORDER_ACCEPTED",
    )
 
    kitchen_ids = [
        user.id
        for user in User.query.filter_by(
            role="KITCHEN_STAFF",
            is_active=True
        ).all()
    ]
 
    notify_staff(
        order,
        kitchen_ids,
        "New kitchen order",
        f"Order {order.order_number} is ready to be prepared.",
        "KITCHEN_ORDER_AVAILABLE",
    )
 
    notify_admins(
        f"Order {order.order_number} accepted and sent to kitchen ({payment_method})",
        order,
    )
 
    return jsonify({
        "message": "Order accepted and sent to kitchen",
        "order": order.to_dict(),
    }), 200
 
@order_bp.route("/orders/<int:order_id>/reject", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def reject_order(order_id):
 
    order = Order.query.get_or_404(order_id)
    data = request.get_json() or {}
 
    if order.status != "PENDING":
        return jsonify({"error": "Only pending orders can be rejected"}), 400
 
    old_status = order.status
    order.status = "REJECTED"
    order.rejection_reason = data.get("reason")
 
    log_order_status(order, old_status, "REJECTED", get_current_user().id, data.get("reason"))
 
    db.session.commit()
 
    return jsonify({
        "message": "Order rejected",
        "order": order.to_dict()
    }), 200
 
 
@order_bp.route("/orders/<int:order_id>/cancel", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT","USER"])
def cancel_order(order_id):
    order = Order.query.get_or_404(order_id)
    if order.status in ("DELIVERED", "CANCELLED"):
        return jsonify({"error": f"Cannot cancel an order that is {order.status}"}), 400
 
    data = request.get_json() or {}
    old_status = order.status
    order.status = "CANCELLED"
    order.rejection_reason = data.get("reason")
 
    log_order_status(order, old_status, "CANCELLED", get_current_user().id, data.get("reason"))
 
    db.session.commit()
    return jsonify({"message": "Order cancelled", "order": order.to_dict()}), 200
 
 
# ─── 2. ASSIGN TO KITCHEN ────────────────────────────────────────────────────
 
@order_bp.route("/kitchen-staff", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_kitchen_staff():
    staff = User.query.filter_by(role="KITCHEN_STAFF").all()
    return jsonify([
        {"id": s.id, "name": f"{s.first_name} {s.last_name}"}
        for s in staff
    ]), 200
 
 
# ─── 3. KITCHEN: PREPARING -> READY ─────────────────────────────────────────
 
 
@order_bp.route("/orders/<int:order_id>/start-preparation", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
def start_preparation(order_id):
 
    order = Order.query.get_or_404(order_id)
 
    current_user = get_current_user()
 
    if order.status != "ASSIGNED_TO_KITCHEN":
     return jsonify({
        "error": "Order must be ASSIGNED_TO_KITCHEN"
     }), 400
 
    order.status = "PREPARING"
    order.preparation_started_at = utc_now()
    order.preparation_started_by = current_user.id
    order.kitchen_staff_id = current_user.id
    
    log_order_status(
    order,
      "ASSIGNED_TO_KITCHEN",
      "PREPARING",
      current_user.id,
       f"Preparation started by {current_user.first_name} {current_user.last_name}"
       )
 
    db.session.commit()
    other_kitchen_ids = [
        user.id
        for user in User.query.filter_by(role="KITCHEN_STAFF", is_active=True).all()
        if user.id != current_user.id
    ]
    notify_staff(
        order,
        other_kitchen_ids,
        "Kitchen order claimed",
        f"Order {order.order_number} was claimed by {current_user.first_name} {current_user.last_name}.",
        "KITCHEN_ORDER_CLAIMED",
    )
 
    return jsonify({
        "message": "Preparation started",
        "order": order.to_dict()
    }), 200
 
 
@order_bp.route("/orders/<int:order_id>/ready", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
def mark_ready(order_id):
 
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()
 
    if current_user.role == "KITCHEN_STAFF" and order.kitchen_staff_id != current_user.id:
        return jsonify({"error": "Order not assigned to you"}), 403
 
    # Admin / shop manager may also skip preparation (ASSIGNED_TO_KITCHEN -> ready).
    allowed_from = {"PREPARING"}
    if current_user.role in ("ADMIN", "SHOP_MANAGER"):
        allowed_from.add("ASSIGNED_TO_KITCHEN")
    if order.status not in allowed_from:
        return jsonify({"error": "Order must be PREPARING before it can be marked READY"}), 400
 
    old_status = order.status
 
    order.completed_by_kitchen_at = utc_now()
    if not order.preparation_started_by:
        order.preparation_started_by = current_user.id
        order.preparation_started_at = order.preparation_started_at or utc_now()

    # PICKUP orders never go to a delivery agent: they wait at the shop until
    # the customer collects them (kitchen, owner or shop manager completes).
    if str(order.delivery_method or "DELIVERY").upper() == "PICKUP":
        order.status = "PICKUP_READY"
        log_order_status(
            order, old_status, "PICKUP_READY", current_user.id,
            "Pickup order ready — waiting for customer collection",
        )
        db.session.commit()
        notify_customer(
            order,
            "Ready for pickup",
            f"Your order {order.order_number} is ready for pickup.",
            "PICKUP_READY",
        )
        return jsonify({
            "message": "Pickup order is ready for customer collection",
            "order": order.to_dict(),
        }), 200
 
# Find available delivery agent
    # Prefer an ONLINE delivery agent, then any active one.
    delivery_agent = (
        User.query.filter_by(role="DELIVERY_AGENT", availability_status="ONLINE", is_active=True)
        .order_by(User.id.asc()).first()
        or User.query.filter_by(role="DELIVERY_AGENT", is_active=True)
        .order_by(User.id.asc()).first()
    )
    if not delivery_agent:
        # No delivery agent: keep the order READY so the owner / shop manager
        # can assign a driver directly from Order Management.
        order.status = "READY"
        log_order_status(
            order, old_status, "READY", current_user.id,
            "Order ready — no delivery agent available for auto-assignment",
        )
        db.session.commit()
        notify_admins(f"Order {order.order_number} is READY for dispatch", order)
        return jsonify({"message": "Order marked READY", "order": order.to_dict()}), 200
 
    order.delivery_agent_id = delivery_agent.id
    order.delivery_agent_assigned_by = current_user.id
    order.delivery_agent_assigned_at = utc_now()
 
    order.status = "ASSIGNED_TO_AGENT"
 
    log_order_status(
    order,
    old_status,
    "ASSIGNED_TO_AGENT",
    current_user.id,
    f"Automatically assigned to delivery agent "
    f"{delivery_agent.first_name} {delivery_agent.last_name}"
    )
 
    db.session.commit()
    notify_staff(
        order,
        [delivery_agent.id],
        "New delivery order",
        f"Order {order.order_number} is ready. Please assign an available driver.",
        "DELIVERY_AGENT_ORDER_ASSIGNED",
    )
 
    notify_admins(f"Order {order.order_number} is READY for dispatch", order)
 
    return jsonify({
        "message": "Order marked READY",
        "order": order.to_dict()
    }), 200
 
 
# ─── 4. ASSIGN TO DELIVERY AGENT (owner/shop manager -> DELIVERY_AGENT) ─────
 
@order_bp.route("/orders/<int:order_id>/assign-agent", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def assign_delivery_agent(order_id):
 
    order = Order.query.get_or_404(order_id)
 
    if order.status != "READY":
        return jsonify({"error": "Order must be READY before assigning a delivery agent"}), 400
 
    data = request.get_json()
    agent_id = data.get("delivery_agent_id") or data.get("agent_id")
 
    if not agent_id:
        return jsonify({"error": "delivery_agent_id is required"}), 400
 
    agent = User.query.get(agent_id)
    if not agent:
        return jsonify({"error": "Delivery agent not found"}), 404
    if agent.role != "DELIVERY_AGENT":
        return jsonify({"error": "Selected user is not a delivery agent"}), 400
 
    old_status = order.status
    current_user = get_current_user()
 
    order.delivery_agent_id = agent.id
    order.delivery_agent_assigned_by = current_user.id
    order.delivery_agent_assigned_at = utc_now()
    order.status = "ASSIGNED_TO_AGENT"
 
    log_order_status(
        order, old_status, "ASSIGNED_TO_AGENT", current_user.id,
        f"Assigned to delivery agent {agent.first_name} {agent.last_name}"
    )
 
    db.session.commit()
 
    notify_staff(
        order,
        [agent.id],
        "New delivery order",
        f"Order {order.order_number} is ready. Please assign an available driver.",
        "DELIVERY_AGENT_ORDER_ASSIGNED",
    )
 
    notify_admins(
        f"Order {order.order_number} assigned to delivery agent "
        f"{agent.first_name} {agent.last_name}",
        order
    )
 
    return jsonify({
        "message": "Delivery agent assigned",
        "order": order.to_dict()
    }), 200
 
 
@order_bp.route("/orders/<int:order_id>/reassign-agent", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def reassign_delivery_agent(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
 
    agent = User.query.filter_by(
        id=data.get("delivery_agent_id"), role="DELIVERY_AGENT"
    ).first()
    if not agent:
        return jsonify({"error": "Delivery agent not found"}), 404
 
    order.delivery_agent_id = agent.id
    order.delivery_agent_assigned_by = get_current_user().id
    order.delivery_agent_assigned_at = utc_now()
 
    # Reassigning the agent also clears any driver previously picked by the
    # old agent, since the new agent should choose their own driver.
    order.driver_id = None
    order.driver_assigned_by = None
    order.driver_assigned_at = None
    order.driver_accepted_at = None
    if order.status in ("ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY"):
        order.status = "ASSIGNED_TO_AGENT"
 
    db.session.commit()
    return jsonify({"message": "Delivery agent reassigned", "order": order.to_dict()}), 200
 
 
@order_bp.route("/delivery-agents", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_delivery_agents():
    agents = User.query.filter_by(role="DELIVERY_AGENT").all()
    return jsonify([
        {"id": a.id, "name": f"{a.first_name} {a.last_name}", "phone_no": a.phone_no}
        for a in agents
    ]), 200
 
 
@order_bp.route("/orders/<int:order_id>/assign-driver", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def assign_driver(order_id):
 
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()
 
    # Owner / shop manager can dispatch a driver directly once the cake is
    # ready (client report: shop manager only had "Cancel order"), and can
    # re-assign while the driver has not accepted yet.
    role = str(current_user.role or "").upper()
    if str(order.delivery_method or "DELIVERY").upper() == "PICKUP":
        return jsonify({"error": "Pickup orders are collected at the shop — no driver needed"}), 400
    if role in ("ADMIN", "SHOP_MANAGER"):
        allowed_from = {"READY", "ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER"}
    else:
        allowed_from = {"ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER"}
    if order.status not in allowed_from:
        return jsonify({
            "error": "A driver can be assigned once the order is ready for dispatch"
        }), 400
 
    data = request.get_json(silent=True) or {}
    driver_id = data.get("driver_id")
 
    if not driver_id:
        return jsonify({"error": "driver_id is required"}), 400
 
    driver = User.query.get(driver_id)
 
    if not driver:
        return jsonify({"error": "Driver not found"}), 404
 
    if driver.role != "DRIVER":
        return jsonify({"error": "Selected user is not a driver"}), 400
 
    old_status = order.status
 
    # Record which delivery agent handled the order (only when one did it).
    if role == "DELIVERY_AGENT":
        order.delivery_agent_id = current_user.id
 
    order.driver_id = driver.id
    order.driver_assigned_by = current_user.id
    order.driver_assigned_at = utc_now()
    order.driver_accepted_at = None
    order.status = "ASSIGNED_TO_DRIVER"
 
    log_order_status(
        order,
        old_status,
        "ASSIGNED_TO_DRIVER",
        current_user.id,
        f"Driver {driver.first_name} {driver.last_name} assigned by "
        f"{current_user.first_name} {current_user.last_name}"
    )
 
    db.session.commit()
    notify_staff(
        order,
        [driver.id],
        "New delivery assigned",
        f"Order {order.order_number} has been assigned to you. Please review and accept it.",
        "DRIVER_ORDER_ASSIGNED",
    )
 
    notify_admins(
        f"Order {order.order_number}: Driver {driver.first_name} {driver.last_name} assigned.",
        order
    )
 
    return jsonify({
        "message": "Driver assigned successfully",
        "order": order.to_dict()
    }), 200
 
# ─── ROLE-SCOPED "MY ORDERS" LISTS ──────────────────────────────────────────
 
@order_bp.route("/orders/kitchen/my-orders", methods=["GET"])
@jwt_required()
@role_required(["KITCHEN_STAFF"])
def get_my_kitchen_orders():
    current_user = get_current_user()
    orders = Order.query.filter(
        Order.kitchen_staff_id == current_user.id,
        Order.status.in_(["ASSIGNED_TO_KITCHEN", "PREPARING"])
    ).order_by(Order.created_at.desc()).all()
 
    return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/agent/my-orders", methods=["GET"])
@jwt_required()
@role_required(["DELIVERY_AGENT"])
def get_my_agent_orders():
    current_user = get_current_user()
    orders = Order.query.filter(
        Order.delivery_agent_id == current_user.id,
        Order.status.in_([
            "ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
            "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"
        ])
    ).order_by(Order.created_at.desc()).all()
 
    return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/driver/my-orders", methods=["GET"])
@jwt_required()
@role_required(["DRIVER"])
def get_my_driver_orders():
    current_user = get_current_user()
    orders = Order.query.filter(
        Order.driver_id == current_user.id,
        Order.status.in_(["ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"])
    ).order_by(Order.created_at.desc()).all()
 
    return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/kitchen/<int:kitchen_staff_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_kitchen_assigned_orders(kitchen_staff_id):
    orders = Order.query.filter_by(kitchen_staff_id=kitchen_staff_id).order_by(Order.created_at.desc()).all()
    return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/agent/<int:agent_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_agent_assigned_orders(agent_id):
    orders = Order.query.filter_by(delivery_agent_id=agent_id).order_by(Order.created_at.desc()).all()
    return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/driver/<int:driver_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def get_driver_assigned_orders(driver_id):
    orders = Order.query.filter_by(driver_id=driver_id).order_by(Order.created_at.desc()).all()
    return jsonify({"count": len(orders), "orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/status/<string:status>", methods=["GET"])
@jwt_required()
def orders_by_status(status):
    orders = Order.query.filter_by(status=status.upper()).order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/customer/<int:customer_id>", methods=["GET"])
@jwt_required()
def orders_by_customer(customer_id):
 
    current_user = get_current_user()
 
    # Admins, shop managers and sales agents can view any customer's orders
    if current_user.role in ["ADMIN", "SHOP_MANAGER", "SALES_AGENT","USER"]:
        pass
 
    else:
        return jsonify({
            "error": "Forbidden"
        }), 403
 
    orders = Order.query.filter_by(user_id=customer_id)\
        .order_by(Order.created_at.desc()).all()
 
    return jsonify({
        "orders": [o.to_dict() for o in orders]
    }), 200
 
@order_bp.route("/orders/created-by/<int:agent_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def orders_by_creator(agent_id):
    orders = Order.query.filter_by(created_by=agent_id).order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200
 
 
@order_bp.route("/orders/<int:order_id>/history", methods=["GET"])
@jwt_required()
def order_history(order_id):
    from models.order_status_history import OrderStatusHistory
    history = OrderStatusHistory.query.filter_by(order_id=order_id).order_by(
        OrderStatusHistory.created_at.desc()
    ).all()
    return jsonify({"history": [h.to_dict() for h in history]}), 200
 
 
# ─── IMAGES ──────────────────────────────────────────────────────────────────
 
@order_bp.route("/orders/<int:order_id>/upload-image", methods=["POST"])
@jwt_required()
def upload_order_image(order_id):
    import cloudinary.uploader
    order = Order.query.get_or_404(order_id)
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400
    result = cloudinary.uploader.upload(file, folder=f"orders/{order_id}")
    images = order.delivery_images or []
    images.append({"url": result["secure_url"], "public_id": result["public_id"]})
    order.delivery_images = images
    db.session.commit()
    return jsonify({"message": "Image uploaded", "image_url": result["secure_url"]}), 200
 
 
@order_bp.route("/orders/<int:order_id>/images", methods=["GET"])
@jwt_required()
def get_order_images(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({"images": order.delivery_images or []}), 200
 
 
@order_bp.route("/orders/<int:order_id>/images/<string:image_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_order_image(order_id, image_id):
    order = Order.query.get_or_404(order_id)
    order.delivery_images = [
        img for img in (order.delivery_images or [])
        if img.get("public_id") != image_id
    ]
    db.session.commit()
    return jsonify({"message": "Image deleted"}), 200
 
 
# ─── GREETING CARD ───────────────────────────────────────────────────────────
 
@order_bp.route("/orders/<int:order_id>/greeting", methods=["POST"])
@jwt_required()
def add_greeting(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    order.greeting_message = data.get("message")
    order.greeting_from = data.get("from")
    order.greeting_to = data.get("to")
    db.session.commit()
    return jsonify({"message": "Greeting added", "order": order.to_dict()}), 201
 
 
@order_bp.route("/orders/<int:order_id>/greeting", methods=["PUT"])
@jwt_required()
def update_greeting(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    if "message" in data:
        order.greeting_message = data["message"]
    if "from" in data:
        order.greeting_from = data["from"]
    if "to" in data:
        order.greeting_to = data["to"]
    db.session.commit()
    return jsonify({"message": "Greeting updated", "order": order.to_dict()}), 200
 
 
@order_bp.route("/orders/<int:order_id>/greeting", methods=["GET"])
@jwt_required()
def get_greeting(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({
        "message": order.greeting_message,
        "from": order.greeting_from,
        "to": order.greeting_to
    }), 200
 
 
# ─── 6. DRIVER ACCEPTS THE ORDER ────────────────────────────────────────────
 
@order_bp.route("/orders/<int:order_id>/driver-accept", methods=["POST"])
@jwt_required()
@role_required(["DRIVER"])
def driver_accept(order_id):
 
    order        = Order.query.get_or_404(order_id)
    current_user = get_current_user()
 
    if order.driver_id != current_user.id:
        return jsonify({"error": "Order not assigned to you"}), 403
 
    if order.status != "ASSIGNED_TO_DRIVER":
        return jsonify({"error": "Order is not awaiting driver acceptance"}), 400
 
    old_status = order.status
    now        = utc_now()
 
    order.driver_accepted_at = now
    order.status             = "DRIVER_ACCEPTED"
    log_order_status(order, old_status, "DRIVER_ACCEPTED", current_user.id)
 
    # Immediately move to OUT_FOR_DELIVERY so the driver can start the trip
    order.out_for_delivery_at = now
    order.status              = "OUT_FOR_DELIVERY"
    log_order_status(order, "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", current_user.id)
 
    # ── FIX: mark driver BUSY so they don't appear in available-drivers list ──
    current_user.availability_status = "BUSY"
 
    db.session.commit()
    notify_customer(
        order,
        "Out for delivery",
        f"Your order {order.order_number} is now out for delivery.",
        "OUT_FOR_DELIVERY",
    )
 
    notify_admins(
        f"Order {order.order_number} accepted by driver "
        f"{current_user.first_name} {current_user.last_name} — now out for delivery",
        order,
    )
 
    return jsonify({
        "message": "Delivery accepted, order is out for delivery",
        "order": order.to_dict(),
    }), 200
 
 
# ─── 6b. DRIVER REJECTS THE ORDER ───────────────────────────────────────────
 
@order_bp.route("/orders/<int:order_id>/driver-reject", methods=["POST"])
@jwt_required()
@role_required(["DRIVER"])
def driver_reject(order_id):
 
    order        = Order.query.get_or_404(order_id)
    current_user = get_current_user()
 
    if order.driver_id != current_user.id:
        return jsonify({"error": "Order not assigned to you"}), 403
 
    old_status = order.status
 
    order.driver_id          = None
    order.driver_assigned_by = None
    order.driver_assigned_at = None
    order.driver_accepted_at = None
    order.status             = "ASSIGNED_TO_AGENT"   # bounce back to delivery agent
 
    # ── FIX: driver is free again ─────────────────────────────────────────────
    current_user.availability_status = "ONLINE"
 
    log_order_status(
        order, old_status, "ASSIGNED_TO_AGENT",
        current_user.id, "Rejected by driver"
    )
    db.session.commit()
 
    notify_admins(
        f"Driver rejected order {order.order_number}; returned to delivery agent",
        order,
    )
 
    return jsonify({
        "message": "Order rejected, returned to delivery agent",
        "order": order.to_dict(),
    }), 200
 
 
# ─── 7. DRIVER COMPLETES THE DELIVERY ────────────────────────────────────────
#
# Client report (13/10/2026): after "Accept Order" the app asked for a proof
# photo, and even after sending one the order stayed "On the way" with no
# "Mark Delivered". Causes:
#   * the proof endpoint only read JSON, so a multipart photo upload failed;
#   * "Mark Delivered" (confirm-delivery) only worked from DELIVERY_SUBMITTED,
#     a status the proof step never produced.
# Now both endpoints accept JSON or multipart, the photo is optional, and a
# driver can finish their own order from DRIVER_ACCEPTED / OUT_FOR_DELIVERY /
# DELIVERY_SUBMITTED in one step.

DRIVER_FINISHABLE = {"DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"}


def _delivery_payload():
    """Return (fields, uploaded_file) from a JSON or multipart request."""
    data = request.get_json(silent=True)
    if isinstance(data, dict):
        return data, None
    fields = request.form.to_dict() if request.form else {}
    uploaded = None
    for key in ("delivery_photo", "photo", "image", "file", "proof"):
        candidate = request.files.get(key)
        if candidate and candidate.filename:
            uploaded = candidate
            break
    return fields, uploaded


def _truthy(value):
    return value is True or str(value).strip().lower() in {"1", "true", "yes", "on"}


def _store_proof(order, fields, uploaded):
    """Save photo/notes/confirmation details sent with the delivery."""
    photo = _addr_clean(fields.get("delivery_photo") or fields.get("photo") or fields.get("image_url"))
    if uploaded is not None:
        try:
            import cloudinary.uploader
            result = cloudinary.uploader.upload(
                uploaded, folder="cakentake/delivery-proof", resource_type="image",
            )
            photo = result.get("secure_url") or photo
        except Exception as exc:
            print("Delivery proof upload error:", exc)
    if photo:
        order.delivery_photo = photo
    notes = _addr_clean(fields.get("delivery_notes") or fields.get("notes"))
    if notes:
        order.delivery_notes = notes
    name = _addr_clean(fields.get("customer_confirmation_name") or fields.get("customer_name"))
    phone = _addr_clean(fields.get("customer_confirmation_phone") or fields.get("customer_phone"))
    if name:
        order.customer_confirmation_name = name
    if phone:
        order.customer_confirmation_phone = phone


def _finalize_delivery(order, current_user, fields, note):
    """Mark an order DELIVERED with every side effect in one place."""
    old_status = order.status
    now = utc_now()

    if not order.driver_submitted_at:
        order.driver_submitted_at = now
    order.status = "DELIVERED"
    order.delivered_at = now
    order.delivery_confirmed_by = current_user.id
    order.delivery_confirmed_at = now

    # COD is marked paid only when the driver confirms the cash was collected.
    if str(order.payment_method or "").upper() in ("COD", "CASH"):
        if _truthy(fields.get("cash_collected")) and order.payment_status != "PAID":
            order.payment_status = "PAID"

    log_order_status(order, old_status, "DELIVERED", current_user.id, note)

    if order.driver_id:
        driver = User.query.get(order.driver_id)
        if driver:
            driver.availability_status = "ONLINE"

    from models.delivery_charge import DeliveryCharge
    if order.driver_id and not DeliveryCharge.query.filter_by(order_id=order.id).first():
        db.session.add(DeliveryCharge(
            order_id=order.id,
            driver_id=order.driver_id,
            charge_amount=order.delivery_charge or 0,
            driver_share=0,
            is_paid=False,
            notes="Delivered; waiting for settlement amount",
        ))

    try:
        config = get_loyalty_config()
        subtotal = float(order.subtotal or 0)
        if subtotal >= float(config.min_order_amount):
            earned_points = (
                int(subtotal // float(config.min_order_amount))
                * config.points_per_min_order
            )
            existing = LoyaltyLedger.query.filter_by(
                customer_id=order.user_id, order_id=order.id, transaction_type="EARN"
            ).first()
            if not existing and earned_points > 0:
                add_loyalty_points(
                    customer_id=order.user_id,
                    points=earned_points,
                    order_id=order.id,
                    description=f"Earned points for delivered Order {order.order_number}",
                )
    except Exception as exc:
        print("Loyalty Error:", exc)

    db.session.commit()

    notify_customer(
        order,
        "Order delivered",
        f"Your order {order.order_number} has been delivered successfully. Thank you for ordering with CakeNTake!",
        "ORDER_DELIVERED",
    )
    reviewer_ids = [
        u.id for u in User.query.filter(
            User.role.in_(["ADMIN", "SHOP_MANAGER"]), User.is_active.is_(True),
        ).all()
    ]
    notify_staff(
        order, reviewer_ids, "Order delivered",
        f"Order {order.order_number} was delivered and is ready for settlement review.",
        "ORDER_READY_FOR_SETTLEMENT",
    )
    notify_admins(
        f"Order {order.order_number} DELIVERED — {current_user.first_name} {current_user.last_name}",
        order,
    )


@order_bp.route("/orders/<int:order_id>/delivery-proof", methods=["POST"])
@jwt_required()
@role_required(["DRIVER"])
def upload_delivery_proof(order_id):
    """Driver submits (optional) proof and the order is marked delivered."""
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()

    if order.driver_id != current_user.id:
        return jsonify({"error": "Order not assigned to you"}), 403
    if order.status not in DRIVER_FINISHABLE:
        return jsonify({"error": "Accept the order before marking it delivered"}), 400

    fields, uploaded = _delivery_payload()
    _store_proof(order, fields, uploaded)
    _finalize_delivery(order, current_user, fields, "Driver marked the order delivered")

    return jsonify({
        "message": "Order marked as delivered",
        "order": order.to_dict(),
    }), 200


# ─── 8. MARK DELIVERED (driver) / CONFIRM DELIVERY (owner, shop manager) ────

@order_bp.route("/orders/<int:order_id>/confirm-delivery", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DRIVER", "DELIVERY_AGENT"])
def confirm_delivery(order_id):
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()
    role = str(current_user.role or "").upper()

    if role == "DRIVER" and order.driver_id != current_user.id:
        return jsonify({"error": "Order not assigned to you"}), 403
    if role == "DELIVERY_AGENT" and order.delivery_agent_id != current_user.id:
        return jsonify({"error": "Order not assigned to you"}), 403
    if order.status not in DRIVER_FINISHABLE:
        return jsonify({"error": "Only orders that are out for delivery can be marked delivered"}), 400

    fields, uploaded = _delivery_payload()
    _store_proof(order, fields, uploaded)
    note = (
        "Driver marked the order delivered" if role == "DRIVER"
        else f"Delivery confirmed by {role.replace('_', ' ').title()}"
    )
    _finalize_delivery(order, current_user, fields, note)

    return jsonify({
        "message": "Order marked as delivered",
        "order": order.to_dict(),
    }), 200


@order_bp.route("/orders/sales-agent", methods=["POST"])
@jwt_required()
@role_required(["SALES_AGENT", "SHOP_MANAGER","ADMIN"])
def create_sales_agent_order():
    """Create a staff-assisted order for an existing or new customer.
 
    SHOP_MANAGER and SALES_AGENT can use this route.  customer_id/address_id
    may point at existing database records.  If customer_id is omitted, a
    customer is found/created from the supplied contact details.  Delivery
    orders require an existing address or enough area/address data to create
    one.  Pickup orders do not require a delivery address.
    """
    data = request.get_json(silent=True) or {}
    staff_user = get_current_user()
 
    try:
        allowed_currencies = {"INR", "KWD", "AED", "USD", "SAR", "SGD"}
        currency = str(data.get("currency") or "KWD").strip().upper()
        if currency not in allowed_currencies:
            currency = "KWD"
 
        delivery_method = str(
            data.get("delivery_method") or "DELIVERY"
        ).strip().upper()
        if delivery_method not in {"DELIVERY", "PICKUP"}:
            return jsonify({"error": "Invalid delivery method"}), 400
 
        # "-" / blank means "not chosen yet" on the staff form -> collect later (COD).
        payment_method = _addr_clean(data.get("payment_method")).upper() or "COD"
        if payment_method == "CASH":
            payment_method = "COD"
        allowed_payment_methods = ALLOWED_PAYMENT_METHODS - {"CREDIT"}
        if payment_method not in allowed_payment_methods:
            return jsonify({
                "error": "Invalid payment method",
                "allowed_payment_methods": sorted(allowed_payment_methods),
            }), 400
 
        # ----------------------------------------------------------
        # CUSTOMER: existing DB user OR create/find by contact data
        # ----------------------------------------------------------
        customer_id = data.get("customer_id") or data.get("user_id")
        customer = None
 
        if customer_id:
            customer = User.query.get(int(customer_id))
            if not customer or str(customer.role or "").upper() != "USER":
                return jsonify({"error": "Customer not found"}), 404
 
        customer_origin = "EXISTING" if customer else "NEW"
 
        customer_name = str(
            data.get("customer_name")
            or (
                f"{customer.first_name or ''} {customer.last_name or ''}".strip()
                if customer else ""
            )
        ).strip()
        # ── Contact number validation (client report: incorrect numbers) ──
        # A number typed on the form must be valid; a legacy number already
        # stored on an existing customer is kept as-is when none is typed.
        typed_phone = _addr_clean(data.get("customer_phone"))
        if typed_phone:
            try:
                customer_phone = normalize_phone(typed_phone, field="Customer phone")
            except PhoneError as exc:
                return jsonify({"error": str(exc), "field": "customer_phone"}), 400
        else:
            customer_phone = str(customer.phone_no if customer else "").strip()
 
        incoming_email = str(data.get("customer_email") or "").strip().lower()
        customer_email = (
            incoming_email
            if incoming_email not in ("", "-")
            else (customer.email if customer else None)
        )
        customer_alt_phone = None
        typed_alt = _addr_clean(data.get("customer_alt_phone"))
        if typed_alt:
            try:
                customer_alt_phone = normalize_phone(typed_alt, field="Alternate phone")
            except PhoneError as exc:
                return jsonify({"error": str(exc), "field": "customer_alt_phone"}), 400
 
        # if not customer:
        #     if not customer_name:
        #         return jsonify({"error": "customer_name is required"}), 400
        #     if not customer_phone:
        #         return jsonify({"error": "customer_phone is required"}), 400
        #     # if not customer_email:
        #     #     return jsonify({"error": "customer_email is required"}), 400
 
        #     customer = User.query.filter(
        #         db.or_(
        #             User.phone_no == customer_phone,
        #             User.email == customer_email,
        #         )
        #     ).first()
 
        #     if not customer:
        #         name_parts = customer_name.split(None, 1)
        #         first_name = name_parts[0]
        #         last_name = name_parts[1] if len(name_parts) > 1 else "-"
        #         customer = User(
        #             first_name=first_name,
        #             last_name=last_name,
        #             email=customer_email,
        #             phone_no=customer_phone,
        #             password=generate_password_hash("Temp@12345"),
        #             role="USER",
        #             currency_code=currency,
        #             loyalty_points=0,
        #             availability_status="OFFLINE",
        #             rating=0.0,
        #         )
        #         db.session.add(customer)
        #         db.session.flush()
 
       
        if not customer:
            if not customer_name:
                return jsonify({"error": "customer_name is required"}), 400
            if not customer_phone:
                return jsonify({"error": "customer_phone is required"}), 400

            # Identify the customer by PHONE ONLY (matching every way the
            # number may have been stored: local 8 digits, 965..., +965...).
            # Email is deliberately NOT used for matching: an agent typing a
            # new customer whose email already belongs to someone else must
            # not silently attach the order to that other account.
            customer = User.query.filter(
                db.func.upper(User.role) == "USER",
                User.phone_no.in_(phone_variants(customer_phone)),
            ).first()

            if not customer:
                name_parts = customer_name.split(None, 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else "-"

                # users.email is UNIQUE. If the typed email already belongs to
                # another account, create the new customer without an email
                # (the typed email is still saved on the order itself).
                new_user_email = customer_email
                if new_user_email and User.query.filter(
                    db.func.lower(User.email) == new_user_email.lower()
                ).first():
                    new_user_email = None

                customer = User(
                    first_name=first_name,
                    last_name=last_name,
                    email=new_user_email,
                    phone_no=customer_phone,
                    password=generate_password_hash("Temp@12345"),
                    role="USER",
                    currency_code=currency,
                    loyalty_points=0,
                    availability_status="OFFLINE",
                    rating=0.0,
                )
                db.session.add(customer)
                db.session.flush()

        # ----------------------------------------------------------
        # ADDRESS / AREA
        # ----------------------------------------------------------
        address = None
        area = None
        fields = extract_address_fields(data)
 
        address_id = data.get("address_id")
        area_id = data.get("area_id")
 
        if delivery_method == "DELIVERY":
            if address_id:
                address = Address.query.get(int(address_id))
                if not address:
                    return jsonify({"error": "Address not found"}), 404
                if address.user_id != customer.id:
                    return jsonify({
                        "error": "Selected address does not belong to this customer"
                    }), 403
                area_id = address.area_id
 
            if not area_id:
                return jsonify({"error": "area_id is required for delivery"}), 400
 
            area = Area.query.filter_by(id=int(area_id), is_active=True).first()
            if not area:
                return jsonify({"error": "Invalid delivery area"}), 400
 
            if not address:
                # Address has no landmark / house_no columns, so fold them in:
                #   house_no -> building (Kuwait: house / building number)
                #   landmark -> appended to delivery_notes
                notes = fields["delivery_notes"]
                if fields["landmark"]:
                    notes = (f"{notes} | " if notes else "") + f"Landmark: {fields['landmark']}"
 
                address = Address(
                    user_id=customer.id,
                    street=fields["street"],
                    block=fields["block"],
                    avenue=fields["avenue"],
                    building=fields["building"] or fields["house_no"],
                    floor=fields["floor"],
                    apartment=fields["apartment"],
                    delivery_notes=notes,
                    country=fields["country"],
                    area_id=area.id,
                )
                db.session.add(address)
                db.session.flush()
 
        # ----------------------------------------------------------
        # ITEMS
        # ----------------------------------------------------------
        items = data.get("items") or []
        custom_cakes = normalize_custom_cakes(data)
        if not isinstance(items, list):
            return jsonify({"error": "items must be an array"}), 400
        if not items and not custom_cakes:
            return jsonify({
                "error": "Order must contain at least one item or a custom cake"
            }), 400
 
        role = str(staff_user.role or "").upper()
        source = "SHOP_MANAGER" if role == "SHOP_MANAGER" else "SALES_AGENT"
        order_type = (
            "shopmanager_order" if role == "SHOP_MANAGER" else "salesagent_order"
        )
 
        delivery_charge = Decimal(str(area.delivery_charge or 0)) if area else Decimal("0")
 
        raw_date = data.get("delivery_date") or data.get("pickup_date")
        raw_slot = data.get("delivery_time_slot") or data.get("pickup_time_slot")
 
 
        order = Order(
            user_id=customer.id,
            created_by=staff_user.id,
            order_number=generate_order_number(),
            order_type=order_type,
            order_source=source,
            notes=extract_order_notes(data) or None,
            delivery_method=delivery_method,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            customer_alt_phone=customer_alt_phone,
            delivery_address_json=with_order_notes(
                build_address_snapshot(fields, address, area, customer_origin, data)
                if delivery_method == "DELIVERY"
                else {"customer_origin": customer_origin},
                extract_order_notes(data),
            ),
            address_id=address.id if address else None,
            delivery_area_id=area.id if area else None,
            delivery_date=(
                datetime.strptime(raw_date, "%Y-%m-%d").date()
                if raw_date else None
            ),
            delivery_time_slot=raw_slot,
            # Keep the real pickup date on pickup orders as well, so kitchen /
            # receipts / app screens that read pickup_date show it.
            pickup_date=(
                datetime.strptime(raw_date, "%Y-%m-%d").date()
                if raw_date and delivery_method == "PICKUP" else None
            ),
            pickup_time_slot=raw_slot if delivery_method == "PICKUP" else None,
            greeting_message=extract_cake_message(data) or None,
            greeting_from=data.get("greeting_from") or None,
            greeting_to=data.get("greeting_to") or None,
            status="PENDING",
            payment_method=payment_method,
            payment_status="PENDING",
            subtotal=0,
            delivery_charge=delivery_charge,
            discount=Decimal("0"),
            grand_total=0,
            total=0,
            currency=currency,
        )
        db.session.add(order)
 
        db.session.flush()
        # Canonical order number is the database order ID.
        order.order_number = str(order.id)
 
        subtotal = Decimal("0")
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                raise ValueError(f"Invalid item at position {index + 1}")
            product_id = item.get("product_id")
            product = Product.query.get(product_id) if product_id else None
            if not product:
                raise ValueError(f"Product {product_id} not found")
 
            quantity = int(item.get("quantity", 1))
            if quantity <= 0:
                raise ValueError("Quantity must be greater than zero")
 
            incoming_price = item.get("price")
            price = Decimal(str(incoming_price if incoming_price is not None else product.price or 0))
            if price < 0:
                raise ValueError("Price cannot be negative")
 
            decimals = Decimal("0.001") if currency == "KWD" else Decimal("0.01")
            price = price.quantize(decimals)
            line_total = (price * Decimal(quantity)).quantize(decimals)
            subtotal += line_total
 
            db.session.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price=price,
                line_total=line_total,
                custom_json=item.get("custom_json"),
            ))
 
        if custom_cakes:
            for cake_index, cake in enumerate(custom_cakes):
                cake_price = Decimal(str(cake.get("price") or 0))
                if cake_price < 0:
                    raise ValueError(
                        f"Custom cake {cake_index + 1}: price cannot be negative"
                    )
                subtotal += cake_price
            # Stored as a JSON array so every cake on the order is kept.
            order.custom_cake_json = custom_cakes
 
        minimum_order = Decimal(str(area.min_order_value or 0)) if area else Decimal("0")
        if subtotal < minimum_order:
            raise ValueError(
                f"Minimum order value is {currency} {minimum_order}"
            )
 
        grand_total = subtotal + delivery_charge
        order.subtotal = subtotal
        order.delivery_charge = delivery_charge
        order.grand_total = grand_total
        order.total = grand_total
 
        db.session.commit()
 
        # Both Owner and Shop Manager should immediately see staff-created
        # orders in their pending workflow. Push is best-effort only.
        try:
            reviewer_ids = [
                u.id for u in User.query.filter(
                    User.role.in_(["ADMIN", "SHOP_MANAGER"]),
                    User.is_active.is_(True),
                ).all()
            ]
            notify_staff(
                order,
                reviewer_ids,
                "New order awaiting approval",
                f"{order.order_number} was created by {source.replace('_', ' ').title()}.",
                "NEW_ORDER",
            )
        except Exception as exc:
            print("Staff order notification error:", str(exc))
 
        return jsonify({
            "message": "Staff order created successfully",
            "order": order.to_dict(),
        }), 201
 
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        print("Staff Order Error:", str(exc))
        return jsonify({"error": "Unable to create staff order"}), 500
 
 
# @order_bp.route("/orders/sales-agent", methods=["GET"])
# @jwt_required()
# @role_required(["SALES_AGENT" , "ADMIN" ])
# def sales_agent_orders():
 
#     agent = get_current_user()
 
#     orders = Order.query.filter_by(
#         created_by=agent.id
#     ).order_by(Order.created_at.desc()).all()
 
#     return jsonify({
#         "orders":[o.to_dict() for o in orders]
#     }),200
 
 
@order_bp.route("/orders/sales-agent", methods=["GET"])
@jwt_required()
@role_required(["SALES_AGENT", "ADMIN"])
def sales_agent_orders():
 
    agent = get_current_user()
 
    orders = Order.query.filter_by(
        created_by=agent.id
    ).order_by(Order.created_at.desc()).all()
 
    payload = []
    for o in orders:
        row = o.to_dict()
 
        if o.address_id:
            addr = Address.query.get(o.address_id)
            if addr:
                row["address"] = addr.to_dict()
 
        payload.append(row)
 
    return jsonify({"orders": payload}), 200
 
@order_bp.route("/orders/pickup-ready", methods=["GET"])
@jwt_required()
@role_required(["KITCHEN_STAFF"])
def pickup_ready_orders():
    orders=Order.query.filter(db.func.upper(Order.delivery_method)=="PICKUP",Order.status=="PICKUP_READY").order_by(Order.completed_by_kitchen_at.desc()).all()
    return jsonify({"orders":[o.to_dict() for o in orders]}),200
 
@order_bp.route("/orders/<int:order_id>/customer-received", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
def mark_pickup_customer_received(order_id):
    order=Order.query.get_or_404(order_id); current_user=get_current_user()
    if str(order.delivery_method or "DELIVERY").upper()!="PICKUP": return jsonify({"error":"This is not a pickup order"}),400
    if order.status not in PICKUP_COLLECTABLE: return jsonify({"error":"Pickup order is not ready"}),400
    data = request.get_json(silent=True) or {}
    if str(order.payment_method or "").strip().upper() in ("COD", "CASH"):
        if data.get("cash_collected") is not True:
            return jsonify({"error": "Confirm cash collection before completing pickup"}), 400
        order.payment_status = "PAID"
    old_status=order.status; now=utc_now(); order.status="DELIVERED"; order.delivered_at=now; order.delivery_confirmed_by=current_user.id; order.delivery_confirmed_at=now
    log_order_status(order,old_status,"DELIVERED",current_user.id,"Customer received pickup order at shop")
    db.session.commit(); notify_customer(order,"Order collected",f"Your pickup order {order.order_number} has been collected successfully.","PICKUP_COLLECTED")
    return jsonify({"message":"Customer receipt confirmed","order":order.to_dict()}),200
 
 
# ─── Merged compatibility endpoints ─────────────────────────────────────────
 
@order_bp.route("/orders/<int:order_id>/pickup", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
def pickup_order(order_id):
 
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()
 
    if str(order.delivery_method or "").upper() != "PICKUP":
        return jsonify({
            "error": "This is not a pickup order"
        }), 400
 
    if order.status not in PICKUP_COLLECTABLE:
        return jsonify({
            "error": "Order is not ready for pickup"
        }), 400
 
    old_status = order.status
 
    order.status = "DELIVERED"
    order.delivered_at = utc_now()
 
    if order.payment_method == "COD":
        order.payment_status = "PAID"
 
    log_order_status(
        order,
        old_status,
        "DELIVERED",
        current_user.id,
        "Customer collected pickup order"
    )
 
    db.session.commit()
 
    return jsonify({
        "message": "Pickup completed",
        "order": order.to_dict()
    }), 200
 
@order_bp.route("/orders/<int:order_id>/mark-cod-paid", methods=["POST"])
@jwt_required()
@role_required(["DRIVER", "ADMIN", "SHOP_MANAGER"])
def mark_cod_paid(order_id):
       order = Order.query.get(order_id)
       if not order:
           return jsonify({"error": "Order not found"}), 404
 
       if order.payment_method != "COD":
           return jsonify({"error": "This order is not Cash on Delivery"}), 400
 
       order.payment_status = "PAID"
       db.session.commit()
 
       return jsonify({
           "message": "Payment marked as collected",
           "order": order.to_dict()
       }), 200  
 
@order_bp.route("/orders/<int:order_id>/mark-payment-paid", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF", "DRIVER", "ADMIN", "SHOP_MANAGER"])
def mark_payment_paid(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json(silent=True) or {}
 
    method = (data.get("payment_method") or order.payment_method or "COD").upper()
 
    allowed = ALLOWED_PAYMENT_METHODS
    if method not in allowed:
        return jsonify({"error": "Invalid payment method"}), 400
 
    # Staff is confirming how payment was actually collected at the counter —
    # update payment_method too, in case it differs from what was chosen at checkout.
    order.payment_method = method
    order.payment_status = "PAID"
 
    db.session.commit()
 
    return jsonify({
        "message": "Payment marked as paid",
        "order": order.to_dict()
    }), 200
 
@order_bp.route("/orders/<int:order_id>/pickup-complete", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF", "ADMIN", "SHOP_MANAGER"])
def pickup_complete(order_id):
    """
    One-shot action for PICKUP orders: kitchen staff confirms how the
    customer paid at the counter (COD or online) AND marks the order
    DELIVERED, in a single call.
    """
    order = Order.query.get_or_404(order_id)
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
 
    if str(order.delivery_method or "").upper() != "PICKUP":
        return jsonify({
            "error": "This is not a pickup order"
        }), 400
 
    if order.status not in PICKUP_COLLECTABLE:
        return jsonify({
            "error": "Order is not ready for pickup"
        }), 400
 
    method = (data.get("payment_method") or order.payment_method or "COD").upper()
    allowed = ALLOWED_PAYMENT_METHODS
    if method not in allowed:
        return jsonify({"error": "Invalid payment method"}), 400
 
    old_status = order.status
 
    # Record how payment was actually collected and mark it paid
    order.payment_method = method
    order.payment_status = "PAID"
 
    # Move straight to DELIVERED
    order.status = "DELIVERED"
    order.delivered_at = utc_now()
 
    log_order_status(
        order,
        old_status,
        "DELIVERED",
        current_user.id,
        f"Customer collected pickup order — payment confirmed via {method}"
    )
 
    db.session.commit()
 
    return jsonify({
        "message": "Order marked as delivered and payment collected",
        "order": order.to_dict()
    }), 200