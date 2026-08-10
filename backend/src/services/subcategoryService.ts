import { api } from "./api";

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

export interface CreateSubCategoryPayload {
  name: string;
  category_id: number;
  description?: string;
  image_url?: string;
}

export interface UpdateSubCategoryPayload {
  name?: string;
  category_id?: number;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

/** GET /subcategories */
export const getSubCategories = async (): Promise<SubCategory[]> => {
  const res = await api.get("/subcategories");
  return res.data.subcategories;
};

/** POST /subcategories (ADMIN | SHOP_MANAGER) */
export const createSubCategory = async (
  payload: CreateSubCategoryPayload
): Promise<SubCategory> => {
  const res = await api.post("/subcategories", payload);
  return res.data.subcategory;
};

/** PUT /subcategories/:sub_id (ADMIN | SHOP_MANAGER) */
export const updateSubCategory = async (
  subId: number,
  payload: UpdateSubCategoryPayload
): Promise<SubCategory> => {
  const res = await api.put(`/subcategories/${subId}`, payload);
  return res.data.subcategory;
};

/** DELETE /subcategories/:sub_id (ADMIN | SHOP_MANAGER) */
export const deleteSubCategory = async (
  subId: number
): Promise<void> => {
  await api.delete(`/subcategories/${subId}`);
};