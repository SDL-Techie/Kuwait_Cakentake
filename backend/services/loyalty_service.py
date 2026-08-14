# from extensions import db
# from models.loyalty import LoyaltyConfig, LoyaltyLedger
# from models.user import User


# def get_loyalty_config():
#     config = LoyaltyConfig.query.first()
#     if not config:
#         config = LoyaltyConfig()
#         db.session.add(config)
#         db.session.commit()
#     return config


# def add_loyalty_points(customer_id, points, order_id=None, description=None):
#     user = User.query.get(customer_id)
#     if not user:
#         return None

#     user.loyalty_points = (user.loyalty_points or 0) + points

#     ledger = LoyaltyLedger(
#         customer_id=customer_id,
#         order_id=order_id,
#         transaction_type="EARN",
#         points=points,
#         balance_after=user.loyalty_points,
#         description=description or f"Earned {points} points"
#     )
#     db.session.add(ledger)
#     db.session.commit()
#     return ledger


# def redeem_loyalty_points(customer_id, points, order_id=None):
#     config = get_loyalty_config()
#     user = User.query.get(customer_id)

#     if not user:
#         return {"error": "Customer not found"}

#     if (user.loyalty_points or 0) < points:
#         return {"error": "Insufficient loyalty points"}

#     if points < config.min_redemption:
#         return {"error": f"Minimum redemption is {config.min_redemption} points"}

#     user.loyalty_points -= points
#     discount_amount = float(points) * float(config.points_value)

#     ledger = LoyaltyLedger(
#         customer_id=customer_id,
#         order_id=order_id,
#         transaction_type="REDEEM",
#         points=-points,
#         balance_after=user.loyalty_points,
#         description=f"Redeemed {points} points for ₹{discount_amount:.2f} discount"
#     )
#     db.session.add(ledger)
#     db.session.commit()
#     return {"success": True, "discount_amount": discount_amount, "remaining_points": user.loyalty_points}



from extensions import db
from models.loyalty import LoyaltyConfig, LoyaltyLedger
from models.user import User


def get_loyalty_config():
    config = LoyaltyConfig.query.first()
    if not config:
        config = LoyaltyConfig()
        db.session.add(config)
        db.session.commit()
    return config


def add_loyalty_points(customer_id, points, order_id=None, description=None):
    user = User.query.get(customer_id)
    if not user:
        return None

    user.loyalty_points = (user.loyalty_points or 0) + points

    ledger = LoyaltyLedger(
        customer_id=customer_id,
        order_id=order_id,
        transaction_type="EARN",
        points=points,
        balance_after=user.loyalty_points,
        description=description or f"Earned {points} points"
    )
    db.session.add(ledger)
    db.session.commit()
    return ledger


# # def redeem_loyalty_points(customer_id, points, order_id=None):
#     config = get_loyalty_config()
#     user = User.query.get(customer_id)

#     if not user:
#         return {"error": "Customer not found"}

#     if (user.loyalty_points or 0) < points:
#         return {"error": "Insufficient loyalty points"}

#     # min_redemption gates eligibility (you must hold at least this many points
#     # to redeem at all) — it isn't a floor on how many points one redemption has
#     # to use, since a percent-based cap elsewhere can legitimately shrink that.
#     if (user.loyalty_points or 0) < config.min_redemption:
#         return {"error": f"You need at least {config.min_redemption} points in your account to redeem rewards"}

#     user.loyalty_points -= points
#     discount_amount = float(points) * float(config.points_value)

#     ledger = LoyaltyLedger(
#         customer_id=customer_id,
#         order_id=order_id,
#         transaction_type="REDEEM",
#         points=-points,
#         balance_after=user.loyalty_points,
#         description=f"Redeemed {points} points for ₹{discount_amount:.2f} discount"
#     )
#     db.session.add(ledger)
#     db.session.commit()
#     return {"success": True, "discount_amount": discount_amount, "remaining_points": user.loyalty_points}


# def redeem_loyalty_points(customer_id, order_total, order_id=None):

    # config = get_loyalty_config()
    # user = User.query.get(customer_id)

    # if not user:
    #     return {"error": "Customer not found"}

    # # Customer must have minimum points
    # if (user.loyalty_points or 0) < config.min_points:
    #     return {
    #         "error": f"You need at least {config.min_points} loyalty points to redeem."
    #     }

    # # Calculate discount
    # discount_amount = (float(order_total) * float(config.reward_percent)) / 100

    # # Deduct the required points
    # user.loyalty_points -= config.min_points

    # ledger = LoyaltyLedger(
    #     customer_id=customer_id,
    #     order_id=order_id,
    #     transaction_type="REDEEM",
    #     points=-config.min_points,
    #     balance_after=user.loyalty_points,
    #     description=f"Redeemed {config.min_points} points for {config.reward_percent}% discount"
    # )

    # db.session.add(ledger)
    # db.session.commit()

    # return {
    #     "success": True,
    #     "discount_amount": discount_amount,
    #     "remaining_points": user.loyalty_points
    # }


def redeem_loyalty_points(customer_id, order_total, order_id=None):
    config = get_loyalty_config()
    user = User.query.get(customer_id)

    if not user:
        return {"error": "Customer not found"}

    if (user.loyalty_points or 0) < config.min_points:
        return {
            "error": f"You need at least {config.min_points} loyalty points."
        }

    discount_amount = (
        float(order_total) * float(config.reward_percent)
    ) / 100

    user.loyalty_points -= config.min_points

    ledger = LoyaltyLedger(
        customer_id=customer_id,
        order_id=order_id,
        transaction_type="REDEEM",
        points=-config.min_points,
        balance_after=user.loyalty_points,
        description=f"Redeemed {config.min_points} points"
    )

    db.session.add(ledger)

    return {
        "success": True,
        "discount_amount": discount_amount
    }  