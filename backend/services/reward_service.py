import random
from models.coupon import Coupon

def generate_coupon_code():

    while True:

        code = f"CTN{random.randint(100,999)}"

        exists = Coupon.query.filter_by(
            coupon_code=code
        ).first()

        if not exists:
            return code