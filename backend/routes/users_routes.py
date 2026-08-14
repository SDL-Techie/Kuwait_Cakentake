# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models.user import User
# from models.misc import Permission
# from middleware.role import role_required
# from models.address import Address

# users_bp = Blueprint("users", __name__)


# # ─── USERS ──────────────────────────────────────────────────────────────────

# @users_bp.route("/users", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_users():
#     role_filter = request.args.get("role")
#     query = User.query
#     if role_filter:
#         query = query.filter(User.role == role_filter.upper().replace("-", "_"))
#     users = query.all()
#     return jsonify({"users": [u.to_dict() for u in users]}), 200


# @users_bp.route("/users/<int:user_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_user(user_id):
#     user = User.query.get_or_404(user_id)
#     return jsonify({"user": user.to_dict()}), 200


# @users_bp.route("/users", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN"])
# def create_user():
#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "No data provided"}), 400

#     if User.query.filter_by(email=data.get("email")).first():
#         return jsonify({"error": "Email already exists"}), 400
#     if User.query.filter_by(phone_no=data.get("phone_no")).first():
#         return jsonify({"error": "Phone already exists"}), 400

#     user = User(
#         first_name=data["first_name"],
#         last_name=data["last_name"],
#         phone_no=data["phone_no"],
#         email=data["email"],
#         role=data.get("role", "USER")
#     )
#     user.set_password(data["password"])
#     db.session.add(user)
#     db.session.commit()
#     return jsonify({"message": "User created", "user": user.to_dict()}), 201


# @users_bp.route("/users/<int:user_id>", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_user(user_id):
#     user = User.query.get_or_404(user_id)
#     data = request.get_json()
#     for field in ["first_name", "last_name", "phone_no", "email", "role", "is_active"]:
#         if field in data:
#             setattr(user, field, data[field])
#     if "password" in data:
#         user.set_password(data["password"])
#     db.session.commit()
#     return jsonify({"message": "User updated", "user": user.to_dict()}), 200


# @users_bp.route("/users/<int:user_id>", methods=["DELETE"])
# @jwt_required()
# @role_required(["ADMIN"])
# def delete_user(user_id):
#     user = User.query.get_or_404(user_id)
#     db.session.delete(user)
#     db.session.commit()
#     return jsonify({"message": "User deleted"}), 200


# # ─── OWNER STAFF VIEWS ───────────────────────────────────────────────────────

# @users_bp.route("/owner/sales-agents", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_sales_agents():
#     agents = User.query.filter_by(role="SALES_AGENT").all()
#     return jsonify({"sales_agents": [u.to_dict() for u in agents]}), 200


# @users_bp.route("/owner/delivery-agents", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_delivery_agents():
#     agents = User.query.filter_by(role="DELIVERY_AGENT").all()
#     return jsonify({"delivery_agents": [u.to_dict() for u in agents]}), 200


# @users_bp.route("/owner/drivers", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_drivers():
#     drivers = User.query.filter_by(role="DRIVER").all()
#     return jsonify({"drivers": [u.to_dict() for u in drivers]}), 200


# @users_bp.route("/owner/sales-agents/<int:agent_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_sales_agent(agent_id):
#     agent = User.query.filter_by(id=agent_id, role="SALES_AGENT").first_or_404()
#     return jsonify({"agent": agent.to_dict()}), 200


# @users_bp.route("/owner/delivery-agents/<int:agent_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_delivery_agent(agent_id):
#     agent = User.query.filter_by(id=agent_id, role="DELIVERY_AGENT").first_or_404()
#     return jsonify({"agent": agent.to_dict()}), 200


# @users_bp.route("/owner/drivers/<int:driver_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_driver(driver_id):
#     driver = User.query.filter_by(id=driver_id, role="DRIVER").first_or_404()
#     return jsonify({"driver": driver.to_dict()}), 200


# # ─── PERMISSIONS ─────────────────────────────────────────────────────────────

# @users_bp.route("/permissions", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN"])
# def get_permissions():
#     perms = Permission.query.all()
#     return jsonify({"permissions": [p.to_dict() for p in perms]}), 200


# @users_bp.route("/permissions/assign", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN"])
# def assign_permission():
#     data = request.get_json()
#     perm = Permission(
#         user_id=data["user_id"],
#         module=data["module"],
#         can_view=data.get("can_view", False),
#         can_create=data.get("can_create", False),
#         can_edit=data.get("can_edit", False),
#         can_delete=data.get("can_delete", False)
#     )
#     db.session.add(perm)
#     db.session.commit()
#     return jsonify({"message": "Permission assigned", "permission": perm.to_dict()}), 201


# @users_bp.route("/permissions/update", methods=["PUT"])
# @jwt_required()
# @role_required(["ADMIN"])
# def update_permission():
#     data = request.get_json()
#     perm = Permission.query.filter_by(
#         user_id=data["user_id"], module=data["module"]
#     ).first()
#     if not perm:
#         return jsonify({"error": "Permission not found"}), 404
#     for field in ["can_view", "can_create", "can_edit", "can_delete"]:
#         if field in data:
#             setattr(perm, field, data[field])
#     db.session.commit()
#     return jsonify({"message": "Permission updated", "permission": perm.to_dict()}), 200


