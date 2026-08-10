import { api } from "./api";

export interface RawMaterial {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier_id?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
}

export interface Purchase {
  id: number;
  supplier_id?: number;
  material_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  purchased_at: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

/** GET /inventory  (ADMIN | SHOP_MANAGER) */
export const getInventory = async (): Promise<any[]> => {
  const res = await api.get("/inventory");
  return res.data.inventory;
};

/** GET /inventory/low-stock  (ADMIN | SHOP_MANAGER) */
export const getLowStock = async (): Promise<any[]> => {
  const res = await api.get("/inventory/low-stock");
  return res.data.inventory;
};

/** GET /inventory/out-of-stock  (ADMIN | SHOP_MANAGER) */
export const getOutOfStock = async (): Promise<any[]> => {
  const res = await api.get("/inventory/out-of-stock");
  return res.data.inventory;
};

/** PUT /inventory/:material_id  (ADMIN | SHOP_MANAGER) */
export const updateInventory = async (
  materialId: number,
  payload: { quantity?: number; low_stock_threshold?: number }
): Promise<any> => {
  const res = await api.put(`/inventory/${materialId}`, payload);
  return res.data.inventory;
};

/** POST /inventory/consume  (ADMIN | SHOP_MANAGER | KITCHEN_STAFF) */
export const consumeMaterial = async (
  materialId: number,
  quantity: number,
  orderId?: number,
  notes?: string
): Promise<any> => {
  const res = await api.post("/inventory/consume", {
    material_id: materialId,
    quantity,
    order_id: orderId,
    notes,
  });
  return res.data;
};

/** GET /inventory/consumption-report  (ADMIN | SHOP_MANAGER) */
export const getConsumptionReport = async (): Promise<any[]> => {
  const res = await api.get("/inventory/consumption-report");
  return res.data.consumption;
};

/** GET /inventory/material-usage  (ADMIN | SHOP_MANAGER) */
export const getMaterialUsage = async (): Promise<any[]> => {
  const res = await api.get("/inventory/material-usage");
  return res.data.usage;
};

// ─── Raw Materials ────────────────────────────────────────────────────────────

/** GET /materials  (ADMIN | SHOP_MANAGER) */
export const getMaterials = async (): Promise<RawMaterial[]> => {
  const res = await api.get("/materials");
  return res.data.materials;
};

/** POST /materials  (ADMIN | SHOP_MANAGER) */
export const createMaterial = async (
  payload: Omit<RawMaterial, "id">
): Promise<RawMaterial> => {
  const res = await api.post("/materials", payload);
  return res.data.material;
};

/** PUT /materials/:material_id  (ADMIN | SHOP_MANAGER) */
export const updateMaterial = async (
  materialId: number,
  payload: Partial<RawMaterial>
): Promise<RawMaterial> => {
  const res = await api.put(`/materials/${materialId}`, payload);
  return res.data.material;
};

/** DELETE /materials/:material_id  (ADMIN | SHOP_MANAGER) */
export const deleteMaterial = async (materialId: number): Promise<void> => {
  await api.delete(`/materials/${materialId}`);
};

/** GET /materials/:material_id/inventory  (ADMIN | SHOP_MANAGER) */
export const getMaterialInventory = async (materialId: number): Promise<any> => {
  const res = await api.get(`/materials/${materialId}/inventory`);
  return res.data.inventory;
};

// ─── Purchases ────────────────────────────────────────────────────────────────

/** GET /purchases  (ADMIN | SHOP_MANAGER) */
export const getPurchases = async (): Promise<Purchase[]> => {
  const res = await api.get("/purchases");
  return res.data.purchases;
};

/** POST /purchases  (ADMIN | SHOP_MANAGER) */
export const createPurchase = async (payload: {
  material_id: number;
  quantity: number;
  unit_price: number;
  supplier_id?: number;
  notes?: string;
}): Promise<Purchase> => {
  const res = await api.post("/purchases", payload);
  return res.data.purchase;
};

/** GET /purchases/:purchase_id  (ADMIN | SHOP_MANAGER) */
export const getPurchase = async (purchaseId: number): Promise<Purchase> => {
  const res = await api.get(`/purchases/${purchaseId}`);
  return res.data.purchase;
};

/** PUT /purchases/:purchase_id  (ADMIN | SHOP_MANAGER) */
export const updatePurchase = async (
  purchaseId: number,
  payload: Partial<Purchase>
): Promise<Purchase> => {
  const res = await api.put(`/purchases/${purchaseId}`, payload);
  return res.data.purchase;
};

/** DELETE /purchases/:purchase_id  (ADMIN) */
export const deletePurchase = async (purchaseId: number): Promise<void> => {
  await api.delete(`/purchases/${purchaseId}`);
};

/** GET /purchases/report  (ADMIN | SHOP_MANAGER) */
export const getPurchaseReport = async (): Promise<any> => {
  const res = await api.get("/purchases/report");
  return res.data;
};

/** GET /purchases/supplier/:supplier_id  (ADMIN | SHOP_MANAGER) */
export const getPurchasesBySupplier = async (supplierId: number): Promise<Purchase[]> => {
  const res = await api.get(`/purchases/supplier/${supplierId}`);
  return res.data.purchases;
};

/** GET /purchases/dashboard  (ADMIN | SHOP_MANAGER) */
export const getPurchasesDashboard = async (): Promise<any> => {
  const res = await api.get("/purchases/dashboard");
  return res.data;
};

// ─── Suppliers ────────────────────────────────────────────────────────────────

/** GET /suppliers  (ADMIN | SHOP_MANAGER) */
export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await api.get("/suppliers");
  return res.data.suppliers;
};

/** GET /suppliers/:supplier_id  (ADMIN | SHOP_MANAGER) */
export const getSupplier = async (supplierId: number): Promise<Supplier> => {
  const res = await api.get(`/suppliers/${supplierId}`);
  return res.data.supplier;
};

/** POST /suppliers  (ADMIN | SHOP_MANAGER) */
export const createSupplier = async (
  payload: Omit<Supplier, "id" | "is_active">
): Promise<Supplier> => {
  const res = await api.post("/suppliers", payload);
  return res.data.supplier;
};

/** PUT /suppliers/:supplier_id  (ADMIN | SHOP_MANAGER) */
export const updateSupplier = async (
  supplierId: number,
  payload: Partial<Supplier>
): Promise<Supplier> => {
  const res = await api.put(`/suppliers/${supplierId}`, payload);
  return res.data.supplier;
};

/** DELETE /suppliers/:supplier_id  (ADMIN | SHOP_MANAGER) */
export const deleteSupplier = async (supplierId: number): Promise<void> => {
  await api.delete(`/suppliers/${supplierId}`);
};

/** GET /suppliers/:supplier_id/report  (ADMIN | SHOP_MANAGER) */
export const getSupplierReport = async (supplierId: number): Promise<any> => {
  const res = await api.get(`/suppliers/${supplierId}/report`);
  return res.data;
};