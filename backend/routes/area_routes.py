# from decimal import Decimal, InvalidOperation

# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required

# from extensions import db
# from models.area import Area
# from models.order import Order
# from middleware.role import role_required


# area_bp = Blueprint("area", __name__)


# def parse_non_negative_money(value, field_name):
#     try:
#         amount = Decimal(str(value or 0))
#     except (InvalidOperation, TypeError, ValueError):
#         raise ValueError(
#             f"{field_name} must be a valid number"
#         )

#     if amount < 0:
#         raise ValueError(
#             f"{field_name} cannot be negative"
#         )

#     return amount


# def format_money(amount):
#     return f"{float(amount or 0):.3f}"


# # ---------------------------------------------------------------------------
# # PUBLIC ACTIVE AREAS
# # ---------------------------------------------------------------------------

# @area_bp.route("/areas", methods=["GET"])
# def get_areas():
#     areas = Area.query.filter_by(
#         is_active=True
#     ).order_by(Area.name.asc()).all()

#     return jsonify({
#         "areas": [
#             area.to_dict()
#             for area in areas
#         ]
#     }), 200


# # ---------------------------------------------------------------------------
# # GET SINGLE AREA
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/<int:area_id>",
#     methods=["GET"]
# )
# def get_area(area_id):
#     area = Area.query.get(area_id)

#     if not area:
#         return jsonify({
#             "error": "Area not found"
#         }), 404

#     return jsonify({
#         "area": area.to_dict()
#     }), 200


# # ---------------------------------------------------------------------------
# # CREATE AREA
# # ---------------------------------------------------------------------------

# @area_bp.route("/areas", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_area():
#     data = request.get_json(silent=True) or {}

#     name = str(data.get("name") or "").strip()

#     if not name:
#         return jsonify({
#             "error": "Area name is required"
#         }), 400

#     existing = Area.query.filter(
#         db.func.lower(Area.name) == name.lower()
#     ).first()

#     if existing:
#         return jsonify({
#             "error": f"An area named '{name}' already exists"
#         }), 409

#     try:
#         delivery_charge = parse_non_negative_money(
#             data.get("delivery_charge", 0),
#             "Delivery charge"
#         )

#         min_order_value = parse_non_negative_money(
#             data.get("min_order_value", 0),
#             "Minimum order value"
#         )

#     except ValueError as error:
#         return jsonify({
#             "error": str(error)
#         }), 400

#     area = Area(
#         name=name,
#         delivery_charge=delivery_charge,
#         min_order_value=min_order_value,
#         is_active=bool(
#             data.get("is_active", True)
#         )
#     )

#     try:
#         db.session.add(area)
#         db.session.commit()

#         return jsonify({
#             "message": "Area created successfully",
#             "area": area.to_dict()
#         }), 201

#     except Exception as error:
#         db.session.rollback()
#         print("Create area error:", str(error))

#         return jsonify({
#             "error": "Unable to create area"
#         }), 500


# # ---------------------------------------------------------------------------
# # UPDATE AREA
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/<int:area_id>",
#     methods=["PUT"]
# )
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def update_area(area_id):
#     area = Area.query.get(area_id)

#     if not area:
#         return jsonify({
#             "error": "Area not found"
#         }), 404

#     data = request.get_json(silent=True) or {}

#     if "name" in data:
#         new_name = str(
#             data.get("name") or ""
#         ).strip()

#         if not new_name:
#             return jsonify({
#                 "error": "Area name cannot be empty"
#             }), 400

#         clash = Area.query.filter(
#             db.func.lower(Area.name) == new_name.lower(),
#             Area.id != area.id
#         ).first()

#         if clash:
#             return jsonify({
#                 "error": (
#                     f"An area named '{new_name}' already exists"
#                 )
#             }), 409

#         area.name = new_name

#     try:
#         if "delivery_charge" in data:
#             area.delivery_charge = parse_non_negative_money(
#                 data.get("delivery_charge"),
#                 "Delivery charge"
#             )

#         if "min_order_value" in data:
#             area.min_order_value = parse_non_negative_money(
#                 data.get("min_order_value"),
#                 "Minimum order value"
#             )

#     except ValueError as error:
#         return jsonify({
#             "error": str(error)
#         }), 400

#     if "is_active" in data:
#         area.is_active = bool(data.get("is_active"))

#     try:
#         db.session.commit()

