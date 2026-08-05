from datetime import datetime
from constants.order_status import ALLOWED_TRANSITIONS


def update_order_status(order, new_status, user):
    """
    Generic guarded status transition.
    Only ever touches fields that actually exist on the Order model.
    Specific workflow endpoints (accept/assign-kitchen/assign-agent/
    assign-driver/etc.) still set their own extra fields (ids, "assigned_by",
    etc.) - this function only handles the status + timestamp + history part.
    """

    current = order.status

    allowed = ALLOWED_TRANSITIONS.get(current, [])
    if new_status not in allowed:
        return {
            "error": f"Invalid transition {current} -> {new_status}",
            "allowed_next": allowed,
        }

    if user.role in ("USER", "CUSTOMER"):
        return {"error": "Not allowed"}

    now = datetime.utcnow()

    if new_status == "ASSIGNED_TO_KITCHEN":
        order.kitchen_assigned_at = order.kitchen_assigned_at or now

    elif new_status == "PREPARING":
        order.preparation_started_at = now

    elif new_status == "READY":
        order.completed_by_kitchen_at = now

    elif new_status == "ASSIGNED_TO_AGENT":
        order.delivery_agent_assigned_at = order.delivery_agent_assigned_at or now

    elif new_status == "ASSIGNED_TO_DRIVER":
        order.driver_assigned_at = now

    elif new_status == "DRIVER_ACCEPTED":
        order.driver_accepted_at = now

    elif new_status == "OUT_FOR_DELIVERY":
        order.out_for_delivery_at = now

    elif new_status == "DELIVERY_SUBMITTED":
        order.driver_submitted_at = now

    elif new_status == "DELIVERED":
        order.delivered_at = now
        order.delivery_confirmed_by = user.id
        order.delivery_confirmed_at = now

    order.status = new_status

    return {"success": True, "order": order}