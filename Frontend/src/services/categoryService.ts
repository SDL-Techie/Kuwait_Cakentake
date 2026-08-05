import { api } from "./api";

export interface Category {
  id: number;
  name: string;
  image?: string;
  status?: string;
}

/** POST /categories */
export const createCategory = async (payload: Omit<Category, "id">): Promise<Category> => {
  const res = await api.post("/categories", payload);
  return res.data.category;
};

/** GET /categories */
export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories");
  return res.data.categories;
};

/** GET /category/:id */
export const getCategory = async (id: number): Promise<Category> => {
  const res = await api.get(`/category/${id}`);
  return res.data;
};

/** PUT /categories/:cat_id */
export const updateCategory = async (
  catId: number,
  payload: Partial<Omit<Category, "id">>
): Promise<Category> => {
  const res = await api.put(`/categories/${catId}`, payload);
  return res.data.category;
};

/** DELETE /categories/:cat_id */
export const deleteCategory = async (catId: number): Promise<void> => {
  await api.delete(`/categories/${catId}`);
};

/** GET /categories/:cat_id/subcategories */
export const getCategorySubcategories = async (catId: number): Promise<any[]> => {
  const res = await api.get(`/categories/${catId}/subcategories`);
  return res.data.subcategories;
};

/** GET /categories/:cat_id/products */
export const getCategoryProducts = async (catId: number): Promise<any[]> => {
  const res = await api.get(`/categories/${catId}/products`);
  return res.data.products;
};