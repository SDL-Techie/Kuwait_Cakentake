import { api } from "./api";

/**
 * POST /payments/create-link
 * Gateway is decided server-side from the order's currency
 * (KWD -> KNET, other currencies -> Tap's hosted portal).
 * No gateway/payment_method needs to be sent from the client.
 */
export const createPaymentLink = async (orderId: number) => {
  const res = await api.post("/payments/create-link", {
    order_id: orderId,
  });

  return res.data;
};

/** Alias kept for call sites that use the shorter name (e.g. Orders.tsx). */
export const createPayment = createPaymentLink;

/** GET /payments/:order_id */
export const getPayment = async (orderId: number): Promise<any> => {
  const res = await api.get(`/payments/${orderId}`);
  return res.data;
};

/** GET /payments/:order_id/verify */
export const verifyPayment = async (
  orderId: number,
  tapId: string
): Promise<any> => {
  const res = await api.get(
    `/payments/${orderId}/verify?tap_id=${tapId}`
  );

  return res.data;
};

/** POST /payments/:order_id/mark-paid  (ADMIN | SHOP_MANAGER | SALES_AGENT) */
export const markPaid = async (orderId: number, paymentMethod?: string): Promise<any> => {
  const res = await api.post(`/payments/${orderId}/mark-paid`, {
    payment_method: paymentMethod,
  });
  return res.data.order;
};

/** GET /payments/report  (ADMIN | SHOP_MANAGER) */
export const getPaymentReport = async (): Promise<any> => {
  const res = await api.get("/payments/report");
  return res.data;
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

/** GET /invoices/:order_id */
export const getInvoice = async (orderId: number): Promise<any> => {
  const res = await api.get(`/invoices/${orderId}`);
  return res.data;
};

/** POST /invoices/:order_id/download */
export const downloadInvoice = async (orderId: number): Promise<any> => {
  const res = await api.post(`/invoices/${orderId}/download`);
  return res.data;
};

/** POST /invoices/:order_id/share-whatsapp */
export const shareInvoiceWhatsapp = async (orderId: number): Promise<any> => {
  const res = await api.post(`/invoices/${orderId}/share-whatsapp`);
  return res.data;
};