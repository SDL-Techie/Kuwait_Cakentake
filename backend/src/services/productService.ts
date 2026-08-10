import { BASE_URL } from "./api";
import axios from "axios";

// ─── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const currency = localStorage.getItem("currency");

  if (currency) {
    config.headers["X-Currency"] = currency;
  }

  return config;
});

// Handle 401 the same way StaffManagement does
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── TypeScript Interfaces ─────────────────────────────────────────────────────
// These match the exact fields returned by each model's to_dict()

// export interface Product {
//   id: number;
//   name: string;
//   description: string | null;
//   category_id: number;
//   category_name: string | null;
//   price: number;
//   original_price: number | null;
//   currency: string;
//   stock: number;
//   unit: string;
//   image_url: string | null;
//   ingredients: string | null;
//   is_active: boolean;
//   created_at: string | null;
//   updated_at: string | null;
// }

export interface Category {
  id: number;
  name: string;
  image: string | null;
  status: string;
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;

  category: Category | null;
  subcategory?: SubCategory | null;

  variants: Variant[];

  price: number;
  original_price: number | null;

  wholesaleprice?: number | null;

  currency: string;

  stock: number;
  unit: string;

  image_url: string | null;
  ingredients: string | null;

  is_active: boolean;

  created_at: string | null;
  updated_at: string |null;
}

export interface CreateProductPayload {
  name: string;
  category_id: number;
  price: number;
  original_price?: number;
  stock?: number;
  unit: string;
  image_url?: string;
  description?: string;
  ingredients?: string;
  is_active?: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  original_price?: number;
  stock?: number;
  unit?: string;
  image_url?: string;
  category_id?: number;
  ingredients?: string;
  is_active?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  /** Backend field is "image" (not image_url) for Category */
  image: string | null;
  status: string;
}

export interface CreateCategoryPayload {
  name: string;
  image?: string;
  status?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  image?: string;
  status?: string;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description: string | null;
  image_url: string | null;
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

// ──────────────────────────────────────────────────────────────────────────────

export interface Variant {
  id: number;
  product_id: number;
  name: string;
  price_modifier: number;
  is_active: boolean;
  type: string;
  flavors: Flavor[];
}

export interface CreateVariantPayload {
  product_id: number;
  name: string;
  price_modifier?: number;
}

export interface UpdateVariantPayload {
  name?: string;
  price_modifier?: number;
  is_active?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface Flavor {
  id: number;
  variant_id: number;
  name: string;
  price_modifier: number;
  is_active: boolean;
}

export interface CreateFlavorPayload {
  variant_id: number;
  name: string;
  price_modifier?: number;
}

export interface UpdateFlavorPayload {
  name?: string;
  price_modifier?: number;
  is_active?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface Addon {
  id: number;
  name: string;
  price: number;
  image_url: string | null; 
  is_predefined: boolean;
  is_active: boolean;
}

export interface CreateAddonPayload {
  name: string;
  price?: number;
  image_url?: string; 
  is_predefined?: boolean;
}

export interface UpdateAddonPayload {
  name?: string;
  price?: number;
  image_url?: string; 
  is_predefined?: boolean;
  is_active?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface Combo {
  id: number;
  name: string;
  description: string | null;
  price: number;
  discount_amount: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  products?: Product[];
}

export interface CreateComboPayload {
  name: string;
  description?: string;
  price: number;
  discount_amount?: number;
  image_url?: string;
}

export interface UpdateComboPayload {
  name?: string;
  description?: string;
  price?: number;
  discount_amount?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ComboPricePreview {
  combo_id: number;
  combo_price: number;
  individual_total: number;
  savings: number;
}

// ──────────────────────────────────────────────────────────────────────────────

// export interface PromotionFreeItem {
//   id: number;
//   promotion_id: number;
//   product_id: number;
//   quantity: number;
//   product: Product | null;
// }

export interface PromotionFreeItem {
  id: number;
  promotion_id: number;
  product_id: number;
  quantity: number;

