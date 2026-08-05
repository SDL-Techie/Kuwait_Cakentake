ROLE_PERMISSIONS = {
    "OWNER": ["manage:orders", "manage:all"],
    "SHOP_MANAGER": ["manage:orders"],
    "KITCHEN_STAFF": ["update:kitchen"],
    "DELIVERY_AGENT": ["update:delivery"],
    "CUSTOMER": ["manage:own_orders"]
}