import { api } from "./api";

export interface BankCharge {
  id: number;
  title: string;
  charge_type: "SERVICE_FEE" | "TRANSACTION_FEE" | "PENALTY" | "OTHER";
  amount: number;
  description?: string;
  charged_on: string;
}

export interface CreateBankChargePayload {
  title: string;
  charge_type: "SERVICE_FEE" | "TRANSACTION_FEE" | "PENALTY" | "OTHER";
  amount: number;
  description?: string;
}

/** GET /bank/charges  (ADMIN | SHOP_MANAGER) */
export const getBankCharges = async (): Promise<BankCharge[]> => {
  const res = await api.get("/bank/charges");
  return res.data.bank_charges;
};

/** POST /bank/charges  (ADMIN | SHOP_MANAGER) */
export const createBankCharge = async (
  payload: CreateBankChargePayload
): Promise<BankCharge> => {
  const res = await api.post("/bank/charges", payload);
  return res.data.bank_charge;
};

/** PUT /bank/charges/:charge_id  (ADMIN | SHOP_MANAGER) */
export const updateBankCharge = async (
  chargeId: number,
  payload: Partial<CreateBankChargePayload>
): Promise<BankCharge> => {
  const res = await api.put(`/bank/charges/${chargeId}`, payload);
  return res.data.bank_charge;
};

/** DELETE /bank/charges/:charge_id  (ADMIN) */
export const deleteBankCharge = async (chargeId: number): Promise<void> => {
  await api.delete(`/bank/charges/${chargeId}`);
};

/** GET /bank/charges/report  (ADMIN | SHOP_MANAGER) */
export const getBankChargesReport = async (): Promise<any> => {
  const res = await api.get("/bank/charges/report");
  return res.data;
};