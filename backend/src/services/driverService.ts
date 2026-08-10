// // import { api } from "./api";

// // // ─── Types ─────────────────────────────────────────────────────────────────────

// // export type DriverAvailability = "ONLINE" | "BUSY" | "OFFLINE";

// // export interface DriverDashboard {
// //   driver: any;
// //   total_orders: number;
// //   delivered: number;
// //   active: number;
// //   pending_amount: number;
// //   total_earned: number;
// //   rating: number;
// // }

// // export interface Settlement {
// //   id: number;
// //   driver_id: number;
// //   amount: number;
// //   orders_count: number;
// //   period_start: string | null;
// //   period_end: string | null;
// //   status: "PENDING" | "PAID";
// //   paid_at: string | null;
// //   paid_by: number | null;
// //   notes: string | null;
// //   payment_source: string;
// //   reference: string | null;
// //   created_at: string;
// //   driver: { id: number; first_name: string; last_name: string; phone_no: string } | null;
// //   orders?: any[];
// // }

// // export interface SettlementListResponse {
// //   settlements: Settlement[];
// //   total_pending: number;
// //   total_paid: number;
// //   orders_settled: number;
// // }

// // export interface CreateSettlementPayload {
// //   driver_id: number;
// //   amount: number;
// //   order_ids?: number[];
// //   orders_count?: number;
// //   period_start?: string;
// //   period_end?: string;
// //   notes?: string;
// //   payment_source?: "CASH" | "BANK";
// //   reference?: string;
// // }


// // // ─── Driver info ───────────────────────────────────────────────────────────────

// // /** GET /drivers  — all users with role=DRIVER */
// // export const getDrivers = async (): Promise<any[]> => {
// //   const res = await api.get("/drivers");
// //   return res.data.drivers ?? [];
// // };

// // /** GET /drivers/available  — drivers with no active order */
// // export const getAvailableDrivers = async (): Promise<any[]> => {
// //   const res = await api.get("/drivers/available");
// //   return res.data.drivers ?? [];
// // };

// // /** GET /drivers/:id/dashboard */
// // export const getDriverDashboard = async (driverId: number): Promise<DriverDashboard> => {
// //   const res = await api.get(`/drivers/${driverId}/dashboard`);
// //   return res.data;
// // };

// // /** GET /drivers/:id/assigned  — active orders for this driver */
// // export const getDriverAssigned = async (driverId: number): Promise<any[]> => {
// //   const res = await api.get(`/drivers/${driverId}/assigned`);
// //   return res.data.orders ?? [];
// // };

// // /** GET /drivers/:id/completed  — DELIVERED orders for this driver */
// // export const getDriverCompleted = async (driverId: number): Promise<any[]> => {
// //   const res = await api.get(`/drivers/${driverId}/completed`);
// //   return res.data.orders ?? [];
// // };

// // /** GET /drivers/:id/report */
// // export const getDriverReport = async (driverId: number): Promise<any> => {
// //   const res = await api.get(`/drivers/${driverId}/report`);
// //   return res.data;
// // };

// // /**
// //  * POST /drivers/:id/status
// //  * Body: { status: "ONLINE" | "BUSY" | "OFFLINE" }
// //  */
// // export const updateDriverStatus = async (
// //   driverId: number,
// //   status: DriverAvailability
// // ): Promise<any> => {
// //   const res = await api.post(`/drivers/${driverId}/status`, { status });
// //   return res.data;
// // };


// // // ─── Order actions (driver) ────────────────────────────────────────────────────

// // /**
// //  * POST /orders/:id/driver-accept
// //  * Sets status → DRIVER_ACCEPTED → OUT_FOR_DELIVERY atomically.
// //  * Also sets driver.availability_status = "BUSY" on the backend.
// //  */
// // export const driverAcceptOrder = async (orderId: number): Promise<any> => {
// //   const res = await api.post(`/orders/${orderId}/driver-accept`);
// //   return res.data;
// // };

// // /**
// //  * POST /orders/:id/driver-reject
// //  * Bounces order back to ASSIGNED_TO_AGENT.
// //  * Sets driver.availability_status = "ONLINE" on the backend.
// //  */
// // export const driverRejectOrder = async (orderId: number): Promise<any> => {
// //   const res = await api.post(`/orders/${orderId}/driver-reject`);
// //   return res.data;
// // };