  product?: {
    id: number;
    name: string;
    image_url?: string;
  };
}

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  discount_type: string;       // "PERCENT" | "FLAT"
  discount_value: number;
  min_order_value: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  free_items: PromotionFreeItem[];
}

export interface CreatePromotionPayload {
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_order_value?: number;
  start_date?: string;         // ISO string e.g. "2025-01-01"
  end_date?: string;
}

export interface UpdatePromotionPayload {
  name?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  min_order_value?: number;
  start_date?: string;
  end_date?: string;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface PromoCode {
  id: number;
  code: string;
  discount_type: string;       // "PERCENT" | "FLAT"
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;   // backend field is "expires_at"
}

export interface CreatePromoCodePayload {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value?: number;
  max_uses?: number;
  expires_at?: string;         // ISO string
}

export interface UpdatePromoCodePayload {
  discount_type?: string;
  discount_value?: number;
  min_order_value?: number;
  max_uses?: number;
  is_active?: boolean;
  expires_at?: string;
}

export interface ValidatePromoResponse {
  valid: boolean;
  promo?: PromoCode;
  error?: string;
}

// =============================================================================
// ─── PRODUCT SERVICE ─────────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /products
 * Public — no JWT required.
 * Returns all products.
 */
export const getAllProducts = async (
  currency?: string,
  agent = false
): Promise<Product[]> => {
  // If a currency is provided, pass it explicitly so callers (e.g., Sales Agent UI)
  // can request the raw stored prices in KWD. The api instance also attaches
  // X-Currency from localStorage; providing it here overrides that value.
  const options: any = {};

  if (currency) {
    options.headers = { "X-Currency": currency };
  }

  if (agent) {
    options.params = { agent: "true" };
  }

  const res = await api.get("/products", options);
  // Backend returns a plain array
  return res.data;
};

/**
 * GET /products/:id
 * Public — no JWT required.
 */
// export const getProductById = async (id: number): Promise<Product> => {
//   const res = await api.get(`/products/${id}`);
//   return res.data;
// };


export const getProductById = async (id: number): Promise<Product> => {
  const currency = localStorage.getItem("currency") || "KWD";

  const res = await api.get(`/products/${id}`, {
    headers: {
      "X-Currency": currency,
    },
  });

  return res.data;
};

/**
 * GET /products/category/:category_id
 * Public — no JWT required.
 * Returns { products: Product[] }
 */
export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  const res = await api.get(`/products/category/${categoryId}`);
  return res.data.products;
};

/**
 * GET /products/:product_id/variants
 * Public — no JWT required.
 * Returns { variants: Variant[] }
 */
export const getProductVariants = async (productId: number): Promise<Variant[]> => {
  const res = await api.get(`/products/${productId}/variants`);
  return res.data.variants;
};

/**
 * POST /products
 * No JWT required (route has no @jwt_required decorator).
 * Returns { message, product }
 */
export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await api.post("/products", payload);
  return res.data.product;
};

/**
 * PUT /products/:id
 * No JWT required.
 * Returns { message, product }
 */
export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data.product;
};

/**
 * DELETE /products/:id
 * No JWT required.
 * Returns { message }
 */
export const deleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

// =============================================================================
// ─── CATEGORY SERVICE ────────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /category   (original endpoint — returns plain array)
 * GET /categories (new endpoint  — returns { categories: [] })
 * Both are public. We use /category for backwards compatibility.
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const res = await api.get("/category");
  // Returns a plain array
  return res.data;
};

/**
 * GET /category/:id
 */
export const getCategoryById = async (id: number): Promise<Category> => {
  const res = await api.get(`/category/${id}`);
  return res.data;
};

/**
 * GET /categories/:cat_id/products
 * Returns { products: Product[] }
 */
export const getCategoryProducts = async (catId: number): Promise<Product[]> => {
  const res = await api.get(`/categories/${catId}/products`);
  return res.data.products;
};

/**
 * GET /categories/:cat_id/subcategories
 * Returns { subcategories: SubCategory[] }
 */
export const getCategorySubcategories = async (catId: number): Promise<SubCategory[]> => {
  const res = await api.get(`/categories/${catId}/subcategories`);
  return res.data.subcategories;
};

/**
 * POST /category
 * No JWT required.
 * Returns { message, category }
 */
export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const res = await api.post("/category", payload);
  return res.data.category;
};

/**
 * PUT /category/:id
 * No JWT required.
 * Returns { message, category }
 */
export const updateCategory = async (
  id: number,
  payload: UpdateCategoryPayload
): Promise<Category> => {
  const res = await api.put(`/category/${id}`, payload);
  return res.data.category;
};

/**
 * DELETE /category/:id
 * No JWT required.
 * Returns { message }
 */
