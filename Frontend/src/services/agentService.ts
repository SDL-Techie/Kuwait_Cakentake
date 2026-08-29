// import { api } from "./api";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────

// export interface Agent {
//   id: number;
//   first_name: string;
//   last_name: string;
//   phone_no: string;
//   email: string;
//   role: string;
//   is_active: boolean;
//   created_by: number | null;
//   default_discount: number;
//   created_at: string;

//   [key: string]: any;
// }

// export interface AgentProduct {
//   id: number;
//   agent_id: number;
//   name: string;
//   description: string | null;
//   variants: string[];
//   flavours: string[];
//   price: number;
//   image: string | null;
//   cloudinary_public_id: string | null;
//   is_active: boolean;
//   created_by: number | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface BakeryProduct {
//   id: number;
//   name: string;
//   price: number;

//   [key: string]: any;
// }

// export interface AgentOrderItemInput {
//   product_id: number;
//   quantity: number;
//   custom_json?: any;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CREATE AGENT ORDER PAYLOAD
// // ─────────────────────────────────────────────────────────────────────────────

// export interface CreateAgentOrderPayload {
//   customer_id: number;

//   /*
//    * DELIVERY -> address ID
//    * PICKUP   -> null
//    */
//   address_id: number | null;

//   items: AgentOrderItemInput[];

//   payment_method?:
//     | "COD"
//     | "CARD"
//     | "STRIPE"
//     | "KNET"
//     | "UPI"
//     | "LINK";

//   currency?:
//     | "INR"
//     | "KWD"
//     | "AED"
//     | "USD"
//     | "SAR"
//     | "SGD";

//   /*
//    * DELIVERY
//    */
//   delivery_date?: string;
//   delivery_time_slot?: string;

//   /*
//    * PICKUP
//    */
//   pickup_date?: string;
//   pickup_time_slot?: string;

//   greeting_message?: string;
//   greeting_from?: string;
//   greeting_to?: string;

//   /*
//    * Agent order fields
//    */
//   order_source?: "AGENT_SELF" | "AGENT";

//   delivery_method?: "PICKUP" | "DELIVERY";

//   agent_notes?: string;

//   agent_discount_percentage?: number;

//   discount_total?: number;

//   delivery_charge?: number;

//   subtotal?: number;

//   grand_total?: number;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // DASHBOARD
// // ─────────────────────────────────────────────────────────────────────────────

// export interface AgentDashboard {
//   agent: Agent;

//   todays_orders: number;
//   todays_revenue: number;

//   pending_orders: number;
//   completed_orders: number;
//   cancelled_orders: number;

//   total_orders: number;
//   total_revenue: number;
//   total_customers: number;

//   recent_orders: any[];
// }

// export interface AgentCatalog {
//   products: BakeryProduct[];
//   agent_products: AgentProduct[];
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // OWNER — AGENTS
// // ─────────────────────────────────────────────────────────────────────────────

// export const createAgent = async (payload: {
//   first_name: string;
//   last_name: string;
//   phone_no: string;
//   email: string;
//   password: string;
//   default_discount?: number;
// }): Promise<Agent> => {
//   const res = await api.post(
//     "/owner/agents",
//     payload
//   );

//   return res.data?.agent;
// };

// export const getAgents = async (
//   activeOnly?: boolean
// ): Promise<Agent[]> => {
//   const res = await api.get(
//     "/owner/agents",
//     {
//       params:
//         activeOnly === undefined
//           ? {}
//           : {
//               active: activeOnly
//                 ? "true"
//                 : "false",
//             },
//     }
//   );

//   return res.data?.agents ?? [];
// };

// export const getAgentById = async (
//   agentId: number
// ): Promise<Agent> => {
//   const res = await api.get(
//     `/owner/agents/${agentId}`
//   );

//   return res.data?.agent;
// };

// export const updateAgent = async (
//   agentId: number,
//   payload: Partial<{
//     first_name: string;
//     last_name: string;
//     phone_no: string;
//     email: string;
//     password: string;
//   }>
// ): Promise<Agent> => {
//   const res = await api.put(
//     `/owner/agents/${agentId}`,
//     payload
//   );

//   return res.data?.agent;
// };

// export const deleteAgent = async (
//   agentId: number
// ): Promise<void> => {
//   await api.delete(
//     `/owner/agents/${agentId}`
//   );
// };

// export const setAgentStatus = async (
//   agentId: number,
//   active: boolean
// ): Promise<Agent> => {
//   const res = await api.patch(
//     `/owner/agents/${agentId}/status`,
//     {
//       active,
//     }
//   );

