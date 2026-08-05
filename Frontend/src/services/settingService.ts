import { api } from "./api";

/** GET /settings */
export const getSettings = async (): Promise<{ currency_code: string }> => {
  const res = await api.get("/settings");
  return res.data;
};

/** PUT /settings/currency */
export const updateCurrency = async (
  currencyCode: "INR" | "USD" | "AED"
): Promise<{ success: boolean; currency_code: string }> => {
  const res = await api.put("/settings/currency", { currency_code: currencyCode });
  return res.data;
};