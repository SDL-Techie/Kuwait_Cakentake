import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlusCircle, Trash2, Edit2, Tag, Layers, Utensils, Award, X,
  GitBranch, Palette, Percent, Search, RefreshCw, ChevronDown,
  CheckCircle2, XCircle, Package, Flame, Plus, Image as ImageIcon,
  ToggleLeft, ToggleRight, AlertCircle, Filter, UploadCloud,
} from 'lucide-react';
import './MenuManagement.css';
import { uploadCloudinaryImage } from '../../services/directApiService';
import { menuManagementService } from '../../services/menuManagementService';

import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion as deletePromotionApi,
  activatePromotion,
  deactivatePromotion,
  addFreeItem,
} from '../../services/promotionService';


const CLOUD_NAME = 'djwyoxnqy';
const UPLOAD_PRESET = 'CakeNTake_upload';

const uploadToCloudinary = async (file: File): Promise<string> => {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', UPLOAD_PRESET);
  const res = await uploadCloudinaryImage(CLOUD_NAME, data);
  return res.data.secure_url;
};

/* ============================================================
   TOAST SYSTEM
============================================================ */
interface ToastItem { id: number; message: string; type: 'success' | 'error' | 'info'; }
let _toastId = 0;

const ToastStack: React.FC<{ toasts: ToastItem[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => (
  <div className="mm-toast-stack">
    {toasts.map(t => (
      <div key={t.id} className={`mm-toast mm-toast-${t.type}`}>
        {t.type === 'success' ? <CheckCircle2 size={15} /> : t.type === 'error' ? <XCircle size={15} /> : <AlertCircle size={15} />}
        <span>{t.message}</span>
        <button onClick={() => onRemove(t.id)}><X size={13} /></button>
      </div>
    ))}
  </div>
);

/* ============================================================
   CONFIRM DIALOG
============================================================ */
interface ConfirmProps { isOpen: boolean; message: string; onConfirm: () => void; onCancel: () => void; }
const ConfirmDialog: React.FC<ConfirmProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="mm-confirm-overlay" onClick={onCancel}>
      <div className="mm-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="mm-confirm-icon"><AlertCircle size={30} /></div>
        <p className="mm-confirm-msg">{message}</p>
        <div className="mm-confirm-actions">
          <button className="mm-btn mm-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="mm-btn mm-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MODAL
============================================================ */
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; icon?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; children: React.ReactNode; }
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, icon, size = 'md', children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className={`mm-modal mm-modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="mm-modal-header">
          <div className="mm-modal-title-wrap">
            {icon && <span className="mm-modal-icon">{icon}</span>}
            <h3 className="mm-modal-title">{title}</h3>
          </div>
          <button className="mm-modal-close" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="mm-modal-body">{children}</div>
      </div>
    </div>
  );
};

/* ============================================================
   IMAGE UPLOAD FIELD — drag & drop, preview, replace, remove
   (used by Categories, Subcategories, Products, Combos, and now Addons)
============================================================ */
const ImageUploadField: React.FC<{
  label: string; preview: string; fileId: string;
  onFileChange: (file: File, url: string) => void;
  onRemove?: () => void;
}> = ({ label, preview, fileId, onFileChange, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f && f.type.startsWith('image/')) {
      onFileChange(f, URL.createObjectURL(f));
    }
  };

  return (
    <div className="mm-field">
      <label className="mm-label">{label}</label>
      <div
        className={`mm-img-upload ${preview ? 'has-preview' : ''} ${dragActive ? 'is-dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
        onDrop={e => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="mm-img-preview" />
            <div className="mm-img-overlay">
              <span className="mm-img-overlay-btn">
                <UploadCloud size={15} /> Replace
              </span>
              {onRemove && (
                <button
                  type="button"
                  className="mm-img-remove-btn"
                  onClick={e => { e.stopPropagation(); onRemove(); }}
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mm-img-placeholder">
            <div className="mm-img-placeholder-icon"><ImageIcon size={22} /></div>
            <span className="mm-img-placeholder-title">
              {dragActive ? 'Drop image here' : 'Click or drag image to upload'}
            </span>
            <span className="mm-img-hint">PNG, JPG up to 5MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          id={fileId}
          accept="image/*"
          className="mm-file-input"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
};

/* ============================================================
   STATUS BADGE
============================================================ */
const StatusBadge: React.FC<{ active: boolean; onClick?: () => void }> = ({ active, onClick }) => (
  <button
    className={`mm-status-badge ${active ? 'mm-status-active' : 'mm-status-inactive'}`}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
    title={onClick ? `Click to ${active ? 'deactivate' : 'activate'}` : undefined}
  >
    {active ? <><CheckCircle2 size={11} /> Active</> : <><XCircle size={11} /> Inactive</>}
  </button>
);

/* ============================================================
   TYPES
============================================================ */
type TopTab = 'products' | 'categories' | 'subcategories' | 'variants' | 'flavors' | 'addons' | 'combos' | 'promotions' | 'promoCodes';

interface Product     { id: string; name: string; description: string; categoryId: string; categoryName?: string; price: number; originalPrice?: number; stock: number; unit: string; image: string; ingredients: string; isAvailable: boolean; }
interface Category    { id: string; name: string; description?: string; image?: string; isActive?: boolean; }
interface SubCategory { id: string; name: string; parentCategoryId: string; parentCategoryName?: string; description?: string; image?: string; isActive: boolean; }
interface Variant     { id: string; name: string; priceModifier: number; isActive: boolean; productId?: string; productName?: string; }
interface Flavor      { id: string; name: string; priceModifier: number; isActive: boolean; variantId?: string; variantName?: string; }
// ── CHANGED: Addon now carries an image ──
interface Addon       { id: string; name: string; price: number; image?: string; isPredefined: boolean; isActive: boolean; }
interface Combo       { id: string; name: string; description: string; price: number; discountAmount?: number; image: string; isAvailable: boolean; }

interface Promotion {
  id: string;
  name: string;
  description?: string;
  productId: number;
  product?: { id: number; name: string; image_url?: string; };
  promotionType: "DISCOUNT" | "FREE_ITEM";
  discountType?: "PERCENT" | "FLAT";
  discountValue?: number;
  freeItems: {
    id: number;
    product_id: number;
    quantity: number;
    product?: { id: number; name: string; image_url?: string; };
  }[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface PromoCode   { id: string; code: string; discountType: string; discountValue: number; minOrderValue: number; maxUses?: number; usedCount?: number; isActive: boolean; expiresAt?: string; }

/* ============================================================
   EMPTY STATE
============================================================ */
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; sub: string; action?: { label: string; onClick: () => void } }> = ({ icon, title, sub, action }) => (
  <div className="mm-empty">
    <div className="mm-empty-icon">{icon}</div>
    <p className="mm-empty-title">{title}</p>
    <p className="mm-empty-sub">{sub}</p>
    {action && <button className="mm-btn mm-btn-primary" onClick={action.onClick}><Plus size={14} />{action.label}</button>}
  </div>
);

/* ============================================================
   FORM FIELD HELPERS
============================================================ */
const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="mm-field">
    <label className="mm-label">{label}{required && <span className="mm-required">*</span>}</label>
    {children}
  </div>
);

const Row2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mm-field-row">{children}</div>
);

const Checkbox: React.FC<{ id: string; checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ id, checked, onChange, label }) => (
  <div className="mm-checkbox-row">
    <div className={`mm-toggle ${checked ? 'mm-toggle-on' : ''}`} onClick={() => onChange(!checked)}>
      {checked ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
    </div>
    <label htmlFor={id} className="mm-toggle-label" onClick={() => onChange(!checked)}>{label}</label>
  </div>
);

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const discountLabel = (type: string, val: number) => type === 'PERCENT' || type === 'percentage' ? `${val}% off` : `₹${val} off`;

/* ============================================================
   MAIN COMPONENT
============================================================ */
export const MenuManagement: React.FC = () => {

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++_toastId;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  const [confirm, setConfirm] = useState<{ open: boolean; msg: string; action: () => void }>({ open: false, msg: '', action: () => {} });
  const askConfirm = (msg: string, action: () => void) => setConfirm({ open: true, msg, action });
  const doConfirm = () => { confirm.action(); setConfirm({ open: false, msg: '', action: () => {} }); };

  const [activeTab, setActiveTab] = useState<TopTab>('products');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCats,    setSubCats]    = useState<SubCategory[]>([]);
  const [variants,   setVariants]   = useState<Variant[]>([]);
  const [allVariants, setAllVariants] = useState<Variant[]>([]);
  const [flavors,    setFlavors]    = useState<Flavor[]>([]);
  const [addons,     setAddons]     = useState<Addon[]>([]);
  const [combos,     setCombos]     = useState<Combo[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  const [activeCatFilter,  setActiveCatFilter]  = useState('all');
  const [variantProductId, setVariantProductId] = useState('');
  const [flavorVariantId,  setFlavorVariantId]  = useState('');

  const [productModal,   setProductModal]   = useState(false);
  const [categoryModal,  setCategoryModal]  = useState(false);
  const [subCatModal,    setSubCatModal]    = useState(false);
  const [variantModal,   setVariantModal]   = useState(false);
  const [flavorModal,    setFlavorModal]    = useState(false);
  const [addonModal,     setAddonModal]     = useState(false);
  const [comboModal,     setComboModal]     = useState(false);
  const [promotionModal, setPromotionModal] = useState(false);
  const [promoCodeModal, setPromoCodeModal] = useState(false);

  const [selProduct,   setSelProduct]   = useState<Product    | null>(null);
  const [selCategory,  setSelCategory]  = useState<Category   | null>(null);
  const [selSubCat,    setSelSubCat]    = useState<SubCategory | null>(null);
  const [selVariant,   setSelVariant]   = useState<Variant    | null>(null);
  const [selFlavor,    setSelFlavor]    = useState<Flavor     | null>(null);
  const [selAddon,     setSelAddon]     = useState<Addon      | null>(null);
  const [selCombo,     setSelCombo]     = useState<Combo      | null>(null);
  const [selPromotion, setSelPromotion] = useState<Promotion  | null>(null);
  const [selPromoCode, setSelPromoCode] = useState<PromoCode  | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [saving,       setSaving]       = useState(false);

  const [pName, setPName] = useState(''); const [pPrice, setPPrice] = useState('0');
  const [pOrigPrice, setPOrigPrice] = useState(''); const [pDesc, setPDesc] = useState('');
  const [pCatId, setPCatId] = useState(''); const [pImage, setPImage] = useState('');
  const [pFile, setPFile] = useState<File | null>(null); const [pAvailable, setPAvailable] = useState(true);
  const [pStock, setPStock] = useState('0'); const [pUnit, setPUnit] = useState('piece');
  const [pIngredients, setPIngredients] = useState('');

  const [cName, setCName] = useState(''); const [cImage, setCImage] = useState('');
  const [cFile, setCFile] = useState<File | null>(null);

  const [scName, setScName] = useState(''); const [scDesc, setScDesc] = useState('');
  const [scParentId, setScParentId] = useState(''); const [scImage, setScImage] = useState('');
  const [scFile, setScFile] = useState<File | null>(null); const [scActive, setScActive] = useState(true);

  const [vName, setVName] = useState(''); const [vMod, setVMod] = useState('0');
  const [vActive, setVActive] = useState(true); const [vProdId, setVProdId] = useState('');

  const [flName, setFlName] = useState(''); const [flMod, setFlMod] = useState('0');
  const [flActive, setFlActive] = useState(true); const [flVarId, setFlVarId] = useState('');

  // ── CHANGED: Addon form now includes image + file ──
  const [adName, setAdName] = useState(''); const [adPrice, setAdPrice] = useState('0');
  const [adImage, setAdImage] = useState(''); const [adFile, setAdFile] = useState<File | null>(null);
  const [adPredefined, setAdPredefined] = useState(false); const [adActive, setAdActive] = useState(true);

  const [coName, setCoName] = useState(''); const [coDesc, setCoDesc] = useState('');
  const [coPrice, setCoPrice] = useState('0'); const [coDiscount, setCoDiscount] = useState('0');
  const [coImage, setCoImage] = useState(''); const [coFile, setCoFile] = useState<File | null>(null);
  const [coAvailable, setCoAvailable] = useState(true);

  const [prName, setPrName] = useState('');
  const [prDesc, setPrDesc] = useState('');
  const [prProductId, setPrProductId] = useState('');
  const [prPromotionType, setPrPromotionType] = useState<'DISCOUNT' | 'FREE_ITEM'>('DISCOUNT');
  const [prType, setPrType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [prValue, setPrValue] = useState('10');
  const [prStart, setPrStart] = useState(''); const [prEnd, setPrEnd] = useState('');
  const [prActive, setPrActive] = useState(true);
  const [prFreeItemProductId, setPrFreeItemProductId] = useState('');
  const [prFreeItemQty, setPrFreeItemQty] = useState('1');
  const [prFreeItemsDraft, setPrFreeItemsDraft] = useState<{ productId: string; quantity: number }[]>([]);

  const [pcCode, setPcCode] = useState(''); const [pcType, setPcType] = useState<'PERCENT'|'FLAT'>('PERCENT');
  const [pcValue, setPcValue] = useState('10'); const [pcMinOrder, setPcMinOrder] = useState('0');
  const [pcMaxUses, setPcMaxUses] = useState('100'); const [pcExpiry, setPcExpiry] = useState('');
  const [pcActive, setPcActive] = useState(true);

  /* ============================================================
     FETCH
  ============================================================ */

  const fetchProducts = useCallback(async (catId?: string) => {
    setLoading(true);
    try {
      let data: any[];
      if (catId && catId !== 'all') {
        const res = await menuManagementService.getProducts(catId);
        data = Array.isArray(res.data) ? res.data : (res.data.products || []);
      } else {
        const res = await menuManagementService.getProducts();
        data = Array.isArray(res.data) ? res.data : (res.data.products || []);
      }
      setProducts(data.map((item: any) => ({
        id:            String(item.id),
        name:          item.name || '',
        description:   item.description || '',
        categoryId:    String(item.category?.id || item.category_id || ''),
        categoryName:  item.category?.name || item.category_name || '',
        price:         Number(item.price || 0),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        stock:         Number(item.stock || 0),
        unit:          item.unit || 'piece',
        image:         item.image_url || '',
        ingredients:   item.ingredients || '',
        isAvailable:   item.is_active ?? true,
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load products', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuManagementService.getCategories();
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data.map((cat: any) => ({
        id:       String(cat.id),
        name:     cat.name || '',
        image:    cat.image_url || cat.image || '',
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load categories', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  const fetchSubCats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuManagementService.getSubcategories();
      const data = res.data.subcategories || res.data || [];
      setSubCats(data.map((sc: any) => ({
        id:                 String(sc.id),
        name:               sc.name || '',
        parentCategoryId:   String(sc.category_id || sc.parent_category_id || ''),
        parentCategoryName: sc.category_name || sc.parent_category_name || '',
        description:        sc.description || '',
        image:              sc.image_url || sc.image || '',
        isActive:           sc.is_active ?? true,
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load subcategories', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  const fetchAllVariants = useCallback(async () => {
    try {
      const res = await menuManagementService.getVariants();
      const data = res.data.variants || [];
      const mapped: Variant[] = data.map((v: any) => ({
        id:            String(v.id),
        name:          v.name || '',
        priceModifier: Number(v.price_modifier || 0),
        isActive:      v.is_active ?? true,
        productId:     String(v.product_id || ''),
      }));
      setAllVariants(mapped);
      return mapped;
    } catch { return []; }
  }, []);

  const fetchVariants = useCallback(async (productId?: string) => {
    setLoading(true);
    try {
      const res = await menuManagementService.getVariants();
      let data = res.data.variants || [];
      const pid = productId !== undefined ? productId : variantProductId;
      if (pid) {
        data = data.filter((v: any) => String(v.product_id) === String(pid));
      }
      setVariants(data.map((v: any) => ({
        id:            String(v.id),
        name:          v.name || '',
        priceModifier: Number(v.price_modifier || 0),
        isActive:      v.is_active ?? true,
        productId:     String(v.product_id || ''),
        productName:   products.find(p => String(p.id) === String(v.product_id))?.name || '',
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load variants', 'error');
    } finally { setLoading(false); }
  }, [variantProductId, products, showToast]);

  const fetchFlavors = useCallback(async (variantId?: string) => {
    const vid = variantId !== undefined ? variantId : flavorVariantId;
    if (!vid) return;
    setLoading(true);
    try {
      const res = await menuManagementService.getFlavors(vid);
      const data = res.data.flavors || res.data || [];
      setFlavors(data.map((f: any) => ({
        id:            String(f.id),
        name:          f.name || '',
        priceModifier: Number(f.price_modifier || 0),
        isActive:      f.is_active ?? true,
        variantId:     String(f.variant_id || vid),
        variantName:   allVariants.find(v => String(v.id) === String(f.variant_id || vid))?.name || '',
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load flavors', 'error');
    } finally { setLoading(false); }
  }, [flavorVariantId, allVariants, showToast]);

  // ── CHANGED: fetchAddons now maps image_url too ──
  const fetchAddons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuManagementService.getAddons();
      const data = res.data.addons || res.data || [];
      setAddons(data.map((a: any) => ({
        id:            String(a.id),
        name:          a.name || '',
        price:         Number(a.price || 0),
        image:         a.image_url || a.image || '',
        isPredefined: a.is_predefined ?? false,
        isActive:      a.is_active ?? true,
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load addons', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuManagementService.getCombos();
      const data = res.data.combos || res.data || [];
      setCombos(data.map((c: any) => ({
        id:              String(c.id),
        name:            c.name || '',
        description:     c.description || '',
        price:           Number(c.price || 0),
        discountAmount: c.discount_amount ? Number(c.discount_amount) : undefined,
        image:           c.image_url || c.image || '',
        isAvailable:     c.is_active ?? true,
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load combos', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(
        data.map((p) => ({
          id: String(p.id),
          name: p.name,
          description: p.description ?? "",
          productId: p.product_id,
          product: p.product,
          promotionType: p.promotion_type,
          discountType: p.discount_type,
          discountValue: p.discount_value,
          freeItems: p.free_items ?? [],
          startDate: p.start_date ?? "",
          endDate: p.end_date ?? "",
          isActive: p.is_active,
        }))
      );
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load promotions", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuManagementService.getPromoCodes();
      const data = res.data.promos || res.data || [];
      setPromoCodes(data.map((p: any) => ({
        id:             String(p.id),
        code:           p.code || '',
        discountType:  p.discount_type || 'PERCENT',
        discountValue: Number(p.discount_value || 0),
        minOrderValue: Number(p.min_order_value || 0),
        maxUses:       p.max_uses ?? undefined,
        usedCount:     Number(p.used_count || 0),
        isActive:      p.is_active ?? true,
        expiresAt:     p.expires_at || p.expiry_date || '',
      })));
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to load promo codes', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  /* ============================================================
     INITIAL LOAD & TAB SWITCH
  ============================================================ */
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllVariants();
  }, []); // eslint-disable-line

  useEffect(() => {
    setSearchTerm('');
    if (activeTab === 'products')      fetchProducts(activeCatFilter);
    if (activeTab === 'categories')    fetchCategories();
    if (activeTab === 'subcategories') fetchSubCats();
    if (activeTab === 'variants')      fetchVariants(variantProductId || undefined);
    if (activeTab === 'addons')        fetchAddons();
    if (activeTab === 'combos')        fetchCombos();
    if (activeTab === 'promotions')    fetchPromotions();
    if (activeTab === 'promoCodes')    fetchPromoCodes();
  }, [activeTab]); // eslint-disable-line

  /* ============================================================
     PRODUCT HANDLERS
  ============================================================ */
  const openAddProduct = () => {
    setSelProduct(null);
    setPName(''); setPPrice('0'); setPOrigPrice(''); setPDesc('');
    setPCatId(categories[0]?.id || ''); setPImage(''); setPFile(null);
    setPAvailable(true); setPStock('0'); setPUnit('piece'); setPIngredients('');
    setProductModal(true);
  };
  const openEditProduct = (p: Product) => {
    setSelProduct(p);
    setPName(p.name); setPPrice(String(p.price));
    setPOrigPrice(p.originalPrice ? String(p.originalPrice) : '');
    setPDesc(p.description); setPCatId(p.categoryId);
    setPImage(p.image); setPFile(null); setPAvailable(p.isAvailable);
    setPStock(String(p.stock)); setPUnit(p.unit || 'piece'); setPIngredients(p.ingredients || '');
    setProductModal(true);
  };
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = pImage;
      if (pFile) { setUploading(true); imageUrl = await uploadToCloudinary(pFile); setUploading(false); }
      const payload: any = {
        name: pName.trim(), description: pDesc.trim(),
        category_id: Number(pCatId), price: Number(pPrice),
        stock: Number(pStock), unit: pUnit.trim(),
        image_url: imageUrl, ingredients: pIngredients.trim(), is_active: pAvailable,
      };
      if (pOrigPrice) payload.original_price = Number(pOrigPrice);
      if (selProduct) {
        await menuManagementService.updateProduct(selProduct.id, payload);
        showToast('Product updated successfully');
      } else {
        await menuManagementService.createProduct(payload);
        showToast('Product created successfully');
      }
      setProductModal(false); setPFile(null);
      fetchProducts(activeCatFilter);
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to save product', 'error');
    } finally { setSaving(false); setUploading(false); }
  };
  const handleDeleteProduct = (id: string) =>
    askConfirm('Delete this product? This cannot be undone.', async () => {
      try {
        await menuManagementService.deleteProduct(id);
        showToast('Product deleted'); fetchProducts(activeCatFilter);
      } catch (err: any) { showToast(err?.response?.data?.message || err?.response?.data?.error || 'Delete failed', 'error'); }
    });
  const handleToggleProduct = async (prod: Product) => {
    try {
      await menuManagementService.updateProduct(prod.id, { name: prod.name, is_active: !prod.isAvailable });
      showToast(`Product ${!prod.isAvailable ? 'activated' : 'deactivated'}`);
      fetchProducts(activeCatFilter);
    } catch (err: any) { showToast(err?.response?.data?.error || 'Toggle failed', 'error'); }
  };

  /* ============================================================
     CATEGORY HANDLERS
  ============================================================ */
  const openAddCategory = () => { setSelCategory(null); setCName(''); setCImage(''); setCFile(null); setCategoryModal(true); };
  const openEditCategory = (c: Category) => { setSelCategory(c); setCName(c.name); setCImage(c.image || ''); setCFile(null); setCategoryModal(true); };
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let imageUrl = cImage;
      if (cFile) { setUploading(true); imageUrl = await uploadToCloudinary(cFile); setUploading(false); }
      const payload = { name: cName.trim(), status: 'active', image_url: imageUrl };
      if (selCategory) {
        await menuManagementService.updateCategory(selCategory.id, payload); showToast('Category updated');
      } else {
        await menuManagementService.createCategory(payload); showToast('Category created');
      }
      setCategoryModal(false); setCFile(null); fetchCategories();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); setUploading(false); }
  };
  const handleDeleteCategory = (id: string) =>
    askConfirm('Delete this category? Products in it may be affected.', async () => {
      try { await menuManagementService.deleteCategory(id); showToast('Category deleted'); fetchCategories(); }
      catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     SUBCATEGORY HANDLERS
  ============================================================ */
  const openAddSubCat = () => {
    setSelSubCat(null); setScName(''); setScDesc('');
    setScParentId(categories[0]?.id || ''); setScImage(''); setScFile(null); setScActive(true);
    setSubCatModal(true);
  };
  const openEditSubCat = (sc: SubCategory) => {
    setSelSubCat(sc); setScName(sc.name); setScDesc(sc.description || '');
    setScParentId(sc.parentCategoryId); setScImage(sc.image || ''); setScFile(null); setScActive(sc.isActive);
    setSubCatModal(true);
  };
  const handleSaveSubCat = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let imageUrl = scImage;
      if (scFile) { setUploading(true); imageUrl = await uploadToCloudinary(scFile); setUploading(false); }
      const payload = { name: scName.trim(), description: scDesc.trim(), category_id: Number(scParentId), image_url: imageUrl, is_active: scActive };
      if (selSubCat) {
        await menuManagementService.updateSubcategory(selSubCat.id, payload); showToast('Subcategory updated');
      } else {
        await menuManagementService.createSubcategory(payload); showToast('Subcategory created');
      }
      setSubCatModal(false); setScFile(null); fetchSubCats();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); setUploading(false); }
  };
  const handleDeleteSubCat = (id: string) =>
    askConfirm('Delete this subcategory?', async () => {
      try { await menuManagementService.deleteSubcategory(id); showToast('Subcategory deleted'); fetchSubCats(); }
      catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     VARIANT HANDLERS
  ============================================================ */
  const openAddVariant = () => {
    setSelVariant(null); setVName(''); setVMod('0'); setVActive(true);
    setVProdId(variantProductId || products[0]?.id || '');
    setVariantModal(true);
  };
  const openEditVariant = (v: Variant) => {
    setSelVariant(v); setVName(v.name); setVMod(String(v.priceModifier));
    setVActive(v.isActive); setVProdId(v.productId || '');
    setVariantModal(true);
  };
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (selVariant) {
        await menuManagementService.updateVariant(selVariant.id, { name: vName.trim(), price_modifier: Number(vMod), is_active: vActive });
        showToast('Variant updated');
      } else {
        await menuManagementService.createVariant({ product_id: Number(vProdId), name: vName.trim(), price_modifier: Number(vMod) });
        showToast('Variant created');
      }
      setVariantModal(false);
      await fetchAllVariants();
      fetchVariants(variantProductId || undefined);
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };
  const handleDeleteVariant = (id: string) =>
    askConfirm('Delete this variant? Associated flavors will also be removed.', async () => {
      try {
        await menuManagementService.deleteVariant(id); showToast('Variant deleted');
        await fetchAllVariants(); fetchVariants(variantProductId || undefined);
      } catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     FLAVOR HANDLERS
  ============================================================ */
  const openAddFlavor = () => {
    setSelFlavor(null); setFlName(''); setFlMod('0'); setFlActive(true);
    setFlVarId(flavorVariantId || allVariants[0]?.id || '');
    setFlavorModal(true);
  };
  const openEditFlavor = (f: Flavor) => {
    setSelFlavor(f); setFlName(f.name); setFlMod(String(f.priceModifier));
    setFlActive(f.isActive); setFlVarId(f.variantId || '');
    setFlavorModal(true);
  };
  const handleSaveFlavor = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (selFlavor) {
        await menuManagementService.updateFlavor(selFlavor.id, { name: flName.trim(), price_modifier: Number(flMod), is_active: flActive });
        showToast('Flavor updated');
      } else {
        await menuManagementService.createFlavor({ variant_id: Number(flVarId), name: flName.trim(), price_modifier: Number(flMod) });
        showToast('Flavor created');
      }
      setFlavorModal(false);
      const vid = flVarId || flavorVariantId;
      if (vid) { setFlavorVariantId(vid); fetchFlavors(vid); }
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };
  const handleDeleteFlavor = (id: string) =>
    askConfirm('Delete this flavor?', async () => {
      try {
        await menuManagementService.deleteFlavor(id); showToast('Flavor deleted');
        fetchFlavors(flavorVariantId || undefined);
      } catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     ADDON HANDLERS
     ── CHANGED: now uploads/removes an image just like categories ──
  ============================================================ */
  const openAddAddon = () => {
    setSelAddon(null); setAdName(''); setAdPrice('0');
    setAdImage(''); setAdFile(null);
    setAdPredefined(false); setAdActive(true);
    setAddonModal(true);
  };
  const openEditAddon = (a: Addon) => {
    setSelAddon(a); setAdName(a.name); setAdPrice(String(a.price));
    setAdImage(a.image || ''); setAdFile(null);
    setAdPredefined(a.isPredefined); setAdActive(a.isActive);
    setAddonModal(true);
  };
  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let imageUrl = adImage;
      if (adFile) { setUploading(true); imageUrl = await uploadToCloudinary(adFile); setUploading(false); }
      const payload = {
        name: adName.trim(),
        price: Number(adPrice),
        image_url: imageUrl || undefined,
        is_predefined: adPredefined,
        is_active: adActive,
      };
      if (selAddon) {
        await menuManagementService.updateAddon(selAddon.id, payload); showToast('Addon updated');
      } else {
        await menuManagementService.createAddon(payload); showToast('Addon created');
      }
      setAddonModal(false); setAdFile(null); fetchAddons();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); setUploading(false); }
  };
  const handleDeleteAddon = (id: string) =>
    askConfirm('Delete this addon?', async () => {
      try { await menuManagementService.deleteAddon(id); showToast('Addon deleted'); fetchAddons(); }
      catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     COMBO HANDLERS
  ============================================================ */
  const openAddCombo = () => { setSelCombo(null); setCoName(''); setCoDesc(''); setCoPrice('0'); setCoDiscount('0'); setCoImage(''); setCoFile(null); setCoAvailable(true); setComboModal(true); };
  const openEditCombo = (c: Combo) => { setSelCombo(c); setCoName(c.name); setCoDesc(c.description); setCoPrice(String(c.price)); setCoDiscount(c.discountAmount ? String(c.discountAmount) : '0'); setCoImage(c.image); setCoFile(null); setCoAvailable(c.isAvailable); setComboModal(true); };
  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let imageUrl = coImage;
      if (coFile) { setUploading(true); imageUrl = await uploadToCloudinary(coFile); setUploading(false); }
      const payload = { name: coName.trim(), description: coDesc.trim(), price: Number(coPrice), discount_amount: Number(coDiscount), image_url: imageUrl, is_active: coAvailable };
      if (selCombo) {
        await menuManagementService.updateCombo(selCombo.id, payload); showToast('Combo updated');
      } else {
        await menuManagementService.createCombo(payload); showToast('Combo created');
      }
      setComboModal(false); setCoFile(null); fetchCombos();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); setUploading(false); }
  };
  const handleDeleteCombo = (id: string) =>
    askConfirm('Delete this combo?', async () => {
      try { await menuManagementService.deleteCombo(id); showToast('Combo deleted'); fetchCombos(); }
      catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     PROMOTION HANDLERS
  ============================================================ */
  const openAddPromotion = () => {
    setSelPromotion(null);
    setPrName(''); setPrDesc('');
    setPrProductId(products[0]?.id || '');
    setPrPromotionType('DISCOUNT');
    setPrType('PERCENT'); setPrValue('10');
    setPrStart(''); setPrEnd(''); setPrActive(true);
    setPrFreeItemsDraft([]); setPrFreeItemProductId(''); setPrFreeItemQty('1');
    setPromotionModal(true);
  };

  const openEditPromotion = (p: Promotion) => {
    setSelPromotion(p);
    setPrName(p.name);
    setPrDesc(p.description || '');
    setPrProductId(p.productId != null ? String(p.productId) : '');
    setPrPromotionType(p.promotionType);
    setPrType((p.discountType as any) || 'PERCENT');
    setPrValue(p.discountValue != null ? String(p.discountValue) : '10');
    setPrStart(p.startDate || ''); setPrEnd(p.endDate || '');
    setPrActive(p.isActive);
    setPrFreeItemsDraft(
      (p.freeItems || []).map(fi => ({ productId: String(fi.product_id), quantity: fi.quantity }))
    );
    setPrFreeItemProductId(''); setPrFreeItemQty('1');
    setPromotionModal(true);
  };

  const addFreeItemToDraft = () => {
    if (!prFreeItemProductId) return;
    setPrFreeItemsDraft(prev => [...prev, { productId: prFreeItemProductId, quantity: Number(prFreeItemQty) || 1 }]);
    setPrFreeItemProductId(''); setPrFreeItemQty('1');
  };
  const removeFreeItemFromDraft = (idx: number) => {
    setPrFreeItemsDraft(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload: any = {
        name: prName.trim(),
        description: prDesc.trim(),
        product_id: Number(prProductId),
        promotion_type: prPromotionType,
      };
      if (prPromotionType === 'DISCOUNT') {
        payload.discount_type = prType;
        payload.discount_value = Number(prValue);
      }
      if (prStart) payload.start_date = prStart;
      if (prEnd)   payload.end_date   = prEnd;

      let saved: any;
      if (selPromotion) {
        saved = await updatePromotion(Number(selPromotion.id), payload);
      } else {
        saved = await createPromotion(payload);
      }

      if (prPromotionType === 'FREE_ITEM' && saved?.id) {
        for (const item of prFreeItemsDraft) {
          if (item.productId) {
            await addFreeItem(saved.id, Number(item.productId), item.quantity);
          }
        }
      }

      showToast(selPromotion ? 'Promotion updated' : 'Promotion created');
      setPromotionModal(false);
      fetchPromotions();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const handleTogglePromotion = async (p: Promotion) => {
    try {
      if (p.isActive) await deactivatePromotion(Number(p.id));
      else await activatePromotion(Number(p.id));
      showToast(`Promotion ${p.isActive ? 'deactivated' : 'activated'}`); fetchPromotions();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Toggle failed', 'error'); }
  };

  const handleDeletePromotion = (id: string) =>
    askConfirm('Delete this promotion?', async () => {
      try { await deletePromotionApi(Number(id)); showToast('Promotion deleted'); fetchPromotions(); }
      catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     PROMO CODE HANDLERS
  ============================================================ */
  const openAddPromoCode = () => { setSelPromoCode(null); setPcCode(''); setPcType('PERCENT'); setPcValue('10'); setPcMinOrder('0'); setPcMaxUses('100'); setPcExpiry(''); setPcActive(true); setPromoCodeModal(true); };
  const openEditPromoCode = (p: PromoCode) => { setSelPromoCode(p); setPcCode(p.code); setPcType(p.discountType as any); setPcValue(String(p.discountValue)); setPcMinOrder(String(p.minOrderValue)); setPcMaxUses(p.maxUses ? String(p.maxUses) : ''); setPcExpiry(p.expiresAt || ''); setPcActive(p.isActive); setPromoCodeModal(true); };
  const handleSavePromoCode = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload: any = { code: pcCode.toUpperCase().trim(), discount_type: pcType, discount_value: Number(pcValue), min_order_value: Number(pcMinOrder), is_active: pcActive };
      if (pcMaxUses) payload.max_uses = Number(pcMaxUses);
      if (pcExpiry)  payload.expires_at = pcExpiry;
      if (selPromoCode) {
        await menuManagementService.updatePromoCode(selPromoCode.id, payload); showToast('Promo code updated');
      } else {
        await menuManagementService.createPromoCode(payload); showToast('Promo code created');
      }
      setPromoCodeModal(false); fetchPromoCodes();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };
  const handleDeletePromoCode = (id: string) =>
    askConfirm('Delete this promo code?', async () => {
      try { await menuManagementService.deletePromoCode(id); showToast('Promo code deleted'); fetchPromoCodes(); }
      catch (err: any) { showToast(err?.response?.data?.error || 'Delete failed', 'error'); }
    });

  /* ============================================================
     FILTER BY SEARCH
  ============================================================ */
  const s = searchTerm.toLowerCase();
  const filteredProducts   = products.filter(p => p.name.toLowerCase().includes(s) || (p.categoryName || '').toLowerCase().includes(s));
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(s));
  const filteredSubCats    = subCats.filter(sc => sc.name.toLowerCase().includes(s) || (sc.parentCategoryName || '').toLowerCase().includes(s));
  const filteredVariants   = variants.filter(v => v.name.toLowerCase().includes(s));
  const filteredFlavors    = flavors.filter(f => f.name.toLowerCase().includes(s));
  const filteredAddons     = addons.filter(a => a.name.toLowerCase().includes(s));
  const filteredCombos     = combos.filter(c => c.name.toLowerCase().includes(s));
  const filteredPromotions = promotions.filter(p =>
    p.name.toLowerCase().includes(s) || (p.product?.name || '').toLowerCase().includes(s)
  );
  const filteredPromoCodes = promoCodes.filter(p => p.code.toLowerCase().includes(s));

  /* ============================================================
     TAB CONFIG
  ============================================================ */
  const tabs: { key: TopTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'products',      label: 'Products',      icon: <Utensils size={15} />,   count: products.length },
    { key: 'categories',    label: 'Categories',    icon: <Layers size={15} />,      count: categories.length },
    { key: 'subcategories', label: 'Subcategories', icon: <GitBranch size={15} />,  count: subCats.length },
    { key: 'variants',      label: 'Variants',      icon: <Package size={15} />,    count: variants.length },
    { key: 'flavors',       label: 'Flavors',       icon: <Flame size={15} /> },
    { key: 'addons',        label: 'Add-ons',       icon: <Plus size={15} />,       count: addons.length },
    // { key: 'combos',        label: 'Combos',        icon: <Award size={15} />,      count: combos.length },
    { key: 'promotions',    label: 'Promotions',    icon: <Tag size={15} />,        count: promotions.length },
    // { key: 'promoCodes',    label: 'Promo Codes',   icon: <Percent size={15} />,    count: promoCodes.length },
  ];

  const tabAddHandlers: Record<TopTab, (() => void) | null> = {
    products:      openAddProduct,
    categories:    openAddCategory,
    subcategories: openAddSubCat,
    variants:      openAddVariant,
    flavors:       openAddFlavor,
    addons:        openAddAddon,
    combos:        openAddCombo,
    promotions:    openAddPromotion,
    promoCodes:    openAddPromoCode,
  };

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="mm-root">
      <ToastStack toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirm.open} message={confirm.msg}
        onConfirm={doConfirm} onCancel={() => setConfirm({ open: false, msg: '', action: () => {} })}
      />

      {/* ── NAV TABS ── */}
      <div className="mm-nav">
        <div className="mm-tabs-scroll">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`mm-tab ${activeTab === t.key ? 'mm-tab-active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count !== undefined && <span className="mm-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="mm-toolbar">
        <div className="mm-search-wrap">
          <Search size={15} className="mm-search-icon" />
          <input
            className="mm-search"
            placeholder={`Search ${activeTab}…`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button className="mm-search-clear" onClick={() => setSearchTerm('')}><X size={13} /></button>}
        </div>
        <div className="mm-toolbar-right">
          <button className="mm-btn mm-btn-ghost mm-btn-icon" onClick={() => {
            if (activeTab === 'products') fetchProducts(activeCatFilter);
            else if (activeTab === 'categories') fetchCategories();
            else if (activeTab === 'subcategories') fetchSubCats();
            else if (activeTab === 'variants') fetchVariants(variantProductId || undefined);
            else if (activeTab === 'flavors') fetchFlavors(flavorVariantId || undefined);
            else if (activeTab === 'addons') fetchAddons();
            else if (activeTab === 'combos') fetchCombos();
            else if (activeTab === 'promotions') fetchPromotions();
            else if (activeTab === 'promoCodes') fetchPromoCodes();
          }} title="Refresh">
            <RefreshCw size={15} className={loading ? 'mm-spin' : ''} />
          </button>
          {tabAddHandlers[activeTab] && (
            <button className="mm-btn mm-btn-primary" onClick={tabAddHandlers[activeTab]!}>
              <PlusCircle size={15} />
              <span>Add {tabs.find(t => t.key === activeTab)?.label.replace(/s$/, '')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="mm-content">

        {/* ═══════════ PRODUCTS ═══════════ */}
        {activeTab === 'products' && (
          <div className="mm-tab-pane">
            <div className="mm-chips">
              <div className="mm-chips-label"><Filter size={12} /> Filter:</div>
              <button
                className={`mm-chip ${activeCatFilter === 'all' ? 'mm-chip-active' : ''}`}
                onClick={() => { setActiveCatFilter('all'); fetchProducts('all'); }}
              >All</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`mm-chip ${activeCatFilter === cat.id ? 'mm-chip-active' : ''}`}
                  onClick={() => { setActiveCatFilter(cat.id); fetchProducts(cat.id); }}
                >{cat.name}</button>
              ))}
            </div>

            {loading ? (
              <div className="mm-loading"><div className="mm-spinner" /><span>Loading products…</span></div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState icon={<Utensils size={36} />} title="No products found" sub={searchTerm ? 'Try a different search term' : 'Add your first product to get started'} action={!searchTerm ? { label: 'Add Product', onClick: openAddProduct } : undefined} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead><tr>
                    <th>Product</th><th>Category</th><th>Price</th>
                    <th>Stock</th><th>Status</th><th className="mm-th-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredProducts.map(row => (
                      <tr key={row.id}>
                        <td>
                          <div className="mm-product-cell">
                            <div className="mm-product-img-wrap">
                              {row.image ? <img src={row.image} alt={row.name} className="mm-product-img" /> : <div className="mm-product-img-placeholder"><Utensils size={16} /></div>}
                            </div>
                            <div>
                              <p className="mm-product-name">{row.name}</p>
                              {row.description && <p className="mm-product-desc">{row.description.slice(0, 50)}{row.description.length > 50 ? '…' : ''}</p>}
                            </div>
                          </div>
                        </td>
                        <td><span className="mm-cat-pill">{row.categoryName || '—'}</span></td>
                        <td>
                          <div className="mm-price-cell">
                            <span className="mm-price-main">KWD{row.price}</span>
                            {row.originalPrice && row.originalPrice > row.price && (
                              <span className="mm-price-orig">KWD{row.originalPrice}</span>
                            )}
                          </div>
                        </td>
                        <td><span className="mm-stock-pill">{row.stock} {row.unit}</span></td>
                        <td><StatusBadge active={row.isAvailable} onClick={() => handleToggleProduct(row)} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" title="Edit" onClick={() => openEditProduct(row)}><Edit2 size={15} /></button>
                            <button className="mm-action-btn mm-action-danger" title="Delete" onClick={() => handleDeleteProduct(row.id)}><Trash2 size={14} strokeWidth={2} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ CATEGORIES ═══════════ */}
        {activeTab === 'categories' && (
          <div className="mm-tab-pane">
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading categories…</span></div>
            : filteredCategories.length === 0 ? (
              <EmptyState icon={<Layers size={36} />} title="No categories yet" sub="Create categories to organise your products" action={{ label: 'New Category', onClick: openAddCategory }} />
            ) : (
              <div className="mm-grid-cards">
                {filteredCategories.map(cat => (
                  <div key={cat.id} className="mm-cat-card">
                    <div className="mm-cat-img-wrap">
                      {cat.image ? <img src={cat.image} alt={cat.name} className="mm-cat-img" /> : <div className="mm-cat-img-placeholder"><Layers size={26} /></div>}
                    </div>
                    <div className="mm-cat-body">
                      <p className="mm-cat-name">{cat.name}</p>
                      <StatusBadge active={cat.isActive ?? true} />
                    </div>
                    <div className="mm-cat-actions">
                      <button className="mm-action-btn" onClick={() => openEditCategory(cat)}><Edit2 size={14} /></button>
                      <button className="mm-action-btn mm-action-danger" onClick={() => handleDeleteCategory(cat.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                <button className="mm-cat-card mm-cat-add" onClick={openAddCategory}>
                  <Plus size={26} />
                  <span>New Category</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SUBCATEGORIES ═══════════ */}
        {activeTab === 'subcategories' && (
          <div className="mm-tab-pane">
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading subcategories…</span></div>
            : filteredSubCats.length === 0 ? (
              <EmptyState icon={<GitBranch size={36} />} title="No subcategories" sub="Group products within a category using subcategories" action={{ label: 'New Subcategory', onClick: openAddSubCat }} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead><tr><th>Image</th><th>Name</th><th>Parent Category</th><th>Description</th><th>Status</th><th className="mm-th-right">Actions</th></tr></thead>
                  <tbody>
                    {filteredSubCats.map(row => (
                      <tr key={row.id}>
                        <td><div className="mm-sm-img-wrap">{row.image ? <img src={row.image} alt={row.name} className="mm-sm-img" /> : <div className="mm-sm-img-placeholder"><GitBranch size={15} /></div>}</div></td>
                        <td><strong className="mm-cell-name">{row.name}</strong></td>
                        <td><span className="mm-cat-pill">{row.parentCategoryName || row.parentCategoryId}</span></td>
                        <td><span className="mm-cell-muted">{row.description || '—'}</span></td>
                        <td><StatusBadge active={row.isActive} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" onClick={() => openEditSubCat(row)}><Edit2 size={14} /></button>
                            <button className="mm-action-btn mm-action-danger" onClick={() => handleDeleteSubCat(row.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ VARIANTS ═══════════ */}
        {activeTab === 'variants' && (
          <div className="mm-tab-pane">
            <div className="mm-selector-bar">
              <div className="mm-selector-group">
                <label className="mm-selector-label"><Filter size={12} /> Filter by Product</label>
                <div className="mm-select-wrap">
                  <select className="mm-select" value={variantProductId} onChange={e => { setVariantProductId(e.target.value); fetchVariants(e.target.value || undefined); }}>
                    <option value="">All Products</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={13} className="mm-select-arrow" />
                </div>
              </div>
            </div>
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading variants…</span></div>
            : filteredVariants.length === 0 ? (
              <EmptyState icon={<Package size={36} />} title="No variants found" sub={variantProductId ? 'This product has no variants yet' : 'Select a product above or add a new variant'} action={{ label: 'New Variant', onClick: openAddVariant }} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead><tr><th>Variant Name</th><th>Product</th><th>Price Modifier</th><th>Status</th><th className="mm-th-right">Actions</th></tr></thead>
                  <tbody>
                    {filteredVariants.map(row => (
                      <tr key={row.id}>
                        <td><strong className="mm-cell-name">{row.name}</strong></td>
                        <td><span className="mm-cat-pill">{products.find(p => p.id === row.productId)?.name || row.productId || '—'}</span></td>
                        <td><span className="mm-modifier-pill mm-modifier-positive">+KWD{row.priceModifier}</span></td>
                        <td><StatusBadge active={row.isActive} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" onClick={() => openEditVariant(row)}><Edit2 size={14} /></button>
                            <button className="mm-action-btn mm-action-danger" onClick={() => handleDeleteVariant(row.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ FLAVORS ═══════════ */}
        {activeTab === 'flavors' && (
          <div className="mm-tab-pane">
            <div className="mm-selector-bar">
              <div className="mm-selector-group">
                <label className="mm-selector-label"><Flame size={12} /> Select Variant</label>
                <div className="mm-select-wrap">
                  <select className="mm-select" value={flavorVariantId} onChange={e => { setFlavorVariantId(e.target.value); if (e.target.value) fetchFlavors(e.target.value); else setFlavors([]); }}>
                    <option value="">— choose a variant —</option>
                    {allVariants.map(v => <option key={v.id} value={v.id}>{v.name} {products.find(p => p.id === v.productId) ? `(${products.find(p => p.id === v.productId)?.name})` : ''}</option>)}
                  </select>
                  <ChevronDown size={13} className="mm-select-arrow" />
                </div>
                {allVariants.length === 0 && <span className="mm-selector-hint">No variants available — go to Variants tab first.</span>}
              </div>
            </div>
            {!flavorVariantId ? (
              <EmptyState icon={<Flame size={36} />} title="Select a variant" sub="Choose a variant above to view and manage its flavors" />
            ) : loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading flavors…</span></div>
            : filteredFlavors.length === 0 ? (
              <EmptyState icon={<Palette size={36} />} title="No flavors yet" sub="Add flavors to this variant" action={{ label: 'New Flavor', onClick: openAddFlavor }} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead><tr><th>Flavor Name</th><th>Variant</th><th>Price Modifier</th><th>Status</th><th className="mm-th-right">Actions</th></tr></thead>
                  <tbody>
                    {filteredFlavors.map(row => (
                      <tr key={row.id}>
                        <td><strong className="mm-cell-name">{row.name}</strong></td>
                        <td><span className="mm-cat-pill">{allVariants.find(v => v.id === row.variantId)?.name || row.variantId || '—'}</span></td>
                        <td><span className="mm-modifier-pill mm-modifier-positive">+KWD{row.priceModifier}</span></td>
                        <td><StatusBadge active={row.isActive} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" onClick={() => openEditFlavor(row)}><Edit2 size={14} /></button>
                            <button className="mm-action-btn mm-action-danger" onClick={() => handleDeleteFlavor(row.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ ADDONS ═══════════ */}
        {/* ── CHANGED: addons now render as image cards, matching categories ── */}
        {activeTab === 'addons' && (
          <div className="mm-tab-pane">
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading addons…</span></div>
            : filteredAddons.length === 0 ? (
              <EmptyState icon={<Plus size={36} />} title="No addons yet" sub="Create predefined or custom addons for your products" action={{ label: 'New Addon', onClick: openAddAddon }} />
            ) : (
              <div className="mm-grid-cards mm-addon-grid">
                {filteredAddons.map(row => (
                  <div key={row.id} className="mm-addon-card">
                    <div className="mm-addon-img-wrap">
                      {row.image ? (
                        <img src={row.image} alt={row.name} className="mm-addon-img" />
                      ) : (
                        <div className="mm-addon-img-placeholder"><Plus size={24} /></div>
                      )}
                      {row.isPredefined && (
                        <span className="mm-addon-predefined-tag">Predefined</span>
                      )}
                    </div>
                    <div className="mm-addon-body">
                      <p className="mm-addon-name">{row.name}</p>
                      <div className="mm-addon-meta-row">
                        <span className="mm-price-main">KWD{row.price}</span>
                        <StatusBadge active={row.isActive} />
                      </div>
                    </div>
                    <div className="mm-addon-actions">
                      <button className="mm-action-btn" onClick={() => openEditAddon(row)}><Edit2 size={14} /> Edit</button>
                      <button className="mm-action-btn mm-action-danger" onClick={() => handleDeleteAddon(row.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                <button className="mm-cat-card mm-cat-add mm-addon-add" onClick={openAddAddon}>
                  <Plus size={26} />
                  <span>New Addon</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ COMBOS ═══════════ */}
        {activeTab === 'combos' && (
          <div className="mm-tab-pane">
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading combos…</span></div>
            : filteredCombos.length === 0 ? (
              <EmptyState icon={<Award size={36} />} title="No combos yet" sub="Bundle products into value combos for your customers" action={{ label: 'New Combo', onClick: openAddCombo }} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead><tr><th>Combo</th><th>Price</th><th>Discount</th><th>Status</th><th className="mm-th-right">Actions</th></tr></thead>
                  <tbody>
                    {filteredCombos.map(row => (
                      <tr key={row.id}>
                        <td>
                          <div className="mm-product-cell">
                            <div className="mm-product-img-wrap">{row.image ? <img src={row.image} alt={row.name} className="mm-product-img" /> : <div className="mm-product-img-placeholder"><Award size={15} /></div>}</div>
                            <div>
                              <p className="mm-product-name">{row.name}</p>
                              {row.description && <p className="mm-product-desc">{row.description.slice(0, 48)}{row.description.length > 48 ? '…' : ''}</p>}
                            </div>
                          </div>
                        </td>
                        <td><span className="mm-price-main">KWD{row.price.toFixed(2)}</span></td>
                        <td>{row.discountAmount ? <span className="mm-discount-pill">KWD{row.discountAmount} off</span> : <span className="mm-cell-muted">—</span>}</td>
                        <td><StatusBadge active={row.isAvailable} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" onClick={() => openEditCombo(row)}><Edit2 size={14} /></button>
                            <button className="mm-action-btn mm-action-danger" onClick={() => handleDeleteCombo(row.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ PROMOTIONS ═══════════ */}
        {activeTab === 'promotions' && (
          <div className="mm-tab-pane">
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading promotions…</span></div>
            : filteredPromotions.length === 0 ? (
              <EmptyState icon={<Tag size={36} />} title="No promotions" sub="Set up product promotions — discounts or free items — for your customers" action={{ label: 'New Promotion', onClick: openAddPromotion }} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Product</th>
                      <th>Promotion Type</th>
                      <th>Offer</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th className="mm-th-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPromotions.map(row => (
                      <tr key={row.id}>
                        <td>
                          <strong className="mm-cell-name">{row.name}</strong>
                          {row.description && <p className="mm-product-desc">{row.description.slice(0, 40)}{row.description.length > 40 ? '…' : ''}</p>}
                        </td>
                        <td><span className="mm-cat-pill">{row.product?.name || '—'}</span></td>
                        <td>
                          {row.promotionType === 'FREE_ITEM' ? (
                            <span className="mm-status-badge mm-status-inactive"><Award size={11} /> Free Item</span>
                          ) : (
                            <span className="mm-status-badge mm-status-active"><Percent size={11} /> Discount</span>
                          )}
                        </td>
                        <td>
                          {row.promotionType === 'DISCOUNT' ? (
                            row.discountType && row.discountValue != null ? (
                              <span className="mm-discount-pill">{discountLabel(row.discountType, row.discountValue)}</span>
                            ) : (
                              <span className="mm-cell-muted">—</span>
                            )
                          ) : row.freeItems && row.freeItems.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {row.freeItems.map(fi => (
                                <span key={fi.id} className="mm-discount-pill">
                                  🎁 {fi.product?.name || 'Item'} ×{fi.quantity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="mm-cell-muted">No free items</span>
                          )}
                        </td>
                        <td><span className="mm-date-range">{formatDate(row.startDate)} → {formatDate(row.endDate)}</span></td>
                        <td><StatusBadge active={row.isActive} onClick={() => handleTogglePromotion(row)} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" onClick={() => openEditPromotion(row)}><Edit2 size={14} /></button>
                            <button className="mm-action-btn mm-action-danger" onClick={() => handleDeletePromotion(row.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ PROMO CODES ═══════════ */}
        {activeTab === 'promoCodes' && (
          <div className="mm-tab-pane">
            {loading ? <div className="mm-loading"><div className="mm-spinner" /><span>Loading promo codes…</span></div>
            : filteredPromoCodes.length === 0 ? (
              <EmptyState icon={<Percent size={36} />} title="No promo codes" sub="Create discount codes customers can apply at checkout" action={{ label: 'New Promo Code', onClick: openAddPromoCode }} />
            ) : (
              <div className="mm-table-wrap">
                <table className="mm-table">
                  <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Expires</th><th>Status</th><th className="mm-th-right">Actions</th></tr></thead>
                  <tbody>
                    {filteredPromoCodes.map(row => (
                      <tr key={row.id}>
                        <td><code className="mm-code-badge">{row.code}</code></td>
                        <td><span className="mm-discount-pill">{discountLabel(row.discountType, row.discountValue)}</span></td>
                        <td><span className="mm-cell-muted">{row.minOrderValue ? `KWD${row.minOrderValue}` : '—'}</span></td>
                        <td>
                          <div className="mm-usage-bar-wrap">
                            <span className="mm-usage-text">{row.usedCount ?? 0}{row.maxUses ? ` / ${row.maxUses}` : ''}</span>
                            {row.maxUses && (
                              <div className="mm-usage-bar">
                                <div className="mm-usage-fill" style={{ width: `${Math.min(100, ((row.usedCount ?? 0) / row.maxUses) * 100)}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td><span className="mm-cell-muted">{row.expiresAt ? formatDate(row.expiresAt) : '—'}</span></td>
                        <td><StatusBadge active={row.isActive} /></td>
                        <td className="mm-td-right">
                          <div className="mm-row-actions">
                            <button className="mm-action-btn" onClick={() => openEditPromoCode(row)}><Edit2 size={14} /></button>
                            <button className="mm-action-btn mm-action-danger" onClick={() => handleDeletePromoCode(row.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================
          MODALS
      ================================================================ */}

      {/* PRODUCT MODAL */}
      <Modal isOpen={productModal} onClose={() => setProductModal(false)} icon={<Package size={16} />} title={selProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSaveProduct} className="mm-form">
          <Field label="Product Name" required>
            <input className="mm-input" placeholder="e.g. Cake" value={pName} onChange={e => setPName(e.target.value)} required />
          </Field>
          <Row2>
            <Field label="Selling Price (KWD)" required>
              <input className="mm-input" type="number" min="0" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} required />
            </Field>
            <Field label="Original / MRP (KWD)">
              <input className="mm-input" type="number" min="0" step="0.01" placeholder="Optional" value={pOrigPrice} onChange={e => setPOrigPrice(e.target.value)} />
            </Field>
            <Field label="Category" required>
              <div className="mm-select-wrap">
                <select className="mm-select mm-input" value={pCatId} onChange={e => setPCatId(e.target.value)}>
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="mm-select-arrow" />
              </div>
            </Field>
          </Row2>
          <Field label="Description">
            <textarea className="mm-input mm-textarea" rows={2} placeholder="Brief description…" value={pDesc} onChange={e => setPDesc(e.target.value)} />
          </Field>
          <Field label="Ingredients">
            <textarea className="mm-input mm-textarea" rows={2} placeholder="Comma-separated ingredients…" value={pIngredients} onChange={e => setPIngredients(e.target.value)} />
          </Field>
          <Row2>
            <Field label="Stock" required>
              <input className="mm-input" type="number" min="0" value={pStock} onChange={e => setPStock(e.target.value)} required />
            </Field>
            <Field label="Unit" required>
              <input className="mm-input" placeholder="piece / kg / plate" value={pUnit} onChange={e => setPUnit(e.target.value)} required />
            </Field>
          </Row2>
          <ImageUploadField
            label="Product Image" preview={pImage} fileId="p-img"
            onFileChange={(f, url) => { setPFile(f); setPImage(url); }}
            onRemove={() => { setPFile(null); setPImage(''); }}
          />
          <Checkbox id="p-avail" checked={pAvailable} onChange={setPAvailable} label="Visible in storefront" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setProductModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving || uploading}>
              {uploading ? 'Uploading image…' : saving ? 'Saving…' : selProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CATEGORY MODAL */}
      <Modal isOpen={categoryModal} onClose={() => setCategoryModal(false)} icon={<Tag size={16} />} title={selCategory ? 'Edit Category' : 'New Category'} size="sm">
        <form onSubmit={handleSaveCategory} className="mm-form">
          <Field label="Category Name" required>
            <input className="mm-input" placeholder="e.g. Starters" value={cName} onChange={e => setCName(e.target.value)} required />
          </Field>
          <ImageUploadField
            label="Category Image" preview={cImage} fileId="cat-img"
            onFileChange={(f, url) => { setCFile(f); setCImage(url); }}
            onRemove={() => { setCFile(null); setCImage(''); }}
          />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setCategoryModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving || uploading}>
              {uploading ? 'Uploading…' : saving ? 'Saving…' : selCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SUBCATEGORY MODAL */}
      <Modal isOpen={subCatModal} onClose={() => setSubCatModal(false)} icon={<Layers size={16} />} title={selSubCat ? 'Edit Subcategory' : 'New Subcategory'} size="md">
        <form onSubmit={handleSaveSubCat} className="mm-form">
          <Field label="Subcategory Name" required>
            <input className="mm-input" placeholder="e.g. Grilled Starters" value={scName} onChange={e => setScName(e.target.value)} required />
          </Field>
          <Field label="Parent Category" required>
            <div className="mm-select-wrap">
              <select className="mm-select mm-input" value={scParentId} onChange={e => setScParentId(e.target.value)}>
                <option value="">Select parent…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={13} className="mm-select-arrow" />
            </div>
          </Field>
          <Field label="Description">
            <textarea className="mm-input mm-textarea" rows={2} value={scDesc} onChange={e => setScDesc(e.target.value)} />
          </Field>
          <ImageUploadField
            label="Image" preview={scImage} fileId="sc-img"
            onFileChange={(f, url) => { setScFile(f); setScImage(url); }}
            onRemove={() => { setScFile(null); setScImage(''); }}
          />
          <Checkbox id="sc-active" checked={scActive} onChange={setScActive} label="Active" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setSubCatModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving || uploading}>
              {uploading ? 'Uploading…' : saving ? 'Saving…' : selSubCat ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VARIANT MODAL */}
      <Modal isOpen={variantModal} onClose={() => setVariantModal(false)} icon={<GitBranch size={16} />} title={selVariant ? 'Edit Variant' : 'New Variant'} size="sm">
        <form onSubmit={handleSaveVariant} className="mm-form">
          <Field label="Product" required>
            <div className="mm-select-wrap">
              <select className="mm-select mm-input" value={vProdId} onChange={e => setVProdId(e.target.value)} required>
                <option value="">Select product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={13} className="mm-select-arrow" />
            </div>
          </Field>
          <Field label="Variant Name" required>
            <input className="mm-input" placeholder="e.g. Large, Small, 500g" value={vName} onChange={e => setVName(e.target.value)} required />
          </Field>
          <Field label="Price Modifier (KWD)">
            <input className="mm-input" type="number" min="0" step="0.01" value={vMod} onChange={e => setVMod(e.target.value)} />
          </Field>
          <Checkbox id="v-active" checked={vActive} onChange={setVActive} label="Active" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setVariantModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving}>{saving ? 'Saving…' : selVariant ? 'Update Variant' : 'Create Variant'}</button>
          </div>
        </form>
      </Modal>

      {/* FLAVOR MODAL */}
      <Modal isOpen={flavorModal} onClose={() => setFlavorModal(false)} icon={<Palette size={16} />} title={selFlavor ? 'Edit Flavor' : 'New Flavor'} size="sm">
        <form onSubmit={handleSaveFlavor} className="mm-form">
          <Field label="Variant" required>
            <div className="mm-select-wrap">
              <select className="mm-select mm-input" value={flVarId} onChange={e => setFlVarId(e.target.value)} required>
                <option value="">Select variant…</option>
                {allVariants.map(v => <option key={v.id} value={v.id}>{v.name} {products.find(p => p.id === v.productId) ? `· ${products.find(p => p.id === v.productId)?.name}` : ''}</option>)}
              </select>
              <ChevronDown size={13} className="mm-select-arrow" />
            </div>
          </Field>
          <Field label="Flavor Name" required>
            <input className="mm-input" placeholder="e.g. Mango, Chocolate" value={flName} onChange={e => setFlName(e.target.value)} required />
          </Field>
          <Field label="Price Modifier (KWD)">
            <input className="mm-input" type="number" min="0" step="0.01" value={flMod} onChange={e => setFlMod(e.target.value)} />
          </Field>
          <Checkbox id="fl-active" checked={flActive} onChange={setFlActive} label="Active" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setFlavorModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving}>{saving ? 'Saving…' : selFlavor ? 'Update Flavor' : 'Create Flavor'}</button>
          </div>
        </form>
      </Modal>

      {/* ADDON MODAL */}
      {/* ── CHANGED: now includes ImageUploadField with drag & drop / replace / remove ── */}
      <Modal isOpen={addonModal} onClose={() => setAddonModal(false)} icon={<Award size={16} />} title={selAddon ? 'Edit Addon' : 'New Addon'} size="sm">
        <form onSubmit={handleSaveAddon} className="mm-form">
          <ImageUploadField
            label="Addon Image" preview={adImage} fileId="addon-img"
            onFileChange={(f, url) => { setAdFile(f); setAdImage(url); }}
            onRemove={() => { setAdFile(null); setAdImage(''); }}
          />
          <Field label="Addon Name" required>
            <input className="mm-input" placeholder="e.g. Extra Sauce, Cheese" value={adName} onChange={e => setAdName(e.target.value)} required />
          </Field>
          <Field label="Price (KWD)" required>
            <input className="mm-input" type="number" min="0" step="0.01" value={adPrice} onChange={e => setAdPrice(e.target.value)} required />
          </Field>
          <Checkbox id="ad-pre" checked={adPredefined} onChange={setAdPredefined} label="Predefined (shown by default)" />
          <Checkbox id="ad-active" checked={adActive} onChange={setAdActive} label="Active" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setAddonModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving || uploading}>
              {uploading ? 'Uploading image…' : saving ? 'Saving…' : selAddon ? 'Update Addon' : 'Create Addon'}
            </button>
          </div>
        </form>
      </Modal>

      {/* COMBO MODAL */}
      <Modal isOpen={comboModal} onClose={() => setComboModal(false)} icon={<Utensils size={16} />} title={selCombo ? 'Edit Combo' : 'New Combo'} size="md">
        <form onSubmit={handleSaveCombo} className="mm-form">
          <Field label="Combo Name" required>
            <input className="mm-input" placeholder="e.g. Family Meal Deal" value={coName} onChange={e => setCoName(e.target.value)} required />
          </Field>
          <Field label="Description">
            <textarea className="mm-input mm-textarea" rows={2} value={coDesc} onChange={e => setCoDesc(e.target.value)} />
          </Field>
          <Row2>
            <Field label="Price (KWD)" required>
              <input className="mm-input" type="number" min="0" step="0.01" value={coPrice} onChange={e => setCoPrice(e.target.value)} required />
            </Field>
            <Field label="Discount Amount (KWD)">
              <input className="mm-input" type="number" min="0" step="0.01" value={coDiscount} onChange={e => setCoDiscount(e.target.value)} />
            </Field>
          </Row2>
          <ImageUploadField
            label="Combo Image" preview={coImage} fileId="co-img"
            onFileChange={(f, url) => { setCoFile(f); setCoImage(url); }}
            onRemove={() => { setCoFile(null); setCoImage(''); }}
          />
          <Checkbox id="co-avail" checked={coAvailable} onChange={setCoAvailable} label="Available to customers" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setComboModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving || uploading}>
              {uploading ? 'Uploading…' : saving ? 'Saving…' : selCombo ? 'Update Combo' : 'Create Combo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PROMOTION MODAL */}
      <Modal isOpen={promotionModal} onClose={() => setPromotionModal(false)} icon={<Percent size={16} />} title={selPromotion ? 'Edit Promotion' : 'New Promotion'} size="md">
        <form onSubmit={handleSavePromotion} className="mm-form">
          <Field label="Promotion Name" required>
            <input className="mm-input" placeholder="e.g. Summer Sale" value={prName} onChange={e => setPrName(e.target.value)} required />
          </Field>
          <Field label="Description">
            <textarea className="mm-input mm-textarea" rows={2} value={prDesc} onChange={e => setPrDesc(e.target.value)} />
          </Field>

          <Row2>
            <Field label="Product" required>
              <div className="mm-select-wrap">
                <select className="mm-select mm-input" value={prProductId} onChange={e => setPrProductId(e.target.value)} required>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={13} className="mm-select-arrow" />
              </div>
            </Field>
            <Field label="Promotion Type" required>
              <div className="mm-select-wrap">
                <select className="mm-select mm-input" value={prPromotionType} onChange={e => setPrPromotionType(e.target.value as any)}>
                  <option value="DISCOUNT">Discount</option>
                  {/* <option value="FREE_ITEM">Free Item</option> */}
                </select>
                <ChevronDown size={13} className="mm-select-arrow" />
              </div>
            </Field>
          </Row2>

          {prPromotionType === 'DISCOUNT' ? (
            <Row2>
              <Field label="Discount Type" required>
                <div className="mm-select-wrap">
                  <select className="mm-select mm-input" value={prType} onChange={e => setPrType(e.target.value as any)}>
                    <option value="PERCENT">Percentage (%)</option>
                    {/* <option value="FLAT">Fixed Amount (KWD)</option> */}
                  </select>
                  <ChevronDown size={13} className="mm-select-arrow" />
                </div>
              </Field>
              <Field label={`Discount Value ${prType === 'PERCENT' ? '(%)' : '(KWD)'}`} required>
                <input className="mm-input" type="number" min="0" step="0.01" value={prValue} onChange={e => setPrValue(e.target.value)} required />
              </Field>
            </Row2>
          ) : (
            <div className="mm-field">
              <label className="mm-label">Free Items</label>
              <Row2>
                <div className="mm-select-wrap">
                  <select className="mm-select mm-input" value={prFreeItemProductId} onChange={e => setPrFreeItemProductId(e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={13} className="mm-select-arrow" />
                </div>
                <input className="mm-input" type="number" min="1" value={prFreeItemQty} onChange={e => setPrFreeItemQty(e.target.value)} placeholder="Qty" />
              </Row2>
              <button type="button" className="mm-btn mm-btn-ghost" onClick={addFreeItemToDraft} style={{ marginTop: 8 }}>
                <Plus size={13} /> Add Free Item
              </button>

              {prFreeItemsDraft.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {prFreeItemsDraft.map((item, idx) => (
                    <span key={idx} className="mm-discount-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      🎁 {products.find(p => p.id === item.productId)?.name || 'Item'} ×{item.quantity}
                      <button type="button" onClick={() => removeFreeItemFromDraft(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <Row2>
            <Field label="Start Date">
              <input className="mm-input" type="date" value={prStart} onChange={e => setPrStart(e.target.value)} />
            </Field>
            <Field label="End Date">
              <input className="mm-input" type="date" value={prEnd} onChange={e => setPrEnd(e.target.value)} />
            </Field>
          </Row2>
          <Checkbox id="pr-active" checked={prActive} onChange={setPrActive} label="Active immediately" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setPromotionModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving}>{saving ? 'Saving…' : selPromotion ? 'Update Promotion' : 'Create Promotion'}</button>
          </div>
        </form>
      </Modal>

      {/* PROMO CODE MODAL */}
      <Modal isOpen={promoCodeModal} onClose={() => setPromoCodeModal(false)} icon={<Tag size={16} />} title={selPromoCode ? 'Edit Promo Code' : 'New Promo Code'} size="md">
        <form onSubmit={handleSavePromoCode} className="mm-form">
          <Field label="Voucher Code" required>
            <input className="mm-input mm-code-input" placeholder="e.g. SAVE20" value={pcCode} onChange={e => setPcCode(e.target.value.toUpperCase())} required />
          </Field>
          <Row2>
            <Field label="Discount Type" required>
              <div className="mm-select-wrap">
                <select className="mm-select mm-input" value={pcType} onChange={e => setPcType(e.target.value as any)}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Fixed Amount (₹)</option>
                </select>
                <ChevronDown size={13} className="mm-select-arrow" />
              </div>
            </Field>
            <Field label={`Discount Value ${pcType === 'PERCENT' ? '(%)' : '(KWD)'}`} required>
              <input className="mm-input" type="number" min="0" step="0.01" value={pcValue} onChange={e => setPcValue(e.target.value)} required />
            </Field>
          </Row2>
          <Row2>
            <Field label="Min. Order Value (KWD)">
              <input className="mm-input" type="number" min="0" value={pcMinOrder} onChange={e => setPcMinOrder(e.target.value)} />
            </Field>
            <Field label="Max Uses">
              <input className="mm-input" type="number" min="1" placeholder="Unlimited" value={pcMaxUses} onChange={e => setPcMaxUses(e.target.value)} />
            </Field>
          </Row2>
          <Field label="Expiry Date">
            <input className="mm-input" type="date" value={pcExpiry} onChange={e => setPcExpiry(e.target.value)} />
          </Field>
          <Checkbox id="pc-active" checked={pcActive} onChange={setPcActive} label="Active" />
          <div className="mm-form-footer">
            <button type="button" className="mm-btn mm-btn-ghost" onClick={() => setPromoCodeModal(false)}>Cancel</button>
            <button type="submit" className="mm-btn mm-btn-primary" disabled={saving}>{saving ? 'Saving…' : selPromoCode ? 'Update Code' : 'Create Code'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuManagement;