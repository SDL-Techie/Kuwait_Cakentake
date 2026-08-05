import { api } from "./api";

/** POST /payments */
// export const createPayment = async (orderId: number, paymentMethod: string): Promise<any> => {
//   const res = await api.post("/payments", { order_id: orderId, payment_method: paymentMethod });
//   return res.data;
// };

export const createPayment = async (
  orderId: number,
  gateway: "STRIPE" | "TAP"
) => {

  const paymentMethod =
    gateway === "STRIPE"
      ? "CARD"
      : "KNET";

  const res = await api.post("/payments/create-link", {
    order_id: orderId,
    payment_gateway: gateway,
    payment_method: paymentMethod,
  });

  return res.data;
};

/** GET /payments/:order_id */
export const getPayment = async (orderId: number): Promise<any> => {
  const res = await api.get(`/payments/${orderId}`);
  return res.data;
};

/** POST /payments/:order_id/create-link */
export const createPaymentLink = async (orderId: number): Promise<{ payment_url: string; session_id: string }> => {
  const res = await api.post(`/payments/${orderId}/create-link`);
  return res.data;
};

/** POST /payments/:order_id/verify */
// export const verifyPayment = async (orderId: number, sessionId: string): Promise<any> => {
//   const res = await api.post(`/payments/${orderId}/verify`, { session_id: sessionId });
//   return res.data;
// };

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


export const verifyStripePayment = async (
  orderId: number,
  sessionId: string
) => {

  const res = await api.get(
    `/payments/stripe/verify?order_id=${orderId}&session_id=${sessionId}`
  );

  return res.data;
};
