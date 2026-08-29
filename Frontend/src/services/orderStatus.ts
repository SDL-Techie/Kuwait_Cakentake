/**
 * Maps the many internal backend order statuses down to the
 * 6 customer-facing stages that should ever be shown in the UI:
 *   1. Order Placed (PENDING)
 *   2. Accepted
 *   3. Kitchen Assigned - Processing
 *   4. Ready
 *   5. Out for Delivery (agent + driver assigned)
 *   6. Delivered
 *
 * This is a display-only mapping — it does not change any
 * backend behavior or order logic.
 */

export interface CustomerStage {
  key: string;
  label: string;
}

export const CUSTOMER_ORDER_STAGES: CustomerStage[] = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'KITCHEN_PROCESSING', label: 'Kitchen Assigned - Processing' },
  { key: 'READY', label: 'Ready' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

// Raw backend status -> index into CUSTOMER_ORDER_STAGES
const STATUS_STAGE_MAP: Record<string, number> = {
  PENDING: 0,

  ACCEPTED: 1,
  ASSIGNED_TO_KITCHEN: 1, // accept + kitchen assignment happen together on the backend

  PREPARING: 2,

  READY: 3,
  ASSIGNED_TO_AGENT: 3, // kitchen "ready" auto-assigns a delivery agent on the backend

  ASSIGNED_TO_DRIVER: 4,
  DRIVER_ACCEPTED: 4,
  OUT_FOR_DELIVERY: 4,
  DELIVERY_SUBMITTED: 4,

  DELIVERED: 5,
};

/** Returns the customer-facing stage index (0-5) for a raw backend status, or -1 if not part of the normal flow (e.g. CANCELLED, REJECTED). */
export const getCustomerStageIndex = (status?: string): number => {
  const s = (status || '').trim().toUpperCase();
  return s in STATUS_STAGE_MAP ? STATUS_STAGE_MAP[s] : -1;
};

/** Returns the friendly label to display anywhere a status badge is shown. */
export const getCustomerStatusLabel = (status?: string): string => {
  const s = (status || '').trim().toUpperCase();
  const idx = getCustomerStageIndex(s);
  if (idx !== -1) return CUSTOMER_ORDER_STAGES[idx].label;

  if (s === 'CANCELLED') return 'Cancelled';
  if (s === 'REJECTED') return 'Rejected';
  if (s === 'PICKUP_READY') return 'Ready for Pickup';

  return s ? s.replace(/_/g, ' ') : 'Pending';
};

// Stage index at which the order is considered "accepted" (used for cancel-eligibility)
export const ACCEPTED_STAGE_INDEX = 1;