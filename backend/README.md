# Cake N Take — Backend API v2.0

A Flask + PostgreSQL backend for the Cake N Take bakery management platform. Covers authentication, orders, kitchen, delivery, drivers, inventory, finance, loyalty, promotions, and full reporting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flask |
| Database | PostgreSQL (via SQLAlchemy) |
| Auth | JWT (flask-jwt-extended) |
| Migrations | Flask-Migrate / Alembic |
| File Uploads | Cloudinary |
| Payments | Stripe |
| CORS | flask-cors |

---

## Folder Structure

```
backend/
├── app.py                        # App factory & blueprint registration
├── config.py                     # Config from .env
├── extensions.py                 # db, migrate instances
├── requirements.txt
├── .env                          # Environment variables (never commit)
│
├── constants/
│   ├── roles.py                  # Role constants
│   └── order_status.py           # Allowed status transitions
│
├── middleware/
│   ├── role.py                   # role_required decorator
│   └── permissions.py            # Permission helpers
│
├── models/
│   ├── user.py                   # User (all roles)
│   ├── customer.py               # Customer profile extension
│   ├── address.py                # Delivery addresses
│   ├── order.py                  # Orders (full workflow)
│   ├── order_item.py             # Order line items
│   ├── order_status_history.py   # Status change log
│   ├── product.py                # Products
│   ├── category.py               # Categories
│   ├── cart.py / cartItem.py     # Shopping cart
│   ├── coupon.py                 # Coupons
│   ├── wishlist.py               # Wishlists
│   ├── currency_rate.py          # Currency exchange rates
│   ├── pincode.py                # Delivery pincodes
│   ├── point_setting.py          # Legacy point settings
│   ├── loyalty.py                # LoyaltyConfig, LoyaltyLedger
│   ├── variant.py                # Variant, Flavor, Addon
│   ├── combo.py                  # Combo products
│   ├── promotion.py              # Promotion, PromotionFreeItem, PromoCode
│   ├── area.py                   # Delivery areas
│   ├── inventory.py              # RawMaterial, Inventory, Consumption, Supplier, Purchase
│   └── misc.py                   # Expense, CashDrawer, Bank, Notification, Permission,
│                                 #   Brand, Partner, DeliverySlot, OrderSource,
│                                 #   CustomOrder, AuditLog, DriverSettlement, SubCategory
│
├── routes/
│   ├── auth_routes.py            # /auth/*
│   ├── users_routes.py           # /users, /permissions, /owner/*
│   ├── customer_routes.py        # /customers/*
│   ├── order_routes.py           # /orders/* (existing + extended)
│   ├── kitchen_routes.py         # /kitchen/*
│   ├── delivery_routes.py        # /delivery/*, /delivery-slots/*
│   ├── driver_routes.py          # /drivers/*
│   ├── category_routes.py        # /category/*, /categories/*
│   ├── subcategory_routes.py     # /subcategories/*
│   ├── product_routes.py         # /products/* (existing + extended)
│   ├── variant_routes.py         # /variants/*, /flavors/*, /addons/*
│   ├── combo_routes.py           # /combos/*
│   ├── promotion_routes.py       # /promotions/*, /promos/*
│   ├── area_routes.py            # /areas/*
│   ├── loyalty_routes.py         # /loyalty-config, /loyalty-points/*, /loyalty/ledger
│   ├── inventory_routes.py       # /inventory/*, /materials/*, /purchases/*, /suppliers/*
│   ├── finance_routes.py         # /expenses/*, /cash-drawer/*, /bank/*
│   ├── dashboard_routes.py       # /dashboard/*, /sales-agents/*, chart endpoints
│   ├── reports_routes.py         # /reports/* + CSV exports
│   ├── misc_routes.py            # /notifications/*, /audit-logs/*, /partners/*,
│   │                             #   /brands/*, /driver-settlements/*, /custom-orders/*,
│   │                             #   /order-sources/*, /whatsapp/*
│   ├── payment_rotes.py          # /payments/*, /invoices/*
│   ├── address_route.py          # /addresses/*
│   ├── cart_route.py             # /cart/*
│   ├── reward_route.py           # /rewards/*
│   ├── settings_route.py         # /settings/*
│   ├── delivery_charge_routes.py # /delivery-charges/*
│   ├── pointsetting_routes.py    # /point-settings/*
│   └── wishlist_route.py         # /wishlists/*
│
├── services/
│   ├── order_service.py          # Status transition logic
│   ├── order_history_service.py  # Log order status changes
│   ├── loyalty_service.py        # Earn / redeem points
│   ├── inventory_service.py      # Stock operations
│   ├── cash_service.py           # Cash drawer operations
│   ├── audit_service.py          # Audit log helper
│   ├── notification_service.py   # Push / in-app notifications
│   ├── point_service.py          # Legacy points
│   ├── reward_service.py         # Reward logic
│   ├── currency_service.py       # Exchange rates
│   └── postal_service.py         # Pincode lookups
│
└── migrations/                   # Alembic auto-generated migrations
```

