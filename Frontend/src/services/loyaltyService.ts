// // // import { api } from "./api";

// // // export interface LoyaltyConfig {
// // //   points_per_order: number;
// // //   points_value: number;
// // //   min_redemption: number;
// // //   max_redemption_percent: number;
// // //   is_active: boolean;
// // // }

// // // export const createLoyaltyConfig = async (
// // //   payload: LoyaltyConfig
// // // ): Promise<LoyaltyConfig> => {
// // //   const res = await api.post("/loyalty-config", payload);
// // //   return res.data.config;
// // // };

// // // /** GET /loyalty-config */
// // // export const getLoyaltyConfig = async (): Promise<LoyaltyConfig> => {
// // //   const res = await api.get("/loyalty-config");
// // //   return res.data.config;
// // // };

// // // /** PUT /loyalty-config  (ADMIN | SHOP_MANAGER) */
// // // export const updateLoyaltyConfig = async (
// // //   payload: Partial<LoyaltyConfig>
// // // ): Promise<LoyaltyConfig> => {
// // //   const res = await api.put("/loyalty-config", payload);
// // //   return res.data.config;
// // // };

// // // /** GET /loyalty-points/:customer_id */
// // // export const getLoyaltyPoints = async (
// // //   customerId: number
// // // ): Promise<{ customer_id: number; points: number }> => {
// // //   const res = await api.get(`/loyalty-points/${customerId}`);
// // //   return res.data;
// // // };

// // // /** POST /loyalty-points/:customer_id/redeem */
// // // export const redeemLoyaltyPoints = async (
// // //   customerId: number,
// // //   points: number,
// // //   orderId?: number
// // // ): Promise<any> => {
// // //   const res = await api.post(`/loyalty-points/${customerId}/redeem`, {
// // //     points,
// // //     order_id: orderId,
// // //   });
// // //   return res.data;
// // // };

// // // /** GET /loyalty-points/report  (ADMIN | SHOP_MANAGER) */
// // // export const getLoyaltyReport = async (): Promise<any> => {
// // //   const res = await api.get("/loyalty-points/report");
// // //   return res.data;
// // // };

// // // /** GET /loyalty/ledger?page=1  (ADMIN | SHOP_MANAGER) */
// // // export const getLoyaltyLedger = async (page: number = 1): Promise<any> => {
// // //   const res = await api.get("/loyalty/ledger", { params: { page } });
// // //   return res.data;
// // // };

// // // /** GET /loyalty/ledger/:customer_id */
// // // export const getCustomerLedger = async (customerId: number): Promise<any[]> => {
// // //   const res = await api.get(`/loyalty/ledger/${customerId}`);
// // //   return res.data.ledger;
// // // };


// // import { api } from "./api";

// // export interface LoyaltyConfig {
// //   points_per_order: number;
// //   points_value: number;
// //   min_redemption: number;
// //   max_redemption_percent: number;
// //   is_active: boolean;
// // }

// // export interface LoyaltyLedgerEntry {
// //   id: number;
// //   customer_id: number;
// //   customer_name?: string;
// //   points: number;
// //   transaction_type: "EARN" | "REDEEM" | string;
// //   description?: string;
// //   order_id?: number | null;
// //   created_at: string;
// // }

// // export interface LoyaltyReport {
// //   total_earned: number;
// //   total_redeemed: number;
// //   net_outstanding: number;
// // }

// // export interface LoyaltyLedgerResponse {
// //   ledger: LoyaltyLedgerEntry[];
// //   total: number;
// // }

// // /** POST /loyalty-config */
// // export const createLoyaltyConfig = async (
// //   payload: LoyaltyConfig
// // ): Promise<LoyaltyConfig> => {
// //   const res = await api.post("/loyalty-config", payload);
// //   return res.data.config;
// // };

// // /** GET /loyalty-config */
// // export const getLoyaltyConfig = async (): Promise<LoyaltyConfig> => {
// //   const res = await api.get("/loyalty-config");
// //   return res.data.config;
// // };

// // /** PUT /loyalty-config  (ADMIN | SHOP_MANAGER) */
// // export const updateLoyaltyConfig = async (
// //   payload: Partial<LoyaltyConfig>
// // ): Promise<LoyaltyConfig> => {
// //   const res = await api.put("/loyalty-config", payload);
// //   return res.data.config;
// // };

// // /** GET /loyalty-points/:customer_id */
// // export const getLoyaltyPoints = async (
// //   customerId: number
// // ): Promise<{ customer_id: number; points: number }> => {
// //   const res = await api.get(`/loyalty-points/${customerId}`);
// //   return res.data;
// // };