#         return jsonify({
#             "message": "Area updated successfully",
#             "area": area.to_dict()
#         }), 200

#     except Exception as error:
#         db.session.rollback()
#         print("Update area error:", str(error))

#         return jsonify({
#             "error": "Unable to update area"
#         }), 500


# # ---------------------------------------------------------------------------
# # SOFT DELETE AREA
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/<int:area_id>",
#     methods=["DELETE"]
# )
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def delete_area(area_id):
#     area = Area.query.get(area_id)

#     if not area:
#         return jsonify({
#             "error": "Area not found"
#         }), 404

#     area.is_active = False

#     db.session.commit()

#     return jsonify({
#         "message": "Area deactivated successfully"
#     }), 200


# # ---------------------------------------------------------------------------
# # UPDATE DELIVERY CHARGE
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/<int:area_id>/set-charge",
#     methods=["POST"]
# )
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def set_area_charge(area_id):
#     area = Area.query.get(area_id)

#     if not area:
#         return jsonify({
#             "error": "Area not found"
#         }), 404

#     data = request.get_json(silent=True) or {}

#     if "delivery_charge" not in data:
#         return jsonify({
#             "error": "delivery_charge is required"
#         }), 400

#     try:
#         area.delivery_charge = parse_non_negative_money(
#             data.get("delivery_charge"),
#             "Delivery charge"
#         )

#     except ValueError as error:
#         return jsonify({
#             "error": str(error)
#         }), 400

#     db.session.commit()

#     return jsonify({
#         "message": "Delivery charge updated",
#         "area": area.to_dict()
#     }), 200


# # ---------------------------------------------------------------------------
# # UPDATE MINIMUM ORDER
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/<int:area_id>/set-min-order",
#     methods=["POST"]
# )
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def set_area_min_order(area_id):
#     area = Area.query.get(area_id)

#     if not area:
#         return jsonify({
#             "error": "Area not found"
#         }), 404

#     data = request.get_json(silent=True) or {}

#     if "min_order_value" not in data:
#         return jsonify({
#             "error": "min_order_value is required"
#         }), 400

#     try:
#         area.min_order_value = parse_non_negative_money(
#             data.get("min_order_value"),
#             "Minimum order value"
#         )

#     except ValueError as error:
#         return jsonify({
#             "error": str(error)
#         }), 400

#     db.session.commit()

#     return jsonify({
#         "message": "Minimum order value updated",
#         "area": area.to_dict()
#     }), 200


# # ---------------------------------------------------------------------------
# # AREA ORDERS
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/<int:area_id>/orders",
#     methods=["GET"]
# )
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def area_orders(area_id):
#     area = Area.query.get(area_id)

#     if not area:
#         return jsonify({
#             "error": "Area not found"
#         }), 404

#     orders = Order.query.filter_by(
#         delivery_area_id=area_id
#     ).order_by(Order.created_at.desc()).all()

#     return jsonify({
#         "area": area.to_dict(),
#         "orders": [
#             order.to_dict()
#             for order in orders
#         ]
#     }), 200


# # ---------------------------------------------------------------------------
# # CHECK DELIVERY
# # ---------------------------------------------------------------------------

# @area_bp.route(
#     "/areas/check-delivery",
#     methods=["POST"]
# )
# def check_delivery():
#     data = request.get_json(silent=True) or {}

#     area_id = data.get("area_id")

#     if not area_id:
#         return jsonify({
#             "success": False,
#             "delivery_available": False,
#             "message": "Area is required"
#         }), 400

#     try:
#         order_amount = parse_non_negative_money(
#             data.get("order_amount", 0),
#             "Order amount"
#         )

#     except ValueError as error:
#         return jsonify({
#             "success": False,
#             "delivery_available": False,
#             "message": str(error)
#         }), 400

#     area = Area.query.filter_by(
#         id=area_id,
#         is_active=True
#     ).first()

#     if not area:
#         return jsonify({
#             "success": False,
#             "delivery_available": False,
#             "message": (
#                 "Delivery is not available for this area. "
#                 "Please contact CakeNTake customer support."
#             )
#         }), 404

#     minimum_order = Decimal(
#         str(area.min_order_value or 0)
#     )

#     if order_amount < minimum_order:
#         return jsonify({
#             "success": False,
#             "delivery_available": True,
#             "message": (
#                 f"Minimum order value for {area.name} is "
#                 f"{format_money(minimum_order)}."
#             ),
#             "area": area.to_dict()
#         }), 400