---

## Roles

| Role constant | Description |
|---|---|
| `ADMIN` | Owner — full access |
| `SHOP_MANAGER` | Manager — operational access |
| `SALES_AGENT` | Takes and manages orders |
| `KITCHEN_STAFF` | Prepares orders |
| `DELIVERY_AGENT` | Assigns drivers, manages delivery |
| `DRIVER` | Picks up and delivers orders |
| `USER` | Customer |

---

## Environment Variables (.env)

```env
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cakentake

JWT_SECRET_KEY=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

TAP_SECRET_KEY=sk_test_...
TAP_PUBLISHABLE_KEY=pk_test_...
```

---

## Setup

```bash
# 1. Clone / extract the project
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure .env (copy the template above)

# 5. Run migrations
flask db upgrade

# 6. Start the server
python app.py
```

---

## API Reference

### Authentication  `/auth/*`
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register customer |
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh-token` | Refresh JWT |
| POST | `/auth/forgot-password` | Send reset link |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/change-password` | Change password |

### Users & Staff  `/users`, `/permissions`
| Method | Route | Description |
|---|---|---|
| GET | `/users` | List users (filter by `?role=`) |
| GET | `/users/:id` | Get user |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/permissions` | List permissions |
| POST | `/permissions/assign` | Assign permission |
| PUT | `/permissions/update` | Update permission |

### Customers  `/customers`
| Method | Route | Description |
|---|---|---|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer |
| PUT | `/customers/:id` | Update customer |
| GET | `/customers/:id/orders` | Customer's orders |
| GET | `/customers/:id/order-summary` | Order summary |
| GET | `/customers/:id/addresses` | Addresses |
| POST | `/customers/:id/addresses` | Add address |
| GET | `/customers/:id/loyalty-points` | Points balance |
| GET | `/customers/:id/loyalty-history` | Points history |

### Orders  `/orders`
| Method | Route | Description |
|---|---|---|
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/:id` | Get order |
| PUT | `/orders/:id` | Update order |
| DELETE | `/orders/:id` | Delete order |
| GET | `/orders/status/:status` | Orders by status |
| GET | `/orders/customer/:customerId` | Customer orders |
| GET | `/orders/agent/:agentId` | Agent orders |
| POST | `/orders/:id/accept` | Accept order |
| POST | `/orders/:id/reject` | Reject order |
| POST | `/orders/:id/cancel` | Cancel order |
| GET | `/orders/:id/history` | Status history |
| POST | `/orders/:id/assign-kitchen` | Assign kitchen staff |
| POST | `/orders/:id/mark-ready` | Mark ready |
| POST | `/orders/:id/assign-driver` | Assign driver |
| POST | `/orders/:id/start-delivery` | Start delivery |
| POST | `/orders/:id/mark-delivered` | Mark delivered |
| POST | `/orders/:id/upload-image` | Upload delivery image |
| GET | `/orders/:id/images` | Get order images |
| DELETE | `/orders/:id/images/:imageId` | Delete image |
| POST/PUT/GET | `/orders/:id/greeting` | Greeting card |

### Custom Orders  `/custom-orders`
| Method | Route | Description |
|---|---|---|
| GET/POST | `/custom-orders` | List / create |
| GET/PUT/DELETE | `/custom-orders/:id` | Manage single |
| POST | `/custom-orders/:id/approve` | Approve |
| POST | `/custom-orders/:id/reject` | Reject |
| POST | `/custom-orders/:id/convert-to-order` | Convert |

### Kitchen  `/kitchen`
| Method | Route | Description |
|---|---|---|
| GET | `/kitchen/orders/pending` | Pending orders |
| GET | `/kitchen/orders/processing` | In-progress |
| GET | `/kitchen/orders/completed` | Completed |
| POST | `/kitchen/:orderId/start-processing` | Start |
| POST | `/kitchen/:orderId/complete` | Complete |
| POST | `/kitchen/:orderId/reassign` | Reassign staff |
| GET | `/kitchen/report/day|week|month` | Reports |

