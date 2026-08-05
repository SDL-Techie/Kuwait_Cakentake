from models.user import User
from models.point_setting import PointSetting
from extensions import db

def add_points(phone_no, order_amount):

    user = User.query.filter_by(
        phone_no=phone_no
    ).first()

    setting = PointSetting.query.first()

    if not user:
        return

    if not setting:
        return

    if order_amount >= setting.min_purchase:

        user.loyalty_points += (
            setting.points_earned
        )

        db.session.commit()