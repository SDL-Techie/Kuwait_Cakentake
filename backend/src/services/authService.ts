import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "ADMIN"
  | "SHOP_MANAGER"
  | "SALES_AGENT"
  | "DELIVERY_AGENT"
  | "DRIVER"
  | "KITCHEN_STAFF"
  | "USER";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  role: UserRole;
  created_at?: string;
  loyalty_points?: number;
  currency_code?: string;
  addresses?: Address[];
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
}

export interface AdminCreatePayload extends RegisterPayload {
  role: UserRole;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_no?: string;
}

// ─── Auth APIs ────────────────────────────────────────────────────────────────

/** POST /register */
export const register = async (payload: RegisterPayload): Promise<User> => {
  const res = await api.post("/register", payload);
  return res.data.user;
};

/** POST /admin/register  (ADMIN only) */
export const adminRegister = async (payload: AdminCreatePayload): Promise<User> => {
  const res = await api.post("/admin/register", payload);
  return res.data.user;
};

/** POST /admin/create */
export const createAdmin = async (payload: RegisterPayload): Promise<User> => {
  const res = await api.post("/admin/create", payload);
  return res.data.user;
};

/** POST /login */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post("/login", payload);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

/** GET /user/:user_id */
export const getUserById = async (userId: number): Promise<User> => {
  const res = await api.get(`/user/${userId}`);
  return res.data;
};

/** GET /profile */
export const getProfile = async (): Promise<User> => {
  const res = await api.get("/profile");
  return res.data;
};

/** PUT /profile */
export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const res = await api.put("/profile", payload);
  return res.data.user;
};

/** GET /admin/users  (ADMIN only) */
export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get("/admin/users");
  return res.data.users;
};

/** POST /logout */
export const logout = async (): Promise<void> => {
  await api.post("/logout");
  localStorage.removeItem("token");
};

/** PUT /users/change-currency */
export const changeCurrency = async (userId: number, currencyCode: string): Promise<void> => {
  await api.put("/users/change-currency", { user_id: userId, currency_code: currencyCode });
};

/** PUT /change-password */
export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.put("/change-password", payload);
};

/** Helpers */
export const isAuthenticated = (): boolean => !!localStorage.getItem("token");
export const getToken = (): string | null => localStorage.getItem("token");
export const clearAuth = (): void => localStorage.removeItem("token");