import { api } from "./api";

export interface PointSetting {
  min_purchase: number;
  points_earned: number;
  points_needed: number;
  reward_percentage: number;
  coupon_validity_days: number;
}

// ─── Point Settings ───────────────────────────────────────────────────────────

/** GET /api/point-setting */
export const getPointSetting = async (): Promise<PointSetting> => {
  const res = await api.get("/api/point-setting");
  return res.data;
};

/** POST /api/point-setting */
export const savePointSetting = async (payload: PointSetting): Promise<void> => {
  await api.post("/api/point-setting", payload);
};

// ─── Rewards ──────────────────────────────────────────────────────────────────

/** POST /api/reward/generate/:phone_no */
export const generateReward = async (
  phoneNo: string
): Promise<{ coupon_code: string; discount_percentage: number; remaining_points: number }> => {
  const res = await api.post(`/api/reward/generate/${phoneNo}`);
  return res.data;
};

/** POST /api/coupon/apply */
export const applyCoupon = async (payload: {
  phone_no: string;
  coupon_code: string;
  amount: number;
}): Promise<{ amount: number; discount: number; final_amount: number }> => {
  const res = await api.post("/api/coupon/apply", payload);
  return res.data;
};

/** GET /api/user-points/:phone_no */
export const getUserPoints = async (
  phoneNo: string
): Promise<{ phone_no: string; loyalty_points: number }> => {
  const res = await api.get(`/api/user-points/${phoneNo}`);
  return res.data;
};

/** GET /api/my-coupons/:phone_no */
export const getMyCoupons = async (
  phoneNo: string
): Promise<
  { coupon_code: string; discount_percentage: number; is_used: boolean; expiry_date: string }[]
> => {
  const res = await api.get(`/api/my-coupons/${phoneNo}`);
  return res.data;
};


export const pincodeApi = {
  list: () => api.get("/api/pincode"),
  create: (payload: unknown) => api.post("/api/pincode", payload),
  remove: (id: string | number) => api.delete(`/api/pincode/${id}`),
  charge: (zip: string) => api.get(`/api/v1/pincode/${zip}`),
};

export const supplierApi = {
  list: () => api.get("/suppliers"),
  create: (payload: unknown) => api.post("/suppliers", payload),
  update: (id: string | number, payload: unknown) => api.put(`/suppliers/${id}`, payload),
  remove: (id: string | number) => api.delete(`/suppliers/${id}`),
};

export const maintenanceApi = {
  backup: (payload: unknown, config?: unknown) => api.post("/api/v1/admin/backup", payload, config as never),
  restore: (payload: unknown, config?: unknown) => api.post("/api/v1/admin/restore", payload, config as never),
};

export const legacyPointApi = {
  getSettings: (config?: unknown) => api.get("/api/v1/getpointsettings", config as never),
  saveSettings: (payload: unknown, config?: unknown) => api.post("/api/v1/createpointsettings", payload, config as never),
  getUserPoints: (phone: string, config?: unknown) => api.get(`/api/v1/user-points/${phone}`, config as never),
  redeem: (payload: unknown, config?: unknown) => api.post("/api/v1/redeem-points", payload, config as never),
};

export const storefrontApi = {
  products: (config?: unknown) => api.get("/products", config as never),
  categories: () => api.get("/category"),
  subcategories: (categoryId: string | number) => api.get(`/categories/${categoryId}/subcategories`),
  login: <T>(payload: unknown) => api.post<T>("/login", payload),
  register: (payload: unknown) => api.post("/register", payload),
  logout: () => api.post("/logout"),
  profile: (userId: string | number, config?: unknown) => api.get(`/user/${userId}`, config as never),
  updateProfile: (payload: unknown, config?: unknown) => api.put("/profile", payload, config as never),
  order: <T>(id: string | number, config?: unknown) => api.get<T>(`/orders/${id}`, config as never),
};

export const wishlistApi = {
  list: (userId: string | number) => api.get(`/api/wishlist/${userId}`),
  create: (payload: unknown) => api.post("/api/wishlist", payload),
  remove: (id: string | number) => api.delete(`/api/wishlist/${id}`),
};

export const retailerApi = {
  profile: (id: string | number, config?: unknown) => api.get(`/api/v1/profile/${id}`, config as never),
  categories: () => api.get("/api/v1/category"),
  productsByCategory: (id: string | number) => api.get(`/api/v1/category/${id}`),
  updateProfile: (id: string | number, payload: unknown, config?: unknown) => api.put(`/api/v1/profile/${id}`, payload, config as never),
  initiatePayment: (payload: unknown, config?: unknown) => api.post("/api/v1/initiate-retailer-payment", payload, config as never),
  verifyPayment: (payload: unknown, config?: unknown) => api.post("/api/v1/verify-retailer-payment", payload, config as never),
  createOrder: (payload: unknown, config?: unknown) => api.post("/api/v1/createretailerorder", payload, config as never),
};

// export const uploadCloudinaryImage = async (cloudName: string, data: FormData) => {
//   const response = await axios.post(`https://api.cloudinary.com/v1_1/lm9ndjvj/image/upload`, data);
//   return response;
// };

export const uploadCloudinaryImage = async (data: FormData) => {
  const response = await api.post("/api/upload/image", data, {
    headers: { "Content-Type": "multipart/form-data" },
  } as never);
  return response;
};


export const fetchGeoLocation = async () => {
  const response = await fetch("https://ipinfo.io/json");
  if (!response.ok) throw new Error("Unable to detect location");
  return response.json();
};

export const fetchGeoLocationFromIpApi = async () => {
  const response = await fetch("https://ipapi.co/json/");
  if (!response.ok) throw new Error("Unable to detect location");
  return response.json();
};

export const menuApi = {
  get: <T = unknown>(path: string) => api.get<T>(path),
  post: <T = unknown>(path: string, payload?: unknown) => api.post<T>(path, payload),
  put: <T = unknown>(path: string, payload?: unknown) => api.put<T>(path, payload),
  delete: <T = unknown>(path: string) => api.delete<T>(path),
};

export const supplierApiDetails = {
  get: (id: string | number) => api.get(`/suppliers/${id}`),
};
