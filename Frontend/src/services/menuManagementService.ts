import { api } from './api';

export const menuManagementService = {
  getProducts: (categoryId?: string) => {
    const params = new URLSearchParams();
    params.set('admin', 'true');
    if (categoryId && categoryId !== 'all') {
      params.set('category_id', categoryId);
    }
    return api.get(`/products?${params.toString()}`);
  },
  getCategories: () => api.get('/category'),
  getSubcategories: () => api.get('/subcategories'),
  getVariants: () => api.get('/variants'),
  getFlavors: (variantId: string | number) => api.get(`/flavors/${variantId}`),
  getAddons: () => api.get('/addons'),
  getCombos: () => api.get('/combos'),
  getPromoCodes: () => api.get('/promos'),

  createProduct: (payload: unknown) => api.post('/products', payload),
  updateProduct: (id: string | number, payload: unknown) => api.put(`/products/${id}`, payload),
  deleteProduct: (id: string | number) => api.delete(`/products/${id}`),

  createCategory: (payload: unknown) => api.post('/category', payload),
  updateCategory: (id: string | number, payload: unknown) => api.put(`/category/${id}`, payload),
  deleteCategory: (id: string | number) => api.delete(`/category/${id}`),

  createSubcategory: (payload: unknown) => api.post('/subcategories', payload),
  updateSubcategory: (id: string | number, payload: unknown) => api.put(`/subcategories/${id}`, payload),
  deleteSubcategory: (id: string | number) => api.delete(`/subcategories/${id}`),

  createVariant: (payload: unknown) => api.post('/variants', payload),
  updateVariant: (id: string | number, payload: unknown) => api.put(`/variants/${id}`, payload),
  deleteVariant: (id: string | number) => api.delete(`/variants/${id}`),

  createFlavor: (payload: unknown) => api.post('/flavors', payload),
  updateFlavor: (id: string | number, payload: unknown) => api.put(`/flavors/${id}`, payload),
  deleteFlavor: (id: string | number) => api.delete(`/flavors/${id}`),

  createAddon: (payload: unknown) => api.post('/addons', payload),
  updateAddon: (id: string | number, payload: unknown) => api.put(`/addons/${id}`, payload),
  deleteAddon: (id: string | number) => api.delete(`/addons/${id}`),

  createCombo: (payload: unknown) => api.post('/combos', payload),
  updateCombo: (id: string | number, payload: unknown) => api.put(`/combos/${id}`, payload),
  deleteCombo: (id: string | number) => api.delete(`/combos/${id}`),

  createPromoCode: (payload: unknown) => api.post('/promos', payload),
  updatePromoCode: (id: string | number, payload: unknown) => api.put(`/promos/${id}`, payload),
  deletePromoCode: (id: string | number) => api.delete(`/promos/${id}`),
};