# @users_bp.route("/customers/search", methods=["GET"])
# @jwt_required()
# @role_required(["SALES_AGENT", "ADMIN", "SHOP_MANAGER"])
# def search_customers():

#     keyword = request.args.get("q", "").strip()

#     if not keyword:
#         return jsonify({"customers": []}), 200

#     customers = User.query.filter(
#         User.role == "USER",
#         db.or_(
#             User.first_name.ilike(f"%{keyword}%"),
#             User.last_name.ilike(f"%{keyword}%"),
#             User.phone_no.ilike(f"%{keyword}%"),
#             User.email.ilike(f"%{keyword}%")
#         )
#     ).all()

#     return jsonify({
#         "customers": [c.to_dict() for c in customers]
#     }), 200


# @users_bp.route("/customers", methods=["POST"])
# @jwt_required()
# @role_required(["SALES_AGENT", "ADMIN", "SHOP_MANAGER"])
# def create_customer():

#     data = request.get_json() or {}

#     phone = data.get("phone_no")

#     if not phone:
#         return jsonify({"error": "phone_no is required"}), 400

#     existing = User.query.filter_by(phone_no=phone).first()

#     if existing:
#         return jsonify({
#             "message": "Customer already exists",
#             "customer": existing.to_dict()
#         }), 200

#     customer = User(
#         first_name=data.get("first_name"),
#         last_name=data.get("last_name"),
#         phone_no=phone,
#         email=data.get("email"),
#         role="USER"
#     )

#     customer.set_password("123456")

#     db.session.add(customer)
#     db.session.commit()

#     return jsonify({
#         "message": "Customer created",
#         "customer": customer.to_dict()
#     }), 201


# @users_bp.route("/customers/<int:user_id>/address", methods=["POST"])
# @jwt_required()
# @role_required(["SALES_AGENT", "ADMIN", "SHOP_MANAGER"])
# def create_customer_address(user_id):

#     customer = User.query.get_or_404(user_id)

#     data = request.get_json() or {}

#     address = Address(
#         user_id=user_id,
#         full_name=f"{customer.first_name} {customer.last_name}",
#         phone_no=customer.phone_no,
#         address_line1=data["address_line1"],
#         address_line2=data.get("address_line2"),
#         landmark=data.get("landmark"),
#         city=data["city"],
#         state=data["state"],
#         country=data["country"],
#         pincode=data["pincode"],
#         area_id=data["area_id"]
#     )

#     db.session.add(address)
#     db.session.commit()

#     return jsonify({
#         "message": "Address created",
#         "address": address.to_dict()
#     }), 201


# @users_bp.route("/customers/<int:user_id>/addresses", methods=["GET"])
# @jwt_required()
# @role_required(["SALES_AGENT", "ADMIN", "SHOP_MANAGER"])
# def get_customer_addresses(user_id):

#     addresses = Address.query.filter_by(user_id=user_id).all()

#     return jsonify({
#         "addresses":[a.to_dict() for a in addresses]
#     }),200



from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.misc import Permission
from middleware.role import role_required
from models.address import Address

users_bp = Blueprint("users", __name__)


# ─── USERS ──────────────────────────────────────────────────────────────────

@users_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_users():
    role_filter = request.args.get("role")
    query = User.query
    if role_filter:
        query = query.filter(User.role == role_filter.upper().replace("-", "_"))
    users = query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@users_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/users", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(phone_no=data.get("phone_no")).first():
        return jsonify({"error": "Phone already exists"}), 400

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        role=data.get("role", "USER")
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created", "user": user.to_dict()}), 201


@users_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    for field in ["first_name", "last_name", "phone_no", "email", "role"]:
        if field in data:
            setattr(user, field, data[field])
    if "password" in data:
        user.set_password(data["password"])
    db.session.commit()
    return jsonify({"message": "User updated", "user": user.to_dict()}), 200


