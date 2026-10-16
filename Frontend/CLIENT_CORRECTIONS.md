# CakeNTake — Client correction release

Covers both client PDFs ("Request for App & Web" and "Sales Agent and Kitchen correction requests").

## Deploy
1. **Backend** – replace the `backend` folder (keep your live `.env`, it was not changed), `pip install -r requirements.txt`, restart.
   Migrations run automatically on start (`AUTO_INITIALIZE_DATABASE`). No new tables or columns — three old migrations were made idempotent so a fresh database now migrates cleanly.
2. **Frontend** – replace `frontend-web` (keep your `.env`), `npm install`, `npm run build`.
3. The mobile app code was not part of this delivery. App items are fixed on the server: the API now returns `ordered_products`, size, flavour, writing, area, address text, delivery date and image for every order, so the existing app screens get the data without an app update. Screens that show nothing until the app reads those fields need a small app change.

## Super Admin
- Phone numbers are checked and stored as +965XXXXXXXX (8 digits, Kuwait prefixes). Local numbers, double country codes and spaces are fixed automatically, and wrong numbers are rejected with a clear message.
- Custom-cake orders show under **Full Order Details › Ordered Products** with picture, size, flavour, shape and writing.
- Pickup orders can be accepted, go through the kitchen, become **Ready for Pickup**, and are closed with **Customer Collected** (with payment method).
- **Assign / Reassign Driver** and **Mark Delivered** are back in the order drawer.

## Sales Staff
- Custom-cake products are visible in order details.
- One shared receipt now shows Area, Customer Address, Delivery or Pickup Date and slot, every ordered item with image, size, flavour and writing, Order Notes, and totals.

## Kitchen
- New board with three tabs, all based on the **delivery date**:
  - **Pending** – placed but not started. Today by default; switch on "All delivery dates" to see everything, grouped by date.
  - **Active** – Me or All, for the selected date.
  - **Completed** – Me or All, for the selected date.
- Tab counts match the cards shown, which fixes "Pending 6 but shows 2".
- Cake size is shown for menu cakes and custom cakes. The cake message is shown as **Writing** and no longer appears in the address Delivery Notes.

## Shop Manager (Inspect)
- Custom-cake section shows pictures and details.
- **Assign Driver** is available on ready delivery orders, not only Cancel.

## Driver
- Order details show only cake picture, name, quantity and price.
- After Accept, sending the proof (photo optional) completes the order as **Delivered**. **Mark Delivered** also works from On the way.

## Agent
- Exclusive-menu images, variants and flavours load correctly.
- Agent orders are **CREDIT** (no more "PICK UP – LINK") and are settled later.
- New **My Payments** screen: see unpaid orders, select one or more, then pay with one KNET link (QR code or open link). Paid history is also shown.
- The 10% agent discount applies to normal menu items only, not to exclusive items. This is enforced on the server too.
- Create order is a simple flow: select item › variant › flavour › **Place Order**. There is no "Order created" popup: the page moves straight to Orders and highlights the new order.
- "Notes" is renamed **ORDER NOTES**.
- Orders screen: **View details** and **Print receipt** on every order, plus shortcuts to New order and My Payments.
- Addresses: clear **Edit** and **Delete** buttons on each saved address (Delivery section of Create Order).

## UI
- Pistachio styling and motion: page fade transitions, animated tabs, card entrance, hover lift, new-order glow, focus rings, reduced-motion support.
