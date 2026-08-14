import stripe
from config import Config

stripe.api_key = Config.STRIPE_SECRET_KEY


def create_stripe_checkout(order):

    session = stripe.checkout.Session.create(

        mode="payment",

        # Card automatically enables Apple Pay & Google Pay
        payment_method_types=["card"],

        line_items=[
            {
                "price_data": {
                    "currency": order.currency.lower(),
                    "unit_amount": int(float(order.grand_total) * 100),
                    "product_data": {
                        "name": f"Order {order.order_number}"
                    }
                },
                "quantity": 1
            }
        ],

        success_url=f"{Config.API_BASE_URL}/payments/stripe/verify?order_id={order.id}&session_id={{CHECKOUT_SESSION_ID}}",

        cancel_url=Config.TAP_CANCEL_URL,

        billing_address_collection="auto",

        phone_number_collection={
            "enabled": True
        }
    )

    return {
        "gateway": "STRIPE",
        "payment_url": session.url,
        "session_id": session.id
    }