# ORDER_STATUS = {
#     "PENDING",
#     "ACCEPTED",
#     "REJECTED",
#     "CANCELLED",
#     "PROCESSING",
#     "READY",
#     "OUT_FOR_DELIVERY",
#     "DELIVERED"
# }
# ALLOWED_TRANSITIONS = {
#     "PENDING": ["ACCEPTED", "REJECTED", "CANCELLED"],
#     "ACCEPTED": ["PROCESSING", "CANCELLED"],
#     "PROCESSING": ["READY"],
#     "READY": ["OUT_FOR_DELIVERY"],
#     "OUT_FOR_DELIVERY": ["DELIVERED"]
# }   


# constants/order_status.py
#
# Canonical order status machine.
#
# Flow requested:
#   create order
#     -> accept order            (payment_status set based on COD/UPI here)
#     -> assign to kitchen
#     -> kitchen: preparing
#     -> kitchen: ready
#     -> assign to delivery agent        (owner / shop manager picks AGENT, not driver)
#     -> delivery agent assigns a driver (agent picks an available DRIVER)
#     -> driver accepts in their dashboard
#     -> out for delivery
#     -> driver submits proof (photo) of delivery to the delivery agent
#     -> delivery agent confirms delivered -> status visible to admin/shop manager
#
# REJECTED / CANCELLED can branch off at most points before DELIVERED.

ORDER_STATUS = {
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "CANCELLED",

    "ASSIGNED_TO_KITCHEN",
    "PREPARING",
    "READY",

    "ASSIGNED_TO_AGENT",     # owner/shop manager -> delivery agent
    "ASSIGNED_TO_DRIVER",    # delivery agent -> driver
    "DRIVER_ACCEPTED",       # driver accepted in their dashboard
    "OUT_FOR_DELIVERY",      # driver is en route

    "DELIVERY_SUBMITTED",    # driver uploaded proof, waiting on agent confirmation
    "DELIVERED",             # delivery agent confirmed final delivery
}

ALLOWED_TRANSITIONS = {
    "PENDING":              ["ACCEPTED", "REJECTED", "CANCELLED"],
    "ACCEPTED":             ["ASSIGNED_TO_KITCHEN", "CANCELLED"],
    "ASSIGNED_TO_KITCHEN":  ["PREPARING", "CANCELLED"],
    "PREPARING":            ["READY"],
    "READY":                ["ASSIGNED_TO_AGENT"],
    "ASSIGNED_TO_AGENT":    ["ASSIGNED_TO_DRIVER"],
    "ASSIGNED_TO_DRIVER":   ["DRIVER_ACCEPTED", "ASSIGNED_TO_DRIVER"],  # allow re-assign
    "DRIVER_ACCEPTED":      ["OUT_FOR_DELIVERY"],
    "OUT_FOR_DELIVERY":     ["DELIVERY_SUBMITTED"],
    "DELIVERY_SUBMITTED":   ["DELIVERED"],
    "DELIVERED":            [],
    "REJECTED":             [],
    "CANCELLED":            [],
}

# Statuses considered "active" (not finished / not dead-ended)
ACTIVE_STATUSES = [
    s for s in ORDER_STATUS
    if s not in ("DELIVERED", "REJECTED", "CANCELLED")
]

# Payment status values
PAYMENT_STATUS = {
    "PENDING",
    "COMPLETED",
    "FAILED",
}

# Payment methods
PAYMENT_METHOD_COD = "COD"
PAYMENT_METHOD_UPI = "UPI"