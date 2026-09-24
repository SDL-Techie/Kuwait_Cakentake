import React, { useState, useEffect, useMemo } from 'react';
import { storefrontApi } from '../../services/directApiService';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';
import { useCurrency } from '../../context/CurrencyContext';

// ─── Types (matching actual API response shape) ──────────────────────────────

interface Category {
  id: number;
  name: string;
  image: string | null;
  status?: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}

interface Flavor {
  id: number;
  variant_id: number;
  name: string;
  price_modifier: number;
  is_active: boolean;
}

interface Variant {
  id: number;
  product_id: number;
  name: string;
  price_modifier: number;
  is_active: boolean;
  flavors: Flavor[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number | null;
  currency: string;
  image_url: string;
  ingredients?: string;
  is_active?: boolean;
  category: {
    id: number;
    name: string;
    image?: string | null;
    status?: string;
  };
  subcategory?: {
    id: number;
    name: string;
  } | null;
  variants: Variant[];
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name-asc', label: 'Name: A to Z' },
];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subLoading, setSubLoading] = useState<boolean>(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [selectedVariantName, setSelectedVariantName] = useState<string | null>(null);
  const [selectedFlavorName, setSelectedFlavorName] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [minPrice, setMinPrice] = useState<string>(''); // '' = no limit
  const [maxPrice, setMaxPrice] = useState<string>(''); // '' = no limit

  // Mobile / tablet drawer
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const { currency } = useCurrency();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isRetailer = user.role?.toLowerCase() === 'retailer';
  const userId = user.id;

  // ─── Fetch products + categories (again when currency changes) ─────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [prodRes, catRes] = await Promise.all([
          storefrontApi.products({ headers: { 'X-Currency': currency } }),
          storefrontApi.categories(),
        ]);

        const productsData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || [];

        const categoriesData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.categories || catRes.data?.data || [];

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currency]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Close drawer with Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  // ─── Scope = selected category, narrowed by selected subcategory ───────────
  const scopedProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) list = list.filter((p) => p.category?.id === selectedCategory.id);
    if (selectedSubcategory) list = list.filter((p) => p.subcategory?.id === selectedSubcategory.id);
    return list;
  }, [products, selectedCategory, selectedSubcategory]);

  // Price bounds for the products in scope (drives the slider)
  const priceBounds = useMemo(() => {
    const prices = scopedProducts.map((p) => Number(p.price)).filter((n) => !isNaN(n));
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [scopedProducts]);

  const availableVariants = useMemo(() => {
    const names = new Set<string>();
    scopedProducts.forEach((p) =>
      (p.variants || []).forEach((v) => {
        if (v.is_active) names.add(v.name);
      })
    );
    return Array.from(names);
  }, [scopedProducts]);

  const availableFlavors = useMemo(() => {
    const names = new Set<string>();
    scopedProducts.forEach((p) =>
      (p.variants || []).forEach((v) =>
        (v.flavors || []).forEach((f) => {
          if (f.is_active) names.add(f.name);
        })
      )
    );
    return Array.from(names);
  }, [scopedProducts]);

  // ─── Final list: variant + flavour + price filters, then sort ──────────────
  const filteredProducts = useMemo(() => {
    const min = minPrice === '' ? -Infinity : Number(minPrice);
    const max = maxPrice === '' ? Infinity : Number(maxPrice);

    const list = scopedProducts.filter((p) => {
      const price = Number(p.price);
      if (price < min || price > max) return false;

      if (selectedVariantName) {
        const hasVariant = (p.variants || []).some((v) => v.name === selectedVariantName);
        if (!hasVariant) return false;
      }
      if (selectedFlavorName) {
        const hasFlavor = (p.variants || []).some((v) =>
          (v.flavors || []).some((f) => f.name === selectedFlavorName)
        );
        if (!hasFlavor) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [scopedProducts, selectedVariantName, selectedFlavorName, minPrice, maxPrice, sortBy]);

  const hasPriceFilter = minPrice !== '' || maxPrice !== '';

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedVariantName ? 1 : 0) +
    (selectedFlavorName ? 1 : 0) +
    (hasPriceFilter ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const resetDependentFilters = () => {
    setSelectedSubcategory(null);
    setSelectedVariantName(null);
    setSelectedFlavorName(null);
    setMinPrice('');
    setMaxPrice('');
  };

  const handleCategoryClick = async (cat: Category) => {
    // Clicking the open category again collapses it
    if (selectedCategory?.id === cat.id) {
      handleShowAll();
      return;
    }

    setSelectedCategory(cat);
    resetDependentFilters();

    try {
      setSubLoading(true);
      const res = await storefrontApi.subcategories(cat.id);
      setSubcategories(res.data.subcategories || []);
    } catch (err) {
      console.error('Subcategory fetch error', err);
      setSubcategories([]);
    } finally {
      setSubLoading(false);
    }
  };

  const handleShowAll = () => {
    setSelectedCategory(null);
    setSubcategories([]);
    resetDependentFilters();
  };

  const handleSubcategoryClick = (sub: SubCategory) => {
    setSelectedSubcategory((prev) => (prev?.id === sub.id ? null : sub));
    setSelectedVariantName(null);
    setSelectedFlavorName(null);
    setMinPrice('');
    setMaxPrice('');
  };

  const handleClearAll = () => {
    handleShowAll();
    setSortBy('default');
  };

  const sliderValue = maxPrice === '' ? priceBounds.max : Number(maxPrice);

  // Active filter chips shown above the grid
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (selectedCategory) chips.push({ key: 'cat', label: selectedCategory.name, onRemove: handleShowAll });
  if (selectedSubcategory)
    chips.push({ key: 'sub', label: selectedSubcategory.name, onRemove: () => setSelectedSubcategory(null) });
  if (selectedVariantName)
    chips.push({ key: 'var', label: selectedVariantName, onRemove: () => setSelectedVariantName(null) });
  if (selectedFlavorName)
    chips.push({ key: 'flv', label: selectedFlavorName, onRemove: () => setSelectedFlavorName(null) });
  if (hasPriceFilter)
    chips.push({
      key: 'price',
      label: `${minPrice || priceBounds.min} – ${maxPrice || priceBounds.max} ${currency}`,
      onRemove: () => {
        setMinPrice('');
        setMaxPrice('');
      },
    });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pg-wrapper">
      {/* <header className="pg-hero">
        <div className="pg-hero-inner">
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Our Patisserie
          </motion.h1>
          <p>Handcrafted sweets delivered with love</p>
        </div>
      </header> */}

      <div className="pg-container">
        {/* Toolbar shown on mobile / tablet */}
        <div className="pg-mobile-bar">
          <button className="pg-filter-toggle" onClick={() => setSidebarOpen(true)}>
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && <span className="pg-filter-badge">{activeFilterCount}</span>}
          </button>
          <label className="pg-sort-select">
            <span className="pg-sr-only">Sort products</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
        </div>

        <div className="pg-layout">
          {sidebarOpen && <div className="pg-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

          {/* ───────────── SIDEBAR ───────────── */}
          <aside className={`pg-sidebar ${sidebarOpen ? 'pg-sidebar-open' : ''}`} aria-label="Product filters">
            <div className="pg-sidebar-head">
              <h3>Filters</h3>
              <div className="pg-sidebar-head-actions">
                {activeFilterCount > 0 && (
                  <button className="pg-clear-btn" onClick={handleClearAll}>
                    Clear all
                  </button>
                )}
                <button
                  className="pg-sidebar-close"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="pg-sidebar-body">
              {/* Categories → subcategories */}
              <div className="pg-filter-block">
                <h4 className="pg-filter-title">Category</h4>
                <ul className="pg-cat-list">
                  <li>
                    <button
                      className={`pg-cat-item ${!selectedCategory ? 'pg-cat-item-active' : ''}`}
                      onClick={handleShowAll}
                    >
                      All products
                    </button>
                  </li>

                  {categories.map((cat) => {
                    const isOpen = selectedCategory?.id === cat.id;
                    return (
                      <li key={cat.id}>
                        <button
                          className={`pg-cat-item ${isOpen ? 'pg-cat-item-active' : ''}`}
                          onClick={() => handleCategoryClick(cat)}
                          aria-expanded={isOpen}
                        >
                          <span>{cat.name}</span>
                          <ChevronDown
                            size={16}
                            className={`pg-cat-chevron ${isOpen ? 'pg-cat-chevron-open' : ''}`}
                          />
                        </button>

                        {isOpen && (
                          <ul className="pg-sub-list">
                            {subLoading ? (
                              <li className="pg-sub-note">Loading...</li>
                            ) : subcategories.length === 0 ? (
                              <li className="pg-sub-note">No subcategories</li>
                            ) : (
                              subcategories.map((sub) => (
                                <li key={sub.id}>
                                  <button
                                    className={`pg-sub-item ${
                                      selectedSubcategory?.id === sub.id ? 'pg-sub-item-active' : ''
                                    }`}
                                    onClick={() => handleSubcategoryClick(sub)}
                                  >
                                    {sub.name}
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sort */}
              <div className="pg-filter-block">
                <h4 className="pg-filter-title">Sort by</h4>
                <div className="pg-radio-list">
                  {SORT_OPTIONS.map((opt) => (
                    <label key={opt.key} className="pg-radio">
                      <input
                        type="radio"
                        name="pg-sort"
                        checked={sortBy === opt.key}
                        onChange={() => setSortBy(opt.key)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              {priceBounds.max > 0 && (
                <div className="pg-filter-block">
                  <h4 className="pg-filter-title">Price range ({currency})</h4>
                  <div className="pg-price-inputs">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      placeholder={String(priceBounds.min)}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      aria-label="Minimum price"
                    />
                    <span className="pg-price-dash">–</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      placeholder={String(priceBounds.max)}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      aria-label="Maximum price"
                    />
                  </div>
                  <input
                    type="range"
                    className="pg-price-slider"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step="any"
                    value={sliderValue}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    aria-label="Maximum price slider"
                  />
                  <div className="pg-price-scale">
                    <span>{priceBounds.min}</span>
                    <span>{priceBounds.max}</span>
                  </div>
                </div>
              )}

              {/* Variant */}
              {availableVariants.length > 0 && (
                <div className="pg-filter-block">
                  <h4 className="pg-filter-title">Variant</h4>
                  <div className="pg-vf-pills">
                    {availableVariants.map((name) => (
                      <button
                        key={name}
                        className={`pg-vf-pill ${selectedVariantName === name ? 'pg-vf-pill-active' : ''}`}
                        aria-pressed={selectedVariantName === name}
                        onClick={() => setSelectedVariantName((prev) => (prev === name ? null : name))}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavour */}
              {availableFlavors.length > 0 && (
                <div className="pg-filter-block">
                  <h4 className="pg-filter-title">Flavour</h4>
                  <div className="pg-vf-pills">
                    {availableFlavors.map((name) => (
                      <button
                        key={name}
                        className={`pg-vf-pill ${selectedFlavorName === name ? 'pg-vf-pill-active' : ''}`}
                        aria-pressed={selectedFlavorName === name}
                        onClick={() => setSelectedFlavorName((prev) => (prev === name ? null : name))}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / tablet: apply */}
            <div className="pg-apply-wrap">
              <button className="pg-apply-btn" onClick={() => setSidebarOpen(false)}>
                Show {filteredProducts.length} {filteredProducts.length === 1 ? 'treat' : 'treats'}
              </button>
            </div>
          </aside>

          {/* ───────────── PRODUCTS ───────────── */}
          <main className="pg-content">
            <div className="pg-results-bar">
              <nav className="pg-breadcrumb" aria-label="Breadcrumb">
                <button onClick={handleShowAll}>All</button>
                {selectedCategory && (
                  <>
                    <span aria-hidden="true">/</span>
                    <button onClick={() => setSelectedSubcategory(null)}>{selectedCategory.name}</button>
                  </>
                )}
                {selectedSubcategory && (
                  <>
                    <span aria-hidden="true">/</span>
                    <strong>{selectedSubcategory.name}</strong>
                  </>
                )}
              </nav>
              {!loading && (
                <span className="pg-results-count">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
              )}
            </div>

            {chips.length > 0 && (
              <div className="pg-chips">
                {chips.map((c) => (
                  <button key={c.key} className="pg-chip" onClick={c.onRemove} aria-label={`Remove ${c.label}`}>
                    {c.label}
                    <X size={13} />
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="pg-loader">
                <span className="pg-spinner" aria-hidden="true" />
                Loading deliciousness...
              </div>
            ) : (
              <div className="pg-grid">
                <AnimatePresence>
                  {filteredProducts.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product as any}
                      index={idx}
                      isRetailer={isRetailer}
                      userId={userId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="pg-no-results">
                <p>No treats found for this selection.</p>
                {activeFilterCount > 0 && (
                  <button className="pg-clear-btn" onClick={handleClearAll}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;