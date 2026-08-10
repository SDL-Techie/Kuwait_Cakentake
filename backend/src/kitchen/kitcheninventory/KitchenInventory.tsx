import React, { useState, useEffect, useCallback } from 'react';
import './KitchenInventory.css';
import {
  getInventory,
  getLowStock,
  consumeMaterial,
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
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconEmpty = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const IconAll = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconRefresh = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconMinus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
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
const IconFlame = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
const IconCheck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'low' | 'out';

interface ConsumeModalState {
  open: boolean;
  item: any | null;
  qty: number;
  orderId: string;
  notes: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const stockLevel = (item: any): 'ok' | 'low' | 'out' => {
  const qty = Number(item.quantity ?? item.current_stock ?? 0);
  const threshold = Number(item.low_stock_threshold ?? 5);
  if (qty <= 0) return 'out';
  if (qty <= threshold) return 'low';
  return 'ok';
};

const stockPercent = (item: any): number => {
  const qty = Number(item.quantity ?? item.current_stock ?? 0);
  const threshold = Number(item.low_stock_threshold ?? 5);
  const max = Math.max(threshold * 4, qty, 1);
  return Math.min(100, Math.round((qty / max) * 100));
};

// ─── Component ────────────────────────────────────────────────────────────────
const KitchenInventory: React.FC = () => {
  const [allItems,    setAllItems]    = useState<any[]>([]);
  const [lowItems,    setLowItems]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [filter,      setFilter]      = useState<FilterTab>('all');
  const [search,      setSearch]      = useState('');
  const [error,       setError]       = useState<string | null>(null);
  const [successMsg,  setSuccessMsg]  = useState<string | null>(null);

  const [modal, setModal] = useState<ConsumeModalState>({
    open: false, item: null, qty: 1, orderId: '', notes: '',
  });
  const [consuming, setConsuming] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [inv, low] = await Promise.all([
        getInventory().catch(() => []),
        getLowStock().catch(() => []),
      ]);
      setAllItems(inv ?? []);
      setLowItems(low ?? []);
    } catch {
      setError('Failed to load inventory. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived lists ──────────────────────────────────────────────────────────
  const outItems = allItems.filter(i => stockLevel(i) === 'out');

  const sourceList = filter === 'all' ? allItems
    : filter === 'low' ? lowItems
    : outItems;

  const visible = search.trim()
    ? sourceList.filter(i =>
        (i.material?.name ?? i.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : sourceList;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const okCount  = allItems.filter(i => stockLevel(i) === 'ok').length;
  const lowCount = lowItems.length;
  const outCount = outItems.length;

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openConsume = (item: any) =>
    setModal({ open: true, item, qty: 1, orderId: '', notes: '' });

  const closeModal = () =>
    setModal({ open: false, item: null, qty: 1, orderId: '', notes: '' });

  const clampQty = (v: number, max: number) =>
    Math.min(max, Math.max(1, v));

  const handleConsume = async () => {
    if (!modal.item || consuming) return;
    const matId = modal.item.material_id ?? modal.item.material?.id ?? modal.item.id;
    if (!matId) return;
    setConsuming(true);
    setError(null);
    try {
      await consumeMaterial(
        matId,
        modal.qty,
        modal.orderId ? Number(modal.orderId) : undefined,
        modal.notes || undefined
      );
      const name = modal.item.material?.name ?? modal.item.name ?? 'Item';
      setSuccessMsg(`${modal.qty} ${modal.item.material?.unit ?? modal.item.unit ?? ''} of "${name}" consumed.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      closeModal();
      fetchData(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to record consumption.');
    } finally {
      setConsuming(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const currentQty = modal.item
    ? Number(modal.item.quantity ?? modal.item.current_stock ?? 0)
    : 1;
  const matName = modal.item?.material?.name ?? modal.item?.name ?? '';
  const matUnit = modal.item?.material?.unit ?? modal.item?.unit ?? '';

  return (
    <div className="ki-root">

      {/* ── Toast ── */}
      {successMsg && (
        <div className="ki-toast ki-toast--success">
          <IconCheck size={15} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="ki-toast ki-toast--error">
          <IconAlert size={15} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ki-toast-close"><IconX size={12} /></button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="ki-header">
        <div className="ki-header-left">
          <h1 className="ki-title">Kitchen Inventory</h1>
          <p className="ki-subtitle">Stock levels for your kitchen — consume materials against active orders</p>
        </div>
        <button
          className={`ki-refresh-btn${refreshing ? ' ki-refresh-btn--spinning' : ''}`}
          onClick={() => fetchData(true)}
          title="Refresh"
        >
          <IconRefresh size={15} />
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ki-stats-row">
        <div className="ki-stat-card ki-stat-card--all" onClick={() => setFilter('all')}>
          <div className="ki-stat-icon"><IconAll size={20} /></div>
          <div className="ki-stat-body">
            <span className="ki-stat-num">{allItems.length}</span>
            <span className="ki-stat-label">Total Materials</span>
          </div>
        </div>
        <div className="ki-stat-card ki-stat-card--ok">
          <div className="ki-stat-icon"><IconBox size={20} /></div>
          <div className="ki-stat-body">
            <span className="ki-stat-num">{okCount}</span>
            <span className="ki-stat-label">Well Stocked</span>
          </div>
        </div>
        <div className="ki-stat-card ki-stat-card--low" onClick={() => setFilter('low')}>
          <div className="ki-stat-icon"><IconAlert size={20} /></div>
          <div className="ki-stat-body">
            <span className="ki-stat-num">{lowCount}</span>
            <span className="ki-stat-label">Low Stock</span>
          </div>
          {lowCount > 0 && <span className="ki-stat-badge">Needs reorder</span>}
        </div>
        <div className="ki-stat-card ki-stat-card--out" onClick={() => setFilter('out')}>
          <div className="ki-stat-icon"><IconEmpty size={20} /></div>
          <div className="ki-stat-body">
            <span className="ki-stat-num">{outCount}</span>
            <span className="ki-stat-label">Out of Stock</span>
          </div>
          {outCount > 0 && <span className="ki-stat-badge ki-stat-badge--red">Urgent</span>}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="ki-toolbar">
        <div className="ki-tabs">
          {([
            { key: 'all',  label: 'All Stock',   count: allItems.length },
            { key: 'low',  label: 'Low Stock',   count: lowCount },
            { key: 'out',  label: 'Out of Stock', count: outCount },
          ] as { key: FilterTab; label: string; count: number }[]).map(t => (
            <button
              key={t.key}
              className={`ki-tab${filter === t.key ? ' ki-tab--active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span className="ki-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="ki-search-wrap">
          <IconSearch size={15} />
          <input
            type="text"
            className="ki-search"
            placeholder="Search materials…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ki-search-clear" onClick={() => setSearch('')}>
              <IconX size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="ki-center">
          <div className="ki-spinner" />
          <p>Loading inventory…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="ki-center ki-empty">
          <IconBox size={44} />
          <h3>No materials found</h3>
          <p>{search ? `No results for "${search}"` : 'This category is currently empty.'}</p>
        </div>
      ) : (
        <div className="ki-table-wrap">
          <table className="ki-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Unit</th>
                <th className="ki-th-num">In Stock</th>
                <th className="ki-th-num">Threshold</th>
                <th>Level</th>
                <th>Status</th>
                <th className="ki-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item, idx) => {
                const level  = stockLevel(item);
                const pct    = stockPercent(item);
                const qty    = Number(item.quantity ?? item.current_stock ?? 0);
                const thresh = Number(item.low_stock_threshold ?? 5);
                const name   = item.material?.name ?? item.name ?? '—';
                const unit   = item.material?.unit ?? item.unit ?? '—';
                const costPu = item.material?.cost_per_unit ?? item.cost_per_unit;

                return (
                  <tr key={item.material_id ?? item.id ?? idx} className={`ki-tr ki-tr--${level}`}>
                    <td>
                      <div className="ki-mat-name">{name}</div>
                      {costPu != null && (
                        <div className="ki-mat-cost">₹{Number(costPu).toFixed(2)} / {unit}</div>
                      )}
                    </td>
                    <td><span className="ki-unit-chip">{unit}</span></td>
                    <td className="ki-td-num">
                      <span className={`ki-qty ki-qty--${level}`}>{qty}</span>
                    </td>
                    <td className="ki-td-num ki-td-thresh">{thresh}</td>
                    <td className="ki-td-bar">
                      <div className="ki-bar-track">
                        <div
                          className={`ki-bar-fill ki-bar-fill--${level}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="ki-bar-pct">{pct}%</span>
                    </td>
                    <td>
                      <span className={`ki-badge ki-badge--${level}`}>
                        {level === 'ok'  ? 'In Stock' :
                         level === 'low' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="ki-td-action">
                      <button
                        className="ki-consume-btn"
                        disabled={qty <= 0}
                        onClick={() => openConsume(item)}
                        title={qty <= 0 ? 'Out of stock' : 'Record consumption'}
                      >
                        <IconFlame size={13} />
                        Consume
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Consume Modal ── */}
      {modal.open && modal.item && (
        <div className="ki-modal-backdrop" onClick={closeModal}>
          <div className="ki-modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="ki-modal-header">
              <div>
                <h3 className="ki-modal-title">Record Consumption</h3>
                <p className="ki-modal-sub">{matName}</p>
              </div>
              <button className="ki-modal-close" onClick={closeModal}>
                <IconX size={16} />
              </button>
            </div>

            {/* Stock summary inside modal */}
            <div className="ki-modal-stock-row">
              <div className="ki-modal-stock-item">
                <span className="ki-modal-stock-label">Current Stock</span>
                <span className={`ki-modal-stock-val ki-qty--${stockLevel(modal.item)}`}>
                  {currentQty} {matUnit}
                </span>
              </div>
              <div className="ki-modal-stock-item">
                <span className="ki-modal-stock-label">Status</span>
                <span className={`ki-badge ki-badge--${stockLevel(modal.item)}`}>
                  {stockLevel(modal.item) === 'ok'  ? 'In Stock' :
                   stockLevel(modal.item) === 'low' ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="ki-modal-body">

              {/* Quantity stepper */}
              <div className="ki-field">
                <label className="ki-label">Quantity to Consume <span className="ki-label-unit">({matUnit})</span></label>
                <div className="ki-stepper">
                  <button
                    className="ki-stepper-btn"
                    onClick={() => setModal(m => ({ ...m, qty: clampQty(m.qty - 1, currentQty) }))}
                    disabled={modal.qty <= 1}
                  >
                    <IconMinus size={14} />
                  </button>
                  <input
                    type="number"
                    className="ki-stepper-input"
                    min={1}
                    max={currentQty}
                    value={modal.qty}
                    onChange={e =>
                      setModal(m => ({ ...m, qty: clampQty(Number(e.target.value), currentQty) }))
                    }
                  />
                  <button
                    className="ki-stepper-btn"
                    onClick={() => setModal(m => ({ ...m, qty: clampQty(m.qty + 1, currentQty) }))}
                    disabled={modal.qty >= currentQty}
                  >
                    <IconPlus size={14} />
                  </button>
                </div>
                {modal.qty > 0 && (
                  <p className="ki-after-consume">
                    After consuming: <strong>{Math.max(0, currentQty - modal.qty)} {matUnit}</strong> remaining
                  </p>
                )}
              </div>

              {/* Order ID */}
              <div className="ki-field">
                <label className="ki-label">
                  Order ID <span className="ki-label-opt">(optional)</span>
                </label>
                <input
                  type="text"
                  className="ki-input"
                  placeholder="e.g. 9820"
                  value={modal.orderId}
                  onChange={e => setModal(m => ({ ...m, orderId: e.target.value }))}
                />
              </div>

              {/* Notes */}
              <div className="ki-field">
                <label className="ki-label">
                  Notes <span className="ki-label-opt">(optional)</span>
                </label>
                <textarea
                  className="ki-textarea"
                  rows={2}
                  placeholder="e.g. Used for birthday cake batch, oven prep…"
                  value={modal.notes}
                  onChange={e => setModal(m => ({ ...m, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="ki-modal-footer">
              <button className="ki-btn-ghost" onClick={closeModal} disabled={consuming}>
                Cancel
              </button>
              <button
                className="ki-btn-consume"
                onClick={handleConsume}
                disabled={consuming || currentQty <= 0}
              >
                {consuming
                  ? <><span className="ki-btn-spinner" /> Recording…</>
                  : <><IconFlame size={14} /> Confirm Consumption</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenInventory;