
# from extensions import db
# from models.order_status_history import OrderStatusHistory


# def log_order_status(
#         order,
#         old_status,
#         new_status,
#         user_id,
#         remarks=None
# ):

#     history = OrderStatusHistory(
#         order_id=order.id,
#         old_status=old_status,
#         new_status=new_status,
#         changed_by=user_id,
#         remarks=remarks
#     )

#     db.session.add(history)



    

from extensions import db
from models.order_status_history import OrderStatusHistory


def log_order_status(order, old_status, new_status, user_id, remarks=None):
    """
    Records a status change row. Call this with the ORDER OBJECT
    (not order.id) as the first argument:

        log_order_status(order, old_status, new_status, current_user.id, "optional note")

    This does not commit - call db.session.commit() after, same
    transaction as the rest of your status update.
    """
    history = OrderStatusHistory(
        order_id=order.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=user_id,
        remarks=remarks
    )

    db.session.add(history)
    return history