// // /**
// //  * POST /orders/:id/delivery-proof
// //  * Submits delivery evidence. Sets status → DELIVERY_SUBMITTED.
// //  *
// //  * Fields (all optional except order context):
// //  *   delivery_photo             – Cloudinary URL of proof photo
// //  *   delivery_notes             – free-text notes
// //  *   customer_confirmation_name – name of person who received
// //  *   customer_confirmation_phone
// //  */
// // export const submitDeliveryProof = async (
// //   orderId: number,
// //   payload: {
// //     delivery_photo?: string;
// //     delivery_notes?: string;
// //     customer_confirmation_name?: string;
// //     customer_confirmation_phone?: string;
// //   }
// // ): Promise<any> => {
// //   const res = await api.post(`/orders/${orderId}/delivery-proof`, payload);
// //   return res.data;
// // };

// // /**
// //  * POST /orders/:id/upload-image  (multipart/form-data)
// //  * Uploads an image to Cloudinary and returns { image_url }.
// //  * Use this to get a URL before calling submitDeliveryProof.
// //  */
// // export const uploadOrderImage = async (
// //   orderId: number,
// //   file: File,
// //   onProgress?: (pct: number) => void
// // ): Promise<string> => {
// //   const form = new FormData();
// //   form.append("image", file);
// //   const res = await api.post(`/orders/${orderId}/upload-image`, form, {
// //     headers: { "Content-Type": "multipart/form-data" },
// //     onUploadProgress: (e) => {
// //       if (onProgress && e.total) {
// //         onProgress(Math.round((e.loaded * 100) / e.total));
// //       }
// //     },
// //   });
// //   return res.data.image_url as string;
// // };


// // // ─── Settlement ────────────────────────────────────────────────────────────────

// // /** GET /drivers/:id/settlements  — driver views their own settlements */
// // export const getDriverSettlements = async (driverId: number): Promise<SettlementListResponse> => {
// //   const res = await api.get(`/drivers/${driverId}/settlements`);
// //   return res.data;
// // };

// // /** GET /drivers/:id/unsettled-orders  — DELIVERED orders not yet in any settlement */
// // export const getUnsettledOrders = async (driverId: number): Promise<any> => {
// //   const res = await api.get(`/drivers/${driverId}/unsettled-orders`);
// //   return res.data;
// // };

// // /** GET /driver-settlements  — admin: all settlements (filter: driver_id, status) */
// // export const getAllSettlements = async (params?: {
// //   driver_id?: number;
// //   status?: "PENDING" | "PAID";
// // }): Promise<{ settlements: Settlement[]; count: number }> => {
// //   const res = await api.get("/driver-settlements", { params });
// //   return res.data;
// // };

// // /** POST /driver-settlements  — admin creates a settlement */
// // export const createSettlement = async (
// //   payload: CreateSettlementPayload
// // ): Promise<{ message: string; settlement: Settlement }> => {
// //   const res = await api.post("/driver-settlements", payload);
// //   return res.data;
// // };

// // /**
// //  * POST /driver-settlements/:id/pay  — admin marks settlement as paid
// //  * Body: { payment_source?: "CASH"|"BANK", reference?: string }
// //  */
// // export const markSettlementPaid = async (
// //   settlementId: number,
// //   payload?: { payment_source?: string; reference?: string }
// // ): Promise<{ message: string; settlement: Settlement }> => {
// //   const res = await api.post(`/driver-settlements/${settlementId}/pay`, payload ?? {});
// //   return res.data;
// // };

// // /** GET /driver-settlements/:id  — detail with linked orders */
// // export const getSettlementDetail = async (
// //   settlementId: number
// // ): Promise<{ settlement: Settlement }> => {
// //   const res = await api.get(`/driver-settlements/${settlementId}`);
// //   return res.data;
// // };



// import { api } from "./api";

// // ─────────────────────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────────────────────

// export type DriverAvailability = "ONLINE" | "BUSY" | "OFFLINE";

// export interface DriverDashboard {
//   driver: any;
//   total_orders: number;
//   delivered: number;
//   active: number;
//   pending_amount: number;
//   total_earned: number;
//   rating: number;
//   today?:number;
// }

// export interface Settlement {
//   id: number;
//   driver_id: number;
//   amount: number;
//   orders_count: number;
//   period_start: string | null;
//   period_end: string |null;
//   status: "PENDING" | "PAID";
//   paid_at: string | null;
//   paid_by: number | null;
//   notes: string | null;
//   payment_source: string;
//   reference: string | null;
//   created_at: string;

