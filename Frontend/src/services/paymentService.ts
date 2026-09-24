// import { api } from "./api";

// /**
//  * POST /payments/create-link
//  * Gateway is decided server-side from the order's currency
//  * (KWD -> KNET, other currencies -> Tap's hosted portal).
//  * No gateway/payment_method needs to be sent from the client.
//  */
// export const createPaymentLink = async (orderId: number) => {
//   const res = await api.post("/payments/create-link", {
//     order_id: orderId,
//   });

//   return res.data;
// };

// /** Alias kept for call sites that use the shorter name (e.g. Orders.tsx). */
// export const createPayment = createPaymentLink;

// /** GET /payments/:order_id */
// export const getPayment = async (orderId: number): Promise<any> => {
//   const res = await api.get(`/payments/${orderId}`);
//   return res.data;
// };

// /** GET /payments/:order_id/verify */
// export const verifyPayment = async (
//   orderId: number,
//   tapId: string
// ): Promise<any> => {
//   const res = await api.get(
//     `/payments/${orderId}/verify?tap_id=${encodeURIComponent(tapId)}&format=json`
//   );

//   return res.data;
// };

// /** POST /payments/:order_id/mark-paid  (ADMIN | SHOP_MANAGER | SALES_AGENT) */
// export const markPaid = async (orderId: number, paymentMethod?: string): Promise<any> => {
//   const res = await api.post(`/payments/${orderId}/mark-paid`, {
//     payment_method: paymentMethod,
//   });
//   return res.data.order;
// };

// /** GET /payments/report  (ADMIN | SHOP_MANAGER) */
// export const getPaymentReport = async (): Promise<any> => {
//   const res = await api.get("/payments/report");
//   return res.data;
// };

// // ─── Invoices ─────────────────────────────────────────────────────────────────

// /** GET /invoices/:order_id */
// export const getInvoice = async (orderId: number): Promise<any> => {
//   const res = await api.get(`/invoices/${orderId}`);
//   return res.data;
// };

// /** POST /invoices/:order_id/download */
// export const downloadInvoice = async (orderId: number): Promise<any> => {
//   const res = await api.post(`/invoices/${orderId}/download`);
//   return res.data;
// };

// /** POST /invoices/:order_id/share-whatsapp */
// export const shareInvoiceWhatsapp = async (orderId: number): Promise<any> => {
//   const res = await api.post(`/invoices/${orderId}/share-whatsapp`);
//   return res.data;
// };


// export const createBulkPaymentLink = async (orderIds: number[]) => {
//   const res = await api.post("/payments/create-link", {
//     order_ids: orderIds,
//   });
 
//   return res.data;
// };



import { api } from "./api";

/**
 * POST /payments/create-link
 * Accepts either a single order id or an array of order ids (must all
 * belong to the same agent) — the backend sums them into ONE Tap/KNET
 * charge and returns a single payment_url for the combined total.
 * Gateway is decided server-side from the orders' currency
 * (KWD -> KNET, other currencies -> Tap's hosted portal).
 * No gateway/payment_method needs to be sent from the client.
 */
export const createPaymentLink = async (orderIds: number | number[]) => {
  const ids = Array.isArray(orderIds) ? orderIds : [orderIds];

  const res = await api.post(
    "/payments/create-link",
    ids.length === 1
      ? { order_id: ids[0], client_platform: "web" }
      : { order_ids: ids, client_platform: "web" }
  );

  return res.data;
};

/** Alias kept for call sites that use the shorter name (e.g. Orders.tsx). */
export const createPayment = createPaymentLink;

/**
 * Alias kept for call sites that were written against the old
 * multi-order-only function name — behaves identically to
 * createPaymentLink(orderIds) now that it accepts arrays natively.
 */
export const createBulkPaymentLink = async (orderIds: number[]) => {
  return createPaymentLink(orderIds);
};

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
    `/payments/${orderId}/verify?tap_id=${encodeURIComponent(tapId)}&format=json`
  );

  return res.data;
};

/**
 * GET /payments/batch/verify?tap_id=...
 * Use this instead of verifyPayment() when the payment was created from
 * createPaymentLink() with multiple order ids — it looks orders up by the
 * shared Tap charge id rather than a single order_id.
 */
export const verifyBatchPayment = async (tapId: string): Promise<any> => {
  const res = await api.get(
    `/payments/batch/verify?tap_id=${encodeURIComponent(tapId)}&format=json`
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
