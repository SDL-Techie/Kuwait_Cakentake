from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from extensions import db
from models.user import User
from middleware.role import role_required
from constants.roles import ROLES

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    if User.query.filter_by(phone_no=data["phone_no"]).first():
        return jsonify({"error": "Phone number already exists"}), 400

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role="USER"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict()
    }), 201

# @auth_bp.route("/admin/register", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN"])
# def admin_register(): 
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    if data["role"] not in ROLES:
        return jsonify({"error": "Invalid role"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    if User.query.filter_by(phone_no=data["phone_no"]).first():
        return jsonify({"error": "Phone number already exists"}), 400

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        role=data["role"]
    )

    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User created successfully",
        "user": user.to_dict()
    }), 201


@auth_bp.route("/admin/create", methods=["POST"])
def create_admin():

    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    if User.query.filter_by(phone_no=data["phone_no"]).first():
        return jsonify({"error": "Phone number already exists"}), 400

    admin = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role="ADMIN"
    )

    db.session.add(admin)
    db.session.commit()

    return jsonify({
        "message": "Admin created successfully",
        "user": admin.to_dict()
    }), 201


# @auth_bp.route("/login", methods=["POST"])
# def login():

#     data = request.get_json()

#     email_or_phone = data.get("email")
#     password = data.get("password")

#     user = User.query.filter(
#         (User.email == email_or_phone) |
#         (User.phone_no == email_or_phone)
#     ).first()

#     if not user or not user.check_password(password):
#         return jsonify({
#             "error": "Invalid credentials"
#         }), 401

#     # token = create_access_token(
#     #     identity=str(user.id)
#     # )
#     token = create_access_token(
#     identity=str(user.id),
#     additional_claims={
#         "role": user.role,
#         "email": user.email
#     }
# )

#     return jsonify({
#         "message": "Login successful",
#         "token": token,
#         "user": {
#             "id": user.id,
#             "name": f"{user.first_name} {user.last_name}",
#             "email": user.email,
#             "role": user.role
#         }
#     }), 200


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    print("Request Data:", data)

    email_or_phone = data.get("email")
    password = data.get("password")

    print("Identifier:", email_or_phone)
    print("Password:", password)

    user = User.query.filter(
        (User.email == email_or_phone) |
        (User.phone_no == email_or_phone)
    ).first()

    print("========== LOGIN DEBUG ==========")
    print("Input:", email_or_phone)
    print("User Found:", user)

    if user:
     print("DB Email:", user.email)
     print("DB Phone:", user.phone_no)
     print("Password Hash:", user.password)
     print("Password Match:", user.check_password(password))
     print("===============================")

    if not user:
     return jsonify({"error": "User not found"}), 401

    if not user.check_password(password):
     return jsonify({"error": "Wrong password"}), 401

    print("User Found:", user)

    if user:
        print("DB Email:", user.email)
        print("DB Role:", user.role)
        print("Password Match:", user.check_password(password))

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "email": user.email
        }
    )

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.role
        }
    }), 200

# @auth_bp.route("/user/<int:user_id>", methods=["GET"])
# @jwt_required()
# def get_user_by_id(user_id):

#     current_user = User.query.get(
#         int(get_jwt_identity())
#     )

#     if current_user.role != "ADMIN":
#         return jsonify({
#             "error": "Admin only access"
#         }), 403

#     user = User.query.get(user_id)

#     if not user:
#         return jsonify({
#             "error": "User not found"
#         }), 404

#     return jsonify({
#         "user": user.to_dict()
#     }), 200
    
@auth_bp.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_single_user(user_id):

    current_user = User.query.get(int(get_jwt_identity()))

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # if current_user.role != "ADMIN":
    #     return jsonify({"error": "Admin only access"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_no": user.phone_no,
        "role": user.role,
        # "addresses": [
        #     {
        #         "id": address.id,
        #         "street": address.street,
        #         "city": address.city,
        #         "state": address.state,
        #         "pincode": address.pincode,
        #         "country": address.country
        #     }
        #     for address in user.addresses
        # ]

        "addresses": [
    {
        "id": address.id,
        "area_id": address.area_id,
        "street": address.street,
        "block": address.block,
        "avenue": address.avenue,
        "building": address.building,
        "floor": address.floor,
        "apartment": address.apartment,
        "delivery_notes": address.delivery_notes,
        "country": address.country
    }
    for address in user.addresses
]
    }), 200




@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    # addresses = []

    # for address in user.addresses:
    #     addresses.append({
    #         "id": address.id,
    #         "street": address.street,
    #         "city": address.city,
    #         "state": address.state,
    #         "pincode": address.pincode,
    #         "country": address.country
    #     })

    
    addresses = []

    for address in user.addresses:
     addresses.append({
        "id": address.id,
        "area_id": address.area_id,
        "street": address.street,
        "block": address.block,
        "avenue": address.avenue,
        "building": address.building,
        "floor": address.floor,
        "apartment": address.apartment,
        "delivery_notes": address.delivery_notes,
        "country": address.country
    })

    return jsonify({
    "id": user.id,
    "name": f"{user.first_name} {user.last_name}",
    "email": user.email,
    "phone_no": user.phone_no,
    "role": user.role,
    "addresses": addresses
}), 200





@auth_bp.route("/admin/users", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def get_all_users():
    users = User.query.all()

    return jsonify({
        "users": [user.to_dict() for user in users]
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({
        "message": "Logout successful"
    }), 200

@auth_bp.route("/users/change-currency", methods=["PUT"])
def change_currency():

    data = request.get_json()

    user = User.query.get(
        data.get("user_id")
    )

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    currency_code = data.get("currency_code")

    if not currency_code:
        return jsonify({
            "error": "currency_code is required"
        }), 400

    user.currency_code = currency_code

    db.session.commit()

    return jsonify({
        "message": "Currency updated",
        "currency_code": user.currency_code
    }), 200

# ─── Change Password ──────────────────────────────────────────────────────────
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "old_password and new_password are required"}), 400

    if not user.check_password(old_password):
        return jsonify({"error": "Incorrect current password"}), 401

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200


# ─── Update Profile ───────────────────────────────────────────────────────────
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    for field in ["first_name", "last_name", "email", "phone_no"]:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200