//   driver: {
//     id: number;
//     first_name: string;
//     last_name: string;
//     phone_no: string;
//   } | null;

//   orders?: any[];
// }

// export interface SettlementListResponse {
//   settlements: Settlement[];
//   total_pending: number;
//   total_paid: number;
//   orders_settled: number;
// }

// export interface CreateSettlementPayload {
//   driver_id: number;
//   amount: number;

//   order_ids?: number[];
//   orders_count?: number;

//   period_start?: string;
//   period_end?: string;

//   notes?: string;

//   payment_source?: "CASH" | "BANK";

//   reference?: string;
// }

// // ─────────────────────────────────────────────────────────────
// // Driver APIs
// // ─────────────────────────────────────────────────────────────

// export const getDrivers = async (): Promise<any[]> => {
//   const res = await api.get("/drivers");
//   return res.data.drivers ?? [];
// };

// export const getAvailableDrivers = async (): Promise<any[]> => {
//   const res = await api.get("/drivers/available");
//   return res.data.drivers ?? [];
// };

// export const getDriverDashboard = async (
//   driverId: number
// ): Promise<DriverDashboard> => {
//   const res = await api.get(`/drivers/${driverId}/dashboard`);
//   return res.data;
// };

// export const getDriverAssigned = async (
//   driverId: number
// ): Promise<any[]> => {
//   const res = await api.get(`/drivers/${driverId}/assigned`);
//   return res.data.orders ?? [];
// };

// export const getDriverCompleted = async (
//   driverId: number
// ): Promise<any[]> => {
//   const res = await api.get(`/drivers/${driverId}/completed`);
//   return res.data.orders ?? [];
// };

// export const getDriverReport = async (
//   driverId: number
// ): Promise<any> => {
//   const res = await api.get(`/drivers/${driverId}/report`);
//   return res.data;
// };

// export const updateDriverStatus = async (
//   driverId: number,
//   status: DriverAvailability
// ) => {
//   const res = await api.post(`/drivers/${driverId}/status`, {
//     status,
//   });

//   return res.data;
// };

// // ─────────────────────────────────────────────────────────────
// // Driver Order APIs
// // ─────────────────────────────────────────────────────────────

// export const driverAcceptOrder = async (
//   orderId: number
// ) => {
//   const res = await api.post(`/orders/${orderId}/driver-accept`);

//   return res.data;
// };

// export const driverRejectOrder = async (
//   orderId: number
// ) => {
//   const res = await api.post(`/orders/${orderId}/driver-reject`);

//   return res.data;
// };

// export const submitDeliveryProof = async (
//   orderId: number,
//   payload: {
//     delivery_photo?: string;
//     delivery_notes?: string;
//     customer_confirmation_name?: string;
//     customer_confirmation_phone?: string;
//   }
// ) => {
//   const res = await api.post(
//     `/orders/${orderId}/delivery-proof`,
//     payload
//   );

//   return res.data;
// };

// export const uploadOrderImage = async (
//   orderId: number,
//   file: File,
//   onProgress?: (progress: number) => void
// ): Promise<string> => {
//   const formData = new FormData();

//   formData.append("image", file);

//   const res = await api.post(
//     `/orders/${orderId}/upload-image`,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       onUploadProgress: (e) => {
//         if (onProgress && e.total) {
//           onProgress(
//             Math.round((e.loaded * 100) / e.total)
//           );
//         }
//       },
//     }
//   );

//   return res.data.image_url;
// };

// // ─────────────────────────────────────────────────────────────
// // Driver Settlement APIs
// // ─────────────────────────────────────────────────────────────

// // Driver can see his own settlements

// export const getDriverSettlements = async (
//   driverId: number
// ): Promise<SettlementListResponse> => {
//   const res = await api.get(
//     `/drivers/${driverId}/settlements`
//   );

//   return res.data;
// };

// // Driver unsettled delivered orders

// export const getUnsettledOrders = async (
//   driverId: number
// ) => {
//   const res = await api.get(
//     `/drivers/${driverId}/unsettled-orders`
//   );

//   return res.data;
// };

// // Admin - all settlements

// export const getAllSettlements = async (params?: {
//   driver_id?: number;
//   status?: "PENDING" | "PAID";
// }) => {
//   const res = await api.get(
//     "/driver-settlements",
//     {
//       params,
//     }
//   );

