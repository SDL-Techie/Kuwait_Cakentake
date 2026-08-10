import { api } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY SERVICE
// All URLs match backend/routes/delivery_routes.py
// Used by DeliveryOrder.tsx (the Delivery Agent's dashboard)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /delivery/pending
 * Orders that are READY (kitchen done, not yet assigned to any agent).
 * Role: ADMIN | SHOP_MANAGER | DELIVERY_AGENT
 */
export const getDeliveryPending = async (): Promise<any[]> => {
  const res = await api.get('/delivery/pending');
  return res.data?.orders ?? [];
};

/**
 * GET /delivery/assigned
 * Orders where a delivery agent has been assigned but no driver picked yet.
 * Status: ASSIGNED_TO_AGENT
 * Role: ADMIN | SHOP_MANAGER | DELIVERY_AGENT (sees only their own)
 */
export const getDeliveryAssigned = async (): Promise<any[]> => {
  const res = await api.get('/delivery/assigned');
  return res.data?.orders ?? [];
};

/**
 * GET /delivery/ready-for-pickup
 * Orders where a driver has been assigned by the delivery agent.
 * Status: ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
 * Role: ADMIN | SHOP_MANAGER | DELIVERY_AGENT (sees only their own)
 */
export const getDeliveryReady = async (): Promise<any[]> => {
  const res = await api.get('/delivery/ready-for-pickup');
  return res.data?.orders ?? [];
};

/**
 * GET /delivery/proof-pending
 * Orders where driver has submitted delivery proof, agent needs to confirm.
 * Status: DELIVERY_SUBMITTED
 * Role: ADMIN | SHOP_MANAGER | DELIVERY_AGENT (sees only their own)
 */
export const getDeliveryProofPending = async (): Promise<any[]> => {
  const res = await api.get('/delivery/proof-pending');
  return res.data?.orders ?? [];
};

/**
 * GET /delivery/delivered
 * Orders confirmed as fully delivered.
 * Status: DELIVERED
 * Role: ADMIN | SHOP_MANAGER | DELIVERY_AGENT (sees only their own)
 */
export const getDeliveryDelivered = async (): Promise<any[]> => {
  const res = await api.get('/delivery/delivered');
  return res.data?.orders ?? [];
};

// ─── Delivery Agent Dashboard ─────────────────────────────────────────────────

/**
 * GET /delivery-agents/:agent_id/dashboard
 * Summary stats for the delivery agent's dashboard header.
 */
export const getAgentDashboard = async (agentId: number): Promise<any> => {
  const res = await api.get(`/delivery-agents/${agentId}/dashboard`);
  return res.data;
};

/**
 * GET /delivery-agents/:agent_id/orders
 * All orders ever assigned to this delivery agent.
 * Role: ADMIN | SHOP_MANAGER | DELIVERY_AGENT
 */
export const getAgentOrders = async (agentId: number): Promise<any[]> => {
  const res = await api.get(`/delivery-agents/${agentId}/orders`);
  return res.data?.orders ?? [];
};

// ─── Delivery Slots ───────────────────────────────────────────────────────────

export interface DeliverySlot {
  id: number;
  label: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  is_active: boolean;
}

export interface CreateSlotPayload {
  label: string;
  start_time: string;
  end_time: string;
  max_orders?: number;
}

/** GET /delivery-slots */
export const getDeliverySlots = async (): Promise<DeliverySlot[]> => {
  const res = await api.get('/delivery-slots');
  return res.data?.slots ?? [];
};

/** POST /delivery-slots  (ADMIN | SHOP_MANAGER) */
export const createDeliverySlot = async (payload: CreateSlotPayload): Promise<DeliverySlot> => {
  const res = await api.post('/delivery-slots', payload);
  return res.data.slot;
};

/** PUT /delivery-slots/:slot_id  (ADMIN | SHOP_MANAGER) */
export const updateDeliverySlot = async (
  slotId: number,
  payload: Partial<DeliverySlot>
): Promise<DeliverySlot> => {
  const res = await api.put(`/delivery-slots/${slotId}`, payload);
  return res.data.slot;
};

/** DELETE /delivery-slots/:slot_id  (ADMIN | SHOP_MANAGER) */
export const deleteDeliverySlot = async (slotId: number): Promise<void> => {
  await api.delete(`/delivery-slots/${slotId}`);
};