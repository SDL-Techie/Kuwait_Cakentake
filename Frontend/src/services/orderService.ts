import { api } from './api';



export interface OrderItem {
  product_id: number;
  quantity: number;
  custom_json?: any;
}


// export interface CreateOrderPayload {
//   address_id: number;
//   delivery_area_id: number;
//   items: OrderItem[];
//   delivery_date?: string;
//   delivery_time_slot?: string;
//   payment_method?: string;
//   order_type?: string;
// }


export interface CreateOrderPayload {
  address_id: number;
  delivery_area_id: number;
  items: OrderItem[];

  delivery_date?: string;
  delivery_time_slot?: string;

  payment_method?: string;
  payment_status?: string;
  status?: string;

  order_type?: string;

  redeemed_points?: number;   // if using loyalty redemption
}


// ─────────────────────────────────────────────────────────────
// SALES AGENT CREATE ORDER
// POST /orders/sales-agent
// ─────────────────────────────────────────────────────────────

export interface SalesAgentOrderItem {
  product_id: number;
  quantity: number;
  custom_json?: any;
}

export interface SalesAgentCreateOrderPayload {
  // Customer
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_alt_phone?: string;

  // Delivery Address
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  area_id: number;

  // Order
  order_addons?: {
    addon_id: number;
    quantity: number;
    price: number;
    total: number;
  }[];
  order_addons_total?: number;
  items: SalesAgentOrderItem[];

  delivery_date?: string;
  delivery_time_slot?: string;

  payment_method?: string;
  order_type?: string;

  // Greeting Card
  greeting_to?: string;
  greeting_from?: string;
  greeting_message?: string;

  // Custom Cake
  custom_cake?: {
    flavour?: string;
    weight?: string;
    shape?: string;
    size?: string;
    colour?: string;
    message?: string;
    image?: string;
    notes?: string;
  };
}

export const createSalesAgentOrder = async (
  payload: SalesAgentCreateOrderPayload
): Promise<any> => {
  const res = await api.post("/orders/sales-agent", payload);
  return res.data;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<any> => {
  const res = await api.post("/orders", payload);
  return res.data.order;
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SERVICE
// All endpoints match routes in backend/routes/order_routes.py
// ─────────────────────────────────────────────────────────────────────────────

/** GET /orders — role-scoped list */
export const getOrders = async (): Promise<any[]> => {
  const res = await api.get('/orders');
  // Backend returns { count, orders } or array directly
  return res.data?.orders ?? res.data ?? [];
};

/** GET /orders/sales-agent */
export const getSalesAgentOrders = async (): Promise<any[]> => {
  const res = await api.get('/orders/sales-agent');
  return res.data?.orders ?? res.data ?? [];
};

/** GET /orders/:id */
export const getOrderById = async (id: number): Promise<any> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

/** GET /orders/:id/history */
export const getOrderHistory = async (id: number): Promise<any[]> => {
  const res = await api.get(`/orders/${id}/history`);
  return res.data?.history ?? res.data ?? [];
};

/** POST /create-checkout-session */
export const createCheckoutSession = async (amount: number): Promise<{ session_id: string; url: string }> => {
  const res = await api.post("/create-checkout-session", { amount });
  return res.data;
};

// ─── Step 1: Accept / Reject order (ADMIN | SHOP_MANAGER) ───────────────────

/**
 * POST /orders/:id/accept
 * Body: { payment_method? }  – if provided overrides the method set at creation.
 * Backend sets payment_status:
 *   COD → PENDING   (collect on delivery)
 *   UPI → COMPLETED (already paid)
 */
export const acceptOrder = async (
  id: number,
  paymentMethod?: string
): Promise<any> => {
  const res = await api.post(`/orders/${id}/accept`,
    paymentMethod ? { payment_method: paymentMethod } : {}
  );
  return res.data;
};

/**
 * POST /orders/:id/reject
 * Body: { reason? }
 */
export const rejectOrder = async (id: number, reason?: string): Promise<any> => {
  const res = await api.post(`/orders/${id}/reject`, { reason: reason ?? null });
  return res.data;
};

/**
 * POST /orders/:id/cancel
 * Body: { reason? }
 */
export const cancelOrder = async (id: number, reason?: string): Promise<any> => {
  const res = await api.post(`/orders/${id}/cancel`, { reason: reason ?? null });
  return res.data;
};

// ─── Step 2: Assign to kitchen (ADMIN | SHOP_MANAGER) ───────────────────────

/**
 * POST /orders/:id/assign-kitchen
 * Body: { kitchen_staff_id }
 * Backend sets status → ASSIGNED_TO_KITCHEN
 */
export const assignKitchen = async (
  orderId: number,
  kitchenStaffId: number
): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/assign-kitchen`, {
    kitchen_staff_id: kitchenStaffId,
  });
  return res.data;
};


// ─── Step 3: Kitchen marks ready (KITCHEN_STAFF | ADMIN | SHOP_MANAGER) ─────


/** POST /orders/:order_id/start-preparation  (KITCHEN_STAFF) */
export const startPreparation = async (orderId: number): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/start-preparation`);
  return res.data.order;
};


/**
 * POST /orders/:id/ready
 * Backend sets status → READY
 */
