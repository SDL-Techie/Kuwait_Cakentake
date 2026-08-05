import { api } from './api';

/* ─────────────────────────────────────────────────────────────────────────
   TYPES
   These mirror Order.to_dict() / OrderItem.to_dict() from the Flask backend.
───────────────────────────────────────────────────────────────────────── */

export interface SalesAgentOrderItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    price: number;
  } | null;
  quantity: number;
  price: number;
  line_total: number;
  custom_json?: any;
}

export type OrderStatus =
  | 'PENDING' | 'ACCEPTED' | 'ASSIGNED_TO_KITCHEN' | 'PREPARING' | 'READY'
  | 'ASSIGNED_TO_AGENT' | 'ASSIGNED_TO_DRIVER' | 'DRIVER_ACCEPTED'
  | 'OUT_FOR_DELIVERY' | 'DELIVERY_SUBMITTED' | 'DELIVERED'
  | 'REJECTED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface SalesAgentOrder {
  id: number;
  order_number: string;
  order_type: string;
  customer: {
    id: number; first_name: string; last_name: string; name: string;
    email?: string; phone_no?: string; role?: string;
  } | null;
  status: OrderStatus;
  rejection_reason?: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  total: number;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  grand_total: number;
  loyalty_coupon?: string | null;
  currency: string;
  delivery_address?: {
    id: number; street: string; city: string; state?: string;
    pincode: string; country?: string;
  } | null;
  delivery_date?: string | null;
  delivery_time_slot?: string | null;
  greeting_message?: string | null;
  greeting_from?: string | null;
  greeting_to?: string | null;
  created_at: string;
  updated_at: string;
  items: SalesAgentOrderItem[];
  // Present once the backend exposes it on Order.to_dict() — see note below.
  created_by?: number | null;
  creator?: { id: number; name: string } | null;
  // Fields specific to sales-agent-created orders (custom_json on the order
  // or dedicated columns, depending on how you wire it up backend-side).
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  payment_link_sent_at?: string | null;
  payment_link_url?: string | null;
}

export interface SalesAgentDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  pendingPaymentOrders: number;
  confirmedToday: number;
  confirmedWeek: number;
  confirmedMonth: number;
}

export interface CreateSalesAgentOrderPayload {
  address_id: number;
  delivery_area_id: number;
  items: { product_id: number; quantity: number; custom_json?: any }[];
  delivery_date?: string;
  delivery_time_slot?: string;
  payment_method?: string;
  order_type?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  created_by_sales_agent: number;
  [key: string]: any;
}

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────── */

const CONFIRMED_STATUSES: OrderStatus[] = [
  'ACCEPTED', 'ASSIGNED_TO_KITCHEN', 'PREPARING', 'READY',
  'ASSIGNED_TO_AGENT', 'ASSIGNED_TO_DRIVER', 'DRIVER_ACCEPTED',
  'OUT_FOR_DELIVERY', 'DELIVERY_SUBMITTED', 'DELIVERED',
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0 = Sunday
  const diff = new Date(d);
  diff.setDate(d.getDate() - day);
  diff.setHours(0, 0, 0, 0);
  return diff;
};

const getCurrentUser = (): { id: number; role?: string; name?: string } => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return { id: 0 }; }
};

/* ─────────────────────────────────────────────────────────────────────────
   ORDERS — scoped to the logged-in sales agent
───────────────────────────────────────────────────────────────────────── */

/**
 * GET /orders, filtered client-side to orders this sales agent created.
 *
 * NOTE: this relies on `created_by` (or `creator.id`) being present in
 * Order.to_dict(). It currently is not — add this to order.py:
 *
 *   "created_by": self.created_by,
 *   "creator": self._user_brief(self.creator),
 *
 * Until that lands, every sales agent will see every order rather than
 * just their own, since there's nothing to filter on.
 */
export const getSalesAgentOrders = async (agentId?: number): Promise<SalesAgentOrder[]> => {
  const id = agentId ?? getCurrentUser().id;
  const res = await api.get('/orders');
  const all: SalesAgentOrder[] = res.data?.orders ?? res.data ?? [];
  return all.filter(o => o.created_by === id || o.creator?.id === id);
};