#     return jsonify({
#         "success": True,
#         "delivery_available": True,
#         "message": "Delivery is available",
#         "area": area.to_dict(),
#         "delivery_charge": float(
#             area.delivery_charge or 0
#         ),
#         "min_order_value": float(
#             area.min_order_value or 0
#         )
#     }), 200




from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from extensions import db
from models.area import Area
from models.order import Order
from middleware.role import role_required


area_bp = Blueprint("area", __name__)


def parse_non_negative_money(value, field_name):
    try:
        amount = Decimal(str(value or 0))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(
            f"{field_name} must be a valid number"
        )

    if amount < 0:
        raise ValueError(
            f"{field_name} cannot be negative"
        )

    return amount


def format_money(amount):
    return f"{float(amount or 0):.3f}"


# ---------------------------------------------------------------------------
# PUBLIC ACTIVE AREAS (used by customer-facing area picker / checkout)
# ---------------------------------------------------------------------------

@area_bp.route("/areas", methods=["GET"])
def get_areas():
    areas = Area.query.filter_by(
        is_active=True
    ).order_by(Area.name.asc()).all()

    return jsonify({
        "areas": [
            area.to_dict()
            for area in areas
        ]
    }), 200


# ---------------------------------------------------------------------------
# ADMIN — ALL AREAS (active + inactive)
# Used by the Area Management screen so toggling an area to "Inactive"
# doesn't make it disappear from the admin's own list.
# ---------------------------------------------------------------------------

@area_bp.route("/areas/admin/all", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_all_areas_admin():
    areas = Area.query.order_by(Area.name.asc()).all()

    return jsonify({
        "areas": [
            area.to_dict()
            for area in areas
        ]
    }), 200


# ---------------------------------------------------------------------------
# GET SINGLE AREA
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/<int:area_id>",
    methods=["GET"]
)
def get_area(area_id):
    area = Area.query.get(area_id)

    if not area:
        return jsonify({
            "error": "Area not found"
        }), 404

    return jsonify({
        "area": area.to_dict()
    }), 200


# ---------------------------------------------------------------------------
# CREATE AREA
# ---------------------------------------------------------------------------