// // /** POST /loyalty-points/:customer_id/redeem */
// // export const redeemLoyaltyPoints = async (
// //   customerId: number,
// //   points: number,
// //   orderId?: number
// // ): Promise<any> => {
// //   const res = await api.post(`/loyalty-points/${customerId}/redeem`, {
// //     points,
// //     order_id: orderId,
// //   });
// //   return res.data;
// // };

// // /** GET /loyalty-points/report  (ADMIN | SHOP_MANAGER) */
// // export const getLoyaltyReport = async (): Promise<LoyaltyReport> => {
// //   const res = await api.get("/loyalty-points/report");
// //   return res.data;
// // };

// // /** GET /loyalty/ledger?page=1  (ADMIN | SHOP_MANAGER) */
// // export const getLoyaltyLedger = async (
// //   page: number = 1
// // ): Promise<LoyaltyLedgerResponse> => {
// //   const res = await api.get("/loyalty/ledger", { params: { page } });
// //   return res.data;
// // };

// // /** GET /loyalty/ledger/:customer_id */
// // export const getCustomerLedger = async (
// //   customerId: number
// // ): Promise<LoyaltyLedgerEntry[]> => {
// //   const res = await api.get(`/loyalty/ledger/${customerId}`);
// //   return res.data.ledger;
// // };


// import {api} from "./api";

// export interface LoyaltyConfig {
//   id: number;
//   min_order_amount: number;
//   points_per_min_order: number;
//   min_points: number;
//   reward_percent: number;
//   is_active: boolean;
//   updated_at: string;
// }

// export interface CustomerLoyalty {
//   customer_id: number;
//   available_points: number;
//   min_points: number;
//   reward_percent: number;
//   can_redeem: boolean;
//   remaining_points_after_redeem: number;
//   message: string;
// }

// export interface RedeemResponse {
//   message: string;
//   redeemed_points: number;
//   discount_percent: number;
//   remaining_points: number;
// }

// export interface LoyaltyLedger {
//   id: number;
//   customer_id: number;
//   points: number;
//   transaction_type: "EARN" | "REDEEM";
//   description: string;
//   order_id?: number;
//   created_at: string;
// }

// /* -----------------------------
//    Loyalty Configuration
// -------------------------------- */

// export const getLoyaltyConfig = async (): Promise<LoyaltyConfig> => {
//   const res = await api.get("/loyalty-config");
//   return res.data.config;
// };

// /* -----------------------------
//    Customer Loyalty Details
// -------------------------------- */

// export const getCustomerLoyalty = async (
//   customerId: number
// ): Promise<CustomerLoyalty> => {
//   const res = await api.get(`/loyalty/customer/${customerId}`);
//   return res.data;
// };

// /* -----------------------------
//    Current Points
// -------------------------------- */

// export const getCustomerPoints = async (
//   customerId: number
// ): Promise<number> => {
//   const res = await api.get(`/loyalty-points/${customerId}`);
//   return res.data.points;
// };

// /* -----------------------------
//    Redeem Loyalty
// -------------------------------- */

// export const redeemLoyaltyPoints = async (
//   customerId: number,
//   points: number,
//   orderId?: number
// ): Promise<RedeemResponse> => {
//   const res = await api.post(
//     `/loyalty-points/${customerId}/redeem`,
//     {
//       points,
//       order_id: orderId,
//     }
//   );

//   return res.data;
// };

// /* -----------------------------
//    Customer Ledger
// -------------------------------- */

// export const getCustomerLoyaltyLedger = async (
//   customerId: number
// ): Promise<LoyaltyLedger[]> => {
//   const res = await api.get(`/loyalty/ledger/${customerId}`);
//   return res.data.ledger;
// };


import { api } from "./api";

/* ============================================================
   TYPES
   These mirror loyalty_routes.py and models/loyalty.py exactly.
   LoyaltyConfig fields changed from the old (points_per_order /
   points_value / min_redemption / max_redemption_percent) shape
   to the current one — every component below has been updated
   to match. Do not reintroduce the old field names anywhere.
============================================================ */

export interface LoyaltyConfig {
  id: number;
  min_order_amount: number;
  points_per_min_order: number;
  min_points: number;
  reward_percent: number;
  is_active: boolean;
  updated_at: string | null;
}

/** Payload shape for create/update — everything except server-assigned fields. */
export type LoyaltyConfigInput = Omit<LoyaltyConfig, "id" | "updated_at">;

/** GET /loyalty/customer/:id — the "can this customer redeem right now" snapshot. */
export interface CustomerLoyalty {
  customer_id: number;
  available_points: number;
  min_points: number;
  reward_percent: number;
  can_redeem: boolean;
  remaining_points_after_redeem: number;
  message: string;
}

/** GET /loyalty-points/:id */
export interface CustomerPoints {
  customer_id: number;
  points: number;
}

