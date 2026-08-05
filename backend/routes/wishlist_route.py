from flask import Blueprint, request, jsonify
from extensions import db
from models.wishlist import Wishlist

wishlist_bp = Blueprint("wishlist_bp", __name__)
@wishlist_bp.route("/wishlist", methods=["POST"])
def create_wishlist():

    data = request.get_json()

    wishlist = Wishlist(
        user_id=data["user_id"],
        product_id=data["product_id"]
    )

    db.session.add(wishlist)
    db.session.commit()

    return jsonify({
        "message": "Item Added To Wishlist",
        "wishlist":wishlist.to_dict()
    }), 201



@wishlist_bp.route("/wishlist/<int:user_id>", methods=["GET"])
def get_wishlist(user_id):

    items = Wishlist.query.filter_by(user_id=user_id).all()
    currency = request.headers.get("X-Currency", "KWD")
    # if not items:
    #     return jsonify({
    #         "message": "Wishlist Empty"
    #     }), 404

    # return jsonify({
    #     "user_id": user_id,
    #     "items": [item.to_dict(currency) for item in items]
    # }), 200


    return jsonify({
        "message": "Wishlist is empty" if not items else "Wishlist fetched successfully",
        "user_id": user_id,
        "items": [item.to_dict(currency) for item in items]
    }), 200

# Update Wishlist
@wishlist_bp.route("/wishlist/<int:id>", methods=["PUT"])
def update_wishlist(id):

    wishlist = db.session.get(Wishlist, id)

    if not wishlist:
        return jsonify({
            "message": "Wishlist Item Not Found"
        }), 404

    data = request.get_json()

    wishlist.product_id = data.get("product_id", wishlist.product_id)

    db.session.commit()

    return jsonify({
        "message": "Wishlist Updated Successfully",
        "wishlist": wishlist.to_dict()
    }), 200





# Delete Wishlist
@wishlist_bp.route("/wishlist/<int:id>", methods=["DELETE"])
def delete_wishlist(id):

    wishlist = db.session.get(Wishlist, id)

    if not wishlist:
        return jsonify({
            "message": "Wishlist Item Not Found"
        }), 404

    db.session.delete(wishlist)
    db.session.commit()

    return jsonify({
        "message": "Wishlist Deleted Successfully"
    }), 200