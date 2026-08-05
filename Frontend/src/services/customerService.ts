import { BASE_URL } from "./api";
import axios from "axios";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  total_orders: number;
  total_spent: number;
  created_at?: string;
}

export interface CreateCustomerPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  password: string;
}

export interface UpdateCustomerPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_no?: string;
}

export interface Address {
  id: number;
  user_id: number;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface CreateAddressPayload {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface LoyaltyPoints {
  customer_id: number;
  current_points: number;
  total_earned: number;
  total_redeemed: number;
}

// ─── Customer APIs ────────────────────────────────────────────────────────────

/**
 * Get customer dashboard
 */
export const getCustomerDashboard = async (): Promise<any> => {
  const res = await axios.get(`${BASE_URL}/customers/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * Get all customers
 */
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get(`${BASE_URL}/customers`, {
    headers: getAuthHeaders(),
  });
  return res.data.customers;
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (customerId: number): Promise<Customer> => {
  const res = await axios.get(`${BASE_URL}/customers/${customerId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.customer;
};

/**
 * Create customer
 */
export const createCustomer = async (
  payload: CreateCustomerPayload
): Promise<Customer> => {
  const res = await axios.post(`${BASE_URL}/customers`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data.customer;
};

/**
 * Update customer
 */
export const updateCustomer = async (
  customerId: number,
  payload: UpdateCustomerPayload
): Promise<void> => {
  await axios.put(`${BASE_URL}/customers/${customerId}`, payload, {
    headers: getAuthHeaders(),
  });
};

/**
 * Get customer orders
 */
export const getCustomerOrders = async (customerId: number): Promise<any[]> => {
  const res = await axios.get(`${BASE_URL}/customers/${customerId}/orders`, {
    headers: getAuthHeaders(),
  });
  return res.data.orders;
};

/**
 * Get customer order summary
 */
export const getCustomerOrderSummary = async (customerId: number): Promise<any> => {
  const res = await axios.get(`${BASE_URL}/customers/${customerId}/order-summary`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * Get customer addresses
 */
export const getCustomerAddresses = async (customerId: number): Promise<Address[]> => {
  const res = await axios.get(`${BASE_URL}/customers/${customerId}/addresses`, {
    headers: getAuthHeaders(),
  });
  return res.data.addresses;
};

/**
 * Add customer address
 */
export const addCustomerAddress = async (
  customerId: number,
  payload: CreateAddressPayload
): Promise<Address> => {
  const res = await axios.post(
    `${BASE_URL}/customers/${customerId}/addresses`,
    payload,
    { headers: getAuthHeaders() }
  );
  return res.data.address;
};

/**
 * Get customer loyalty points
 */
export const getCustomerLoyaltyPoints = async (
  customerId: number
): Promise<LoyaltyPoints> => {
  const res = await axios.get(`${BASE_URL}/customers/${customerId}/loyalty-points`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * Get customer loyalty history
 */
export const getCustomerLoyaltyHistory = async (customerId: number): Promise<any[]> => {
  const res = await axios.get(
    `${BASE_URL}/customers/${customerId}/loyalty-history`,
    { headers: getAuthHeaders() }
  );
  return res.data.history;
};

// ─── Address APIs ────────────────────────────────────────────────────────────

/**
 * Create address
 */
export const createAddress = async (
  payload: CreateAddressPayload & { user_id: number }
): Promise<Address> => {
  const res = await axios.post(`${BASE_URL}/addresses`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data.address;
};

/**
 * Get user addresses
 */
export const getUserAddresses = async (userId: number): Promise<Address[]> => {
  const res = await axios.get(`${BASE_URL}/users/${userId}/addresses`, {
    headers: getAuthHeaders(),
  });
  return res.data.addresses;
};

/**
 * Get address by ID
 */
export const getAddressById = async (addressId: number): Promise<Address> => {
  const res = await axios.get(`${BASE_URL}/addresses/${addressId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.address;
};

/**
 * Update address
 */
export const updateAddress = async (
  addressId: number,
  payload: CreateAddressPayload
): Promise<void> => {
  await axios.put(`${BASE_URL}/addresses/${addressId}`, payload, {
    headers: getAuthHeaders(),
  });
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/addresses/${addressId}`, {
    headers: getAuthHeaders(),
  });
};