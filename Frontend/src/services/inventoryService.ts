import { api } from "./api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active: boolean;
}

export interface RawMaterial {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier_id?: number | null;
  inventory?: InventoryItem | null;
}

export interface InventoryItem {
  id: number;
  material_id: number;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string | null;
  material?: {
    id: number;
    name: string;
    unit: string;
    cost_per_unit: number;
  } | null;
}

export interface InventoryConsumptionLog {
  id: number;
  material_id: number;
  order_id?: number | null;
  quantity_used: number;
  notes?: string | null;
  consumed_at: string | null;
}

export type PaymentSource = "CASH" | "BANK" | "OTHER";

export interface Purchase {
  id: number;
  supplier_id?: number | null;
  material_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_source: PaymentSource;
  reference?: string | null;
  notes?: string | null;
  purchased_at: string | null;
  supplier?: Supplier | null;
  material?: { id: number; name: string } | null;
}

export interface PurchasesDashboard {
  total_amount: number;
  total_count: number;
  today_total: number;
  month_total: number;
  low_stock_count: number;
  out_of_stock_count: number;
  top_suppliers: { supplier_id: number | null; supplier_name: string; orders: number; total: number }[];
  chart: { date: string; total: number }[];
  recent_purchases: Purchase[];
}

// ─── Inventory ──────────────────────────────────────────────────────────────

/** GET /inventory (ADMIN | SHOP_MANAGER) */
export const getInventory = async (): Promise<InventoryItem[]> => {
  const res = await api.get("/inventory");
  return res.data.inventory;
};

/** GET /inventory/low-stock (ADMIN | SHOP_MANAGER) */
export const getLowStock = async (): Promise<InventoryItem[]> => {
  const res = await api.get("/inventory/low-stock");
  return res.data.inventory;
};

/** GET /inventory/out-of-stock (ADMIN | SHOP_MANAGER) */
export const getOutOfStock = async (): Promise<InventoryItem[]> => {
  const res = await api.get("/inventory/out-of-stock");
  return res.data.inventory;
};

/** PUT /inventory/:material_id (ADMIN | SHOP_MANAGER) */
export const updateInventory = async (
  materialId: number,
  payload: { quantity?: number; low_stock_threshold?: number }
): Promise<InventoryItem> => {
  const res = await api.put(`/inventory/${materialId}`, payload);
  return res.data.inventory;
};

/** POST /inventory/consume (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const consumeMaterial = async (
  materialId: number,
  quantity: number,
  orderId?: number,
  notes?: string
): Promise<{ success: boolean; remaining: number }> => {
  const res = await api.post("/inventory/consume", {
    material_id: materialId,
    quantity,
    order_id: orderId,
    notes,
  });
  return res.data;
};

/** GET /inventory/consumption-report (ADMIN | SHOP_MANAGER) */
export const getConsumptionReport = async (limit = 100): Promise<InventoryConsumptionLog[]> => {
  const res = await api.get("/inventory/consumption-report", { params: { limit } });
  return res.data.consumption;
};

/** GET /inventory/material-usage (ADMIN | SHOP_MANAGER) */
export const getMaterialUsage = async (): Promise<{ material_id: number; total_used: number }[]> => {
  const res = await api.get("/inventory/material-usage");
  return res.data.usage;
};

// ─── Raw Materials ──────────────────────────────────────────────────────────

/** GET /materials (ADMIN | SHOP_MANAGER) */
export const getMaterials = async (): Promise<RawMaterial[]> => {
  const res = await api.get("/materials");
  return res.data.materials;
};

/** POST /materials (ADMIN | SHOP_MANAGER)
 *  Backend also accepts opening_quantity + low_stock_threshold at creation time. */
export const createMaterial = async (payload: {
  name: string;
  unit: string;
  cost_per_unit?: number;
  supplier_id?: number | null;
  opening_quantity?: number;
  low_stock_threshold?: number;
}): Promise<RawMaterial> => {
  const res = await api.post("/materials", payload);
  return res.data.material;
};

/** PUT /materials/:material_id (ADMIN | SHOP_MANAGER) */
export const updateMaterial = async (
  materialId: number,
  payload: Partial<{
    name: string;
    unit: string;
    cost_per_unit: number;
    supplier_id: number | null;
    low_stock_threshold: number;
  }>
): Promise<RawMaterial> => {
  const res = await api.put(`/materials/${materialId}`, payload);
  return res.data.material;
};

/** DELETE /materials/:material_id (ADMIN | SHOP_MANAGER)
 *  Backend rejects (409) if the material has purchase or consumption history. */
export const deleteMaterial = async (materialId: number): Promise<void> => {
  await api.delete(`/materials/${materialId}`);
};

