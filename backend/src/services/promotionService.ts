import { api } from "./api";
import { PromotionFreeItem } from "./productService";



export interface Promotion {
  id: number;
  name: string;
  description?: string;

  product_id: number;

  product?: {
    id: number;
    name: string;
    image_url?: string;
  };

  promotion_type: "DISCOUNT" | "FREE_ITEM";

  discount_type?: "PERCENT" | "FLAT";

  discount_value?: number;

  start_date?: string;

  end_date?: string;

  is_active: boolean;

  free_items?: PromotionFreeItem[];
}

export interface PromoCode {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
}


export interface CreatePromotionPayload {
  name: string;
  description?: string;

  product_id: number;

  promotion_type: "DISCOUNT" | "FREE_ITEM";

  discount_type?: "PERCENT" | "FLAT";

  discount_value?: number;

  start_date?: string;

  end_date?: string;
}
// ─── Promotions ───────────────────────────────────────────────────────────────

/** GET /promotions  (authenticated) */
export const getPromotions = async (): Promise<Promotion[]> => {
  const res = await api.get("/promotions");
  return res.data.promotions;
};

/** GET /promotions/active  (public) */
export const getActivePromotions = async (): Promise<Promotion[]> => {
  const res = await api.get("/promotions/active");
  return res.data.promotions;
};

/** POST /promotions  (ADMIN | SHOP_MANAGER) */
// export const createPromotion = async (
//   payload: Omit<Promotion, "id" | "is_active">
// ): Promise<Promotion> => {
//   const res = await api.post("/promotions", payload);
//   return res.data.promotion;
// };


export const createPromotion = async (
  payload: CreatePromotionPayload
): Promise<Promotion> => {
  const res = await api.post("/promotions", payload);
  return res.data.promotion;
};


/** PUT /promotions/:promo_id  (ADMIN | SHOP_MANAGER) */
export const updatePromotion = async (
  promoId: number,
  payload: Partial<Promotion>
): Promise<Promotion> => {
  const res = await api.put(`/promotions/${promoId}`, payload);
  return res.data.promotion;
};

/** DELETE /promotions/:promo_id  (ADMIN | SHOP_MANAGER) */
export const deletePromotion = async (promoId: number): Promise<void> => {
  await api.delete(`/promotions/${promoId}`);
};

/** POST /promotions/:promo_id/activate  (ADMIN | SHOP_MANAGER) */
export const activatePromotion = async (promoId: number): Promise<Promotion> => {
  const res = await api.post(`/promotions/${promoId}/activate`);
  return res.data.promotion;
};

/** POST /promotions/:promo_id/deactivate  (ADMIN | SHOP_MANAGER) */
export const deactivatePromotion = async (promoId: number): Promise<Promotion> => {
  const res = await api.post(`/promotions/${promoId}/deactivate`);
  return res.data.promotion;
};

/** POST /promotions/:promo_id/add-free-item  (ADMIN | SHOP_MANAGER) */
export const addFreeItem = async (
  promoId: number,
  productId: number,
  quantity: number = 1
): Promise<any> => {
  const res = await api.post(`/promotions/${promoId}/add-free-item`, {
    product_id: productId,
    quantity,
  });
  return res.data.item;
};

/** DELETE /promotions/:promo_id/remove-free-item  (ADMIN | SHOP_MANAGER) */
export const removeFreeItem = async (promoId: number, productId: number): Promise<void> => {
  await api.delete(`/promotions/${promoId}/remove-free-item`, {
    data: { product_id: productId },
  });
};

/** GET /promotions/:promo_id/free-items */
export const getFreeItems = async (promoId: number): Promise<any[]> => {
  const res = await api.get(`/promotions/${promoId}/free-items`);
  return res.data.free_items;
};

// ─── Promo Codes ──────────────────────────────────────────────────────────────

/** GET /promos  (ADMIN | SHOP_MANAGER) */
export const getPromos = async (): Promise<PromoCode[]> => {
  const res = await api.get("/promos");
  return res.data.promos;
};

/** GET /promos/active  (public) */
export const getActivePromos = async (): Promise<PromoCode[]> => {
  const res = await api.get("/promos/active");
  return res.data.promos;
};

/** POST /promos  (ADMIN | SHOP_MANAGER) */
export const createPromo = async (
  payload: Omit<PromoCode, "id" | "used_count" | "is_active">
): Promise<PromoCode> => {
  const res = await api.post("/promos", payload);
  return res.data.promo;
};

/** PUT /promos/:promo_id  (ADMIN | SHOP_MANAGER) */
export const updatePromo = async (
  promoId: number,
  payload: Partial<PromoCode>
): Promise<PromoCode> => {
  const res = await api.put(`/promos/${promoId}`, payload);
  return res.data.promo;
};

/** DELETE /promos/:promo_id  (ADMIN | SHOP_MANAGER) */
export const deletePromo = async (promoId: number): Promise<void> => {
  await api.delete(`/promos/${promoId}`);
};

/** POST /promos/:code/validate */
export const validatePromo = async (
  code: string
): Promise<{ valid: boolean; promo?: PromoCode; error?: string }> => {
  const res = await api.post(`/promos/${code}/validate`);
  return res.data;
};