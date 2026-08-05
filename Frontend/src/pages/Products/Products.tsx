import React, { useState, useEffect, useRef, useMemo } from 'react';
import { storefrontApi } from '../../services/directApiService';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


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

const user = JSON.parse(localStorage.getItem('user') || '{}');
const isRetailer = user.role?.toLowerCase() === 'retailer';
const userId = user.id; // ADD THIS

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subLoading, setSubLoading] = useState<boolean>(false);

  // Tabs: 1 = all categories overview, 2 = category detail (subcategories + variants/flavors)
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [selectedVariantName, setSelectedVariantName] = useState<string | null>(null);
  const [selectedFlavorName, setSelectedFlavorName] = useState<string | null>(null);

  const catScrollRef = useRef<HTMLDivElement>(null);
  const subScrollRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isRetailer = user.role?.toLowerCase() === 'retailer';

  // ─── Fetch all products + categories on mount ───────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currency = localStorage.getItem('currency') || 'AED';

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
  }, []);

  // ─── Derive variants & flavors for the products currently in scope ─────────
  // (scope = selected category, narrowed further by selected subcategory)
  const scopedProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) {
      list = list.filter((p) => p.category?.id === selectedCategory.id);
    }
    if (selectedSubcategory) {
      list = list.filter((p) => p.subcategory?.id === selectedSubcategory.id);
    }
    return list;
  }, [products, selectedCategory, selectedSubcategory]);

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

  // ─── Final filtered product list shown in the grid ──────────────────────────
  const filteredProducts = useMemo(() => {
    return scopedProducts.filter((p) => {
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
  }, [scopedProducts, selectedVariantName, selectedFlavorName]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleCategoryClick = async (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setSelectedVariantName(null);
    setSelectedFlavorName(null);
    setActiveTab(2);

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

  const handleShowAllCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedVariantName(null);
    setSelectedFlavorName(null);
    setSubcategories([]);
    setActiveTab(1);
  };

  const handleSubcategoryClick = (sub: SubCategory) => {
    setSelectedSubcategory((prev) => (prev?.id === sub.id ? null : sub));
    setSelectedVariantName(null);
    setSelectedFlavorName(null);
  };

  const handleVariantClick = (name: string) => {
    setSelectedVariantName((prev) => (prev === name ? null : name));
  };

  const handleFlavorClick = (name: string) => {
    setSelectedFlavorName((prev) => (prev === name ? null : name));
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - 260 : scrollLeft + 260;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="pg-wrapper">
      <header className="pg-hero">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Our Patisserie
        </motion.h1>
        <p>Handcrafted sweets delivered with love</p>
      </header>

      <div className="pg-container">
        {/* ── TAB 1: All categories ── */}
        {activeTab === 1 && (
          <>
            <div className="pg-slider-wrapper">
              <button className="pg-nav-btn" onClick={() => scroll(catScrollRef, 'left')}>
                
                
              <FaChevronLeft/>

              </button>
              <div className="pg-category-slider" ref={catScrollRef}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="pg-circle-pill"
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <div className="pg-circle-img-wrap">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="pg-circle-img" />
                      ) : (
                        <div className="pg-circle-placeholder">{cat.name.charAt(0)}</div>
                      )}
                      <span className="pg-circle-overlay-name">{cat.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button className="pg-nav-btn" onClick={() => scroll(catScrollRef, 'right')}>
               <FaChevronRight/>
              </button>
            </div>

            <main className="pg-main-content">
              {loading ? (
                <div className="pg-loader">Loading Deliciousness...</div>
              ) : (
                <div className="pg-grid">
                  <AnimatePresence>
                    {products.map((product, idx) => (
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
              {!loading && products.length === 0 && (
                <div className="pg-no-results">No treats found.</div>
              )}
            </main>
          </>
        )}

        {/* ── TAB 2: Category detail (subcategories + variants/flavors) ── */}
        {activeTab === 2 && selectedCategory && (
          <>
            <button className="pg-back-btn" onClick={handleShowAllCategory}>
              <ArrowLeft size={16} /> All Categories
            </button>

            <div className="pg-selected-category-banner">
              {selectedCategory.image && (
                <img src={selectedCategory.image} alt={selectedCategory.name} />
              )}
              <h2>{selectedCategory.name}</h2>
            </div>

            {/* Subcategory slider (same circle design) */}
            {subLoading ? (
              <div className="pg-loader-small">Loading subcategories...</div>
            ) : (
              subcategories.length > 0 && (
                <div className="pg-slider-wrapper">
                  <button className="pg-nav-btn" onClick={() => scroll(subScrollRef, 'left')}>
                   <FaChevronLeft/>
                  </button>
                  <div className="pg-category-slider" ref={subScrollRef}>
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        className={`pg-circle-pill ${
                          selectedSubcategory?.id === sub.id ? 'pg-active-ring' : ''
                        }`}
                        onClick={() => handleSubcategoryClick(sub)}
                      >
                        <div className="pg-circle-img-wrap">
                          {sub.image_url ? (
                            <img src={sub.image_url} alt={sub.name} className="pg-circle-img" />
                          ) : (
                            <div className="pg-circle-placeholder">{sub.name.charAt(0)}</div>
                          )}
                          <span className="pg-circle-overlay-name">{sub.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="pg-nav-btn" onClick={() => scroll(subScrollRef, 'right')}>
                    <FaChevronRight/>
                  </button>
                </div>
              )
            )}

            {/* Variant / Flavor simple pill filters */}
            {(availableVariants.length > 0 || availableFlavors.length > 0) && (
              <div className="pg-vf-section">
                {availableVariants.length > 0 && (
                  <div className="pg-vf-row">
                    <span className="pg-vf-label">Variant</span>
                    <div className="pg-vf-pills">
                      {availableVariants.map((name) => (
                        <button
                          key={name}
                          className={`pg-vf-pill ${
                            selectedVariantName === name ? 'pg-vf-pill-active' : ''
                          }`}
                          onClick={() => handleVariantClick(name)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableFlavors.length > 0 && (
                  <div className="pg-vf-row">
                    <span className="pg-vf-label">Flavour</span>
                    <div className="pg-vf-pills">
                      {availableFlavors.map((name) => (
                        <button
                          key={name}
                          className={`pg-vf-pill ${
                            selectedFlavorName === name ? 'pg-vf-pill-active' : ''
                          }`}
                          onClick={() => handleFlavorClick(name)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <main className="pg-main-content">
              {loading ? (
                <div className="pg-loader">Loading Deliciousness...</div>
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
                <div className="pg-no-results">No treats found for this selection.</div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;