//   return res.data?.agent;
// };

// export const resetAgentPassword = async (
//   agentId: number,
//   password: string
// ): Promise<void> => {
//   await api.post(
//     `/owner/agents/${agentId}/reset-password`,
//     {
//       password,
//     }
//   );
// };

// export const setAgentDiscount = async (
//   agentId: number,
//   default_discount: number
// ): Promise<Agent> => {
//   const res = await api.patch(
//     `/owner/agents/${agentId}/discount`,
//     {
//       default_discount,
//     }
//   );

//   return res.data?.agent;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // OWNER — AGENT PRODUCTS
// // ─────────────────────────────────────────────────────────────────────────────

// export const createAgentProduct = async (
//   payload: {
//     agent_id: number;
//     name: string;
//     price: number;
//     description?: string;
//     variants?: string[];
//     flavours?: string[];
//     image?: string;
//     cloudinary_public_id?: string;
//   }
// ): Promise<AgentProduct> => {
//   const res = await api.post(
//     "/owner/agent-products",
//     payload
//   );

//   return res.data?.product;
// };

// export const getAllAgentProducts =
//   async (): Promise<AgentProduct[]> => {
//     const res = await api.get(
//       "/owner/agent-products"
//     );

//     return res.data?.products ?? [];
//   };

// export const getAgentProductsForAgent =
//   async (
//     agentId: number
//   ): Promise<AgentProduct[]> => {
//     const res = await api.get(
//       `/owner/agents/${agentId}/products`
//     );

//     return res.data?.products ?? [];
//   };

// export const updateAgentProduct = async (
//   productId: number,
//   payload: Partial<{
//     name: string;
//     description: string;
//     variants: string[];
//     flavours: string[];
//     price: number;
//     image: string;
//     cloudinary_public_id: string;
//     is_active: boolean;
//   }>
// ): Promise<AgentProduct> => {
//   const res = await api.put(
//     `/owner/agent-products/${productId}`,
//     payload
//   );

//   return res.data?.product;
// };

// export const deleteAgentProduct = async (
//   productId: number
// ): Promise<void> => {
//   await api.delete(
//     `/owner/agent-products/${productId}`
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // AGENT — PRODUCTS
// // ─────────────────────────────────────────────────────────────────────────────

// export const getMyAgentProducts =
//   async (): Promise<AgentProduct[]> => {
//     const res = await api.get(
//       "/agent/my-products"
//     );

//     return res.data?.products ?? [];
//   };

// export const getBakeryProductsForAgent =
//   async (
//     currency: string = "KWD"
//   ): Promise<BakeryProduct[]> => {
//     const res = await api.get(
//       "/agent/products",
//       {
//         headers: {
//           "X-Currency": currency,
//         },
//       }
//     );

//     return res.data?.products ?? [];
//   };

// export const getAgentCatalog = async (
//   currency: string = "KWD"
// ): Promise<AgentCatalog> => {
//   const res = await api.get(
//     "/agent/catalog",
//     {
//       headers: {
//         "X-Currency": currency,
//       },
//     }
//   );

//   return res.data;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // AGENT — DASHBOARD
// // ─────────────────────────────────────────────────────────────────────────────

// export const getAgentDashboard =
//   async (): Promise<AgentDashboard> => {
//     const res = await api.get(
//       "/agent/dashboard"
//     );

//     return res.data;
//   };

// // ─────────────────────────────────────────────────────────────────────────────
// // AGENT — ORDERS
// // ─────────────────────────────────────────────────────────────────────────────

// export const getAgentOrders = async (
//   status?: string
// ): Promise<any[]> => {
//   const res = await api.get(
//     "/agent/orders",
//     {
//       params: status
//         ? {
//             status,
//           }
//         : {},
//     }
//   );

//   return res.data?.orders ?? [];
// };

// export const getAgentOrderById = async (
//   orderId: number
// ): Promise<any> => {
//   const res = await api.get(
//     `/agent/orders/${orderId}`
//   );

//   return res.data?.order;
// };

// /**
//  * POST /agent/orders/:id/cancel
//  * Lets the logged-in Agent cancel one of THEIR OWN orders — the backend
//  * (see agent_routes.py) only allows this while the order is still PENDING,
//  * i.e. before the shop has accepted it. Mirrors the read-only ownership
//  * scoping already used by getAgentOrders / getAgentOrderById.
//  */
// export const cancelAgentOrder = async (
//   orderId: number,
//   reason?: string
// ): Promise<any> => {
//   const res = await api.post(
//     `/agent/orders/${orderId}/cancel`,
//     {
//       reason: reason ?? null,
//     }
//   );

