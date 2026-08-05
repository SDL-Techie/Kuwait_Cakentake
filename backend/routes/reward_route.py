from datetime import datetime
from datetime import timedelta

from flask import Blueprint
from flask import request
from flask import jsonify

from extensions import db

from models.user import User
from models.coupon import Coupon
from models.point_setting import PointSetting

from services.reward_service import generate_coupon_code

reward_bp = Blueprint(
    "reward",
    __name__
)

@reward_bp.route(
    "/api/reward/generate/<string:phone_no>",
    methods=["POST"]
)
def generate_reward(phone_no):

    user = User.query.filter_by(
        phone_no=phone_no
    ).first()

    if not user:
        return jsonify({
            "message":"User Not Found"
        }),404

    setting = PointSetting.query.first()

    if not setting:
        return jsonify({
            "message":"Point Setting Missing"
        }),404

    if user.loyalty_points < setting.points_needed:
        return jsonify({
            "message":"Not Enough Points"
        }),400

    coupon = Coupon(
        user_id=user.id,
        coupon_code=generate_coupon_code(),
        discount_percentage=setting.reward_percentage,
        expiry_date=datetime.utcnow() +
        timedelta(
            days=setting.coupon_validity_days
        )
    )

    db.session.add(coupon)

    user.loyalty_points -= (
        setting.points_needed
    )

    db.session.commit()

    return jsonify({
        "coupon_code":coupon.coupon_code,
        "discount_percentage":coupon.discount_percentage,
        "remaining_points":user.loyalty_points
    })

@reward_bp.route(
    "/api/coupon/apply",
    methods=["POST"]
)
def apply_coupon():

    body = request.get_json()

    user = User.query.filter_by(
        phone_no=body["phone_no"]
    ).first()

    if not user:
        return jsonify({
            "message":"User Not Found"
        }),404

    coupon = Coupon.query.filter_by(
        coupon_code=body["coupon_code"]
    ).first()

    if not coupon:
        return jsonify({
            "message":"Invalid Coupon"
        }),400

    if coupon.user_id != user.id:
        return jsonify({
            "message":"Coupon belongs to another user"
        }),400

    if coupon.is_used:
        return jsonify({
            "message":"Coupon already used"
        }),400

    if coupon.expiry_date < datetime.utcnow():
        return jsonify({
            "message":"Coupon expired"
        }),400

    amount = float(
        body["amount"]
    )

    discount = (
        amount *
        coupon.discount_percentage
    ) / 100

    final_amount = (
        amount -
        discount
    )

    coupon.is_used = True

    db.session.commit()

    return jsonify({
        "amount":amount,
        "discount":discount,
        "final_amount":final_amount
    })

@reward_bp.route(
    "/api/user-points/<string:phone_no>",
    methods=["GET"]
)
def get_points(phone_no):

    user = User.query.filter_by(
        phone_no=phone_no
    ).first()

    if not user:
        return jsonify({
            "message": "User Not Found"
        }), 404

    return jsonify({
        "phone_no": user.phone_no,
        "loyalty_points": user.loyalty_points
    }), 200

@reward_bp.route(
    "/api/my-coupons/<string:phone_no>",
    methods=["GET"]
)
def my_coupons(phone_no):

    user = User.query.filter_by(
        phone_no=phone_no
    ).first()

    if not user:
        return jsonify({
            "message": "User Not Found"
        }), 404

    coupons = Coupon.query.filter_by(
        user_id=user.id
    ).all()

    return jsonify([
        {
            "coupon_code": c.coupon_code,
            "discount_percentage": c.discount_percentage,
            "is_used": c.is_used,
            "expiry_date": c.expiry_date.strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        }
        for c in coupons
    ]), 200