export const markOrderReady = async (orderId: number): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/ready`);
  return res.data;
};

// ─── Step 4: Assign delivery agent (ADMIN | SHOP_MANAGER) ───────────────────

/**
 * POST /orders/:id/assign-agent
 * Body: { delivery_agent_id }
 * Backend sets status → ASSIGNED_TO_AGENT
 *
 * NOTE: This assigns a DELIVERY_AGENT (role=DELIVERY_AGENT), not a driver.
 * The delivery agent then picks their own driver (step 5 below).
 */
export const assignAgentToOrder = async (
  orderId: number,
  deliveryAgentId: number
): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/assign-agent`, {
    delivery_agent_id: deliveryAgentId,
  });
  return res.data;
};

// ─── Step 5: Delivery agent assigns a driver (DELIVERY_AGENT | ADMIN | SHOP_MANAGER) ─

/**
 * POST /orders/:id/assign-driver
 * Body: { driver_id }
 * Backend sets status → ASSIGNED_TO_DRIVER
 *
 * NOTE: This assigns a DRIVER (role=DRIVER), a separate role from DELIVERY_AGENT.
 * Only a delivery agent (or admin) can call this; the driver then accepts
 * via their DriverOrder dashboard.
 */
export const assignDriverToOrder = async (
  orderId: number,
  driverId: number
): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/assign-driver`, {
    driver_id: driverId,
  });
  return res.data;
};

// ─── Step 6: Driver accepts (DRIVER) ────────────────────────────────────────

/**
 * POST /orders/:id/driver-accept
 * Backend sets status → DRIVER_ACCEPTED → OUT_FOR_DELIVERY (atomically)
 * Called from the DriverOrder dashboard, not from OrderManagement.
 */
export const driverAcceptOrder = async (orderId: number): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/driver-accept`);
  return res.data;
};

/**
 * POST /orders/:id/driver-reject
 * Bounces order back to ASSIGNED_TO_AGENT so agent can pick another driver.
 */
export const driverRejectOrder = async (orderId: number): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/driver-reject`);
  return res.data;
};

// ─── Step 7: Driver submits delivery proof (DRIVER) ─────────────────────────

/**
 * POST /orders/:id/delivery-proof
 * Body: { delivery_photo?, delivery_notes?, customer_confirmation_name?, customer_confirmation_phone? }
 * Backend sets status → DELIVERY_SUBMITTED
 * Called from the DriverOrder dashboard.
 */
export const submitDeliveryProof = async (
  orderId: number,
  payload: {
    delivery_photo?: string;
    delivery_notes?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_confirmation_name?: string;
    customer_confirmation_phone?: string;
  }
): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/delivery-proof`, payload);
  return res.data;
};

// ─── Step 8: Delivery agent / admin confirms final delivery ──────────────────

/**
 * POST /orders/:id/confirm-delivery
 * Backend sets status → DELIVERED
 * Delivery agent reviews the driver's proof photo and confirms.
 * Also accessible to ADMIN and SHOP_MANAGER.
 */
export const markOrderDelivered = async (orderId: number): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/confirm-delivery`);
  return res.data;
};

// ─── My-order lists (role-scoped) ────────────────────────────────────────────

/** GET /orders/kitchen/my-orders  (KITCHEN_STAFF) */
export const getMyKitchenOrders = async (): Promise<any[]> => {
  const res = await api.get('/orders/kitchen/my-orders');
  return res.data?.orders ?? res.data ?? [];
};

/** GET /orders/agent/my-orders  (DELIVERY_AGENT) */
export const getMyAgentOrders = async (): Promise<any[]> => {
  const res = await api.get('/orders/agent/my-orders');
  return res.data?.orders ?? res.data ?? [];
};

/** GET /orders/driver/my-orders  (DRIVER) */
export const getMyDriverOrders = async (): Promise<any[]> => {
  const res = await api.get('/orders/driver/my-orders');
  return res.data?.orders ?? res.data ?? [];
};

// ─── Admin / staff list endpoints ────────────────────────────────────────────

/** GET /orders/status/:status */
export const getOrdersByStatus = async (status: string): Promise<any[]> => {
  const res = await api.get(`/orders/status/${status}`);
  return res.data?.orders ?? res.data ?? [];
};

// /** GET /orders/customer/:customer_id */
// export const getOrdersByCustomer = async (customerId: number): Promise<any[]> => {
//   const res = await api.get(`/orders/customer/${customerId}`);
//   return res.data?.orders ?? res.data ?? [];
// };


export const getOrdersByCustomer = async (customerId: number) => {
  try {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/** GET /orders/agent/:agent_id  (admin — orders assigned to a delivery agent) */
export const getOrdersByAgent = async (agentId: number): Promise<any[]> => {
  const res = await api.get(`/orders/agent/${agentId}`);
  return res.data?.orders ?? res.data ?? [];
};

/** GET /orders/driver/:driver_id  (admin — orders assigned to a driver) */
export const getOrdersByDriver = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/orders/driver/${driverId}`);
  return res.data?.orders ?? res.data ?? [];
};

// ─── Image upload ────────────────────────────────────────────────────────────

/** POST /orders/:id/upload-image  (multipart/form-data) */
export const uploadOrderImage = async (
  orderId: number,
  file: File
): Promise<{ image_url: string }> => {
  const form = new FormData();
  form.append('image', file);
  const res = await api.post(`/orders/${orderId}/upload-image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/** GET /orders/:id/images */
export const getOrderImages = async (orderId: number): Promise<any[]> => {
  const res = await api.get(`/orders/${orderId}/images`);
  return res.data?.images ?? [];
};

// /** GET /orders?status=PENDING */
// export const getOrders = async (status?: string): Promise<any[]> => {
//   const res = await api.get("/orders", { params: status ? { status } : {} });
//   return res.data.orders;
// };