//   return res.data;
// };

// // Admin - settlements by driver

// export const getSettlementsByDriver = async (
//   driverId: number
// ) => {
//   const res = await api.get(
//     `/driver-settlements/driver/${driverId}`
//   );

//   return res.data;
// };

// // Settlement detail

// export const getSettlementDetail = async (
//   settlementId: number
// ) => {
//   const res = await api.get(
//     `/driver-settlements/${settlementId}`
//   );

//   return res.data;
// };

// // Create settlement

// export const createSettlement = async (
//   payload: CreateSettlementPayload
// ) => {
//   const res = await api.post(
//     "/driver-settlements",
//     payload
//   );

//   return res.data;
// };

// // Mark settlement paid

// export const markSettlementPaid = async (
//   settlementId: number,
//   payload?: {
//     payment_source?: "CASH" | "BANK";
//     reference?: string;
//   }
// ) => {
//   const res = await api.post(
//     `/driver-settlements/${settlementId}/pay`,
//     payload ?? {}
//   );

//   return res.data;
// };

// // Delete settlement (optional)

// export const deleteSettlement = async (
//   settlementId: number
// ) => {
//   const res = await api.delete(
//     `/driver-settlements/${settlementId}`
//   );

//   return res.data;
// };

// export const getDriverDeliveredOrders = async (
//   driverId: number
// ) => {
//   const res = await api.get(
//     `/drivers/${driverId}/delivered-orders`
//   );

//   return res.data;
// };


// export const markCodPaymentPaid = async (orderId: number): Promise<any> => {
//      const res = await api.post(`/orders/${orderId}/mark-cod-paid`);
//      return res.data;
//    };

// // ─────────────────────────────────────────────────────────────
// // Default Export
// // ─────────────────────────────────────────────────────────────

// export default {
//   getDrivers,
//   getAvailableDrivers,
//   getDriverDashboard,
//   getDriverAssigned,
//   getDriverCompleted,
//   getDriverReport,
//   updateDriverStatus,

//   driverAcceptOrder,
//   driverRejectOrder,
//   submitDeliveryProof,
//   uploadOrderImage,

//   getDriverSettlements,
//   getUnsettledOrders,

//   getAllSettlements,
//   getSettlementsByDriver,
//   getSettlementDetail,
//   createSettlement,

//   markSettlementPaid,
//   deleteSettlement,
//   getDriverDeliveredOrders,
//   markCodPaymentPaid
// };



import { api } from "./api";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type DriverAvailability = "ONLINE" | "BUSY" | "OFFLINE";

export interface DriverDashboard {
  driver: any;
  total_orders: number;
  delivered: number;
  active: number;
  pending_amount: number;
  total_earned: number;
  rating: number;
}

export interface Settlement {
  id: number;
  driver_id: number;
  amount: number;
  orders_count: number;
  period_start: string | null;
  period_end: string | null;
  status: "PENDING" | "PAID";
  paid_at: string | null;
  paid_by: number | null;
  notes: string | null;
  payment_source: string;
  reference: string | null;
  created_at: string;
  driver: { id: number; first_name: string; last_name: string; phone_no: string } | null;
  orders?: any[];
}

export interface SettlementListResponse {
  settlements: Settlement[];
  total_pending: number;
  total_paid: number;
  orders_settled: number;
}

export interface CreateSettlementPayload {
  driver_id: number;
  amount: number;
  order_ids?: number[];
  notes?: string;
  payment_source?: "CASH" | "BANK";
}

export interface UnsettledOrdersResponse {
  orders: any[];
  count: number;
  total_delivery_charges: number;
}

// ─────────────────────────────────────────────────────────────
// Driver APIs
// ─────────────────────────────────────────────────────────────

export const getDrivers = async (): Promise<any[]> => {
  const res = await api.get("/drivers");
  return res.data.drivers ?? [];
};

export const getAvailableDrivers = async (): Promise<any[]> => {
  const res = await api.get("/drivers/available");
  return res.data.drivers ?? [];
};

export const getDriverDashboard = async (driverId: number): Promise<DriverDashboard> => {
  const res = await api.get(`/drivers/${driverId}/dashboard`);
  return res.data;
};