export interface LoyaltyLedgerEntry {
  id: number;
  customer_id: number;
  /** Not returned by the current backend to_dict() — always fall back to customer_id in the UI. */
  customer_name?: string;
  order_id?: number | null;
  transaction_type: "EARN" | "REDEEM";
  points: number;
  balance_after: number;
  description?: string | null;
  created_at: string;
}

/** GET /loyalty/ledger (admin, paginated, all customers) */
export interface LoyaltyLedgerPage {
  ledger: LoyaltyLedgerEntry[];
  total: number;
}

/** GET /loyalty-points/report */
export interface LoyaltyReport {
  total_earned: number;
  total_redeemed: number;
  net_outstanding: number;
}

/**
 * POST /loyalty-points/:id/redeem returns whatever the backend's
 * redeem_loyalty_points() service function hands back, spread directly
 * into the response body (not nested). We don't have visibility into
 * that service's exact return shape, so this is intentionally loose —
 * components should treat every field as optional and re-fetch points /
 * ledger afterwards rather than trusting this response for display.
 */
export interface RedeemResponse {
  message?: string;
  points?: number;
  balance_after?: number;
  ledger?: LoyaltyLedgerEntry;
  [key: string]: any;
}

/* ============================================================
   CONFIG  (Admin / Shop Manager)
============================================================ */

export const getLoyaltyConfig = async (): Promise<LoyaltyConfig> => {
  const res = await api.get("/loyalty-config");
  return res.data.config;
};

export const createLoyaltyConfig = async (
  data: LoyaltyConfigInput
): Promise<LoyaltyConfig> => {
  const res = await api.post("/loyalty-config", data);
  return res.data.config;
};

export const updateLoyaltyConfig = async (
  data: Partial<LoyaltyConfigInput>
): Promise<LoyaltyConfig> => {
  const res = await api.put("/loyalty-config", data);
  return res.data.config;
};

/* ============================================================
   CUSTOMER POINTS / ELIGIBILITY
============================================================ */

/** Raw balance — GET /loyalty-points/:id -> { customer_id, points } */
export const getLoyaltyPoints = async (
  customerId: number
): Promise<CustomerPoints> => {
  const res = await api.get(`/loyalty-points/${customerId}`);
  return res.data;
};

/** Convenience wrapper when you only need the number. */
export const getCustomerPoints = async (
  customerId: number
): Promise<number> => {
  const res = await getLoyaltyPoints(customerId);
  return res.points;
};

/** Full eligibility snapshot — GET /loyalty/customer/:id */
export const getCustomerLoyalty = async (
  customerId: number
): Promise<CustomerLoyalty> => {
  const res = await api.get(`/loyalty/customer/${customerId}`);
  return res.data;
};

/* ============================================================
   REDEMPTION
   NOTE: this is the *generic* points-burn endpoint
   (POST /loyalty-points/:id/redeem). It is separate from the
   order-embedded redemption flow (POST /orders with use_loyalty: true),
   which is what actually applies a checkout discount under the current
   model. Use this generic endpoint only for manual / admin point
   adjustments — not to give a customer a discount.
============================================================ */

export const redeemLoyaltyPoints = async (
  customerId: number,
  points: number,
  orderId?: number
): Promise<RedeemResponse> => {
  const res = await api.post(`/loyalty-points/${customerId}/redeem`, {
    points,
    order_id: orderId,
  });
  return res.data;
};

/* ============================================================
   LEDGER
============================================================ */

/** Single customer's history — GET /loyalty/ledger/:id -> { ledger: [...] } */
export const getCustomerLedger = async (
  customerId: number
): Promise<LoyaltyLedgerEntry[]> => {
  const res = await api.get(`/loyalty/ledger/${customerId}`);
  return res.data.ledger;
};

// Alias kept so older imports (getCustomerLoyaltyLedger) keep compiling.
export const getCustomerLoyaltyLedger = getCustomerLedger;

/** All customers, paginated (Admin / Shop Manager) — GET /loyalty/ledger?page= */
export const getLoyaltyLedger = async (
  page: number = 1
): Promise<LoyaltyLedgerPage> => {
  const res = await api.get(`/loyalty/ledger`, { params: { page } });
  return res.data;
};

/* ============================================================
   ADMIN — MANUAL POINT GRANTS
============================================================ */

export const addLoyaltyPoints = async (
  customerId: number,
  points: number,
  orderId?: number
): Promise<{ message: string; ledger: LoyaltyLedgerEntry }> => {
  const res = await api.post(`/loyalty-points/add`, {
    customer_id: customerId,
    points,
    order_id: orderId,
  });
  return res.data;
};

/* ============================================================
   REPORT  (Admin / Shop Manager)
============================================================ */

export const getLoyaltyReport = async (): Promise<LoyaltyReport> => {
  const res = await api.get(`/loyalty-points/report`);
  return res.data;
};