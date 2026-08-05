import React, { useState, useCallback, useEffect } from "react";
import "./StockManagement.css";
import * as stockAPI from "../../services/inventoryService"

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockCategory = "Dry Staples" | "Perishables" | "Cold Storage";

export interface RawMaterial {
  id: string;
  name: string;
  category: StockCategory;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconArchive = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const IconAlertOctagon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSettings2 = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 1.44 1.44" />
    <path d="M21 12a9 9 0 0 1-9 9" />
    <path d="M3 12a9 9 0 0 1 9-9" />
    <path d="M5.64 18.36a10 10 0 0 1-1.41-1.41" />
    <path d="M18.36 5.64a10 10 0 0 1 1.41 1.41" />
  </svg>
);

const IconPlus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconRefreshCw = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconEdit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconEye = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTrash = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconLoader = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="7.07" y2="7.07" />
    <line x1="16.93" y1="16.93" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="7.07" y2="16.93" />
    <line x1="16.93" y1="7.07" x2="19.78" y2="4.22" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: StockCategory[] = ["Dry Staples", "Perishables", "Cold Storage"];

const CATEGORY_FILTERS = [
  { label: "All Items",    value: "" },
  { label: "Dry Staples",  value: "Dry Staples" },
  { label: "Perishables",  value: "Perishables" },
  { label: "Cold Storage", value: "Cold Storage" },
];

type ModalMode = "create" | "view" | "edit" | "delete" | "restock" | null;

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: "success" | "error" }
let toastCounter = 0;

// ─── Form defaults ────────────────────────────────────────────────────────────

const defaultForm = () => ({
  name: "",
  category: "Dry Staples" as StockCategory,
  currentStock: "10.0",
  unit: "kg",
  reorderLevel: "5.0",
  costPerUnit: "5.00",
});

// ─── Helper: Merge Material + InventoryItem → RawMaterial ────────────────────