/** GET /materials/:material_id/inventory (ADMIN | SHOP_MANAGER) */
export const getMaterialInventory = async (materialId: number): Promise<InventoryItem> => {
  const res = await api.get(`/materials/${materialId}/inventory`);
  return res.data.inventory;
};

// ─── Purchases ──────────────────────────────────────────────────────────────

/** GET /purchases (ADMIN | SHOP_MANAGER) */
export const getPurchases = async (): Promise<Purchase[]> => {
  const res = await api.get("/purchases");
  return res.data.purchases;
};

/** POST /purchases (ADMIN | SHOP_MANAGER)
 *  payment_source must be CASH, BANK, or OTHER. CASH/BANK move drawer/bank balances server-side. */
export const createPurchase = async (payload: {
  material_id: number;
  quantity: number;
  unit_price: number;
  supplier_id?: number | null;
  payment_source?: PaymentSource;
  reference?: string;
  notes?: string;
}): Promise<Purchase> => {
  const res = await api.post("/purchases", payload);
  return res.data.purchase;
};

/** GET /purchases/:purchase_id (ADMIN | SHOP_MANAGER) */
export const getPurchase = async (purchaseId: number): Promise<Purchase> => {
  const res = await api.get(`/purchases/${purchaseId}`);
  return res.data.purchase;
};

/** PUT /purchases/:purchase_id (ADMIN | SHOP_MANAGER) */
export const updatePurchase = async (
  purchaseId: number,
  payload: Partial<{
    material_id: number;
    supplier_id: number | null;
    quantity: number;
    unit_price: number;
    payment_source: PaymentSource;
    reference: string;
    notes: string;
  }>
): Promise<Purchase> => {
  const res = await api.put(`/purchases/${purchaseId}`, payload);
  return res.data.purchase;
};

/** DELETE /purchases/:purchase_id (ADMIN | SHOP_MANAGER) */
export const deletePurchase = async (purchaseId: number): Promise<void> => {
  await api.delete(`/purchases/${purchaseId}`);
};

/** GET /purchases/report (ADMIN | SHOP_MANAGER) */
export const getPurchaseReport = async (): Promise<{ total_purchases: number; total_amount: number }> => {
  const res = await api.get("/purchases/report");
  return res.data;
};

/** GET /purchases/supplier/:supplier_id (ADMIN | SHOP_MANAGER) */
export const getPurchasesBySupplier = async (supplierId: number): Promise<Purchase[]> => {
  const res = await api.get(`/purchases/supplier/${supplierId}`);
  return res.data.purchases;
};

/** GET /purchases/dashboard (ADMIN | SHOP_MANAGER) */
export const getPurchasesDashboard = async (): Promise<PurchasesDashboard> => {
  const res = await api.get("/purchases/dashboard");
  return res.data;
};

// ─── Suppliers ──────────────────────────────────────────────────────────────

/** GET /suppliers (ADMIN | SHOP_MANAGER) */
export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await api.get("/suppliers");
  return res.data.suppliers;
};

/** GET /suppliers/:supplier_id (ADMIN | SHOP_MANAGER) */
export const getSupplier = async (supplierId: number): Promise<Supplier> => {
  const res = await api.get(`/suppliers/${supplierId}`);
  return res.data.supplier;
};

/** POST /suppliers (ADMIN | SHOP_MANAGER) */
export const createSupplier = async (payload: {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}): Promise<Supplier> => {
  const res = await api.post("/suppliers", payload);
  return res.data.supplier;
};

/** PUT /suppliers/:supplier_id (ADMIN | SHOP_MANAGER) */
export const updateSupplier = async (
  supplierId: number,
  payload: Partial<{
    name: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
  }>
): Promise<Supplier> => {
  const res = await api.put(`/suppliers/${supplierId}`, payload);
  return res.data.supplier;
};

/** DELETE /suppliers/:supplier_id (ADMIN | SHOP_MANAGER)
 *  Backend soft-deletes (deactivates) suppliers that have purchase/material history
 *  instead of hard-deleting them — check response.deactivated on the caller side if needed. */
export const deleteSupplier = async (
  supplierId: number
): Promise<{ deactivated: boolean; supplier?: Supplier }> => {
  const res = await api.delete(`/suppliers/${supplierId}`);
  return { deactivated: !!res.data.supplier, supplier: res.data.supplier };
};

/** GET /suppliers/:supplier_id/report (ADMIN | SHOP_MANAGER) */
export const getSupplierReport = async (
  supplierId: number
): Promise<{ supplier_id: number; supplier: Supplier; total_purchases: number; total_amount: number }> => {
  const res = await api.get(`/suppliers/${supplierId}/report`);
  return res.data;
};