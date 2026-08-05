from flask import Blueprint
from flask import request
from flask import jsonify

from extensions import db
from models.point_setting import PointSetting

point_setting_bp = Blueprint(
    "point_setting",
    __name__
)

@point_setting_bp.route(
    "/api/point-setting",
    methods=["POST"]
)
def save_setting():

    body = request.get_json()

    setting = PointSetting.query.first()

    if setting:

        setting.min_purchase = body["min_purchase"]
        setting.points_earned = body["points_earned"]
        setting.points_needed = body["points_needed"]
        setting.reward_percentage = body["reward_percentage"]
        setting.coupon_validity_days = body["coupon_validity_days"]

    else:

        setting = PointSetting(
            min_purchase=body["min_purchase"],
            points_earned=body["points_earned"],
            points_needed=body["points_needed"],
            reward_percentage=body["reward_percentage"],
            coupon_validity_days=body["coupon_validity_days"]
        )

        db.session.add(setting)

    db.session.commit()

    return jsonify({
        "message":"Saved Successfully"
    })

@point_setting_bp.route(
    "/api/point-setting",
    methods=["GET"]
)
def get_setting():

    setting = PointSetting.query.first()

    if not setting:
        return jsonify({})

    return jsonify({
        "min_purchase":
        setting.min_purchase,

        "points_earned":
        setting.points_earned,

        "points_needed":
        setting.points_needed,

        "reward_percentage":
        setting.reward_percentage,

        "coupon_validity_days":
        setting.coupon_validity_days
    })