export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  const res = await api.delete(`/category/${id}`);
  return res.data;
};

// =============================================================================
// ─── SUBCATEGORY SERVICE ─────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /subcategories
 * Public — no JWT.
 * Returns { subcategories: SubCategory[] }
 */
export const getAllSubCategories = async (): Promise<SubCategory[]> => {
  const res = await api.get("/subcategories");
  return res.data.subcategories;
};

/**
 * POST /subcategories
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, subcategory }
 */
export const createSubCategory = async (
  payload: CreateSubCategoryPayload
): Promise<SubCategory> => {
  const res = await api.post("/subcategories", payload);
  return res.data.subcategory;
};

/**
 * PUT /subcategories/:sub_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, subcategory }
 */
export const updateSubCategory = async (
  subId: number,
  payload: UpdateSubCategoryPayload
): Promise<SubCategory> => {
  const res = await api.put(`/subcategories/${subId}`, payload);
  return res.data.subcategory;
};

/**
 * DELETE /subcategories/:sub_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deleteSubCategory = async (subId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/subcategories/${subId}`);
  return res.data;
};

// =============================================================================
// ─── VARIANT SERVICE ─────────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /variants/:product_id
 * Public — no JWT.
 * Returns { variants: Variant[] }
 */
// export const getVariantsByProduct = async (productId: number): Promise<Variant[]> => {
//   const res = await api.get(`/variants/${productId}`);
//   return res.data.variants;
// };

// export const getAllVariants = async (): Promise<Variant[]> => {
//   const res = await api.get("/variants");
//   return res.data.variants;
// };

export const getVariantsByProduct = async (
  productId: number
): Promise<Variant[]> => {
  const res = await api.get(`/variants/${productId}`);

  return res.data.variants.filter(
    (item: Variant) => item.type === "Variant"
  );
};

export const getAllVariants = async (): Promise<Variant[]> => {
  const res = await api.get("/variants");

  return res.data.variants.filter(
    (item: Variant) => item.type === "Variant"
  );
};

/**
 * POST /variants
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, variant }
 */
export const createVariant = async (payload: CreateVariantPayload): Promise<Variant> => {
  const res = await api.post("/variants", payload);
  return res.data.variant;
};

/**
 * PUT /variants/:variant_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, variant }
 */
export const updateVariant = async (
  variantId: number,
  payload: UpdateVariantPayload
): Promise<Variant> => {
  const res = await api.put(`/variants/${variantId}`, payload);
  return res.data.variant;
};

/**
 * DELETE /variants/:variant_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deleteVariant = async (variantId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/variants/${variantId}`);
  return res.data;
};

// =============================================================================
// ─── FLAVOR SERVICE ──────────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /flavors/:variant_id
 * Public — no JWT.
 * Returns { flavors: Flavor[] }
 */
export const getFlavorsByVariant = async (variantId: number): Promise<Flavor[]> => {
  const res = await api.get(`/flavors/${variantId}`);
  return res.data.flavors;
};

/**
 * POST /flavors
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, flavor }
 */
export const createFlavor = async (payload: CreateFlavorPayload): Promise<Flavor> => {
  const res = await api.post("/flavors", payload);
  return res.data.flavor;
};

/**
 * PUT /flavors/:flavor_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, flavor }
 */
export const updateFlavor = async (
  flavorId: number,
  payload: UpdateFlavorPayload
): Promise<Flavor> => {
  const res = await api.put(`/flavors/${flavorId}`, payload);
  return res.data.flavor;
};

/**
 * DELETE /flavors/:flavor_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deleteFlavor = async (flavorId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/flavors/${flavorId}`);
  return res.data;
};

// =============================================================================
// ─── ADDON SERVICE ───────────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /addons
 * Public — no JWT. Returns only active addons.
 * Returns { addons: Addon[] }
 */
export const getAllAddons = async (): Promise<Addon[]> => {
  const res = await api.get("/addons");
  return res.data.addons;
};

/**
 * GET /addons/predefined
 * Public — no JWT. Returns only predefined + active addons.
 * Returns { addons: Addon[] }
 */
export const getPredefinedAddons = async (): Promise<Addon[]> => {
  const res = await api.get("/addons/predefined");
  return res.data.addons;
};

/**
 * POST /addons
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, addon }
 */
export const createAddon = async (payload: CreateAddonPayload): Promise<Addon> => {
  const res = await api.post("/addons", payload);
  return res.data.addon;
};