//   return res.data?.order ?? res.data;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CREATE AGENT ORDER
// // ─────────────────────────────────────────────────────────────────────────────

// export const createAgentOrder = async (
//   payload: CreateAgentOrderPayload
// ): Promise<any> => {
//   console.log(
//     "========================================"
//   );

//   console.log(
//     "CREATE AGENT ORDER API"
//   );

//   console.log(
//     "========================================"
//   );

//   console.log(
//     "Payload:",
//     JSON.stringify(
//       payload,
//       null,
//       2
//     )
//   );

//   try {
//     const res = await api.post(
//       "/agent/orders",
//       payload
//     );

//     console.log(
//       "CREATE AGENT ORDER RESPONSE:",
//       res.data
//     );

//     return res.data?.order;

//   } catch (error: any) {
//     console.error(
//       "CREATE AGENT ORDER ERROR:"
//     );

//     console.error(
//       "Status:",
//       error?.response?.status
//     );

//     console.error(
//       "Data:",
//       error?.response?.data
//     );

//     console.error(
//       "Message:",
//       error?.message
//     );

//     throw error;
//   }
// };


import { api } from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
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

  [key: string]: any;
}

/** A single variant or flavour option with its own price add-on. */
export interface AgentProductOption {
  name: string;
  /** Amount added to the base product price when this option is selected. */
  price_modifier: number;
}

export interface AgentProduct {
  id: number;
  agent_id: number;
  name: string;
  description: string | null;
  variants: AgentProductOption[];
  flavours: AgentProductOption[];
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

  [key: string]: any;
}