### Delivery  `/delivery`, `/delivery-slots`
| Method | Route | Description |
|---|---|---|
| GET | `/delivery/pending` | Pending deliveries |
| GET | `/delivery/ready-for-pickup` | Ready for pickup |
| POST | `/delivery/:orderId/assign-driver` | Assign driver |
| POST | `/delivery/:orderId/on-way` | Mark on-way |
| POST | `/delivery/:orderId/delivered` | Mark delivered |
| GET | `/delivery/report` | Delivery report |
| GET/POST | `/delivery-slots` | List / create slots |
| PUT/DELETE | `/delivery-slots/:id` | Manage slots |

### Drivers  `/drivers`
| Method | Route | Description |
|---|---|---|
| GET | `/drivers` | All drivers |
| GET | `/drivers/available` | Available drivers |
| GET | `/drivers/:id/dashboard` | Driver dashboard |
| GET | `/drivers/:id/assigned` | Assigned orders |
| GET | `/drivers/:id/completed` | Completed orders |
| POST | `/drivers/:orderId/delivered` | Mark delivered |
| POST | `/drivers/:orderId/accept` | Accept order |
| POST | `/drivers/:orderId/reject` | Reject order |

### Products, Variants, Flavors, Addons
| Method | Route | Description |
|---|---|---|
| GET/POST | `/products` | List / create |
| GET/PUT/DELETE | `/products/:id` | Manage |
| GET | `/products/category/:categoryId` | By category |
| POST | `/products/:id/link-category` | Link category |
| DELETE | `/products/:id/unlink-category/:catId` | Unlink |
| GET | `/products/:id/variants` | Product variants |
| GET/POST | `/variants/:productId` | Variants |
| GET/POST | `/flavors/:variantId` | Flavors |
| GET/POST | `/addons` | Addons |
| GET | `/addons/predefined` | Predefined addons |

### Combos  `/combos`
| Method | Route | Description |
|---|---|---|
| GET/POST | `/combos` | List / create |
| GET/PUT/DELETE | `/combos/:id` | Manage |
| POST | `/combos/:id/add-product` | Add product |
| DELETE | `/combos/:id/remove-product` | Remove product |
| GET | `/combos/:id/items` | Combo items |
| GET | `/combos/:id/price-preview` | Price preview |

### Promotions & Promo Codes
| Method | Route | Description |
|---|---|---|
| GET/POST | `/promotions` | List / create |
| POST | `/promotions/:id/activate` | Activate |
| POST | `/promotions/:id/deactivate` | Deactivate |
| POST | `/promotions/:id/add-free-item` | Add free item |
| GET/POST | `/promos` | Promo codes |
| POST | `/promos/:code/validate` | Validate code |

### Areas  `/areas`
All CRUD + `/areas/:id/set-charge`, `/areas/:id/set-min-order`, `/areas/:id/orders`

### Loyalty  `/loyalty-config`, `/loyalty-points`, `/loyalty/ledger`
Config management, point earning/redemption, full ledger.

### Inventory, Materials, Purchases, Suppliers
Full CRUD for raw materials and suppliers. Inventory updates on purchase. Consumption tracking.

### Finance
- **Expenses**: `/expenses` — CRUD + report
- **Cash Drawer**: `/cash-drawer` — balance, add, deposit, withdraw, statement, audit, daily summary
- **Bank**: `/bank` — balance, deposit, withdraw, statement, reconciliation

### Dashboard  `/dashboard`
Role-specific dashboards: owner, manager, sales-agent, delivery-agent, driver, kitchen, customer. Includes chart endpoints for sales, orders, revenue, payment methods.

### Reports  `/reports`
Orders, sales, revenue, delivery, loyalty, inventory, cash-flow, expense reports. CSV export endpoints for orders, sales, customers, delivery.

### Notifications, Audit, Brands, Partners, Settlements
Full CRUD + reporting for each module.

### Payments & Invoices
Stripe checkout session creation, verification, manual mark-paid, invoice download and WhatsApp share.

---

## Order Status Flow

```
PENDING → ACCEPTED → PROCESSING → READY → OUT_FOR_DELIVERY → DELIVERED
       ↘ REJECTED
       ↘ CANCELLED (at any stage before delivery)
```

---

## Adding a Migration

```bash
flask db migrate -m "describe your change"
flask db upgrade
```

---

## Notes

- All protected routes require `Authorization: Bearer <token>` header.
- Role enforcement uses `@role_required([...])` decorator in middleware/role.py.
- Images are stored on Cloudinary; only URLs are saved in the database.
- WhatsApp routes (`/whatsapp/*`) are stubs — wire up your n8n webhook or WhatsApp Business API in `misc_routes.py`.
- Partner order tracking requires adding a `partner_id` FK to the Order model if needed.
