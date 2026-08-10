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