const mergeDataToRawMaterial = (
  material: stockAPI.Material,
  inventory: stockAPI.InventoryItem | null
): RawMaterial => {
  // Extract category from description (stored as "CAT:CategoryName")
  let category: StockCategory = "Dry Staples";
  if (material.description?.startsWith("CAT:")) {
    const catStr = material.description.substring(4).split("|")[0];
    if (["Dry Staples", "Perishables", "Cold Storage"].includes(catStr)) {
      category = catStr as StockCategory;
    }
  }

  return {
    id: String(material.id),
    name: material.name,
    category,
    currentStock: inventory?.quantity ?? 0,
    unit: material.unit,
    reorderLevel: inventory?.reorder_level ?? 0,
    costPerUnit: material.cost_per_unit,
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export const StockManagement: React.FC = () => {
  // ── Materials state ────────────────────────────────────────────────────────
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState(defaultForm());
  const [restockAmount, setRestockAmount] = useState("10");

  // ── Loading & Error ────────────────────────────────────────────────────────
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Load Materials & Inventory on Mount ────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        setPageError(null);

        // Fetch materials and inventory in parallel
        const [apiMaterials, apiInventory] = await Promise.all([
          stockAPI.getMaterials(),
          stockAPI.getInventory(),
        ]);

        // Merge materials and inventory into RawMaterial array
        const merged = apiMaterials.map((mat) => {
          const inv = apiInventory.find((inv) => inv.material_id === mat.id);
          return mergeDataToRawMaterial(mat, inv);
        });

        setMaterials(merged);
        setPageLoading(false);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to load materials";
        setPageError(errorMsg);
        setPageLoading(false);
        showToast(errorMsg, "error");
      }
    };

    loadData();
  }, [showToast]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredMaterials = activeCategory
    ? materials.filter((m) => m.category === activeCategory)
    : materials;

  const lowStockMaterials = materials.filter((m) => m.currentStock <= m.reorderLevel);
  const totalMaterials = materials.length;
  const totalTrackedUnits = materials.reduce((sum, m) => sum + m.currentStock, 0);

  // ── Stock bar helper ───────────────────────────────────────────────────────
  const getStockMetricColor = (mat: RawMaterial) => {
    if (mat.currentStock <= mat.reorderLevel) return "danger-glow";
    if (mat.currentStock <= mat.reorderLevel * 1.5) return "warning-glow";
    return "success-glow";
  };

  const getStockBarWidth = (mat: RawMaterial) =>
    `${Math.min((mat.currentStock / (mat.reorderLevel || 1)) * 50, 100)}%`;

  // ── Modal openers ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setForm(defaultForm());
    setModalMode("create");
  };

  const openViewModal = (mat: RawMaterial) => {
    setSelectedMaterial(mat);
    setModalMode("view");
  };

  const openEditModal = (mat: RawMaterial) => {
    setSelectedMaterial(mat);
    setForm({
      name: mat.name,
      category: mat.category,
      currentStock: String(mat.currentStock),
      unit: mat.unit,
      reorderLevel: String(mat.reorderLevel),
      costPerUnit: String(mat.costPerUnit),
    });
    setModalMode("edit");
  };

  const openDeleteModal = (mat: RawMaterial) => {
    setSelectedMaterial(mat);
    setModalMode("delete");
  };

  const openRestockModal = (mat: RawMaterial) => {
    setSelectedMaterial(mat);
    setRestockAmount("10");
    setModalMode("restock");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMaterial(null);
    setForm(defaultForm());
    setRestockAmount("10");
  };

  // ── CRUD handlers (with API calls) ──────────────────────────────────────────

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setFormLoading(true);
    try {
      // Build description with category info
      const categoryPrefix = `CAT:${form.category}|`;
      const description = categoryPrefix;

      // Create material first
      const newMaterial = await stockAPI.createMaterial({
        name: form.name,
        unit: form.unit,
        cost_per_unit: parseFloat(form.costPerUnit) || 0,
        description,
      });

      // Create initial inventory entry
      await stockAPI.updateInventory(newMaterial.id, {
        quantity: parseFloat(form.currentStock) || 0,
        reason: "Initial stock entry",
      });

      // Merge the new data and add to state
      const newRawMaterial = mergeDataToRawMaterial(newMaterial, {
        id: 0,
        material_id: newMaterial.id,
        quantity: parseFloat(form.currentStock) || 0,
        unit: form.unit,
        reorder_level: parseFloat(form.reorderLevel) || 0,
      });

      setMaterials((prev) => [...prev, newRawMaterial]);
      showToast("Material Added Successfully", "success");
      closeModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create material";
      showToast(errorMsg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    setFormLoading(true);
    try {
      const materialId = parseInt(selectedMaterial.id);
      const categoryPrefix = `CAT:${form.category}|`;
      const description = categoryPrefix;

      // Update material
      await stockAPI.updateMaterial(materialId, {
        name: form.name,
        unit: form.unit,
        cost_per_unit: parseFloat(form.costPerUnit) || 0,
        description,
      });

      // Update inventory separately (quantity and reorder level)
      await stockAPI.updateInventory(materialId, {
        quantity: parseFloat(form.currentStock) || 0,
        reason: "Material updated",
      });

      // Update local state
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === selectedMaterial.id
            ? {
                ...m,
                name: form.name,
                category: form.category,
                currentStock: parseFloat(form.currentStock) || 0,
                unit: form.unit,
                reorderLevel: parseFloat(form.reorderLevel) || 0,
                costPerUnit: parseFloat(form.costPerUnit) || 0,
              }
            : m
        )
      );
      showToast("Material Updated Successfully", "success");
      closeModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update material";
      showToast(errorMsg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    setFormLoading(true);
    try {
      const materialId = parseInt(selectedMaterial.id);
      await stockAPI.deleteMaterial(materialId);

      setMaterials((prev) => prev.filter((m) => m.id !== selectedMaterial.id));
      showToast("Material Deleted Successfully", "success");
      closeModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete material";
      showToast(errorMsg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    setFormLoading(true);
    try {
      const materialId = parseInt(selectedMaterial.id);
      const amount = parseFloat(restockAmount) || 0;
      const newStock = selectedMaterial.currentStock + amount;

      // Update inventory with new quantity
      await stockAPI.updateInventory(materialId, {
        quantity: newStock,
        reason: `Restocked +${amount}`,
      });

      // Update local state
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === selectedMaterial.id
            ? { ...m, currentStock: newStock }
            : m
        )
      );

      showToast(`Restocked +${amount} ${selectedMaterial.unit}`, "success");
      closeModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to restock";
      showToast(errorMsg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="stock-workspace-container">

      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <div className="sm-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`sm-toast sm-toast-${t.type}`}>
            <span className="sm-toast-dot" />
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Page Error State ────────────────────────────────────────────── */}
      {pageError && (
        <div className="sm-toast sm-toast-error" style={{ marginBottom: "1rem" }}>
          <span className="sm-toast-dot" />
          {pageError}
        </div>
      )}

      {/* ── Loading State ───────────────────────────────────────────────── */}
      {pageLoading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <IconLoader size={24} />
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
            Loading materials...
          </p>
        </div>
      ) : (
        <>
          {/* ── 1. Stats Grid ────────────────────────────────────────────── */}
          <div className="stock-metrics-grid">
            <div className="stock-stat-card">
              <IconArchive size={20} className="meta-icon purple-ico" />
              <div className="details">
                <h3>{totalMaterials}</h3>
                <span>Total Ingredients Tracked</span>
              </div>
            </div>
            <div className="stock-stat-card">
              <IconAlertOctagon size={20} className="meta-icon alert-ico" />
              <div className="details">
                <h3 className={lowStockMaterials.length > 0 ? "text-danger" : ""}>
                  {lowStockMaterials.length}
                </h3>
                <span>Depleted Materials Alerts</span>
              </div>
            </div>
            <div className="stock-stat-card">
              <IconSettings2 size={20} className="meta-icon green-ico" />
              <div className="details">
                <h3>{Math.round(totalTrackedUnits)} Units</h3>
                <span>Staples Tracked</span>
              </div>
            </div>
          </div>

          {/* ── 2. Table Section ─────────────────────────────────────────── */}
          <div className="stock-table-section">
            <div className="stock-table-header sm-table-header-row">
              <h4>Ingredient &amp; Staples Ledger</h4>
              <div className="sm-header-actions">
                {/* Category Filter Chips */}
                <div className="sm-role-chips">
                  {CATEGORY_FILTERS.map((c) => (
                    <button
                      key={c.value}
                      className={`sm-chip ${activeCategory === c.value ? "sm-chip-active" : ""}`}
                      onClick={() => setActiveCategory(c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <button className="sage-btn btn-primary btn-md" onClick={openCreateModal}>
                  <IconPlus size={24} />
                  Track Ingredient
                </button>
              </div>
            </div>

            <div className="sage-table-card">
              <div className="sage-table-container">
                <table className="sage-data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Staple ID</th>
                      <th style={{ textAlign: "left" }}>Ingredient Name</th>
                      <th style={{ textAlign: "left" }}>Category</th>
                      <th style={{ textAlign: "left" }}>Inventory Level</th>
                      <th style={{ textAlign: "left" }}>Warning Line</th>
                      <th style={{ textAlign: "left" }}>Standard Cost</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.length === 0 ? (
                      <tr>
                        <td className="empty-table-cell" colSpan={7}>
                          No ingredients found. Click "Track Ingredient" to add one.
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((mat) => (
                        <tr key={mat.id}>
                          <td>
                            <span className="sm-id-badge">#{mat.id}</span>
                          </td>
                          <td>
                            <strong>{mat.name}</strong>
                          </td>
                          <td>
                            <span className="role-tag-caps">{mat.category}</span>
                          </td>
                          <td style={{ width: "22%" }}>
                            <div className="stock-health-bar-container">
                              <span className="stock-size-text">
                                {mat.currentStock.toFixed(1)} {mat.unit}
                              </span>
                              <div className="health-outline">
                                <div
                                  className={`health-filler ${getStockMetricColor(mat)}`}
                                  style={{ width: getStockBarWidth(mat) }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span>{mat.reorderLevel} {mat.unit}</span>
                          </td>
                          <td>
                            ${mat.costPerUnit.toFixed(2)} / {mat.unit}
                          </td>
                          <td>
                            <div className="tbl-actions">
                              <button
                                className="sage-btn btn-secondary btn-sm sm-icon-btn"
                                title="View"
                                onClick={() => openViewModal(mat)}
                              >
                                <IconEye size={24} />
                              </button>
                              <button
                                className="sage-btn btn-secondary btn-sm sm-icon-btn"
                                title="Edit"
                                onClick={() => openEditModal(mat)}
                              >
                                <IconEdit size={24} />
                              </button>
                              <button
                                className="sage-btn btn-primary btn-sm sm-icon-btn"
                                title="Restock"
                                onClick={() => openRestockModal(mat)}
                              >
                                <IconRefreshCw size={24} />
                              </button>
                              <button
                                className="sage-btn btn-danger btn-sm sm-icon-btn"
                                title="Delete"
                                onClick={() => openDeleteModal(mat)}
                              >
                                <IconTrash size={24} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              MODALS
          ════════════════════════════════════════════════════════════════════ */}

          {/* ── VIEW MODAL ───────────────────────────────────────────────────── */}
          {modalMode === "view" && selectedMaterial && (
            <div className="sage-modal-overlay" onClick={closeModal}>
              <div className="sage-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="sage-modal-header">
                  <h3>Ingredient Details</h3>
                  <button className="sage-modal-close" onClick={closeModal}><IconX size={24} /></button>
                </div>
                <div className="sage-modal-body">
                  <div className="sm-view-grid">
                    <div className="sm-view-row">
                      <span className="sm-view-label">Staple ID</span>
                      <span className="sm-view-value sm-id-badge">#{selectedMaterial.id}</span>
                    </div>
                    <div className="sm-view-row">
                      <span className="sm-view-label">Ingredient Name</span>
                      <span className="sm-view-value">{selectedMaterial.name}</span>
                    </div>
                    <div className="sm-view-row">
                      <span className="sm-view-label">Category</span>
                      <span className="sm-view-value">{selectedMaterial.category}</span>
                    </div>
                    <div className="sm-view-row">
                      <span className="sm-view-label">Current Stock</span>
                      <span className="sm-view-value">
                        {selectedMaterial.currentStock.toFixed(1)} {selectedMaterial.unit}
                      </span>
                    </div>
                    <div className="sm-view-row">
                      <span className="sm-view-label">Reorder Warning Level</span>
                      <span className="sm-view-value">
                        {selectedMaterial.reorderLevel} {selectedMaterial.unit}
                      </span>
                    </div>
                    <div className="sm-view-row">
                      <span className="sm-view-label">Cost Per Unit</span>
                      <span className="sm-view-value">
                        ${selectedMaterial.costPerUnit.toFixed(2)} / {selectedMaterial.unit}
                      </span>
                    </div>
                    <div className="sm-view-row">
                      <span className="sm-view-label">Stock Status</span>
                      <span className={`sm-perm-badge ${
                        selectedMaterial.currentStock <= selectedMaterial.reorderLevel
                          ? "sm-perm-off"
                          : "sm-perm-on"
                      }`}>
                        {selectedMaterial.currentStock <= selectedMaterial.reorderLevel
                          ? "Low Stock"
                          : "Adequate"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CREATE / EDIT MODAL ──────────────────────────────────────────── */}
          {(modalMode === "create" || modalMode === "edit") && (
            <div className="sage-modal-overlay" onClick={closeModal}>
              <div className="sage-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="sage-modal-header">
                  <h3>{modalMode === "create" ? "Track New Raw Material" : "Edit Material"}</h3>
                  <button className="sage-modal-close" onClick={closeModal}><IconX size={24} /></button>
                </div>
                <div className="sage-modal-body">
                  <form
                    className="admin-form-container"
                    onSubmit={modalMode === "create" ? handleCreateMaterial : handleUpdateMaterial}
                  >
                    <div className="form-group-field">
                      <label>Artisanal Staple Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Heirloom Winter Greens"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group-split">
                      <div className="form-group-field">
                        <label>Warehouse Category *</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value as StockCategory })}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group-field">
                        <label>Measuring Unit *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. kg, boxes"
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group-split">
                      <div className="form-group-field">
                        <label>In-Stock Quantity *</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={form.currentStock}
                          onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                        />
                      </div>
                      <div className="form-group-field">
                        <label>Reorder Warning Limit *</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={form.reorderLevel}
                          onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group-field">
                      <label>Avg Wholesale Unit Cost ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={form.costPerUnit}
                        onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                      />
                    </div>

                    <div className="form-dialog-buttons footer-gap">
                      <button
                        type="button"
                        className="sage-btn btn-secondary btn-sm"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="sage-btn btn-primary btn-sm"
                        disabled={formLoading}
                      >
                        {formLoading
                          ? "Saving…"
                          : modalMode === "create"
                          ? "Commit Material"
                          : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── DELETE MODAL ─────────────────────────────────────────────────── */}
          {modalMode === "delete" && selectedMaterial && (
            <div className="sage-modal-overlay" onClick={closeModal}>
              <div className="sage-modal-content sm-modal-narrow" onClick={(e) => e.stopPropagation()}>
                <div className="sage-modal-header">
                  <h3>Remove Ingredient</h3>
                  <button className="sage-modal-close" onClick={closeModal}><IconX size={24} /></button>
                </div>
                <div className="sage-modal-body">
                  <div className="sm-delete-body">
                    <div className="sm-delete-icon-wrap">
                      <IconTrash size={28} />
                    </div>
                    <p className="sm-delete-title">Are you sure?</p>
                    <p className="sm-delete-sub">
                      You are about to permanently remove{" "}
                      <strong>{selectedMaterial.name}</strong> from the ledger.
                      This action cannot be undone.
                    </p>
                  </div>
                  <div className="form-dialog-buttons footer-gap">
                    <button className="sage-btn btn-secondary btn-sm" onClick={closeModal}>
                      Cancel
                    </button>
                    <button
                      className="sage-btn btn-danger btn-sm"
                      disabled={formLoading}
                      onClick={handleDeleteMaterial}
                    >
                      {formLoading ? "Removing…" : "Yes, Remove"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESTOCK MODAL ────────────────────────────────────────────────── */}
          {modalMode === "restock" && selectedMaterial && (
            <div className="sage-modal-overlay" onClick={closeModal}>
              <div className="sage-modal-content sm-modal-narrow" onClick={(e) => e.stopPropagation()}>
                <div className="sage-modal-header">
                  <h3>Restock Ingredient</h3>
                  <button className="sage-modal-close" onClick={closeModal}><IconX size={24} /></button>
                </div>
                <div className="sage-modal-body">
                  <form className="admin-form-container" onSubmit={handleRestock}>
                    <div className="sm-view-grid" style={{ marginBottom: "1rem" }}>
                      <div className="sm-view-row">
                        <span className="sm-view-label">Ingredient</span>
                        <span className="sm-view-value"><strong>{selectedMaterial.name}</strong></span>
                      </div>
                      <div className="sm-view-row">
                        <span className="sm-view-label">Current Stock</span>
                        <span className="sm-view-value">
                          {selectedMaterial.currentStock.toFixed(1)} {selectedMaterial.unit}
                        </span>
                      </div>
                      <div className="sm-view-row">
                        <span className="sm-view-label">Warning Level</span>
                        <span className="sm-view-value">
                          {selectedMaterial.reorderLevel} {selectedMaterial.unit}
                        </span>
                      </div>
                    </div>

                    <div className="form-group-field">
                      <label>Amount to Add ({selectedMaterial.unit}) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(e.target.value)}
                        placeholder="e.g. 50"
                      />
                    </div>

                    <div className="sm-restock-quick-chips">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className={`sm-chip ${restockAmount === String(amt) ? "sm-chip-active" : ""}`}
                          onClick={() => setRestockAmount(String(amt))}
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>

                    <div className="form-dialog-buttons footer-gap">
                      <button type="button" className="sage-btn btn-secondary btn-sm" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="sage-btn btn-primary btn-sm" disabled={formLoading}>
                        {formLoading ? "Restocking…" : `Add ${restockAmount || "?"} ${selectedMaterial.unit}`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default StockManagement;