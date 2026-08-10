import { api } from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// Types (mirroring routes/agent_routes.py response shapes)
// ─────────────────────────────────────────────────────────────────────────────

export interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  role: string;
  is_active: boolean;
  created_by: number | null;
  default_discount: number;
  created_at: string;
  [key: string]: any; // other User.to_dict() fields (currency_code, loyalty_points, etc.)
}

export interface AgentProduct {
  id: number;
  agent_id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  cloudinary_public_id: string | null;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface BakeryProduct {
  id: number;
  name: string;
  price: number;
  [key: string]: any; // rest of Product.to_dict(currency)
}

export interface AgentOrderItemInput {
  product_id: number;
  quantity: number;
  custom_json?: any;
}

export interface CreateAgentOrderPayload {
  customer_id: number; // required — used to validate the address belongs to this customer
  address_id: number;
  items: AgentOrderItemInput[];
  payment_method?: "COD" | "CARD" | "STRIPE" | "KNET" | "UPI" | "LINK";
  currency?: "INR" | "KWD" | "AED" | "USD" | "SAR" | "SGD";
  delivery_date?: string; // "YYYY-MM-DD"
  delivery_time_slot?: string;
  greeting_message?: string;
  greeting_from?: string;
  greeting_to?: string;
}

export interface AgentDashboard {
  agent: Agent;
  todays_orders: number;
  todays_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  recent_orders: any[];
}

export interface AgentCatalog {
  products: BakeryProduct[]; // normal bakery products (shared catalog)
  agent_products: AgentProduct[]; // this agent's own private products
}

// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Agent CRUD  (role: ADMIN / SHOP_MANAGER)
// ─────────────────────────────────────────────────────────────────────────────

export const createAgent = async (payload: {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
  default_discount?: number;
}): Promise<Agent> => {
  const res = await api.post("/owner/agents", payload);
  return res.data.agent;
};

export const getAgents = async (activeOnly?: boolean): Promise<Agent[]> => {
  const res = await api.get("/owner/agents", {
    params: activeOnly === undefined ? {} : { active: activeOnly ? "true" : "false" },
  });
  return res.data.agents ?? [];
};

export const getAgentById = async (agentId: number): Promise<Agent> => {
  const res = await api.get(`/owner/agents/${agentId}`);
  return res.data.agent;
};

export const updateAgent = async (
  agentId: number,
  payload: Partial<{
    first_name: string;
    last_name: string;
    phone_no: string;
    email: string;
    password: string;
  }>
): Promise<Agent> => {
  const res = await api.put(`/owner/agents/${agentId}`, payload);
  return res.data.agent;
};

export const deleteAgent = async (agentId: number): Promise<void> => {
  await api.delete(`/owner/agents/${agentId}`);
};

export const setAgentStatus = async (agentId: number, active: boolean): Promise<Agent> => {
  const res = await api.patch(`/owner/agents/${agentId}/status`, { active });
  return res.data.agent;
};

export const resetAgentPassword = async (agentId: number, password: string): Promise<void> => {
  await api.post(`/owner/agents/${agentId}/reset-password`, { password });
};

export const setAgentDiscount = async (
  agentId: number,
  default_discount: number
): Promise<Agent> => {
  const res = await api.patch(`/owner/agents/${agentId}/discount`, { default_discount });
  return res.data.agent;
};

// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Agent Products CRUD  (role: ADMIN / SHOP_MANAGER)
// Private, per-agent products — NOT part of the shared Product catalog.
// ─────────────────────────────────────────────────────────────────────────────

export const createAgentProduct = async (payload: {
  agent_id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  cloudinary_public_id?: string;
}): Promise<AgentProduct> => {
  const res = await api.post("/owner/agent-products", payload);
  return res.data.product;
};

// All agent products across every agent
export const getAllAgentProducts = async (): Promise<AgentProduct[]> => {
  const res = await api.get("/owner/agent-products");
  return res.data.products ?? [];
};

// Products belonging to one particular agent (owner view — includes inactive)
export const getAgentProductsForAgent = async (agentId: number): Promise<AgentProduct[]> => {
  const res = await api.get(`/owner/agents/${agentId}/products`);
  return res.data.products ?? [];
};

export const updateAgentProduct = async (
  productId: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    cloudinary_public_id: string;
    is_active: boolean;
  }>
): Promise<AgentProduct> => {
  const res = await api.put(`/owner/agent-products/${productId}`, payload);
  return res.data.product;
};

export const deleteAgentProduct = async (productId: number): Promise<void> => {
  await api.delete(`/owner/agent-products/${productId}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT: catalog / dashboard / orders  (role: AGENT)
// ─────────────────────────────────────────────────────────────────────────────

// Agent's own private products only (active)
export const getMyAgentProducts = async (): Promise<AgentProduct[]> => {
  const res = await api.get("/agent/my-products");
  return res.data.products ?? [];
};

// Source 1: normal bakery products, shared catalog, unfiltered by agent
export const getBakeryProductsForAgent = async (
  currency: string = "KWD"
): Promise<BakeryProduct[]> => {
  const res = await api.get("/agent/products", {
    headers: { "X-Currency": currency },
  });
  return res.data.products ?? [];
};

// Convenience: both sources in one call → { products, agent_products }
export const getAgentCatalog = async (currency: string = "KWD"): Promise<AgentCatalog> => {
  const res = await api.get("/agent/catalog", {
    headers: { "X-Currency": currency },
  });
  return res.data;
};

export const getAgentDashboard = async (): Promise<AgentDashboard> => {
  const res = await api.get("/agent/dashboard");
  return res.data;
};

export const getAgentOrders = async (status?: string): Promise<any[]> => {
  const res = await api.get("/agent/orders", {
    params: status ? { status } : {},
  });
  return res.data.orders ?? [];
};

export const getAgentOrderById = async (orderId: number): Promise<any> => {
  const res = await api.get(`/agent/orders/${orderId}`);
  return res.data.order;
};

export const createAgentOrder = async (payload: CreateAgentOrderPayload): Promise<any> => {
  const res = await api.post("/agent/orders", payload);
  return res.data.order;
};