/**
 * PUT /addons/:addon_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, addon }
 */
export const updateAddon = async (
  addonId: number,
  payload: UpdateAddonPayload
): Promise<Addon> => {
  const res = await api.put(`/addons/${addonId}`, payload);
  return res.data.addon;
};

/**
 * DELETE /addons/:addon_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deleteAddon = async (addonId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/addons/${addonId}`);
  return res.data;
};

// =============================================================================
// ─── COMBO SERVICE ───────────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /combos
 * Public — no JWT. Returns active combos only.
 * Returns { combos: Combo[] }
 */
export const getAllCombos = async (): Promise<Combo[]> => {
  const res = await api.get("/combos");
  return res.data.combos;
};

/**
 * POST /combos
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, combo }
 */
export const createCombo = async (payload: CreateComboPayload): Promise<Combo> => {
  const res = await api.post("/combos", payload);
  return res.data.combo;
};

/**
 * PUT /combos/:combo_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, combo }
 */
export const updateCombo = async (
  comboId: number,
  payload: UpdateComboPayload
): Promise<Combo> => {
  const res = await api.put(`/combos/${comboId}`, payload);
  return res.data.combo;
};

/**
 * DELETE /combos/:combo_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deleteCombo = async (comboId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/combos/${comboId}`);
  return res.data;
};

/**
 * POST /combos/:combo_id/add-product
 * JWT required — ADMIN or SHOP_MANAGER.
 * Body: { product_id: number }
 * Returns { message, combo } — combo includes products[]
 */
export const addProductToCombo = async (
  comboId: number,
  productId: number
): Promise<Combo> => {
  const res = await api.post(`/combos/${comboId}/add-product`, { product_id: productId });
  return res.data.combo;
};

/**
 * DELETE /combos/:combo_id/remove-product
 * JWT required — ADMIN or SHOP_MANAGER.
 * Body: { product_id: number }
 * Returns { message }
 */
export const removeProductFromCombo = async (
  comboId: number,
  productId: number
): Promise<{ message: string }> => {
  const res = await api.delete(`/combos/${comboId}/remove-product`, {
    data: { product_id: productId },
  });
  return res.data;
};

/**
 * GET /combos/:combo_id/items
 * Public — no JWT.
 * Returns { products: Product[] }
 */
export const getComboItems = async (comboId: number): Promise<Product[]> => {
  const res = await api.get(`/combos/${comboId}/items`);
  return res.data.products;
};

/**
 * GET /combos/:combo_id/price-preview
 * Public — no JWT.
 * Returns { combo_id, combo_price, individual_total, savings }
 */
export const getComboPricePreview = async (
  comboId: number
): Promise<ComboPricePreview> => {
  const res = await api.get(`/combos/${comboId}/price-preview`);
  return res.data;
};

// =============================================================================
// ─── PROMOTION SERVICE ───────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /promotions
 * JWT required (any role).
 * Returns { promotions: Promotion[] }
 */
export const getAllPromotions = async (): Promise<Promotion[]> => {
  const res = await api.get("/promotions");
  return res.data.promotions;
};

/**
 * GET /promotions/active
 * Public — no JWT.
 * Returns { promotions: Promotion[] }
 */
export const getActivePromotions = async (): Promise<Promotion[]> => {
  const res = await api.get("/promotions/active");
  return res.data.promotions;
};

/**
 * POST /promotions
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, promotion }
 */
export const createPromotion = async (
  payload: CreatePromotionPayload
): Promise<Promotion> => {
  const res = await api.post("/promotions", payload);
  return res.data.promotion;
};

/**
 * PUT /promotions/:promo_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, promotion }
 */
export const updatePromotion = async (
  promoId: number,
  payload: UpdatePromotionPayload
): Promise<Promotion> => {
  const res = await api.put(`/promotions/${promoId}`, payload);
  return res.data.promotion;
};

/**
 * DELETE /promotions/:promo_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deletePromotion = async (promoId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/promotions/${promoId}`);
  return res.data;
};

/**
 * POST /promotions/:promo_id/activate
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, promotion }
 */
export const activatePromotion = async (promoId: number): Promise<Promotion> => {
  const res = await api.post(`/promotions/${promoId}/activate`);
  return res.data.promotion;
};

/**
 * POST /promotions/:promo_id/deactivate
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, promotion }
 */
