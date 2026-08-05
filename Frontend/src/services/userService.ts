import axios from "axios";
import { api, BASE_URL } from "./api";


// ─────────────────────────────────────────────────────────────
// AUTH HEADERS (for old axios endpoints)
// ─────────────────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type UserRole =
  | "ADMIN"
  | "SHOP_MANAGER"
  | "SALES_AGENT"
  | "DELIVERY_AGENT"
  | "DRIVER"
  | "KITCHEN_STAFF"
  | "USER"

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  role: UserRole;
  created_at?: string;
}

export interface Permission {
  id: number;
  user_id: number;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface AssignPermissionPayload {
  user_id: number;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_no?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
}

// ─────────────────────────────────────────────────────────────
// OLD USER APIs (axios-based)
// ─────────────────────────────────────────────────────────────

export const getUsers = async (role?: string): Promise<User[]> => {
  const res = await axios.get(`${BASE_URL}/users`, {
    headers: getAuthHeaders(),
    params: role ? { role } : {},
  });
  return res.data.users;
};

export const searchCustomers = async (
  keyword: string
): Promise<Customer[]> => {
  if (!keyword.trim()) return [];

  const res = await api.get("/customers/search", {
    params: {
      q: keyword,
    },
  });

  return res.data?.customers ?? [];
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await axios.get(`${BASE_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data.user;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axios.post(`${BASE_URL}/users`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data.user;
};

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<void> => {
  await axios.put(`${BASE_URL}/users/${id}`, payload, {
    headers: getAuthHeaders(),
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
};

// ─────────────────────────────────────────────────────────────
// ROLE-BASED APIs
// ─────────────────────────────────────────────────────────────

export const getKitchenStaff = async (): Promise<any[]> => {
  const res = await api.get("/kitchen-staff");
  return Array.isArray(res.data) ? res.data : res.data?.staff ?? [];
};

export const getDeliveryAgents = async (): Promise<any[]> => {
  const res = await api.get("/delivery-agents");
  return Array.isArray(res.data) ? res.data : res.data?.agents ?? [];
};

export const getDrivers = async (): Promise<any[]> => {
  const res = await api.get("/drivers");
  return Array.isArray(res.data) ? res.data : res.data?.drivers ?? [];
};

export const getAvailableDrivers = async (): Promise<any[]> => {
  const res = await api.get("/drivers/available");
  return Array.isArray(res.data) ? res.data : res.data?.drivers ?? [];
};

export const getDriverDashboard = async (driverId: number): Promise<any> => {
  const res = await api.get(`/drivers/${driverId}/dashboard`);
  return res.data;
};

export const getDriverAssigned = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/drivers/${driverId}/assigned`);
  return res.data?.orders ?? res.data ?? [];
};

export const getDriverCompleted = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/drivers/${driverId}/completed`);
  return res.data?.orders ?? res.data ?? [];
};

export const updateDriverStatus = async (
  driverId: number,
  status: "ONLINE" | "BUSY" | "OFFLINE"
): Promise<any> => {
  const res = await api.post(`/drivers/${driverId}/status`, { status });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PERMISSIONS (THIS FIXES YOUR ERROR)
// ─────────────────────────────────────────────────────────────

export const getPermissions = async (): Promise<Permission[]> => {
  const res = await axios.get(`${BASE_URL}/permissions`, {
    headers: getAuthHeaders(),
  });
  return res.data.permissions;
};

export const assignPermission = async (
  payload: AssignPermissionPayload
): Promise<void> => {
  await axios.post(`${BASE_URL}/permissions/assign`, payload, {
    headers: getAuthHeaders(),
  });
};

export const updatePermission = async (
  payload: AssignPermissionPayload
): Promise<void> => {
  await axios.put(`${BASE_URL}/permissions/update`, payload, {
    headers: getAuthHeaders(),
  });
};