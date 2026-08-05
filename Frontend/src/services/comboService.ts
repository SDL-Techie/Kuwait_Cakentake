import { api } from "./api";

export interface Combo {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_amount: number;
  image_url?: string;
  is_active: boolean;
}

/** GET /combos  (public, active only) */
export const getCombos = async (): Promise<Combo[]> => {
  const res = await api.get("/combos");
  return res.data.combos;
};

/** POST /combos  (ADMIN | SHOP_MANAGER) */
export const createCombo = async (
  payload: Omit<Combo, "id" | "is_active">
): Promise<Combo> => {
  const res = await api.post("/combos", payload);
  return res.data.combo;
};

/** PUT /combos/:combo_id  (ADMIN | SHOP_MANAGER) */
export const updateCombo = async (
  comboId: number,
  payload: Partial<Combo>
): Promise<Combo> => {
  const res = await api.put(`/combos/${comboId}`, payload);
  return res.data.combo;
};

/** DELETE /combos/:combo_id  (ADMIN | SHOP_MANAGER) */
export const deleteCombo = async (comboId: number): Promise<void> => {
  await api.delete(`/combos/${comboId}`);
};

/** POST /combos/:combo_id/add-product  (ADMIN | SHOP_MANAGER) */
export const addProductToCombo = async (comboId: number, productId: number): Promise<any> => {
  const res = await api.post(`/combos/${comboId}/add-product`, { product_id: productId });
  return res.data.combo;
};

/** DELETE /combos/:combo_id/remove-product  (ADMIN | SHOP_MANAGER) */
export const removeProductFromCombo = async (
  comboId: number,
  productId: number
): Promise<void> => {
  await api.delete(`/combos/${comboId}/remove-product`, {
    data: { product_id: productId },
  });
};

/** GET /combos/:combo_id/items */
export const getComboItems = async (comboId: number): Promise<any[]> => {
  const res = await api.get(`/combos/${comboId}/items`);
  return res.data.products;
};

/** GET /combos/:combo_id/price-preview */
export const getComboPricePreview = async (comboId: number): Promise<any> => {
  const res = await api.get(`/combos/${comboId}/price-preview`);
  return res.data;
};