@area_bp.route("/areas", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_area():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name") or "").strip()

    if not name:
        return jsonify({
            "error": "Area name is required"
        }), 400

    existing = Area.query.filter(
        db.func.lower(Area.name) == name.lower()
    ).first()

    if existing:
        return jsonify({
            "error": f"An area named '{name}' already exists"
        }), 409

    try:
        delivery_charge = parse_non_negative_money(
            data.get("delivery_charge", 0),
            "Delivery charge"
        )

        min_order_value = parse_non_negative_money(
            data.get("min_order_value", 0),
            "Minimum order value"
        )

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    area = Area(
        name=name,
        delivery_charge=delivery_charge,
        min_order_value=min_order_value,
        is_active=bool(
            data.get("is_active", True)
        )
    )

    try:
        db.session.add(area)
        db.session.commit()

        return jsonify({
            "message": "Area created successfully",
            "area": area.to_dict()
        }), 201

    except Exception as error:
        db.session.rollback()
        print("Create area error:", str(error))

        return jsonify({
            "error": "Unable to create area"
        }), 500


# ---------------------------------------------------------------------------
# UPDATE AREA
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/<int:area_id>",
    methods=["PUT"]
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_area(area_id):
    area = Area.query.get(area_id)

    if not area:
        return jsonify({
            "error": "Area not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        new_name = str(
            data.get("name") or ""
        ).strip()

        if not new_name:
            return jsonify({
                "error": "Area name cannot be empty"
            }), 400

        clash = Area.query.filter(
            db.func.lower(Area.name) == new_name.lower(),
            Area.id != area.id
        ).first()

        if clash:
            return jsonify({
                "error": (
                    f"An area named '{new_name}' already exists"
                )
            }), 409

        area.name = new_name

    try:
        if "delivery_charge" in data:
            area.delivery_charge = parse_non_negative_money(
                data.get("delivery_charge"),
                "Delivery charge"
            )

        if "min_order_value" in data:
            area.min_order_value = parse_non_negative_money(
                data.get("min_order_value"),
                "Minimum order value"
            )

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    if "is_active" in data:
        area.is_active = bool(data.get("is_active"))

    try:
        db.session.commit()

        return jsonify({
            "message": "Area updated successfully",
            "area": area.to_dict()
        }), 200

    except Exception as error:
        db.session.rollback()
        print("Update area error:", str(error))

        return jsonify({
            "error": "Unable to update area"
        }), 500


# ---------------------------------------------------------------------------
# DELETE AREA (hard delete)
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/<int:area_id>",
    methods=["DELETE"]
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_area(area_id):
    area = Area.query.get(area_id)

    if not area:
        return jsonify({
            "error": "Area not found"
        }), 404

    try:
        db.session.delete(area)
        db.session.commit()

    except Exception as error:
        db.session.rollback()
        print("Delete area error:", str(error))

        # Most likely cause: FK constraint from addresses/orders still
        # pointing at this area. Ask the admin to deactivate instead.
        return jsonify({
            "error": (
                "Unable to delete this area — it is still linked to "
                "existing addresses or orders. Deactivate it instead."
            )
        }), 409

    return jsonify({
        "message": "Area deleted successfully"
    }), 200


# ---------------------------------------------------------------------------
# UPDATE DELIVERY CHARGE
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/<int:area_id>/set-charge",
    methods=["POST"]
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def set_area_charge(area_id):
    area = Area.query.get(area_id)

    if not area:
        return jsonify({
            "error": "Area not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if "delivery_charge" not in data:
        return jsonify({
            "error": "delivery_charge is required"
        }), 400

    try:
        area.delivery_charge = parse_non_negative_money(
            data.get("delivery_charge"),
            "Delivery charge"
        )

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    db.session.commit()

    return jsonify({
        "message": "Delivery charge updated",
        "area": area.to_dict()
    }), 200


# ---------------------------------------------------------------------------
# UPDATE MINIMUM ORDER
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/<int:area_id>/set-min-order",
    methods=["POST"]
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def set_area_min_order(area_id):
    area = Area.query.get(area_id)

    if not area:
        return jsonify({
            "error": "Area not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if "min_order_value" not in data:
        return jsonify({
            "error": "min_order_value is required"
        }), 400

    try:
        area.min_order_value = parse_non_negative_money(
            data.get("min_order_value"),
            "Minimum order value"
        )

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    db.session.commit()

    return jsonify({
        "message": "Minimum order value updated",
        "area": area.to_dict()
    }), 200


# ---------------------------------------------------------------------------
# AREA ORDERS
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/<int:area_id>/orders",
    methods=["GET"]
)
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def area_orders(area_id):
    area = Area.query.get(area_id)

    if not area:
        return jsonify({
            "error": "Area not found"
        }), 404

    orders = Order.query.filter_by(
        delivery_area_id=area_id
    ).order_by(Order.created_at.desc()).all()

    return jsonify({
        "area": area.to_dict(),
        "orders": [
            order.to_dict()
            for order in orders
        ]
    }), 200


# ---------------------------------------------------------------------------
# CHECK DELIVERY
# ---------------------------------------------------------------------------

@area_bp.route(
    "/areas/check-delivery",
    methods=["POST"]
)
def check_delivery():
    data = request.get_json(silent=True) or {}

    area_id = data.get("area_id")

    if not area_id:
        return jsonify({
            "success": False,
            "delivery_available": False,
            "message": "Area is required"
        }), 400

    try:
        order_amount = parse_non_negative_money(
            data.get("order_amount", 0),
            "Order amount"
        )

    except ValueError as error:
        return jsonify({
            "success": False,
            "delivery_available": False,
            "message": str(error)
        }), 400

    area = Area.query.filter_by(
        id=area_id,
        is_active=True
    ).first()

    if not area:
        return jsonify({
            "success": False,
            "delivery_available": False,
            "message": (
                "Delivery is not available for this area. "
                "Please contact CakeNTake customer support."
            )
        }), 404

    minimum_order = Decimal(
        str(area.min_order_value or 0)
    )

    if order_amount < minimum_order:
        return jsonify({
            "success": False,
            "delivery_available": True,
            "message": (
                f"Minimum order value for {area.name} is "
                f"{format_money(minimum_order)}."
            ),
            "area": area.to_dict()
        }), 400

    return jsonify({
        "success": True,
        "delivery_available": True,
        "message": "Delivery is available",
        "area": area.to_dict(),
        "delivery_charge": float(
            area.delivery_charge or 0
        ),
        "min_order_value": float(
            area.min_order_value or 0
        )
    }), 200