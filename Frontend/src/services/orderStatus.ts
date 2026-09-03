// /**
//  * Maps the many internal backend order statuses down to the
//  * 6 customer-facing stages that should ever be shown in the UI:
//  *   1. Order Placed (PENDING)
//  *   2. Accepted
//  *   3. Kitchen Assigned - Processing
//  *   4. Ready
//  *   5. Out for Delivery (agent + driver assigned)
//  *   6. Delivered
//  *
//  * This is a display-only mapping — it does not change any
//  * backend behavior or order logic.
//  */

// export interface CustomerStage {
//   key: string;
//   label: string;
// }

// export const CUSTOMER_ORDER_STAGES: CustomerStage[] = [
//   { key: 'PENDING', label: 'Order Placed' },
//   { key: 'ACCEPTED', label: 'Accepted' },
//   { key: 'KITCHEN_PROCESSING', label: 'Kitchen Assigned - Processing' },
//   { key: 'READY', label: 'Ready' },
//   { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
//   { key: 'DELIVERED', label: 'Delivered' },
// ];

// // Raw backend status -> index into CUSTOMER_ORDER_STAGES
// const STATUS_STAGE_MAP: Record<string, number> = {
//   PENDING: 0,

//   ACCEPTED: 1,
//   ASSIGNED_TO_KITCHEN: 1, // accept + kitchen assignment happen together on the backend

//   PREPARING: 2,

//   READY: 3,
//   ASSIGNED_TO_AGENT: 3, // kitchen "ready" auto-assigns a delivery agent on the backend

//   ASSIGNED_TO_DRIVER: 4,
//   DRIVER_ACCEPTED: 4,
//   OUT_FOR_DELIVERY: 4,
//   DELIVERY_SUBMITTED: 4,

//   DELIVERED: 5,
// };

// /** Returns the customer-facing stage index (0-5) for a raw backend status, or -1 if not part of the normal flow (e.g. CANCELLED, REJECTED). */
// export const getCustomerStageIndex = (status?: string): number => {
//   const s = (status || '').trim().toUpperCase();
//   return s in STATUS_STAGE_MAP ? STATUS_STAGE_MAP[s] : -1;
// };

// /** Returns the friendly label to display anywhere a status badge is shown. */
// export const getCustomerStatusLabel = (status?: string): string => {
//   const s = (status || '').trim().toUpperCase();
//   const idx = getCustomerStageIndex(s);
//   if (idx !== -1) return CUSTOMER_ORDER_STAGES[idx].label;

//   if (s === 'CANCELLED') return 'Cancelled';
//   if (s === 'REJECTED') return 'Rejected';
//   if (s === 'PICKUP_READY') return 'Ready for Pickup';

//   return s ? s.replace(/_/g, ' ') : 'Pending';
// };

// // Stage index at which the order is considered "accepted" (used for cancel-eligibility)
// export const ACCEPTED_STAGE_INDEX = 1;



/**
 * Maps the many internal backend order statuses down to the small set of
 * customer-facing stages that should ever be shown in the UI.
 *
 * Delivery orders see 6 stages:
 *   1. Order Placed (PENDING)
 *   2. Accepted
 *   3. Processing
 *   4. Ready
 *   5. Out for Delivery (driver has accepted the delivery)
 *   6. Delivered
 *
 * Pickup orders skip the delivery-agent/driver steps entirely — there's no
 * driver to assign — so they see 5 stages instead, ending at pickup:
 *   1. Order Placed (PENDING)
 *   2. Accepted
 *   3. Processing
 *   4. Ready for Pickup
 *   5. Picked Up
 *
 * This is a display-only mapping — it does not change any backend
 * behavior or order logic.
 */

export interface CustomerStage {
  key: string;
  label: string;
}

export const CUSTOMER_ORDER_STAGES: CustomerStage[] = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'READY', label: 'Ready' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const CUSTOMER_ORDER_STAGES_PICKUP: CustomerStage[] = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'READY', label: 'Ready for Pickup' },
  { key: 'DELIVERED', label: 'Picked Up' },
];

// Raw backend status -> index into CUSTOMER_ORDER_STAGES (delivery orders)
const STATUS_STAGE_MAP: Record<string, number> = {
  PENDING: 0,

  ACCEPTED: 1,
  ASSIGNED_TO_KITCHEN: 1, // accept + kitchen assignment happen together on the backend

  PREPARING: 2,

  READY: 3,
  ASSIGNED_TO_AGENT: 3,   // kitchen "ready" auto-assigns a delivery agent on the backend
  ASSIGNED_TO_DRIVER: 3,  // agent picked a driver, but the driver hasn't accepted yet — still "Ready" to the customer

  DRIVER_ACCEPTED: 4,     // driver accepted -> now genuinely out for delivery
  OUT_FOR_DELIVERY: 4,
  DELIVERY_SUBMITTED: 4,

  DELIVERED: 5,
};

// Raw backend status -> index into CUSTOMER_ORDER_STAGES_PICKUP (pickup orders)
// Pickup orders never involve a delivery agent or driver, so every
// delivery-assignment status still just reads as "Ready for Pickup".
const STATUS_STAGE_MAP_PICKUP: Record<string, number> = {
  PENDING: 0,

  ACCEPTED: 1,
  ASSIGNED_TO_KITCHEN: 1,

  PREPARING: 2,

  READY: 3,
  ASSIGNED_TO_AGENT: 3,
  ASSIGNED_TO_DRIVER: 3,
  DRIVER_ACCEPTED: 3,
  OUT_FOR_DELIVERY: 3,
  DELIVERY_SUBMITTED: 3,

  DELIVERED: 4,
};

/** Returns the ordered list of customer-facing stages for this order type. */
export const getCustomerStages = (isPickup?: boolean): CustomerStage[] =>
  isPickup ? CUSTOMER_ORDER_STAGES_PICKUP : CUSTOMER_ORDER_STAGES;

/** Returns the customer-facing stage index for a raw backend status, or -1 if not part of the normal flow (e.g. CANCELLED, REJECTED). */
export const getCustomerStageIndex = (status?: string, isPickup?: boolean): number => {
  const s = (status || '').trim().toUpperCase();
  const map = isPickup ? STATUS_STAGE_MAP_PICKUP : STATUS_STAGE_MAP;
  return s in map ? map[s] : -1;
};

/** Returns the friendly label to display anywhere a status badge is shown. */
export const getCustomerStatusLabel = (status?: string, isPickup?: boolean): string => {
  const s = (status || '').trim().toUpperCase();
  const idx = getCustomerStageIndex(s, isPickup);
  if (idx !== -1) return getCustomerStages(isPickup)[idx].label;

  if (s === 'CANCELLED') return 'Cancelled';
  if (s === 'REJECTED') return 'Rejected';
  if (s === 'PICKUP_READY') return 'Ready for Pickup';

  return s ? s.replace(/_/g, ' ') : 'Pending';
};

// Stage index at which the order is considered "accepted" (used for cancel-eligibility).
// Index 1 = 'Accepted' in both the delivery and pickup stage lists.
export const ACCEPTED_STAGE_INDEX = 1;