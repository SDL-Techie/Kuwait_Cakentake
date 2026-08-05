import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, CheckCircle2, AlertCircle, Settings2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  getLoyaltyConfig,
  createLoyaltyConfig,
  updateLoyaltyConfig,
  LoyaltyConfig,
  LoyaltyConfigInput,
} from "../../services/loyaltyService";
import './Loyalitysettings.css';

/* NOTE: field set matches models/loyalty.py LoyaltyConfig exactly.
   The old shape (points_per_order / points_value / min_redemption /
   max_redemption_percent) no longer exists on the backend — using it
   here silently produced 400s / undefined values, which is why this
   form previously "did nothing". */
const EMPTY_CONFIG: LoyaltyConfigInput = {
  min_order_amount: 0,
  points_per_min_order: 0,
  min_points: 0,
  reward_percent: 0,
  is_active: true,
};

const LoyaltySettings: React.FC = () => {
  const [form, setForm] = useState<LoyaltyConfigInput>(EMPTY_CONFIG);
  const [configExists, setConfigExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getLoyaltyConfig();
      setForm(config);
      setConfigExists(true);
    } catch (err: any) {
      // No config yet — fall back to the create form
      if (err?.response?.status === 404) {
        setConfigExists(false);
        setForm(EMPTY_CONFIG);
      } else {
        setError(
          err?.response?.data?.error || "Unable to load loyalty settings."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    field: keyof LoyaltyConfigInput,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        typeof value === "boolean" ? value : value === "" ? 0 : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (configExists) {
        const updated = await updateLoyaltyConfig(form);
        setForm(updated);
        setSuccess("Loyalty settings updated successfully.");
      } else {
        const created = await createLoyaltyConfig(form);
        setForm(created);
        setConfigExists(true);
        setSuccess("Loyalty configuration created successfully.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to save loyalty settings."
      );
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="loyalty-settings-loading">
        <Loader2 className="loyalty-spin" size={22} />
        <span>Loading loyalty settings…</span>
      </div>
    );
  }

  return (
    <motion.form
      className="loyalty-settings"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loyalty-settings-heading">
        <Settings2 size={19} />
        <div>
          <h3>{configExists ? "Update Loyalty Configuration" : "Create Loyalty Configuration"}</h3>
          <p>Define how customers earn and redeem loyalty points storewide.</p>
        </div>
      </div>

      {error && (
        <div className="loyalty-alert loyalty-alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="loyalty-alert loyalty-alert-success">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="loyalty-settings-grid">
        <label className="loyalty-field">
          <span className="loyalty-field-label">Minimum order amount</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.min_order_amount}
            onChange={(e) => handleChange("min_order_amount", e.target.value)}
            required
          />
          <span className="loyalty-field-hint">
            Order value a customer must spend to earn "points per min order"
          </span>
        </label>

        <label className="loyalty-field">
          <span className="loyalty-field-label">Points per min order</span>
          <input
            type="number"
            min={0}
            step="1"
            value={form.points_per_min_order}
            onChange={(e) => handleChange("points_per_min_order", e.target.value)}
            required
          />
          <span className="loyalty-field-hint">
            Points earned for every "minimum order amount" spent (e.g. order ÷ min amount × this)
          </span>
        </label>

        <label className="loyalty-field">
          <span className="loyalty-field-label">Minimum points to redeem</span>
          <input
            type="number"
            min={0}
            step="1"
            value={form.min_points}
            onChange={(e) => handleChange("min_points", e.target.value)}
            required
          />
          <span className="loyalty-field-hint">
            Points a customer must hold before the reward can be applied
          </span>
        </label>

        <label className="loyalty-field">
          <span className="loyalty-field-label">Reward (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            step="1"
            value={form.reward_percent}
            onChange={(e) => handleChange("reward_percent", e.target.value)}
            required
          />
          <span className="loyalty-field-hint">
            Discount applied to the order when a customer redeems their points
          </span>
        </label>
      </div>

      <button
        type="button"
        className="loyalty-toggle-row"
        onClick={() => handleChange("is_active", !form.is_active)}
      >
        {form.is_active ? (
          <ToggleRight size={30} className="loyalty-toggle-on" />
        ) : (
          <ToggleLeft size={30} className="loyalty-toggle-off" />
        )}
        <span>Loyalty program is {form.is_active ? "active" : "inactive"}</span>
      </button>

      <div className="loyalty-settings-actions">
        <button type="submit" className="loyalty-save-btn" disabled={saving}>
          {saving ? (
            <Loader2 size={17} className="loyalty-spin" />
          ) : (
            <Save size={17} />
          )}
          {saving ? "Saving…" : configExists ? "Save changes" : "Create configuration"}
        </button>
      </div>
    </motion.form>
  );
};

export default LoyaltySettings;