export const deactivatePromotion = async (promoId: number): Promise<Promotion> => {
  const res = await api.post(`/promotions/${promoId}/deactivate`);
  return res.data.promotion;
};

/**
 * GET /promotions/:promo_id/free-items
 * Public — no JWT.
 * Returns { free_items: PromotionFreeItem[] }
 */
export const getPromotionFreeItems = async (
  promoId: number
): Promise<PromotionFreeItem[]> => {
  const res = await api.get(`/promotions/${promoId}/free-items`);
  return res.data.free_items;
};

/**
 * POST /promotions/:promo_id/add-free-item
 * JWT required — ADMIN or SHOP_MANAGER.
 * Body: { product_id: number, quantity?: number }
 * Returns { message, item }
 */
export const addFreeItemToPromotion = async (
  promoId: number,
  productId: number,
  quantity = 1
): Promise<PromotionFreeItem> => {
  const res = await api.post(`/promotions/${promoId}/add-free-item`, {
    product_id: productId,
    quantity,
  });
  return res.data.item;
};

/**
 * DELETE /promotions/:promo_id/remove-free-item
 * JWT required — ADMIN or SHOP_MANAGER.
 * Body: { product_id: number }
 * Returns { message }
 */
export const removeFreeItemFromPromotion = async (
  promoId: number,
  productId: number
): Promise<{ message: string }> => {
  const res = await api.delete(`/promotions/${promoId}/remove-free-item`, {
    data: { product_id: productId },
  });
  return res.data;
};

// =============================================================================
// ─── PROMO CODE SERVICE ──────────────────────────────────────────────────────
// =============================================================================

/**
 * GET /promos
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { promos: PromoCode[] }
 */
export const getAllPromoCodes = async (): Promise<PromoCode[]> => {
  const res = await api.get("/promos");
  return res.data.promos;
};

/**
 * GET /promos/active
 * Public — no JWT.
 * Returns { promos: PromoCode[] }
 */
export const getActivePromoCodes = async (): Promise<PromoCode[]> => {
  const res = await api.get("/promos/active");
  return res.data.promos;
};

/**
 * POST /promos
 * JWT required — ADMIN or SHOP_MANAGER.
 * Note: backend auto-uppercases the code.
 * Returns { message, promo }
 */
export const createPromoCode = async (
  payload: CreatePromoCodePayload
): Promise<PromoCode> => {
  const res = await api.post("/promos", payload);
  return res.data.promo;
};

/**
 * PUT /promos/:promo_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message, promo }
 */
export const updatePromoCode = async (
  promoId: number,
  payload: UpdatePromoCodePayload
): Promise<PromoCode> => {
  const res = await api.put(`/promos/${promoId}`, payload);
  return res.data.promo;
};

/**
 * DELETE /promos/:promo_id
 * JWT required — ADMIN or SHOP_MANAGER.
 * Returns { message }
 */
export const deletePromoCode = async (promoId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/promos/${promoId}`);
  return res.data;
};

/**
 * POST /promos/:code/validate
 * JWT required (any role).
 * Returns { valid: bool, promo?: PromoCode, error?: string }
 */
export const validatePromoCode = async (
  code: string
): Promise<ValidatePromoResponse> => {
  const res = await api.post(`/promos/${code.toUpperCase()}/validate`);
  return res.data;
};



// =============================================================================
// ─── DEFAULT EXPORT (grouped namespace) ──────────────────────────────────────
// =============================================================================

const productService = {
  // Products
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductVariants,
  createProduct,
  updateProduct,
  deleteProduct,

  // Categories
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  getCategorySubcategories,
  createCategory,
  updateCategory,
  deleteCategory,

  // SubCategories
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,

  // Variants
  getAllVariants,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,

  // Flavors
  getFlavorsByVariant,
  createFlavor,
  updateFlavor,
  deleteFlavor,

  // Addons
  getAllAddons,
  getPredefinedAddons,
  createAddon,
  updateAddon,
  deleteAddon,

  // Combos
  getAllCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  addProductToCombo,
  removeProductFromCombo,
  getComboItems,
  getComboPricePreview,

  // Promotions
  getAllPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  activatePromotion,
  deactivatePromotion,
  getPromotionFreeItems,
  addFreeItemToPromotion,
  removeFreeItemFromPromotion,

  // Promo Codes
  getAllPromoCodes,
  getActivePromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
};

export default productService;