export interface AgentOrderItemInput {
  product_id: number;
  quantity: number;
  custom_json?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE AGENT ORDER PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAgentOrderPayload {
  customer_id: number;

  /*
   * DELIVERY -> address ID
   * PICKUP   -> null
   */
  address_id: number | null;

  items: AgentOrderItemInput[];

  payment_method?:
    | "COD"
    | "CARD"
    | "STRIPE"
    | "KNET"
    | "UPI"
    | "LINK";

  currency?:
    | "INR"
    | "KWD"
    | "AED"
    | "USD"
    | "SAR"
    | "SGD";

  /*
   * DELIVERY
   */
  delivery_date?: string;
  delivery_time_slot?: string;

  /*
   * PICKUP
   */
  pickup_date?: string;
  pickup_time_slot?: string;

  greeting_message?: string;
  greeting_from?: string;
  greeting_to?: string;

  /*
   * Agent order fields
   */
  order_source?: "AGENT_SELF" | "AGENT";

  delivery_method?: "PICKUP" | "DELIVERY";

  agent_notes?: string;

  agent_discount_percentage?: number;

  discount_total?: number;

  delivery_charge?: number;

  subtotal?: number;

  grand_total?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

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
  products: BakeryProduct[];
  agent_products: AgentProduct[];
}

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — AGENTS
// ─────────────────────────────────────────────────────────────────────────────

export const createAgent = async (payload: {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
  default_discount?: number;
}): Promise<Agent> => {
  const res = await api.post(
    "/owner/agents",
    payload
  );

  return res.data?.agent;
};

export const getAgents = async (
  activeOnly?: boolean
): Promise<Agent[]> => {
  const res = await api.get(
    "/owner/agents",
    {
      params:
        activeOnly === undefined
          ? {}
          : {
              active: activeOnly
                ? "true"
                : "false",
            },
    }
  );

  return res.data?.agents ?? [];
};

export const getAgentById = async (
  agentId: number
): Promise<Agent> => {
  const res = await api.get(
    `/owner/agents/${agentId}`
  );

  return res.data?.agent;
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
  const res = await api.put(
    `/owner/agents/${agentId}`,
    payload
  );

  return res.data?.agent;
};

export const deleteAgent = async (
  agentId: number
): Promise<void> => {
  await api.delete(
    `/owner/agents/${agentId}`
  );
};

export const setAgentStatus = async (
  agentId: number,
  active: boolean
): Promise<Agent> => {
  const res = await api.patch(
    `/owner/agents/${agentId}/status`,
    {
      active,
    }
  );

  return res.data?.agent;
};

export const resetAgentPassword = async (
  agentId: number,
  password: string
): Promise<void> => {
  await api.post(
    `/owner/agents/${agentId}/reset-password`,
    {
      password,
    }
  );
};

export const setAgentDiscount = async (
  agentId: number,
  default_discount: number
): Promise<Agent> => {
  const res = await api.patch(
    `/owner/agents/${agentId}/discount`,
    {
      default_discount,
    }
  );

  return res.data?.agent;
};

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — AGENT PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

export const createAgentProduct = async (
  payload: {
    agent_id: number;
    name: string;
    price: number;
    description?: string;
    /** Each option carries its own price_modifier, e.g. { name: "1kg", price_modifier: 2 } */
    variants?: AgentProductOption[];
    flavours?: AgentProductOption[];
    image?: string;
    cloudinary_public_id?: string;
  }
): Promise<AgentProduct> => {
  const res = await api.post(
    "/owner/agent-products",
    payload
  );

  return res.data?.product;
};

export const getAllAgentProducts =
  async (): Promise<AgentProduct[]> => {
    const res = await api.get(
      "/owner/agent-products"
    );

    return res.data?.products ?? [];
  };

export const getAgentProductsForAgent =
  async (
    agentId: number
  ): Promise<AgentProduct[]> => {
    const res = await api.get(
      `/owner/agents/${agentId}/products`
    );

    return res.data?.products ?? [];
  };

export const updateAgentProduct = async (
  productId: number,
  payload: Partial<{
    name: string;
    description: string;
    variants: AgentProductOption[];
    flavours: AgentProductOption[];
    price: number;
    image: string;
    cloudinary_public_id: string;
    is_active: boolean;
  }>
): Promise<AgentProduct> => {
  const res = await api.put(
    `/owner/agent-products/${productId}`,
    payload
  );

  return res.data?.product;
};

export const deleteAgentProduct = async (
  productId: number
): Promise<void> => {
  await api.delete(
    `/owner/agent-products/${productId}`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT — PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

export const getMyAgentProducts =
  async (): Promise<AgentProduct[]> => {
    const res = await api.get(
      "/agent/my-products"
    );

    return res.data?.products ?? [];
  };

export const getBakeryProductsForAgent =
  async (
    currency: string = "KWD"
  ): Promise<BakeryProduct[]> => {
    const res = await api.get(
      "/agent/products",
      {
        headers: {
          "X-Currency": currency,
        },
      }
    );

    return res.data?.products ?? [];
  };

export const getAgentCatalog = async (
  currency: string = "KWD"
): Promise<AgentCatalog> => {
  const res = await api.get(
    "/agent/catalog",
    {
      headers: {
        "X-Currency": currency,
      },
    }
  );

  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT — DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export const getAgentDashboard =
  async (): Promise<AgentDashboard> => {
    const res = await api.get(
      "/agent/dashboard"
    );

    return res.data;
  };

// ─────────────────────────────────────────────────────────────────────────────
// AGENT — ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export const getAgentOrders = async (
  status?: string
): Promise<any[]> => {
  const res = await api.get(
    "/agent/orders",
    {
      params: status
        ? {
            status,
          }
        : {},
    }
  );

  return res.data?.orders ?? [];
};

export const getAgentOrderById = async (
  orderId: number
): Promise<any> => {
  const res = await api.get(
    `/agent/orders/${orderId}`
  );

  return res.data?.order;
};

/**
 * POST /agent/orders/:id/cancel
 * Lets the logged-in Agent cancel one of THEIR OWN orders — the backend
 * (see agent_routes.py) only allows this while the order is still PENDING,
 * i.e. before the shop has accepted it. Mirrors the read-only ownership
 * scoping already used by getAgentOrders / getAgentOrderById.
 */
export const cancelAgentOrder = async (
  orderId: number,
  reason?: string
): Promise<any> => {
  const res = await api.post(
    `/agent/orders/${orderId}/cancel`,
    {
      reason: reason ?? null,
    }
  );

  return res.data?.order ?? res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE AGENT ORDER
// ─────────────────────────────────────────────────────────────────────────────

export const createAgentOrder = async (
  payload: CreateAgentOrderPayload
): Promise<any> => {
  console.log(
    "========================================"
  );

  console.log(
    "CREATE AGENT ORDER API"
  );

  console.log(
    "========================================"
  );

  console.log(
    "Payload:",
    JSON.stringify(
      payload,
      null,
      2
    )
  );

  try {
    const res = await api.post(
      "/agent/orders",
      payload
    );

    console.log(
      "CREATE AGENT ORDER RESPONSE:",
      res.data
    );

    return res.data?.order;

  } catch (error: any) {
    console.error(
      "CREATE AGENT ORDER ERROR:"
    );

    console.error(
      "Status:",
      error?.response?.status
    );

    console.error(
      "Data:",
      error?.response?.data
    );

    console.error(
      "Message:",
      error?.message
    );

    throw error;
  }
};