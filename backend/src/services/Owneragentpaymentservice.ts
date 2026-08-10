import { api } from "./api";
import { getAgents, Agent } from "./agentService";
import { getOrders } from "./orderService"; // adjust path — this is your real, existing order service (document 13)

// ─────────────────────────────────────────────────────────────────────────
// WHY THIS CHANGED
// ─────────────────────────────────────────────────────────────────────────
// `/owner/agent-orders` (the previous getOwnerAgentOrders implementation)
// 404s because that route was never built on the backend — confirmed by
// your Flask access log:
//   GET /owner/agent-orders HTTP/1.1" 404
//
// `GET /orders` (order_service.ts → getOrders()) is a real, already-working
// endpoint. It's role-scoped, so an ADMIN/SHOP_MANAGER hitting it already
// gets every order in the system — including agent-created ones. So instead
// of waiting on a new backend route, we reuse it: fetch everything, keep
// only order_type === "agent_order", and enrich each order with the
// agent's name by matching created_by against the agents list.
//
// `updateOrdersPaymentStatus` (PATCH /owner/orders/payment-status) is a
// DIFFERENT problem: no endpoint in order_service.ts sets payment_status
// directly (acceptOrder only sets it as a side effect of accepting COD/UPI
// orders). That route genuinely doesn't exist yet and still needs to be
// built on the backend — this file keeps it as a clearly-marked placeholder.
// ─────────────────────────────────────────────────────────────────────────

export { getAgents };
export type { Agent };

export type PaymentStatus = "PENDING" | "PAID";

export interface OwnerAgentOrderItem {
  product_name?: string;
  quantity: number;
  price: number;
  line_total: number;
}

export interface OwnerAgentOrder {
  id: number;
  order_number: string;
  agent_id: number;
  agent_name: string;
  customer_name: string;
  customer_phone: string;
  address?: string | null;
  created_at: string;
  delivery_date?: string | null;
  items?: OwnerAgentOrderItem[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  grand_total: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method: string;
  status: string; // order/delivery/kitchen status — display only, never edited here
  notes?: string | null;
}

export interface OwnerAgentOrdersFilters {
  agent_id?: number;
  payment_status?: "PENDING" | "PAID"; // omit for "ALL"
  date_from?: string; // "YYYY-MM-DD"
  date_to?: string; // "YYYY-MM-DD"
  search?: string;
}

/**
 * Resolves both the numeric agent id and a display name from a raw order's
 * `created_by` field, which may come back either as a plain integer FK
 * (`created_by: 5`) or as a nested object (`created_by: { id: 5, first_name,
 * last_name, ... }`) depending on how the backend serializer is written.
 * Handling both shapes here is what fixes the "[object Object]" group
 * labels — those happened because `agentsById.get(rawObjectRef)` always
 * misses (a Map<number, Agent> can't be looked up with an object key), so
 * it fell through to stringifying the object itself.
 */
function resolveAgent(
  raw: any,
  agentsById: Map<number, Agent>
): { agentId: number; agentName: string } {
  const rawCreatedBy = raw.created_by;
  const isNested = rawCreatedBy && typeof rawCreatedBy === "object";

  const agentId = Number(isNested ? rawCreatedBy.id : rawCreatedBy);
  const known = Number.isFinite(agentId) ? agentsById.get(agentId) : undefined;

  const embeddedName = isNested
    ? `${rawCreatedBy.first_name ?? ""} ${rawCreatedBy.last_name ?? ""}`.trim()
    : "";

  const agentName =
    (known && `${known.first_name} ${known.last_name}`.trim()) ||
    embeddedName ||
    (Number.isFinite(agentId) ? `Agent #${agentId}` : "Unknown Agent");

  return { agentId, agentName };
}

/**
 * Maps a raw Order.to_dict() record (shape unknown to us exactly — accessed
 * defensively) into the OwnerAgentOrder shape the UI expects. Adjust field
 * names on the left if your actual Order serializer differs.
 */
function mapRawOrder(raw: any, agentsById: Map<number, Agent>): OwnerAgentOrder {
  const { agentId, agentName } = resolveAgent(raw, agentsById);

  return {
    id: raw.id,
    order_number: raw.order_number,
    agent_id: agentId,
    agent_name: agentName,
    customer_name: raw.customer_name,
    customer_phone: raw.customer_phone,
    address: raw.address ?? raw.address_text ?? null,
    created_at: raw.created_at,
    delivery_date: raw.delivery_date ?? null,
    items: raw.items ?? raw.order_items ?? [],
    subtotal: Number(raw.subtotal || 0),
    discount: Number(raw.discount || 0),
    delivery_charge: Number(raw.delivery_charge || 0),
    grand_total: Number(raw.grand_total ?? raw.total ?? 0),
    currency: raw.currency || "KWD",
    payment_status: (raw.payment_status || "PENDING").toUpperCase() as PaymentStatus,
    payment_method: raw.payment_method,
    status: raw.status,
    notes: raw.notes ?? raw.greeting_message ?? null,
  };
}

function matchesFilters(order: OwnerAgentOrder, filters: OwnerAgentOrdersFilters): boolean {
  if (filters.agent_id && order.agent_id !== filters.agent_id) return false;
  if (filters.payment_status && order.payment_status !== filters.payment_status) return false;

  if (filters.date_from) {
    const from = new Date(filters.date_from);
    const created = new Date(order.created_at);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(created.getTime()) && created < from) return false;
  }

  if (filters.date_to) {
    const to = new Date(filters.date_to);
    to.setHours(23, 59, 59, 999);
    const created = new Date(order.created_at);
    if (!Number.isNaN(to.getTime()) && !Number.isNaN(created.getTime()) && created > to) return false;
  }

  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    if (q) {
      const haystack = `${order.order_number} ${order.customer_name} ${order.customer_phone}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
  }

  return true;
}

/**
 * Fetches all orders via the real GET /orders endpoint, keeps only
 * agent-created orders (order_type === "agent_order"), enriches each with
 * the agent's name, and applies filters client-side (getOrders() doesn't
 * accept query params).
 *
 * `agentsById` should be built once from getAgents() and reused across
 * calls to avoid refetching agents on every filter change — see
 * AgentPayment.tsx for the calling pattern.
 */
export const getOwnerAgentOrders = async (
  agentsById: Map<number, Agent>,
  filters: OwnerAgentOrdersFilters = {}
): Promise<OwnerAgentOrder[]> => {
  const rawOrders = await getOrders();

  const agentOrders = (rawOrders || [])
    .filter((o: any) => o.order_type === "agent_order")
    .map((o: any) => mapRawOrder(o, agentsById));

  return agentOrders.filter((o) => matchesFilters(o, filters));
};

// ─────────────────────────────────────────────────────────────────────────
// STILL A PLACEHOLDER — no backend route exists for this yet.
// Matches the spec's "Future Backend API" section exactly:
//   PATCH /owner/orders/payment-status
//   { order_ids: number[], payment_status: "PAID" }
// Build this route server-side (bulk-update payment_status only, leave
// order_status/delivery_status/kitchen_status untouched) before wiring
// the "Mark Selected as Paid" button up for real.
// ─────────────────────────────────────────────────────────────────────────
export const updateOrdersPaymentStatus = async (
  orderIds: number[],
  paymentStatus: PaymentStatus
): Promise<void> => {
  await api.patch("/owner/orders/payment-status", {
    order_ids: orderIds,
    payment_status: paymentStatus,
  });
};