import { api } from "./api";
import { Area } from "./areaService";

export interface Address {
  id?: number;
  user_id?: number;

  area_id: number;
  area?: Area;

  street: string;

  block?: string;
  avenue?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  delivery_notes?: string;

  country: string;
}

/* ============================
   Create
============================ */

export const createAddress = async (
  payload: Omit<Address, "id" | "user_id">
): Promise<Address> => {
  const res = await api.post("/addresses", payload);
  return res.data.address;
};

/* ============================
   Current User Addresses
============================ */

export const getMyAddresses = async (): Promise<Address[]> => {
  const res = await api.get("/addresses/my-addresses");
  return res.data.addresses;
};

/* ============================
   User Addresses
============================ */

export const getUserAddresses = async (
  userId: number
): Promise<Address[]> => {
  const res = await api.get(`/users/${userId}/addresses`);
  return res.data.addresses;
};

/* ============================
   Single Address
============================ */

export const getAddress = async (
  id: number
): Promise<Address> => {
  const res = await api.get(`/addresses/${id}`);
  return res.data.address;
};

/* ============================
   Update
============================ */

export const updateAddress = async (
  id: number,
  payload: Partial<Omit<Address, "id" | "user_id">>
): Promise<Address> => {
  const res = await api.put(`/addresses/${id}`, payload);
  return res.data.address;
};

/* ============================
   Delete
============================ */

export const deleteAddress = async (
  id: number
): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};