export const getOrderById = async (orderId: number): Promise<SalesAgentOrder> => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

export const createSalesAgentOrder = async (
  payload: CreateSalesAgentOrderPayload
): Promise<SalesAgentOrder> => {
  const res = await api.post('/orders', payload);
  return res.data.order;
};

/**
 * PUT /orders/:id — currently role-gated to ADMIN / SHOP_MANAGER on the
 * backend (`@role_required(["ADMIN", "SHOP_MANAGER"])` in update_order).
 * Add "SALES_AGENT" to that list, scoped to orders they created, for this
 * to work from here.
 */
export const updateSalesAgentOrder = async (
  orderId: number,
  payload: Partial<CreateSalesAgentOrderPayload>
): Promise<SalesAgentOrder> => {
  const res = await api.put(`/orders/${orderId}`, payload);
  return res.data.order;
};

/**
 * DELETE /orders/:id — currently ADMIN-only on the backend. Sales agents
 * cancelling their own mistaken order should probably hit
 * POST /orders/:id/cancel instead (already SALES_AGENT-permitted), which
 * is what this falls back to below rather than a hard delete.
 */
export const deleteSalesAgentOrder = async (orderId: number, reason?: string): Promise<void> => {
  await api.post(`/orders/${orderId}/cancel`, { reason: reason ?? 'Cancelled by sales agent' });
};

/* ─────────────────────────────────────────────────────────────────────────
   PAYMENT LINK
   NOTE: no such endpoint exists yet in order_routes.py. Suggested route:
     POST /orders/:id/payment-link         -> generates + sends the link
     POST /orders/:id/payment-link/mark-paid -> flips payment_status
───────────────────────────────────────────────────────────────────────── */

export const sendPaymentLink = async (orderId: number): Promise<{ payment_link_url: string }> => {
  const res = await api.post(`/orders/${orderId}/payment-link`);
  return res.data;
};

export const markOrderPaid = async (orderId: number): Promise<SalesAgentOrder> => {
  const res = await api.post(`/orders/${orderId}/payment-link/mark-paid`);
  return res.data.order;
};

/* ─────────────────────────────────────────────────────────────────────────
   DASHBOARD — derived entirely from the real order list, no mock numbers
───────────────────────────────────────────────────────────────────────── */

export const getSalesAgentDashboard = async (
  agentId?: number
): Promise<{ stats: SalesAgentDashboardStats; orders: SalesAgentOrder[] }> => {
  const orders = await getSalesAgentOrders(agentId);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let pendingOrders = 0, confirmedOrders = 0, cancelledOrders = 0;
  let todayOrders = 0, weekOrders = 0, monthOrders = 0;
  let confirmedToday = 0, confirmedWeek = 0, confirmedMonth = 0;
  let pendingPaymentOrders = 0;

  for (const o of orders) {
    const created = new Date(o.created_at);
    const isConfirmed = CONFIRMED_STATUSES.includes(o.status);
    const isCancelled = o.status === 'CANCELLED' || o.status === 'REJECTED';
    const isPending = o.status === 'PENDING';

    if (isPending) pendingOrders++;
    if (isConfirmed) confirmedOrders++;
    if (isCancelled) cancelledOrders++;

    if (isSameDay(created, now)) todayOrders++;
    if (created >= weekStart) weekOrders++;
    if (created >= monthStart) monthOrders++;

    if (isConfirmed && isSameDay(created, now)) confirmedToday++;
    if (isConfirmed && created >= weekStart) confirmedWeek++;
    if (isConfirmed && created >= monthStart) confirmedMonth++;

    if (o.payment_method === 'UPI' && o.payment_status === 'PENDING') pendingPaymentOrders++;
  }

  return {
    stats: {
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingPaymentOrders,
      confirmedToday,
      confirmedWeek,
      confirmedMonth,
    },
    orders,
  };
};