@users_bp.route("/users/<int:user_id>/activation", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN"])
def set_user_activation(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    if "is_active" not in data:
        return jsonify({"error": "is_active is required"}), 400
    if user.role == "ADMIN":
        return jsonify({"error": "Owner account cannot be deactivated here"}), 400
    user.is_active = bool(data.get("is_active"))
    db.session.commit()
    return jsonify({
        "message": "User activated" if user.is_active else "User deactivated",
        "user": user.to_dict()
    }), 200


@users_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


# ─── OWNER STAFF VIEWS ───────────────────────────────────────────────────────

@users_bp.route("/owner/sales-agents", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_sales_agents():
    agents = User.query.filter_by(role="SALES_AGENT").all()
    return jsonify({"sales_agents": [u.to_dict() for u in agents]}), 200


@users_bp.route("/owner/delivery-agents", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_delivery_agents():
    agents = User.query.filter_by(role="DELIVERY_AGENT").all()
    return jsonify({"delivery_agents": [u.to_dict() for u in agents]}), 200


@users_bp.route("/owner/drivers", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_drivers():
    drivers = User.query.filter_by(role="DRIVER").all()
    return jsonify({"drivers": [u.to_dict() for u in drivers]}), 200


@users_bp.route("/owner/sales-agents/<int:agent_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_sales_agent(agent_id):
    agent = User.query.filter_by(id=agent_id, role="SALES_AGENT").first_or_404()
    return jsonify({"agent": agent.to_dict()}), 200


@users_bp.route("/owner/delivery-agents/<int:agent_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_delivery_agent(agent_id):
    agent = User.query.filter_by(id=agent_id, role="DELIVERY_AGENT").first_or_404()
    return jsonify({"agent": agent.to_dict()}), 200


@users_bp.route("/owner/drivers/<int:driver_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_driver(driver_id):
    driver = User.query.filter_by(id=driver_id, role="DRIVER").first_or_404()
    return jsonify({"driver": driver.to_dict()}), 200


# ─── PERMISSIONS ─────────────────────────────────────────────────────────────

@users_bp.route("/permissions", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def get_permissions():
    perms = Permission.query.all()
    return jsonify({"permissions": [p.to_dict() for p in perms]}), 200


@users_bp.route("/permissions/assign", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def assign_permission():
    data = request.get_json()
    perm = Permission(
        user_id=data["user_id"],
        module=data["module"],
        can_view=data.get("can_view", False),
        can_create=data.get("can_create", False),
        can_edit=data.get("can_edit", False),
        can_delete=data.get("can_delete", False)
    )
    db.session.add(perm)
    db.session.commit()
    return jsonify({"message": "Permission assigned", "permission": perm.to_dict()}), 201


@users_bp.route("/permissions/update", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN"])
def update_permission():
    data = request.get_json()
    perm = Permission.query.filter_by(
        user_id=data["user_id"], module=data["module"]
    ).first()
    if not perm:
        return jsonify({"error": "Permission not found"}), 404
    for field in ["can_view", "can_create", "can_edit", "can_delete"]:
        if field in data:
            setattr(perm, field, data[field])
    db.session.commit()
    return jsonify({"message": "Permission updated", "permission": perm.to_dict()}), 200


@users_bp.route("/customers/search", methods=["GET"])
@jwt_required()
@role_required(["SALES_AGENT", "AGENT", "ADMIN", "SHOP_MANAGER"])
def search_customers():

    keyword = request.args.get("q", "").strip()

    if not keyword:
        return jsonify({"customers": []}), 200

    customers = User.query.filter(
        User.role == "USER",
        db.or_(
            User.first_name.ilike(f"%{keyword}%"),
            User.last_name.ilike(f"%{keyword}%"),
            User.phone_no.ilike(f"%{keyword}%"),
            User.email.ilike(f"%{keyword}%")
        )
    ).all()

    return jsonify({
        "customers": [c.to_dict() for c in customers]
    }), 200


@users_bp.route("/customers", methods=["POST"])
@jwt_required()
@role_required(["SALES_AGENT", "AGENT", "ADMIN", "SHOP_MANAGER"])
def create_customer():

    data = request.get_json() or {}

    phone = data.get("phone_no")

    if not phone:
        return jsonify({"error": "phone_no is required"}), 400

    existing = User.query.filter_by(phone_no=phone).first()

    if existing:
        return jsonify({
            "message": "Customer already exists",
            "customer": existing.to_dict()
        }), 200

    customer = User(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        phone_no=phone,
        email=data.get("email"),
        role="USER"
    )

    customer.set_password("123456")

    db.session.add(customer)
    db.session.commit()

    return jsonify({
        "message": "Customer created",
        "customer": customer.to_dict()
    }), 201


@users_bp.route("/customers/<int:user_id>/address", methods=["POST"])
@jwt_required()
@role_required(["SALES_AGENT", "AGENT", "ADMIN", "SHOP_MANAGER"])
def create_customer_address(user_id):

    customer = User.query.get_or_404(user_id)

    data = request.get_json() or {}

    address = Address(
        user_id=user_id,
        full_name=f"{customer.first_name} {customer.last_name}",
        phone_no=customer.phone_no,
        address_line1=data["address_line1"],
        address_line2=data.get("address_line2"),
        landmark=data.get("landmark"),
        city=data["city"],
        state=data["state"],
        country=data["country"],
        pincode=data["pincode"],
        area_id=data["area_id"]
    )

    db.session.add(address)
    db.session.commit()

    return jsonify({
        "message": "Address created",
        "address": address.to_dict()
    }), 201


@users_bp.route("/customers/<int:user_id>/addresses", methods=["GET"])
@jwt_required()
@role_required(["SALES_AGENT", "AGENT", "ADMIN", "SHOP_MANAGER"])
def get_customer_addresses(user_id):

    addresses = Address.query.filter_by(user_id=user_id).all()

    return jsonify({
        "addresses":[a.to_dict() for a in addresses]
    }),200