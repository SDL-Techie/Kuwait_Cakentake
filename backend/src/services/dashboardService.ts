import { api } from "./api";

/** GET /dashboard/owner  (ADMIN) */
export const getOwnerDashboard = async (): Promise<any> => {
  const res = await api.get("/dashboard/owner");
  return res.data;
};

/** GET /dashboard/owner/cards  (ADMIN) */
export const getOwnerCards = async (): Promise<any> => {
  const res = await api.get("/dashboard/owner/cards");
  return res.data;
};

/** GET /dashboard/manager  (ADMIN | SHOP_MANAGER) */
export const getManagerDashboard = async (): Promise<any> => {
  const res = await api.get("/dashboard/manager");
  return res.data;
};

/** GET /dashboard/manager/cards  (ADMIN | SHOP_MANAGER) */
export const getManagerCards = async (): Promise<any> => {
  const res = await api.get("/dashboard/manager/cards");
  return res.data;
};

/** GET /dashboard/sales-agent/cards */
export const getSalesAgentCards = async (): Promise<any> => {
  const res = await api.get("/dashboard/sales-agent/cards");
  return res.data;
};

/** GET /dashboard/sales-agent/:agent_id */
export const getSalesAgentDashboard = async (agentId: number): Promise<any> => {
  const res = await api.get(`/dashboard/sales-agent/${agentId}`);
  return res.data;
};

/** GET /dashboard/delivery-agent/:agent_id */
export const getDeliveryAgentDashboard = async (agentId: number): Promise<any> => {
  const res = await api.get(`/dashboard/delivery-agent/${agentId}`);
  return res.data;
};

/** GET /dashboard/delivery-agent/cards */
export const getDeliveryAgentCards = async (): Promise<any> => {
  const res = await api.get("/dashboard/delivery-agent/cards");
  return res.data;
};

/** GET /dashboard/driver/:driver_id */
export const getDriverDashboard = async (driverId: number): Promise<any> => {
  const res = await api.get(`/dashboard/driver/${driverId}`);
  return res.data;
};

/** GET /dashboard/driver/cards */
export const getDriverCards = async (): Promise<any> => {
  const res = await api.get("/dashboard/driver/cards");
  return res.data;
};

/** GET /dashboard/kitchen  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const getKitchenDashboard = async (): Promise<any> => {
  const res = await api.get("/dashboard/kitchen");
  return res.data;
};

/** GET /dashboard/kitchen/cards  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const getKitchenCards = async (): Promise<any> => {
  const res = await api.get("/dashboard/kitchen/cards");
  return res.data;
};

/** GET /dashboard/customer/:customer_id */
export const getCustomerDashboard = async (customerId: number): Promise<any> => {
  const res = await api.get(`/dashboard/customer/${customerId}`);
  return res.data;
};

/** GET /dashboard/sales-chart?days=30  (ADMIN | SHOP_MANAGER) */
export const getSalesChart = async (days: number = 30): Promise<any> => {
  const res = await api.get("/dashboard/sales-chart", { params: { days } });
  return res.data;
};

/** GET /dashboard/order-chart  (ADMIN | SHOP_MANAGER) */
export const getOrderChart = async (): Promise<any> => {
  const res = await api.get("/dashboard/order-chart");
  return res.data;
};

/** GET /dashboard/revenue-chart?days=30  (ADMIN | SHOP_MANAGER) */
export const getRevenueChart = async (days: number = 30): Promise<any> => {
  const res = await api.get("/dashboard/revenue-chart", { params: { days } });
  return res.data;
};

/** GET /dashboard/payment-chart  (ADMIN | SHOP_MANAGER) */
export const getPaymentChart = async (): Promise<any> => {
  const res = await api.get("/dashboard/payment-chart");
  return res.data;
};

/** GET /dashboard/summary  (ADMIN | SHOP_MANAGER) */
export const getDashboardSummary = async (): Promise<any> => {
  const res = await api.get("/dashboard/summary");
  return res.data;
};

/** GET /sales-agents/:agent_id/orders */
export const getSalesAgentOrders = async (agentId: number): Promise<any[]> => {
  const res = await api.get(`/sales-agents/${agentId}/orders`);
  return res.data.orders;
};

/** GET /sales-agents/:agent_id/payments */
export const getSalesAgentPayments = async (agentId: number): Promise<any[]> => {
  const res = await api.get(`/sales-agents/${agentId}/payments`);
  return res.data.payments;
};

/** GET /sales-agents/:agent_id/report */
export const getSalesAgentReport = async (agentId: number): Promise<any> => {
  const res = await api.get(`/sales-agents/${agentId}/report`);
  return res.data;
};