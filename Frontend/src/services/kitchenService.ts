import { api } from "./api";

export interface KitchenOrderItem {
  id: number;
  quantity: number;
  price: number;
  line_total?: number;
  custom_json?: Record<string, any>;
  product?: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
  };
}

export interface KitchenOrder {
  id: number;
  order_number?: string;
  status: string;
  order_type?: string;
  created_at: string;

  items?: KitchenOrderItem[];

  delivery_notes?: string;
  delivery_date?: string;
  delivery_time_slot?: string;
  preparation_started_by?: number | null;
  preparation_started_at?: string | null;

  completed_by_kitchen_at?: string | null;

  kitchen_staff_id?: number | null;
  kitchen_assigned_by?: number | null;
  kitchen_assigned_at?: string | null;

  delivery_agent_id?: number | null;
}

export interface KitchenReport {
  period_days: number;
  total_completed: number;
  orders: KitchenOrder[];
}

export const getKitchenPending = async (): Promise<KitchenOrder[]> => {
  const res = await api.get("/kitchen/orders/pending");
  return res.data.orders;
};

/** GET /kitchen/orders/processing  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF)
 *  Orders with status PREPARING. */
export const getKitchenProcessing = async (): Promise<KitchenOrder[]> => {
  const res = await api.get("/kitchen/orders/processing");
  return res.data.orders;
};

/** GET /kitchen/orders/completed  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF)
 *  Every order the kitchen has ever finished (completed_by_kitchen_at is
 *  set), across ALL kitchen staff — not scoped to the caller. Filter
 *  client-side by `preparation_started_by` if you only want "my"
 *  completed orders (see filterMyCompletedOrders below). */
export const getKitchenCompleted = async (): Promise<KitchenOrder[]> => {
  const res = await api.get("/kitchen/orders/completed");
  return res.data.orders;
};

/** GET /kitchen/assigned-orders  (KITCHEN_STAFF)
 *  Combined ASSIGNED_TO_KITCHEN + PREPARING orders in one call. */
export const getKitchenAssignedOrders = async (): Promise<KitchenOrder[]> => {
  const res = await api.get("/kitchen/assigned-orders");
  return res.data.orders;
};

/** GET /kitchen/:order_id/details  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const getKitchenOrderDetails = async (orderId: number): Promise<KitchenOrder> => {
  const res = await api.get(`/kitchen/${orderId}/details`);
  return res.data.order;
};

/* ============================================================
   Actions
============================================================ */

/** POST /kitchen/:order_id/start-processing  (KITCHEN_STAFF only)
 *  Order must be ASSIGNED_TO_KITCHEN. Backend stamps
 *  preparation_started_by / preparation_started_at from the JWT and
 *  flips status -> PREPARING. */
export const startProcessing = async (orderId: number): Promise<KitchenOrder> => {
  const res = await api.post(`/kitchen/${orderId}/start-processing`);
  return res.data.order;
};

/** POST /kitchen/:order_id/complete  (KITCHEN_STAFF only)
 *  Order must be PREPARING. Backend stamps completed_by_kitchen_at,
 *  auto-assigns a delivery agent, and flips status -> ASSIGNED_TO_AGENT. */
export const completeKitchenOrder = async (orderId: number): Promise<KitchenOrder> => {
  const res = await api.post(`/kitchen/${orderId}/complete`);
  return res.data.order;
};

/** POST /kitchen/:order_id/reassign  (ADMIN | SHOP_MANAGER) */
export const reassignKitchenOrder = async (
  orderId: number,
  kitchenStaffId: number
): Promise<KitchenOrder> => {
  const res = await api.post(`/kitchen/${orderId}/reassign`, {
    kitchen_staff_id: kitchenStaffId,
  });
  return res.data.order;
};

/* ============================================================
   Reports
============================================================ */

/** GET /kitchen/report/day  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const getKitchenReportDay = async (): Promise<KitchenReport> => {
  const res = await api.get("/kitchen/report/day");
  return res.data;
};

/** GET /kitchen/report/week  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const getKitchenReportWeek = async (): Promise<KitchenReport> => {
  const res = await api.get("/kitchen/report/week");
  return res.data;
};

/** GET /kitchen/report/month  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const getKitchenReportMonth = async (): Promise<KitchenReport> => {
  const res = await api.get("/kitchen/report/month");
  return res.data;
};

/* ============================================================
   Client-side helper
   ------------------------------------------------------------
   /kitchen/orders/completed has no per-staff filter on the backend,
   so "my completed orders" is derived here by matching
   preparation_started_by against the logged-in kitchen staff's id.
============================================================ */

export const filterMyCompletedOrders = (
  orders: KitchenOrder[],
  currentUserId: number | null | undefined
): KitchenOrder[] => {
  if (!currentUserId) return [];
  return orders.filter((o) => o.preparation_started_by === currentUserId);
};


export const getMyCompletedKitchenOrders = async (): Promise<KitchenOrder[]> => {
  const res = await api.get("/kitchen/my-completed-orders");
  return res.data.orders;
};