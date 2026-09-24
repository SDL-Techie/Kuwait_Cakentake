// // import React, { useEffect, useState } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import ProductCard from "../../components/ProductCard/ProductCard";
// // import { ArrowLeft, Loader2 } from "lucide-react";
// // import { getCategoryProducts } from "@/src/services/categoryService";
// // import './CategoryProduct.css'

// // const CategoryProduct = () => {
// //   const { id } = useParams(); // 🔥 now ID
// //   const navigate = useNavigate();

// //   const [products, setProducts] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   const user = JSON.parse(localStorage.getItem('user') || '{}');
// //   const userRole = user.role || 'customer';

// //   useEffect(() => {
// //     const fetchProducts = async () => {
// //       if (!id) return;

// //       setLoading(true);
// //       try {
// //         const data = await getCategoryProducts(Number(id));

// //         const formatted = data.map((p: any) => ({
// //           ...p,
// //           id: p.id,
// //           image: p.image_url,
// //           price: userRole === 'RETAILER' ? p.wholesale_price : p.price,
// //         }));

// //         setProducts(formatted);
// //       } catch (err) {
// //         console.error("❌ Error:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchProducts();
// //   }, [id]);

// //   return (
// //     <>
// //       <button className="rasi-back-btn" onClick={() => navigate(-1)}>
// //         <ArrowLeft size={18} /> Back
// //       </button>

// //       <div className="rasi-container">
// //         <div className="rasi-section-header">
// //           <h2>Category Products</h2>
// //         </div>

// //        <div className="rasi-products-grid">
// //   {loading ? (
// //     <div className="rasi-loader-container">
// //       <Loader2 className="spinner" size={40} />
// //       <p>Loading...</p>
// //     </div>
// //   ) : products.length > 0 ? (
// //     products.map((product, index) => (
// //       <ProductCard
// //         key={product.id}
// //         product={product}
// //         index={index}
// //         isRetailer={userRole === 'RETAILER'}
// //       />
// //     ))
// //   ) : (
// //     <div className="rasi-no-products">
// //       <h3>No Products Found</h3>
// //     </div>
// //   )}
// // </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default CategoryProduct;




// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import ProductCard from "../../components/ProductCard/ProductCard";
// import { ArrowLeft, Loader2 } from "lucide-react";
// import { getCategoryProducts } from "@/src/services/categoryService";
// import { useCurrency } from '../../context/CurrencyContext';
// import './CategoryProduct.css'

// const CategoryProduct = () => {
//   const { id } = useParams(); // 🔥 now ID
//   const navigate = useNavigate();

//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { currency } = useCurrency();

//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const userRole = user.role || 'customer';

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!id) return;

//       setLoading(true);
//       try {
//         const data = await getCategoryProducts(Number(id));

//         const formatted = data.map((p: any) => ({
//           ...p,
//           id: p.id,
//           image: p.image_url,
//           price: userRole === 'RETAILER' ? p.wholesale_price : p.price,
//         }));

//         setProducts(formatted);
//       } catch (err) {
//         console.error("❌ Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [id, currency]);

//   return (
//     <>
//       <button className="rasi-back-btn" onClick={() => navigate(-1)}>
//         <ArrowLeft size={18} /> Back
//       </button>

//       <div className="rasi-container">
//         <div className="rasi-section-header">
//           <h2>Category Products</h2>
//         </div>

//        <div className="rasi-products-grid">
//   {loading ? (
//     <div className="rasi-loader-container">
//       <Loader2 className="spinner" size={40} />
//       <p>Loading...</p>
//     </div>
//   ) : products.length > 0 ? (
//     products.map((product, index) => (
//       <ProductCard
//         key={product.id}
//         product={product}
//         index={index}
//         isRetailer={userRole === 'RETAILER'}
//       />
//     ))
//   ) : (
//     <div className="rasi-no-products">
//       <h3>No Products Found</h3>
//     </div>
//   )}
// </div>
//       </div>
//     </>
//   );
// };

// export default CategoryProduct;


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import { storefrontApi } from '../../services/directApiService';
import { getCategoryProducts } from '@/src/services/categoryService';
import { useCurrency } from '../../context/CurrencyContext';
import './CategoryProduct.css';

interface SubCategory {
  id: number;
  name: string;
  category_id?: number;
  image_url?: string | null;
  is_active?: boolean;
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name-asc', label: 'Name: A to Z' },
];