export const getDriverAssigned = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/drivers/${driverId}/assigned`);
  return res.data.orders ?? [];
};

/** All delivered orders for this driver (settled or not) — used for history/view. */
export const getDriverCompleted = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/drivers/${driverId}/completed`);
  return res.data.orders ?? [];
};

export const getDriverReport = async (driverId: number): Promise<any> => {
  const res = await api.get(`/drivers/${driverId}/report`);
  return res.data;
};

export const updateDriverStatus = async (driverId: number, status: DriverAvailability) => {
  const res = await api.post(`/drivers/${driverId}/status`, { status });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Driver Order APIs
// ─────────────────────────────────────────────────────────────

export const driverAcceptOrder = async (orderId: number) => {
  const res = await api.post(`/orders/${orderId}/driver-accept`);
  return res.data;
};

export const driverRejectOrder = async (orderId: number) => {
  const res = await api.post(`/orders/${orderId}/driver-reject`);
  return res.data;
};

export const submitDeliveryProof = async (
  orderId: number,
  payload: {
    delivery_photo?: string;
    delivery_notes?: string;
    customer_confirmation_name?: string;
    customer_confirmation_phone?: string;
  }
) => {
  const res = await api.post(`/orders/${orderId}/delivery-proof`, payload);
  return res.data;
};

export const uploadOrderImage = async (
  orderId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post(`/orders/${orderId}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });

  return res.data.image_url;
};

// ─────────────────────────────────────────────────────────────
// Driver Settlement APIs
// ─────────────────────────────────────────────────────────────

/** Driver (or admin viewing them) sees settlement history + totals. */
export const getDriverSettlements = async (driverId: number): Promise<SettlementListResponse> => {
  const res = await api.get(`/drivers/${driverId}/settlements`);
  return res.data;
};

/**
 * Delivered orders NOT yet attached to any settlement.
 * This is the correct list to show when picking orders for a NEW settlement —
 * it can never include an order already paid or already in a pending settlement.
 */
export const getUnsettledOrders = async (driverId: number): Promise<UnsettledOrdersResponse> => {
  const res = await api.get(`/drivers/${driverId}/unsettled-orders`);
  return res.data;
};

/** Delivered-orders summary + full order list for a driver (used by settlement cards tab). */
export const getDriverDeliveredOrders = async (driverId: number) => {
  const res = await api.get(`/drivers/${driverId}/delivered-orders`);
  return res.data;
};

/** Admin — all settlements, optionally filtered by driver_id / status. */
export const getAllSettlements = async (params?: {
  driver_id?: number;
  status?: "PENDING" | "PAID";
}): Promise<{ settlements: Settlement[]; count: number }> => {
  const res = await api.get("/driver-settlements", { params });
  return res.data;
};

export const getSettlementsByDriver = async (driverId: number) => {
  const res = await api.get(`/driver-settlements/driver/${driverId}`);
  return res.data;
};

export const getSettlementDetail = async (settlementId: number): Promise<{ settlement: Settlement }> => {
  const res = await api.get(`/driver-settlements/${settlementId}`);
  return res.data;
};

/** Create a settlement. order_ids is optional — omit it to record a purely manual payout. */
export const createSettlement = async (payload: CreateSettlementPayload) => {
  const res = await api.post("/driver-settlements", payload);
  return res.data;
};

export const markSettlementPaid = async (
  settlementId: number,
  payload?: { payment_source?: "CASH" | "BANK"; reference?: string }
) => {
  const res = await api.post(`/driver-settlements/${settlementId}/pay`, payload ?? {});
  return res.data;
};

export const deleteSettlement = async (settlementId: number) => {
  const res = await api.delete(`/driver-settlements/${settlementId}`);
  return res.data;
};

export const markCodPaymentPaid = async (orderId: number): Promise<any> => {
  const res = await api.post(`/orders/${orderId}/mark-cod-paid`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────

export default {
  getDrivers,
  getAvailableDrivers,
  getDriverDashboard,
  getDriverAssigned,
  getDriverCompleted,
  getDriverReport,
  updateDriverStatus,

  driverAcceptOrder,
  driverRejectOrder,
  submitDeliveryProof,
  uploadOrderImage,

  getDriverSettlements,
  getUnsettledOrders,
  getDriverDeliveredOrders,

  getAllSettlements,
  getSettlementsByDriver,
  getSettlementDetail,
  createSettlement,

  markSettlementPaid,
  deleteSettlement,
  markCodPaymentPaid,
};