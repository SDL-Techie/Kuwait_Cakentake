import React, { useState, useEffect, useCallback } from 'react';
import './Inventorymanagement.css';
import {
  getInventory,
  getLowStock,
  getOutOfStock,
  updateInventory,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchases,
  createPurchase,
  getPurchasesDashboard,
  RawMaterial,
  Supplier,
  Purchase,
  InventoryItem,
  PurchasesDashboard,
  PaymentSource,
} from '../../services/inventoryService';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBox = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconAlert = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconTruck = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconCart = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconPlus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconEdit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);
const IconTrash = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const IconCheck = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconRefresh = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type TabKey = 'inventory' | 'materials' | 'suppliers' | 'purchases';
type StockLevel = 'ok' | 'low' | 'out';

const stockLevel = (item: InventoryItem): StockLevel => {
  const qty = Number(item.quantity ?? 0);
  const threshold = Number(item.low_stock_threshold ?? 5);
  if (qty <= 0) return 'out';
  if (qty <= threshold) return 'low';
  return 'ok';
};

const fmtMoney = (n: number | undefined | null) => `₹${Number(n ?? 0).toFixed(2)}`;
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString() : '—');

// ─── Component ────────────────────────────────────────────────────────────────
const InventoryManagement: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('inventory');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dashboard, setDashboard] = useState<PurchasesDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal state — one generic drawer reused per tab
  const [materialModal, setMaterialModal] = useState<{ open: boolean; editing: RawMaterial | null }>({ open: false, editing: null });
  const [supplierModal, setSupplierModal] = useState<{ open: boolean; editing: Supplier | null }>({ open: false, editing: null });
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [stockModal, setStockModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [saving, setSaving] = useState(false);

  const flashError = (msg: string) => { setError(msg); setTimeout(() => setError(null), 4000); };
  const flashSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  // ── Fetch all four datasets in parallel, per active tab need ──────────────
  const fetchAll = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [inv, mats, sups, purch, dash] = await Promise.all([
        getInventory(),
        getMaterials(),
        getSuppliers(),
        getPurchases(),
        getPurchasesDashboard().catch(() => null),
      ]);
      setInventory(inv);
      setMaterials(mats);
      setSuppliers(sups);
      setPurchases(purch);
      setDashboard(dash);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to load inventory data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Ensure action button icons are visible — if an inline SVG fails to render or has zero bbox,
  // add `.no-svg` to the button so the textual fallback is shown. Runs after data/tab changes.
  useEffect(() => {
    const checkIcons = () => {
      try {
        const btns = Array.from(document.querySelectorAll('.inv-icon-btn')) as HTMLButtonElement[];
        btns.forEach(btn => {
          const svg = btn.querySelector('svg');
          let showFallback = false;
          if (!svg) {
            showFallback = true;
          } else {
            const cs = window.getComputedStyle(svg as Element);
            const rect = (svg as SVGElement).getBoundingClientRect();
            if (cs.display === 'none' || cs.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
              showFallback = true;
            }
          }
          if (showFallback) btn.classList.add('no-svg'); else btn.classList.remove('no-svg');
        });
      } catch (e) {
        // ignore DOM errors in SSR or strict environments
      }
    };
    // Run on next frame to ensure SVGs are mounted
    const id = window.requestAnimationFrame(checkIcons);
    // also run again after slight delay in case fonts/styles load
    const t = window.setTimeout(checkIcons, 120);
    return () => { window.cancelAnimationFrame(id); window.clearTimeout(t); };
  }, [tab, inventory, materials, suppliers, purchases]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const lowCount = inventory.filter(i => stockLevel(i) === 'low').length;
  const outCount = inventory.filter(i => stockLevel(i) === 'out').length;
  const okCount = inventory.length - lowCount - outCount;

  const q = search.trim().toLowerCase();
  const visibleInventory = q
    ? inventory.filter(i => (i.material?.name ?? '').toLowerCase().includes(q))
    : inventory;
  const visibleMaterials = q
    ? materials.filter(m => m.name.toLowerCase().includes(q))
    : materials;
  const visibleSuppliers = q
    ? suppliers.filter(s => s.name.toLowerCase().includes(q))
    : suppliers;
  const visiblePurchases = q
    ? purchases.filter(p => (p.material?.name ?? '').toLowerCase().includes(q) || (p.supplier?.name ?? '').toLowerCase().includes(q))
    : purchases;

  // ── Stock adjust modal ──────────────────────────────────────────────────
  const [stockForm, setStockForm] = useState({ quantity: '', low_stock_threshold: '' });
  const openStockModal = (item: InventoryItem) => {
    setStockForm({ quantity: String(item.quantity), low_stock_threshold: String(item.low_stock_threshold) });
    setStockModal({ open: true, item });
  };
  const saveStock = async () => {
    if (!stockModal.item) return;
    setSaving(true);
    try {
      await updateInventory(stockModal.item.material_id, {
        quantity: Number(stockForm.quantity),
        low_stock_threshold: Number(stockForm.low_stock_threshold),
      });
      flashSuccess('Stock updated.');
      setStockModal({ open: false, item: null });
      fetchAll(true);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  // ── Material modal ──────────────────────────────────────────────────────
  const [materialForm, setMaterialForm] = useState({
    name: '', unit: '', cost_per_unit: '', supplier_id: '', opening_quantity: '', low_stock_threshold: '10',
  });
  const openMaterialModal = (material: RawMaterial | null) => {
    setMaterialForm(material
      ? {
          name: material.name, unit: material.unit, cost_per_unit: String(material.cost_per_unit),
          supplier_id: material.supplier_id ? String(material.supplier_id) : '',
          opening_quantity: '', low_stock_threshold: String(material.inventory?.low_stock_threshold ?? 10),
        }
      : { name: '', unit: '', cost_per_unit: '', supplier_id: '', opening_quantity: '0', low_stock_threshold: '10' });
    setMaterialModal({ open: true, editing: material });
  };
  const saveMaterial = async () => {
    if (!materialForm.name.trim() || !materialForm.unit.trim()) {
      flashError('Name and unit are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: materialForm.name.trim(),
        unit: materialForm.unit.trim(),
        cost_per_unit: Number(materialForm.cost_per_unit || 0),
        supplier_id: materialForm.supplier_id ? Number(materialForm.supplier_id) : null,
        low_stock_threshold: Number(materialForm.low_stock_threshold || 10),
      };
      if (materialModal.editing) {
        await updateMaterial(materialModal.editing.id, payload);
        flashSuccess('Material updated.');
      } else {
        payload.opening_quantity = Number(materialForm.opening_quantity || 0);
        await createMaterial(payload);
        flashSuccess('Material created.');
      }
      setMaterialModal({ open: false, editing: null });
      fetchAll(true);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to save material.');
    } finally {
      setSaving(false);
    }
  };
  const removeMaterial = async (material: RawMaterial) => {
    if (!window.confirm(`Delete "${material.name}"? This only works if it has no purchase or consumption history.`)) return;
    try {
      await deleteMaterial(material.id);
      flashSuccess('Material deleted.');
      fetchAll(true);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to delete material.');
    }
  };

  // ── Supplier modal ──────────────────────────────────────────────────────
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_name: '', phone: '', email: '', address: '' });
  const openSupplierModal = (supplier: Supplier | null) => {
    setSupplierForm(supplier
      ? { name: supplier.name, contact_name: supplier.contact_name ?? '', phone: supplier.phone ?? '', email: supplier.email ?? '', address: supplier.address ?? '' }
      : { name: '', contact_name: '', phone: '', email: '', address: '' });
    setSupplierModal({ open: true, editing: supplier });
  };
  const saveSupplier = async () => {
    if (!supplierForm.name.trim()) { flashError('Supplier name is required.'); return; }
    setSaving(true);
    try {
      if (supplierModal.editing) {
        await updateSupplier(supplierModal.editing.id, supplierForm);
        flashSuccess('Supplier updated.');
      } else {
        await createSupplier(supplierForm);
        flashSuccess('Supplier created.');
      }
      setSupplierModal({ open: false, editing: null });
      fetchAll(true);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  };
  const removeSupplier = async (supplier: Supplier) => {
    if (!window.confirm(`Remove "${supplier.name}"? Suppliers with purchase history are deactivated instead of deleted.`)) return;
    try {
      const res = await deleteSupplier(supplier.id);
      flashSuccess(res.deactivated ? 'Supplier deactivated (has history).' : 'Supplier deleted.');
      fetchAll(true);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to remove supplier.');
    }
  };

  // ── Purchase modal ───────────────────────────────────────────────────────
  const [purchaseForm, setPurchaseForm] = useState({
    material_id: '', supplier_id: '', quantity: '', unit_price: '',
    payment_source: 'OTHER' as PaymentSource, reference: '', notes: '',
  });
  const openPurchaseModal = () => {
    setPurchaseForm({ material_id: '', supplier_id: '', quantity: '', unit_price: '', payment_source: 'OTHER', reference: '', notes: '' });
    setPurchaseModal(true);
  };
  const savePurchase = async () => {
    if (!purchaseForm.material_id || !purchaseForm.quantity || purchaseForm.unit_price === '') {
      flashError('Material, quantity and unit price are required.');
      return;
    }
    setSaving(true);
    try {
      await createPurchase({
        material_id: Number(purchaseForm.material_id),
        supplier_id: purchaseForm.supplier_id ? Number(purchaseForm.supplier_id) : undefined,
        quantity: Number(purchaseForm.quantity),
        unit_price: Number(purchaseForm.unit_price),
        payment_source: purchaseForm.payment_source,
        reference: purchaseForm.reference || undefined,
        notes: purchaseForm.notes || undefined,
      });
      flashSuccess('Purchase recorded.');
      setPurchaseModal(false);
      fetchAll(true);
    } catch (err: any) {
      flashError(err?.response?.data?.error ?? 'Failed to record purchase.');
    } finally {
      setSaving(false);
    }
  };

  const totalPurchaseValue = dashboard?.total_amount ?? purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="inv-root">

      {successMsg && (
        <div className="inv-toast inv-toast--success"><IconCheck size={15} /><span>{successMsg}</span></div>
      )}
      {error && (
        <div className="inv-toast inv-toast--error">
          <IconAlert size={15} /><span>{error}</span>
          <button onClick={() => setError(null)} className="inv-toast-close"><IconX size={12} /></button>
        </div>
      )}

      <div className="inv-header">
        <div>
          <h1 className="inv-title">Inventory Management</h1>
          <p className="inv-subtitle">Materials, stock levels, suppliers, and purchase records</p>
        </div>
        <button className={`inv-refresh-btn${refreshing ? ' inv-refresh-btn--spinning' : ''}`} onClick={() => fetchAll(true)} title="Refresh">
          <IconRefresh size={15} />
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="inv-stats-row">
        <div className="inv-stat-card inv-stat-card--all">
          <div className="inv-stat-icon"><IconBox size={20} /></div>
          <div className="inv-stat-body"><span className="inv-stat-num">{materials.length}</span><span className="inv-stat-label">Materials</span></div>
        </div>
        <div className="inv-stat-card inv-stat-card--low">
          <div className="inv-stat-icon"><IconAlert size={20} /></div>
          <div className="inv-stat-body"><span className="inv-stat-num">{lowCount}</span><span className="inv-stat-label">Low Stock</span></div>
        </div>
        <div className="inv-stat-card inv-stat-card--out">
          <div className="inv-stat-icon"><IconAlert size={20} /></div>
          <div className="inv-stat-body"><span className="inv-stat-num">{outCount}</span><span className="inv-stat-label">Out of Stock</span></div>
        </div>
        <div className="inv-stat-card inv-stat-card--suppliers">
          <div className="inv-stat-icon"><IconTruck size={20} /></div>
          <div className="inv-stat-body"><span className="inv-stat-num">{suppliers.length}</span><span className="inv-stat-label">Suppliers</span></div>
        </div>
        <div className="inv-stat-card inv-stat-card--purchases">
          <div className="inv-stat-icon"><IconCart size={20} /></div>
          <div className="inv-stat-body"><span className="inv-stat-num">{fmtMoney(totalPurchaseValue)}</span><span className="inv-stat-label">Total Purchased</span></div>
        </div>
      </div>

      {/* ── Tabs + search ── */}
      <div className="inv-toolbar">
        <div className="inv-tabs">
          {([
            { key: 'inventory', label: 'Stock', count: inventory.length },
            { key: 'materials', label: 'Materials', count: materials.length },
            { key: 'suppliers', label: 'Suppliers', count: suppliers.length },
            { key: 'purchases', label: 'Purchases', count: purchases.length },
          ] as { key: TabKey; label: string; count: number }[]).map(t => (
            <button key={t.key} className={`inv-tab${tab === t.key ? ' inv-tab--active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}<span className="inv-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="inv-toolbar-actions">
          <input type="text" className="inv-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          {tab === 'materials' && (
            <button className="inv-btn-primary" onClick={() => openMaterialModal(null)}><IconPlus />New Material</button>
          )}
          {tab === 'suppliers' && (
            <button className="inv-btn-primary" onClick={() => openSupplierModal(null)}><IconPlus />New Supplier</button>
          )}
          {tab === 'purchases' && (
            <button className="inv-btn-primary" onClick={openPurchaseModal}><IconPlus />Record Purchase</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="inv-center"><div className="inv-spinner" /><p>Loading…</p></div>
      ) : (
        <>
          {/* ── STOCK TAB ── */}
          {tab === 'inventory' && (
            visibleInventory.length === 0 ? (
              <div className="inv-center inv-empty"><IconBox size={40} /><h3>No stock records</h3><p>Materials you create will appear here once inventory is tracked.</p></div>
            ) : (
              <div className="inv-table-wrap">
                <table className="inv-table">
                  <colgroup>
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead><tr><th>Material</th><th>Unit</th><th className="inv-num">In Stock</th><th className="inv-num">Threshold</th><th>Status</th><th>Updated</th><th className="inv-action-col">Action</th></tr></thead>
                  <tbody>
                    {visibleInventory.map(item => {
                      const level = stockLevel(item);
                      return (
                        <tr key={item.id} className={`inv-tr inv-tr--${level}`}>
                          <td className="inv-mat-name">{item.material?.name ?? '—'}</td>
                          <td><span className="inv-unit-chip">{item.material?.unit ?? '—'}</span></td>
                          <td className="inv-num"><span className={`inv-qty inv-qty--${level}`}>{item.quantity}</span></td>
                          <td className="inv-num">{item.low_stock_threshold}</td>
                          <td><span className={`inv-badge inv-badge--${level}`}>{level === 'ok' ? 'In Stock' : level === 'low' ? 'Low Stock' : 'Out of Stock'}</span></td>
                          <td className="inv-muted">{fmtDate(item.updated_at)}</td>
                          <td className="inv-actions-cell"><button className="inv-icon-btn" onClick={() => openStockModal(item)} title="Adjust stock"><IconEdit /><span className="inv-icon-fallback" aria-hidden="true">✎</span></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── MATERIALS TAB ── */}
          {tab === 'materials' && (
            visibleMaterials.length === 0 ? (
              <div className="inv-center inv-empty"><IconBox size={40} /><h3>No materials yet</h3><p>Add your first raw material to start tracking stock.</p></div>
            ) : (
              <div className="inv-table-wrap">
                <table className="inv-table">
                  <colgroup>
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead><tr><th>Name</th><th>Unit</th><th className="inv-num">Cost / Unit</th><th>Supplier</th><th className="inv-num">In Stock</th><th className="inv-action-col">Actions</th></tr></thead>
                  <tbody>
                    {visibleMaterials.map(m => {
                      const supplier = suppliers.find(s => s.id === m.supplier_id);
                      return (
                        <tr key={m.id} className="inv-tr">
                          <td className="inv-mat-name">{m.name}</td>
                          <td><span className="inv-unit-chip">{m.unit}</span></td>
                          <td className="inv-num">{fmtMoney(m.cost_per_unit)}</td>
                          <td className="inv-muted">{supplier?.name ?? '—'}</td>
                          <td className="inv-num">{m.inventory?.quantity ?? 0}</td>
                          <td className="inv-actions-cell">
                                                      <button className="inv-icon-btn" onClick={() => openMaterialModal(m)} title="Edit"><IconEdit /><span className="inv-icon-fallback" aria-hidden="true">✎</span></button>
                                                      <button className="inv-icon-btn inv-icon-btn--danger" onClick={() => removeMaterial(m)} title="Delete"><IconTrash /><span className="inv-icon-fallback" aria-hidden="true">🗑</span></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── SUPPLIERS TAB ── */}
          {tab === 'suppliers' && (
            visibleSuppliers.length === 0 ? (
              <div className="inv-center inv-empty"><IconTruck size={40} /><h3>No suppliers yet</h3><p>Add a supplier to link materials and track purchases.</p></div>
            ) : (
              <div className="inv-table-wrap">
                <table className="inv-table">
                  <colgroup>
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th>Status</th><th className="inv-action-col">Actions</th></tr></thead>
                  <tbody>
                    {visibleSuppliers.map(s => (
                      <tr key={s.id} className="inv-tr">
                        <td className="inv-mat-name">{s.name}</td>
                        <td className="inv-muted">{s.contact_name ?? '—'}</td>
                        <td className="inv-muted">{s.phone ?? '—'}</td>
                        <td className="inv-muted">{s.email ?? '—'}</td>
                        <td><span className={`inv-badge inv-badge--${s.is_active ? 'ok' : 'out'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td className="inv-actions-cell">
                                                  <button className="inv-icon-btn" onClick={() => openSupplierModal(s)} title="Edit"><IconEdit /><span className="inv-icon-fallback" aria-hidden="true">✎</span></button>
                                                  <button className="inv-icon-btn inv-icon-btn--danger" onClick={() => removeSupplier(s)} title="Remove"><IconTrash /><span className="inv-icon-fallback" aria-hidden="true">🗑</span></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── PURCHASES TAB ── */}
          {tab === 'purchases' && (
            visiblePurchases.length === 0 ? (
              <div className="inv-center inv-empty"><IconCart size={40} /><h3>No purchases recorded</h3><p>Record a purchase to restock materials and log spend.</p></div>
            ) : (
              <div className="inv-table-wrap">
                <table className="inv-table">
                  <colgroup>
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                  </colgroup>
                  <thead><tr><th>Material</th><th>Supplier</th><th className="inv-num">Qty</th><th className="inv-num">Unit Price</th><th className="inv-num">Total</th><th>Payment</th><th>Date</th></tr></thead>
                  <tbody>
                    {visiblePurchases.map(p => (
                      <tr key={p.id} className="inv-tr">
                        <td className="inv-mat-name">{p.material?.name ?? '—'}</td>
                        <td className="inv-muted">{p.supplier?.name ?? '—'}</td>
                        <td className="inv-num">{p.quantity}</td>
                        <td className="inv-num">{fmtMoney(p.unit_price)}</td>
                        <td className="inv-num inv-num--strong">{fmtMoney(p.total_amount)}</td>
                        <td><span className="inv-pay-chip">{p.payment_source}</span></td>
                        <td className="inv-muted">{fmtDate(p.purchased_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* ── Stock adjust modal ── */}
      {stockModal.open && stockModal.item && (
        <div className="inv-modal-backdrop" onClick={() => setStockModal({ open: false, item: null })}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>Adjust Stock — {stockModal.item.material?.name}</h3>
              <button className="inv-modal-close" onClick={() => setStockModal({ open: false, item: null })}><IconX size={16} /></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-field">
                <label className="inv-label">Quantity ({stockModal.item.material?.unit})</label>
                <input type="number" className="inv-input" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div className="inv-field">
                <label className="inv-label">Low Stock Threshold</label>
                <input type="number" className="inv-input" value={stockForm.low_stock_threshold} onChange={e => setStockForm(f => ({ ...f, low_stock_threshold: e.target.value }))} />
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-ghost" onClick={() => setStockModal({ open: false, item: null })} disabled={saving}>Cancel</button>
              <button className="inv-btn-primary" onClick={saveStock} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Material modal ── */}
      {materialModal.open && (
        <div className="inv-modal-backdrop" onClick={() => setMaterialModal({ open: false, editing: null })}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>{materialModal.editing ? 'Edit Material' : 'New Material'}</h3>
              <button className="inv-modal-close" onClick={() => setMaterialModal({ open: false, editing: null })}><IconX size={16} /></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-field"><label className="inv-label">Name</label>
                <input className="inv-input" value={materialForm.name} onChange={e => setMaterialForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. All-purpose flour" /></div>
              <div className="inv-field-row">
                <div className="inv-field"><label className="inv-label">Unit</label>
                  <input className="inv-input" value={materialForm.unit} onChange={e => setMaterialForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg / litre / pcs" /></div>
                <div className="inv-field"><label className="inv-label">Cost per Unit</label>
                  <input type="number" className="inv-input" value={materialForm.cost_per_unit} onChange={e => setMaterialForm(f => ({ ...f, cost_per_unit: e.target.value }))} /></div>
              </div>
              <div className="inv-field"><label className="inv-label">Supplier <span className="inv-label-opt">(optional)</span></label>
                <select className="inv-input" value={materialForm.supplier_id} onChange={e => setMaterialForm(f => ({ ...f, supplier_id: e.target.value }))}>
                  <option value="">— None —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="inv-field-row">
                {!materialModal.editing && (
                  <div className="inv-field"><label className="inv-label">Opening Quantity</label>
                    <input type="number" className="inv-input" value={materialForm.opening_quantity} onChange={e => setMaterialForm(f => ({ ...f, opening_quantity: e.target.value }))} /></div>
                )}
                <div className="inv-field"><label className="inv-label">Low Stock Threshold</label>
                  <input type="number" className="inv-input" value={materialForm.low_stock_threshold} onChange={e => setMaterialForm(f => ({ ...f, low_stock_threshold: e.target.value }))} /></div>
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-ghost" onClick={() => setMaterialModal({ open: false, editing: null })} disabled={saving}>Cancel</button>
              <button className="inv-btn-primary" onClick={saveMaterial} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Supplier modal ── */}
      {supplierModal.open && (
        <div className="inv-modal-backdrop" onClick={() => setSupplierModal({ open: false, editing: null })}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>{supplierModal.editing ? 'Edit Supplier' : 'New Supplier'}</h3>
              <button className="inv-modal-close" onClick={() => setSupplierModal({ open: false, editing: null })}><IconX size={16} /></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-field"><label className="inv-label">Name</label>
                <input className="inv-input" value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="inv-field-row">
                <div className="inv-field"><label className="inv-label">Contact Name</label>
                  <input className="inv-input" value={supplierForm.contact_name} onChange={e => setSupplierForm(f => ({ ...f, contact_name: e.target.value }))} /></div>
                <div className="inv-field"><label className="inv-label">Phone</label>
                  <input className="inv-input" value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="inv-field"><label className="inv-label">Email</label>
                <input className="inv-input" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="inv-field"><label className="inv-label">Address</label>
                <textarea className="inv-textarea" rows={2} value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} /></div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-ghost" onClick={() => setSupplierModal({ open: false, editing: null })} disabled={saving}>Cancel</button>
              <button className="inv-btn-primary" onClick={saveSupplier} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Purchase modal ── */}
      {purchaseModal && (
        <div className="inv-modal-backdrop" onClick={() => setPurchaseModal(false)}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>Record Purchase</h3>
              <button className="inv-modal-close" onClick={() => setPurchaseModal(false)}><IconX size={16} /></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-field"><label className="inv-label">Material</label>
                <select className="inv-input" value={purchaseForm.material_id} onChange={e => setPurchaseForm(f => ({ ...f, material_id: e.target.value }))}>
                  <option value="">— Select material —</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                </select>
              </div>
              <div className="inv-field"><label className="inv-label">Supplier <span className="inv-label-opt">(optional)</span></label>
                <select className="inv-input" value={purchaseForm.supplier_id} onChange={e => setPurchaseForm(f => ({ ...f, supplier_id: e.target.value }))}>
                  <option value="">— None —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="inv-field-row">
                <div className="inv-field"><label className="inv-label">Quantity</label>
                  <input type="number" className="inv-input" value={purchaseForm.quantity} onChange={e => setPurchaseForm(f => ({ ...f, quantity: e.target.value }))} /></div>
                <div className="inv-field"><label className="inv-label">Unit Price</label>
                  <input type="number" className="inv-input" value={purchaseForm.unit_price} onChange={e => setPurchaseForm(f => ({ ...f, unit_price: e.target.value }))} /></div>
              </div>
              {purchaseForm.quantity && purchaseForm.unit_price && (
                <p className="inv-total-preview">Total: <strong>{fmtMoney(Number(purchaseForm.quantity) * Number(purchaseForm.unit_price))}</strong></p>
              )}
              <div className="inv-field"><label className="inv-label">Payment Source</label>
                <select className="inv-input" value={purchaseForm.payment_source} onChange={e => setPurchaseForm(f => ({ ...f, payment_source: e.target.value as PaymentSource }))}>
                  <option value="OTHER">Other</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>
              <div className="inv-field"><label className="inv-label">Reference <span className="inv-label-opt">(optional)</span></label>
                <input className="inv-input" value={purchaseForm.reference} onChange={e => setPurchaseForm(f => ({ ...f, reference: e.target.value }))} placeholder="Invoice / receipt number" /></div>
              <div className="inv-field"><label className="inv-label">Notes <span className="inv-label-opt">(optional)</span></label>
                <textarea className="inv-textarea" rows={2} value={purchaseForm.notes} onChange={e => setPurchaseForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-ghost" onClick={() => setPurchaseModal(false)} disabled={saving}>Cancel</button>
              <button className="inv-btn-primary" onClick={savePurchase} disabled={saving}>{saving ? 'Recording…' : 'Record Purchase'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;