const CategoryProduct: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const [products, setProducts] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [loading, setLoading] = useState<boolean>(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isRetailer = String(user.role || '').toLowerCase() === 'retailer';
  const userId = user.id;

  // ─── Fetch category products + subcategories (again when category/currency changes) ───
  useEffect(() => {
    if (!id) return;
    const catId = Number(id);
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setSelectedSubId(null);
      setSortBy('default');

      try {
        const [prodRes, subRes, catRes] = await Promise.allSettled([
          storefrontApi.products({ headers: { 'X-Currency': currency } }),
          storefrontApi.subcategories(catId),
          storefrontApi.categories(),
        ]);

        // Products of this category (same shape as the Products page)
        let list: any[] = [];
        if (prodRes.status === 'fulfilled') {
          const d = prodRes.value.data;
          const all: any[] = Array.isArray(d) ? d : d?.products || [];
          list = all.filter((p) => Number(p.category?.id ?? p.category_id) === catId);
        }
        // Fallback to the category endpoint if the storefront list had nothing
        if (list.length === 0) {
          try {
            list = await getCategoryProducts(catId);
          } catch (e) {
            console.error('Category products fallback error', e);
          }
        }

        // Subcategories
        let subs: SubCategory[] = [];
        if (subRes.status === 'fulfilled') {
          subs = subRes.value.data?.subcategories || [];
        }

        // Category name for the heading
        let name = list[0]?.category?.name || list[0]?.category_name || '';
        if (catRes.status === 'fulfilled') {
          const d = catRes.value.data;
          const cats: any[] = Array.isArray(d) ? d : d?.categories || d?.data || [];
          name = cats.find((c) => Number(c.id) === catId)?.name || name;
        }

        if (!cancelled) {
          setProducts(list);
          setSubcategories(subs.filter((s) => s.is_active !== false));
          setCategoryName(name);
        }
      } catch (err) {
        console.error('Category page error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, currency]);

  // ─── Filter by subcategory, then sort ──────────────────────────────────────
  const visibleProducts = useMemo(() => {
    let list = products;
    if (selectedSubId !== null) {
      list = list.filter((p) => Number(p.subcategory?.id ?? p.subcategory_id) === selectedSubId);
    }
    const sorted = [...list];
    const price = (p: any) => Number(p.price) || 0;
    if (sortBy === 'price-asc') sorted.sort((a, b) => price(a) - price(b));
    if (sortBy === 'price-desc') sorted.sort((a, b) => price(b) - price(a));
    if (sortBy === 'name-asc') sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return sorted;
  }, [products, selectedSubId, sortBy]);

  const selectedSub = subcategories.find((s) => s.id === selectedSubId) || null;

  const scrollSlider = (dir: 1 | -1) => {
    sliderRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cp-wrapper">
      <div className="cp-container">
        <button className="cp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <header className="cp-header">
          <h1>{categoryName || 'Category'}</h1>
          <p>
            {selectedSub ? `Showing ${selectedSub.name}` : 'Pick a subcategory or browse everything'}
          </p>
        </header>

        {/* Subcategory slider */}
        {subcategories.length > 0 && (
          <div className="cp-slider-wrap">
            {/* <button className="cp-nav-btn" onClick={() => scrollSlider(-1)} aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button> */}

            <button className="cp-nav-btn" onClick={() => scrollSlider(-1)} aria-label="Scroll left">
  <ChevronLeft size={20} strokeWidth={2.5} color="#2f5d3a" />
</button>

            <div className="cp-slider" ref={sliderRef}>
              <button
                className={`cp-sub ${selectedSubId === null ? 'cp-sub-active' : ''}`}
                onClick={() => setSelectedSubId(null)}
                aria-pressed={selectedSubId === null}
              >
                <span className="cp-sub-img cp-sub-all">All</span>
                <span className="cp-sub-name">All</span>
              </button>

              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  className={`cp-sub ${selectedSubId === sub.id ? 'cp-sub-active' : ''}`}
                  onClick={() => setSelectedSubId((prev) => (prev === sub.id ? null : sub.id))}
                  aria-pressed={selectedSubId === sub.id}
                >
                  <span className="cp-sub-img">
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.name} loading="lazy" />
                    ) : (
                      <span className="cp-sub-initial">{sub.name.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="cp-sub-name">{sub.name}</span>
                </button>
              ))}
            </div>

            {/* <button className="cp-nav-btn" onClick={() => scrollSlider(1)} aria-label="Scroll right">
              <ChevronRight size={18} />
            </button> */}

            <button className="cp-nav-btn" onClick={() => scrollSlider(1)} aria-label="Scroll right">
  <ChevronRight size={20} strokeWidth={2.5} color="#2f5d3a" />
</button>
          </div>
        )}

        {/* Results bar */}
        {!loading && (
          <div className="cp-results-bar">
            <span className="cp-count">
              {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
            </span>
            <label className="cp-sort">
              <span className="cp-sr-only">Sort products</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="cp-loader">
            <Loader2 className="cp-spin" size={36} />
            <p>Loading...</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="cp-grid">
            <AnimatePresence>
              {visibleProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  isRetailer={isRetailer}
                  userId={userId}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="cp-empty">
            <h3>No products found</h3>
            {selectedSub && (
              <button className="cp-link-btn" onClick={() => setSelectedSubId(null)}>
                Show all in {categoryName || 'this category'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProduct;