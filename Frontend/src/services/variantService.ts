import { api } from "./api";

// ─── Variants ─────────────────────────────────────────────────────────────────

/** GET /variants/:product_id */
export const getVariants = async (productId: number): Promise<any[]> => {
  const res = await api.get(`/variants/${productId}`);
  return res.data.variants;
};

/** POST /variants  (ADMIN | SHOP_MANAGER) */
export const createVariant = async (payload: {
  product_id: number;
  name: string;
  price_modifier?: number;
}): Promise<any> => {
  const res = await api.post("/variants", payload);
  return res.data.variant;
};

/** PUT /variants/:variant_id  (ADMIN | SHOP_MANAGER) */
export const updateVariant = async (variantId: number, payload: any): Promise<any> => {
  const res = await api.put(`/variants/${variantId}`, payload);
  return res.data.variant;
};

/** DELETE /variants/:variant_id  (ADMIN | SHOP_MANAGER) */
export const deleteVariant = async (variantId: number): Promise<void> => {
  await api.delete(`/variants/${variantId}`);
};

// ─── Flavors ──────────────────────────────────────────────────────────────────

/** GET /flavors/:variant_id */
export const getFlavors = async (variantId: number): Promise<any[]> => {
  const res = await api.get(`/flavors/${variantId}`);
  return res.data.flavors;
};

/** POST /flavors  (ADMIN | SHOP_MANAGER) */
export const createFlavor = async (payload: {
  variant_id: number;
  name: string;
  price_modifier?: number;
}): Promise<any> => {
  const res = await api.post("/flavors", payload);
  return res.data.flavor;
};

/** PUT /flavors/:flavor_id  (ADMIN | SHOP_MANAGER) */
export const updateFlavor = async (flavorId: number, payload: any): Promise<any> => {
  const res = await api.put(`/flavors/${flavorId}`, payload);
  return res.data.flavor;
};

/** DELETE /flavors/:flavor_id  (ADMIN | SHOP_MANAGER) */
export const deleteFlavor = async (flavorId: number): Promise<void> => {
  await api.delete(`/flavors/${flavorId}`);
};

// ─── Addons ───────────────────────────────────────────────────────────────────

/** GET /addons */
export const getAddons = async (): Promise<any[]> => {
  const res = await api.get("/addons");
  return res.data.addons;
};

/** GET /addons/predefined */
export const getPredefinedAddons = async (): Promise<any[]> => {
  const res = await api.get("/addons/predefined");
  return res.data.addons;
};

/** POST /addons  (ADMIN | SHOP_MANAGER) */
export const createAddon = async (payload: {
  name: string;
  price?: number;
  is_predefined?: boolean;
}): Promise<any> => {
  const res = await api.post("/addons", payload);
  return res.data.addon;
};

/** PUT /addons/:addon_id  (ADMIN | SHOP_MANAGER) */
export const updateAddon = async (addonId: number, payload: any): Promise<any> => {
  const res = await api.put(`/addons/${addonId}`, payload);
  return res.data.addon;
};

/** DELETE /addons/:addon_id  (ADMIN | SHOP_MANAGER) */
export const deleteAddon = async (addonId: number): Promise<void> => {
  await api.delete(`/addons/${addonId}`);
};