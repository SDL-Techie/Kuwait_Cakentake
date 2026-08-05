import { api } from "./api";

export interface DateRangeParams {
  start?: string; // ISO date string
  end?: string;   // ISO date string
}

/** GET /reports/orders?start=&end=  (ADMIN | SHOP_MANAGER) */
export const getOrdersReport = async (params?: DateRangeParams): Promise<any> => {
  const res = await api.get("/reports/orders", { params });
  return res.data;
};

/** GET /reports/sales?start=&end=  (ADMIN | SHOP_MANAGER) */
export const getSalesReport = async (params?: DateRangeParams): Promise<any> => {
  const res = await api.get("/reports/sales", { params });
  return res.data;
};

/** GET /reports/revenue?start=&end=  (ADMIN | SHOP_MANAGER) */
export const getRevenueReport = async (params?: DateRangeParams): Promise<any> => {
  const res = await api.get("/reports/revenue", { params });
  return res.data;
};

/** GET /reports/delivery?start=&end=  (ADMIN | SHOP_MANAGER) */
export const getDeliveryReport = async (params?: DateRangeParams): Promise<any> => {
  const res = await api.get("/reports/delivery", { params });
  return res.data;
};

/** GET /reports/loyalty  (ADMIN | SHOP_MANAGER) */
export const getLoyaltyReport = async (): Promise<any> => {
  const res = await api.get("/reports/loyalty");
  return res.data;
};

/** GET /reports/inventory  (ADMIN | SHOP_MANAGER) */
export const getInventoryReport = async (): Promise<any> => {
  const res = await api.get("/reports/inventory");
  return res.data;
};

/** GET /reports/cash-flow  (ADMIN | SHOP_MANAGER) */
export const getCashFlowReport = async (): Promise<any> => {
  const res = await api.get("/reports/cash-flow");
  return res.data;
};

/** GET /reports/expense?start=&end=  (ADMIN | SHOP_MANAGER) */
export const getExpenseReport = async (params?: DateRangeParams): Promise<any> => {
  const res = await api.get("/reports/expense", { params });
  return res.data;
};

// ─── Exports (returns raw CSV blob) ──────────────────────────────────────────

/** GET /reports/orders/export  (ADMIN | SHOP_MANAGER) */
export const exportOrders = async (): Promise<Blob> => {
  const res = await api.get("/reports/orders/export", { responseType: "blob" });
  return res.data;
};

/** GET /reports/sales/export  (ADMIN | SHOP_MANAGER) */
export const exportSales = async (): Promise<Blob> => {
  const res = await api.get("/reports/sales/export", { responseType: "blob" });
  return res.data;
};

/** GET /reports/customers/export  (ADMIN | SHOP_MANAGER) */
export const exportCustomers = async (): Promise<Blob> => {
  const res = await api.get("/reports/customers/export", { responseType: "blob" });
  return res.data;
};

/** GET /reports/delivery/export  (ADMIN | SHOP_MANAGER) */
export const exportDelivery = async (): Promise<Blob> => {
  const res = await api.get("/reports/delivery/export", { responseType: "blob" });
  return res.data;
};