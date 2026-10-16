// // // import React, { useState, useEffect } from 'react';
// // // import { ChevronLeft, ChevronRight } from 'lucide-react';
// // // import { useNavigate } from 'react-router-dom';
// // // import './CategorySlider.css';
// // // import { storefrontApi } from '../../services/directApiService';
// // // import { useCurrency } from '../../context/CurrencyContext';

// // // interface Category {
// // //   _id: string;
// // //   name: string;
// // //   image?: string;
// // //   description?: string;
// // // }

// // // const CircularCategorySlider = () => {
// // //   const navigate = useNavigate();
// // //   const { currency } = useCurrency();
// // //   const [categories, setCategories] = useState<Category[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [currentSlide, setCurrentSlide] = useState(0);
// // //   const [cardsPerSlide, setCardsPerSlide] = useState(5);

// // //   const updateCardsPerSlide = () => {
// // //     const width = window.innerWidth;
// // //     if (width <= 768) {
// // //       setCardsPerSlide(2);
// // //     } else if (width <= 1024) {
// // //       setCardsPerSlide(3);
// // //     } else {
// // //       setCardsPerSlide(5);
// // //     }
// // //   };

// // //   // Fetch categories from API
// // //   useEffect(() => {
// // //     const fetchCategories = async () => {
// // //       try {
// // //         setLoading(true);
// // //         const response = await storefrontApi.categories();
// // //         const data = response.data;

// // //         const transformedCategories: Category[] = data.map((item: any) => ({
// // //           _id: item._id ?? item.id,
// // //           name: item.name,
// // //           image: item.image || 'https://via.placeholder.com/300x300?text=' + item.name,
// // //           description: item.description || `Discover our ${item.name}`,
// // //         }));

// // //         setCategories(transformedCategories);
// // //         setLoading(false);
// // //       } catch (err) {
// // //         console.error('Error fetching categories:', err);
// // //         setLoading(false);

// // //         // Fallback data
// // //         setCategories([
// // //           {
// // //             _id: '1',
// // //             name: 'Chocolate Truffle',
// // //             image: 'https://via.placeholder.com/300x300?text=Chocolate+Truffle',
// // //             description: 'Rich chocolate truffle',
// // //           },
// // //           {
// // //             _id: '2',
// // //             name: 'Custard Cake',
// // //             image: 'https://via.placeholder.com/300x300?text=Custard+Cake',
// // //             description: 'Delicious custard cake',
// // //           },
// // //           {
// // //             _id: '3',
// // //             name: 'Almond Bread',
// // //             image: 'https://via.placeholder.com/300x300?text=Almond+Bread',
// // //             description: 'Fresh almond bread',
// // //           },
// // //           {
// // //             _id: '4',
// // //             name: 'Strawberry Cake',
// // //             image: 'https://via.placeholder.com/300x300?text=Strawberry',
// // //             description: 'Fresh strawberry cake',
// // //           },
// // //           {
// // //             _id: '5',
// // //             name: 'Vanilla Pastry',
// // //             image: 'https://via.placeholder.com/300x300?text=Vanilla+Pastry',
// // //             description: 'Classic vanilla pastry',
// // //           },
// // //           {
// // //             _id: '6',
// // //             name: 'Macaron',
// // //             image: 'https://via.placeholder.com/300x300?text=Macaron',
// // //             description: 'Delicate macaron',
// // //           },
// // //         ]);
// // //       }
// // //     };

// // //     fetchCategories();
// // //   }, []);

// // //   useEffect(() => {
// // //     updateCardsPerSlide();
// // //     window.addEventListener('resize', updateCardsPerSlide);
// // //     return () => window.removeEventListener('resize', updateCardsPerSlide);
// // //   }, []);

// // //   const totalSlides = Math.max(1, Math.ceil(categories.length / cardsPerSlide));

// // //   useEffect(() => {
// // //     if (currentSlide >= totalSlides) {
// // //       setCurrentSlide(0);
// // //     }
// // //   }, [currentSlide, totalSlides]);

// // //   useEffect(() => {
// // //     const intervalId = window.setInterval(() => {
// // //       setCurrentSlide((prev) => (prev + 1) % totalSlides);
// // //     }, 5000);

// // //     return () => window.clearInterval(intervalId);
// // //   }, [totalSlides]);

// // //   const handlePrev = () => {
// // //     setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
// // //   };

// // //   const handleNext = () => {
// // //     setCurrentSlide((prev) => (prev + 1) % totalSlides);
// // //   };

// // //   const handleCategoryClick = (category: Category) => {
// // //     // No navigation required for this slider.
// // //     // This keeps the category cards interactive without changing pages.
  
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="circular-slider-wrapper loading">
// // //         <div className="spinner"></div>
// // //         <p>Loading categories...</p>
// // //       </div>
// // //     );
// // //   }

// // //   if (categories.length === 0) {
// // //     return (
// // //       <div className="circular-slider-wrapper error">
// // //         <p>No categories available</p>
// // //       </div>
// // //     );
// // //   }

// // //   const visibleCategories = categories.slice(
// // //     currentSlide * cardsPerSlide,
// // //     currentSlide * cardsPerSlide + cardsPerSlide
// // //   );

// // //   return (
// // //     <div className="circular-slider-wrapper">
// // //       {/* Header */}
// // //       <div className="slider-header">
// // //         <h2 className="slider-title">Our Delicacies</h2>
// // //         <p className="slider-subtitle">Explore our finest selections</p>
// // //       </div>

// // //       {/* Slider Container */}
// // //       <div className="circular-slider-container">
// // //         {/* Navigation - Left */}
// // //         {totalSlides > 1 && (
// // //           <button className="nav-button prev" onClick={handlePrev} aria-label="Previous">
// // //             <ChevronLeft size={28} />
// // //           </button>
// // //         )}

// // //         {/* Circular Cards */}
// // //         <div className="cards-wrapper">
// // //           {visibleCategories.map((category, index) => (
// // //             <div
// // //               key={category._id}
// // //               className="circular-card"
// // //               style={{
// // //                 animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
// // //               }}
// // //             >
// // //               {/* Circular Frame */}
// // //               <div className="card-circle">
// // //                 <img
// // //                   src={category.image}
// // //                   alt={category.name}
// // //                   className="card-image"
// // //                   loading="lazy"
// // //                 />
// // //                 <div className="circle-border"></div>

// // //                 {/* Hover overlay showing the category name */}
// // //                 <div className="card-hover-overlay">
// // //                   <span className="card-hover-name">{category.name}</span>
// // //                 </div>
// // //               </div>

// // //               {/* Card Info */}
// // //               <div className="card-info">
// // //                 <h3 className="card-name">{category.name}</h3>
// // //                 <p className="card-desc">{category.description}</p>
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>

// // //         {/* Navigation - Right */}
// // //         {totalSlides > 1 && (
// // //           <button className="nav-button next" onClick={handleNext} aria-label="Next">
// // //             <ChevronRight size={28} />
// // //           </button>
// // //         )}
// // //       </div>

// // //       {/* Dots Indicator */}
// // //       <div className="dots-container">
// // //         {Array.from({ length: totalSlides }).map((_, i) => (
// // //           <button
// // //             key={i}
// // //             className={`dot ${i === currentSlide ? 'active' : ''}`}
// // //             onClick={() => setCurrentSlide(i)}
// // //             aria-label={`Go to group ${i + 1}`}
// // //           />
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default CircularCategorySlider;


// // import React, { useState, useEffect } from 'react';
// // import { ChevronLeft, ChevronRight } from 'lucide-react';
// // import { useNavigate } from 'react-router-dom';
// // import './CategorySlider.css';
// // import { storefrontApi } from '../../services/directApiService';
// // import { useCurrency } from '../../context/CurrencyContext';

// // interface Category {
// //   _id: string;
// //   name: string;
// //   image?: string;
// //   description?: string;
// // }

// // const CircularCategorySlider = () => {
// //   const navigate = useNavigate();
// //   const { currency } = useCurrency();
// //   const [categories, setCategories] = useState<Category[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentSlide, setCurrentSlide] = useState(0);
// //   const [cardsPerSlide, setCardsPerSlide] = useState(5);

// //   const updateCardsPerSlide = () => {
// //     const width = window.innerWidth;
// //     if (width <= 768) {
// //       setCardsPerSlide(2);
// //     } else if (width <= 1024) {
// //       setCardsPerSlide(3);
// //     } else {
// //       setCardsPerSlide(5);
// //     }
// //   };

// //   // Fetch categories from API
// //   useEffect(() => {
// //     const fetchCategories = async () => {
// //       try {
// //         setLoading(true);
// //         const response = await storefrontApi.categories();
// //         const data = response.data;

// //         const transformedCategories: Category[] = data.map((item: any) => ({
// //           _id: item._id ?? item.id,
// //           name: item.name,
// //           image: item.image || 'https://via.placeholder.com/300x300?text=' + item.name,
// //           description: item.description || `Discover our ${item.name}`,
// //         }));

// //         setCategories(transformedCategories);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error('Error fetching categories:', err);
// //         setLoading(false);

// //         // Fallback data
// //         setCategories([
// //           {
// //             _id: '1',
// //             name: 'Chocolate Truffle',
// //             image: 'https://via.placeholder.com/300x300?text=Chocolate+Truffle',
// //             description: 'Rich chocolate truffle',
// //           },
// //           {
// //             _id: '2',
// //             name: 'Custard Cake',
// //             image: 'https://via.placeholder.com/300x300?text=Custard+Cake',
// //             description: 'Delicious custard cake',
// //           },
// //           {
// //             _id: '3',
// //             name: 'Almond Bread',
// //             image: 'https://via.placeholder.com/300x300?text=Almond+Bread',
// //             description: 'Fresh almond bread',
// //           },
// //           {
// //             _id: '4',
// //             name: 'Strawberry Cake',
// //             image: 'https://via.placeholder.com/300x300?text=Strawberry',
// //             description: 'Fresh strawberry cake',
// //           },
// //           {
// //             _id: '5',
// //             name: 'Vanilla Pastry',
// //             image: 'https://via.placeholder.com/300x300?text=Vanilla+Pastry',
// //             description: 'Classic vanilla pastry',
// //           },
// //           {
// //             _id: '6',
// //             name: 'Macaron',
// //             image: 'https://via.placeholder.com/300x300?text=Macaron',
// //             description: 'Delicate macaron',
// //           },
// //         ]);
// //       }
// //     };

// //     fetchCategories();
// //   }, []);

// //   useEffect(() => {
// //     updateCardsPerSlide();
// //     window.addEventListener('resize', updateCardsPerSlide);
// //     return () => window.removeEventListener('resize', updateCardsPerSlide);
// //   }, []);

// //   const totalSlides = Math.max(1, Math.ceil(categories.length / cardsPerSlide));

// //   useEffect(() => {
// //     if (currentSlide >= totalSlides) {
// //       setCurrentSlide(0);
// //     }
// //   }, [currentSlide, totalSlides]);

// //   useEffect(() => {
// //     const intervalId = window.setInterval(() => {
// //       setCurrentSlide((prev) => (prev + 1) % totalSlides);
// //     }, 5000);

// //     return () => window.clearInterval(intervalId);
// //   }, [totalSlides]);

// //   const handlePrev = () => {
// //     setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
// //   };

// //   const handleNext = () => {
// //     setCurrentSlide((prev) => (prev + 1) % totalSlides);
// //   };

// //   const handleCategoryClick = (category: Category) => {
// //     navigate(`/categoryproduct/${category._id}`);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="circular-slider-wrapper loading">
// //         <div className="spinner"></div>
// //         <p>Loading categories...</p>
// //       </div>
// //     );
// //   }

// //   if (categories.length === 0) {
// //     return (
// //       <div className="circular-slider-wrapper error">
// //         <p>No categories available</p>
// //       </div>
// //     );
// //   }

// //   const visibleCategories = categories.slice(
// //     currentSlide * cardsPerSlide,
// //     currentSlide * cardsPerSlide + cardsPerSlide
// //   );

// //   return (
// //     <div className="circular-slider-wrapper">
// //       {/* Header */}
// //       <div className="slider-header">
// //         <h2 className="slider-title">Our Delicacies</h2>
// //         <p className="slider-subtitle">Explore our finest selections</p>
// //       </div>

// //       {/* Slider Container */}
// //       <div className="circular-slider-container">
// //         {/* Navigation - Left */}
// //         {totalSlides > 1 && (
// //           <button className="nav-button prev" onClick={handlePrev} aria-label="Previous">
// //             <ChevronLeft size={28} />
// //           </button>
// //         )}

// //         {/* Circular Cards */}
// //         <div className="cards-wrapper">
// //           {visibleCategories.map((category, index) => (
// //             <div
// //               key={category._id}
// //               className="circular-card"
// //               role="button"
// //               tabIndex={0}
// //               onClick={() => handleCategoryClick(category)}
// //               onKeyDown={(e) => {
// //                 if (e.key === 'Enter' || e.key === ' ') {
// //                   e.preventDefault();
// //                   handleCategoryClick(category);
// //                 }
// //               }}
// //               style={{
// //                 cursor: 'pointer',
// //                 animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
// //               }}
// //             >
// //               {/* Circular Frame */}
// //               <div className="card-circle">
// //                 <img
// //                   src={category.image}
// //                   alt={category.name}
// //                   className="card-image"
// //                   loading="lazy"
// //                 />
// //                 <div className="circle-border"></div>

// //                 {/* Hover overlay showing the category name */}
// //                 <div className="card-hover-overlay">
// //                   <span className="card-hover-name">{category.name}</span>
// //                 </div>
// //               </div>

// //               {/* Card Info */}
// //               <div className="card-info">
// //                 <h3 className="card-name">{category.name}</h3>
// //                 <p className="card-desc">{category.description}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* Navigation - Right */}
// //         {totalSlides > 1 && (
// //           <button className="nav-button next" onClick={handleNext} aria-label="Next">
// //             <ChevronRight size={28} />
// //           </button>
// //         )}
// //       </div>

// //       {/* Dots Indicator */}
// //       <div className="dots-container">
// //         {Array.from({ length: totalSlides }).map((_, i) => (
// //           <button
// //             key={i}
// //             className={`dot ${i === currentSlide ? 'active' : ''}`}
// //             onClick={() => setCurrentSlide(i)}
// //             aria-label={`Go to group ${i + 1}`}
// //           />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default CircularCategorySlider;


// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import ProductCard from '../../components/ProductCard/ProductCard';
// import { storefrontApi } from '../../services/directApiService';
// import './CategorySlider.css';

// /* ──────────────────────────────────────────────────────────────────────
//    OUR DELICACIES — in-page category explorer
//    • Clicking a category NO LONGER opens the category page.
//    • It smoothly scrolls the home page down to that category's row,
//      which shows the first 4 products of the category.
//    • Each row has an "Explore <category>" button that opens the full
//      category page (same pattern as the reference video).
//    • Scroll-spy keeps the active chip in sync while the user scrolls.
//    ────────────────────────────────────────────────────────────────────── */

// export interface HomeProduct {
//   id: number;
//   name: string;
//   image_url: string;
//   price: number;
//   original_price?: number;
//   currency: string;
//   category_name?: string;
//   category_id?: number;
//   category?: { id: number; name: string } | null;
//   [key: string]: any;
// }

// interface Category {
//   id: number;
//   name: string;
//   image?: string;
//   description?: string;
// }

// interface Props {
//   products: HomeProduct[];
//   productsLoading?: boolean;
//   userId?: number;
//   isRetailer?: boolean;
// }

// const PRODUCTS_PER_ROW = 4;
// const SCROLL_OFFSET = 110; // keeps the row clear of the sticky navbar

// const productCategoryId = (p: HomeProduct): number | null => {
//   const raw = p.category?.id ?? p.category_id;
//   return raw === undefined || raw === null ? null : Number(raw);
// };

// const CategorySlider: React.FC<Props> = ({ products, productsLoading = false, userId, isRetailer = false }) => {
//   const navigate = useNavigate();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeId, setActiveId] = useState<number | null>(null);
//   const [notice, setNotice] = useState<string | null>(null);
//   const [flashId, setFlashId] = useState<number | null>(null);

//   const railRef = useRef<HTMLDivElement>(null);
//   const rowRefs = useRef<Record<number, HTMLElement | null>>({});
//   const clickScrolling = useRef(false);

//   /* ── Fetch categories ── */
//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       try {
//         setLoading(true);
//         const res = await storefrontApi.categories();
//         const d = res.data;
//         const list: any[] = Array.isArray(d) ? d : d?.categories || d?.data || [];
//         const mapped: Category[] = list
//           .filter((c) => c && c.is_active !== false && String(c.status ?? 'active').toLowerCase() !== 'inactive')
//           .map((c) => ({
//             id: Number(c.id ?? c._id),
//             name: c.name,
//             image: c.image || c.image_url || '',
//             description: c.description || `Discover our ${c.name}`,
//           }));
//         if (!cancelled) setCategories(mapped);
//       } catch (err) {
//         console.error('Error fetching categories:', err);
//         if (!cancelled) setCategories([]);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   /* ── Group products by category (first 4 per category) ── */
//   const productsByCategory = useMemo(() => {
//     const map: Record<number, HomeProduct[]> = {};
//     products.forEach((p) => {
//       const cid = productCategoryId(p);
//       if (cid === null) return;
//       (map[cid] ||= []).push(p);
//     });
//     return map;
//   }, [products]);

//   const rows = useMemo(
//     () =>
//       categories
//         .filter((c) => (productsByCategory[c.id] || []).length > 0)
//         .map((c) => ({
//           ...c,
//           total: productsByCategory[c.id].length,
//           items: productsByCategory[c.id].slice(0, PRODUCTS_PER_ROW),
//         })),
//     [categories, productsByCategory]
//   );

//   /* ── Scroll-spy: highlight the chip of the row currently in view ── */
//   useEffect(() => {
//     if (!rows.length) return;
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (clickScrolling.current) return;
//         const visible = entries
//           .filter((e) => e.isIntersecting)
//           .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
//         if (visible) {
//           const id = Number((visible.target as HTMLElement).dataset.catId);
//           if (!Number.isNaN(id)) setActiveId(id);
//         }
//       },
//       { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5] }
//     );
//     rows.forEach((r) => {
//       const el = rowRefs.current[r.id];
//       if (el) observer.observe(el);
//     });
//     return () => observer.disconnect();
//   }, [rows]);

//   /* ── Keep the active chip visible inside the rail ── */
//   useEffect(() => {
//     if (activeId === null || !railRef.current) return;
//     const chip = railRef.current.querySelector<HTMLElement>(`[data-chip-id="${activeId}"]`);
//     if (!chip) return;
//     const rail = railRef.current;
//     const left = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
//     rail.scrollTo({ left, behavior: 'smooth' });
//   }, [activeId]);

//   useEffect(() => {
//     if (!notice) return;
//     const t = window.setTimeout(() => setNotice(null), 2600);
//     return () => window.clearTimeout(t);
//   }, [notice]);

//   const scrollRail = (dir: 1 | -1) => {
//     railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
//   };

//   /* ── Click → navigate WITHIN the home page ── */
//   const handleCategoryClick = useCallback(
//     (cat: Category) => {
//       setActiveId(cat.id);
//       const el = rowRefs.current[cat.id];
//       if (!el) {
//         setNotice(`${cat.name} — a fresh batch is coming soon!`);
//         return;
//       }
//       clickScrolling.current = true;
//       const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
//       window.scrollTo({ top, behavior: 'smooth' });
//       setFlashId(cat.id);
//       window.setTimeout(() => {
//         clickScrolling.current = false;
//       }, 900);
//       window.setTimeout(() => setFlashId(null), 1600);
//     },
//     []
//   );

//   const isBusy = loading || productsLoading;

//   return (
//     <div className="dl-wrapper" id="our-delicacies">
//       <span className="dl-leaf dl-leaf-a" aria-hidden />
//       <span className="dl-leaf dl-leaf-b" aria-hidden />

//       {/* ── Header ── */}
//       <motion.div
//         className="dl-header"
//         initial={{ opacity: 0, y: 24 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, amount: 0.4 }}
//         transition={{ duration: 0.6 }}
//       >
//         <span className="dl-eyebrow">
//           <Sparkles size={14} /> Shop by category
//         </span>
//         <h2 className="dl-title">Our Delicacies</h2>
//         <p className="dl-subtitle">Tap a category to jump straight to its freshest picks — right here on this page.</p>
//       </motion.div>

//       {/* ── Category rail ── */}
//       <div className="dl-rail-shell">
//         <button className="dl-rail-nav" onClick={() => scrollRail(-1)} aria-label="Scroll categories left">
//           <ChevronLeft size={20} />
//         </button>

//         <div className="dl-rail" ref={railRef}>
//           {loading
//             ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="dl-chip dl-chip-skeleton" />)
//             : categories.map((cat, i) => {
//                 const count = productsByCategory[cat.id]?.length || 0;
//                 const active = activeId === cat.id;
//                 return (
//                   <motion.button
//                     key={cat.id}
//                     type="button"
//                     data-chip-id={cat.id}
//                     className={`dl-chip ${active ? 'is-active' : ''} ${count === 0 ? 'is-empty' : ''}`}
//                     onClick={() => handleCategoryClick(cat)}
//                     initial={{ opacity: 0, y: 18 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true }}
//                     transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.4 }}
//                     whileHover={{ y: -4 }}
//                     whileTap={{ scale: 0.96 }}
//                     aria-pressed={active}
//                   >
//                     <span className="dl-chip-img">
//                       {cat.image ? (
//                         <img src={cat.image} alt={cat.name} loading="lazy" />
//                       ) : (
//                         <span className="dl-chip-initial">{cat.name.charAt(0).toUpperCase()}</span>
//                       )}
//                     </span>
//                     <span className="dl-chip-name">{cat.name}</span>
//                     <span className="dl-chip-count">{count > 0 ? `${count} item${count > 1 ? 's' : ''}` : 'Coming soon'}</span>
//                   </motion.button>
//                 );
//               })}
//         </div>

//         <button className="dl-rail-nav" onClick={() => scrollRail(1)} aria-label="Scroll categories right">
//           <ChevronRight size={20} />
//         </button>
//       </div>

//       <AnimatePresence>
//         {notice && (
//           <motion.div
//             className="dl-notice"
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//           >
//             {notice}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Category rows (first 4 products each) ── */}
//       <div className="dl-rows">
//         {isBusy && (
//           <div className="dl-row">
//             <div className="dl-row-head">
//               <div className="dl-skel-line" />
//             </div>
//             <div className="dl-row-grid">
//               {Array.from({ length: 4 }).map((_, i) => (
//                 <div key={i} className="dl-card-skeleton" />
//               ))}
//             </div>
//           </div>
//         )}

//         {!isBusy && rows.length === 0 && (
//           <p className="dl-empty">Our bakers are restocking the shelves. Please check back shortly.</p>
//         )}

//         {!isBusy &&
//           rows.map((row, rowIdx) => (
//             <section
//               key={row.id}
//               id={`cat-row-${row.id}`}
//               data-cat-id={row.id}
//               ref={(el) => {
//                 rowRefs.current[row.id] = el;
//               }}
//               className={`dl-row ${rowIdx % 2 ? 'is-alt' : ''} ${flashId === row.id ? 'is-flash' : ''}`}
//             >
//               <motion.div
//                 className="dl-row-head"
//                 initial={{ opacity: 0, x: -24 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true, amount: 0.5 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <div className="dl-row-title">
//                   <span className="dl-row-index">{String(rowIdx + 1).padStart(2, '0')}</span>
//                   <div>
//                     <h3>{row.name}</h3>
//                     <p>
//                       Showing {row.items.length} of {row.total} · {row.description}
//                     </p>
//                   </div>
//                 </div>
//                 <button className="dl-explore" onClick={() => navigate(`/categoryproduct/${row.id}`)}>
//                   Explore {row.name} <ArrowRight size={15} />
//                 </button>
//               </motion.div>

//               <div className="dl-row-grid">
//                 {row.items.map((product, idx) => (
//                   <ProductCard
//                     key={product.id}
//                     product={product as any}
//                     index={idx}
//                     isRetailer={isRetailer}
//                     userId={userId}
//                   />
//                 ))}
//               </div>
//             </section>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default CategorySlider;


import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { storefrontApi } from '../../services/directApiService';
import './CategorySlider.css';

/* ──────────────────────────────────────────────────────────────────────
   OUR DELICACIES — in-page category explorer
   • Clicking a category NO LONGER opens the category page.
   • It smoothly scrolls the home page down to that category's row,
     which shows the first 4 products of the category.
   • Each row has an "Explore <category>" button that opens the full
     category page (same pattern as the reference video).
   • Scroll-spy keeps the active chip in sync while the user scrolls.
   ────────────────────────────────────────────────────────────────────── */

export interface HomeProduct {
  id: number;
  name: string;
  image_url: string;
  price: number;
  original_price?: number;
  currency: string;
  category_name?: string;
  category_id?: number;
  category?: { id: number; name: string } | null;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  description?: string;
}

interface Props {
  products: HomeProduct[];
  productsLoading?: boolean;
  userId?: number;
  isRetailer?: boolean;
}

const PRODUCTS_PER_ROW = 4;
const SCROLL_OFFSET = 110; // keeps the row clear of the sticky navbar

const productCategoryId = (p: HomeProduct): number | null => {
  const raw = p.category?.id ?? p.category_id;
  return raw === undefined || raw === null ? null : Number(raw);
};

const CategorySlider: React.FC<Props> = ({ products, productsLoading = false, userId, isRetailer = false }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<number | null>(null);

  const railRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, HTMLElement | null>>({});
  const clickScrolling = useRef(false);

  /* ── Fetch categories ── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await storefrontApi.categories();
        const d = res.data;
        const list: any[] = Array.isArray(d) ? d : d?.categories || d?.data || [];
        const mapped: Category[] = list
          .filter((c) => c && c.is_active !== false && String(c.status ?? 'active').toLowerCase() !== 'inactive')
          .map((c) => ({
            id: Number(c.id ?? c._id),
            name: c.name,
            image: c.image || c.image_url || '',
            description: c.description || `Discover our ${c.name}`,
          }));
        if (!cancelled) setCategories(mapped);
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Group products by category (first 4 per category) ── */
  const productsByCategory = useMemo(() => {
    const map: Record<number, HomeProduct[]> = {};
    products.forEach((p) => {
      const cid = productCategoryId(p);
      if (cid === null) return;
      (map[cid] ||= []).push(p);
    });
    return map;
  }, [products]);

  const rows = useMemo(
    () =>
      categories
        .filter((c) => (productsByCategory[c.id] || []).length > 0)
        .map((c) => ({
          ...c,
          total: productsByCategory[c.id].length,
          items: productsByCategory[c.id].slice(0, PRODUCTS_PER_ROW),
        })),
    [categories, productsByCategory]
  );

  /* ── Scroll-spy: highlight the chip of the row currently in view ── */
  useEffect(() => {
    if (!rows.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (clickScrolling.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = Number((visible.target as HTMLElement).dataset.catId);
          if (!Number.isNaN(id)) setActiveId(id);
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5] }
    );
    rows.forEach((r) => {
      const el = rowRefs.current[r.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [rows]);

  /* ── Keep the active chip visible inside the rail ── */
  useEffect(() => {
    if (activeId === null || !railRef.current) return;
    const chip = railRef.current.querySelector<HTMLElement>(`[data-chip-id="${activeId}"]`);
    if (!chip) return;
    const rail = railRef.current;
    const left = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
    rail.scrollTo({ left, behavior: 'smooth' });
  }, [activeId]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(t);
  }, [notice]);

  const scrollRail = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  /* ── Click → navigate WITHIN the home page ── */
  const handleCategoryClick = useCallback(
    (cat: Category) => {
      setActiveId(cat.id);
      const el = rowRefs.current[cat.id];
      if (!el) {
        setNotice(`${cat.name} — a fresh batch is coming soon!`);
        return;
      }
      clickScrolling.current = true;
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      setFlashId(cat.id);
      window.setTimeout(() => {
        clickScrolling.current = false;
      }, 900);
      window.setTimeout(() => setFlashId(null), 1600);
    },
    []
  );

  const isBusy = loading || productsLoading;

  return (
    <div className="dl-wrapper" id="our-delicacies">
      <span className="dl-leaf dl-leaf-a" aria-hidden />
      <span className="dl-leaf dl-leaf-b" aria-hidden />

      {/* ── Header ── */}
      <motion.div
        className="dl-header"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <span className="dl-eyebrow">
          <Sparkles size={14} /> Shop by category
        </span>
        <h2 className="dl-title">Our Delicacies</h2>
        <p className="dl-subtitle">Tap a category to jump straight to its freshest picks — right here on this page.</p>
      </motion.div>

      {/* ── Category rail ── */}
      <div className="dl-rail-shell">
        <button className="dl-rail-nav" onClick={() => scrollRail(-1)} aria-label="Scroll categories left">
          <ChevronLeft size={20} />
        </button>

        <div className="dl-rail" ref={railRef}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="dl-chip dl-chip-skeleton" />)
            : categories.map((cat, i) => {
                const count = productsByCategory[cat.id]?.length || 0;
                const active = activeId === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    data-chip-id={cat.id}
                    className={`dl-chip ${active ? 'is-active' : ''} ${count === 0 ? 'is-empty' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    aria-pressed={active}
                  >
                    <span className="dl-chip-img">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} loading="lazy" />
                      ) : (
                        <span className="dl-chip-initial">{cat.name.charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    <span className="dl-chip-name">{cat.name}</span>
                    <span className="dl-chip-count">{count > 0 ? `${count} item${count > 1 ? 's' : ''}` : 'Coming soon'}</span>
                  </motion.button>
                );
              })}
        </div>

        <button className="dl-rail-nav" onClick={() => scrollRail(1)} aria-label="Scroll categories right">
          <ChevronRight size={20} />
        </button>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            className="dl-notice"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category rows (first 4 products each) ── */}
      <div className="dl-rows">
        {isBusy && (
          <div className="dl-row">
            <div className="dl-row-head">
              <div className="dl-skel-line" />
            </div>
            <div className="dl-row-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dl-card-skeleton" />
              ))}
            </div>
          </div>
        )}

        {!isBusy && rows.length === 0 && (
          <p className="dl-empty">Our bakers are restocking the shelves. Please check back shortly.</p>
        )}

        {!isBusy &&
          rows.map((row, rowIdx) => (
            <section
              key={row.id}
              id={`cat-row-${row.id}`}
              data-cat-id={row.id}
              ref={(el) => {
                rowRefs.current[row.id] = el;
              }}
              className={`dl-row ${rowIdx % 2 ? 'is-alt' : ''} ${flashId === row.id ? 'is-flash' : ''}`}
            >
              <motion.div
                className="dl-row-head"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <div className="dl-row-title">
                  <span className="dl-row-index">{String(rowIdx + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{row.name}</h3>
                    <p>
                      Showing {row.items.length} of {row.total} · {row.description}
                    </p>
                  </div>
                </div>
                <button className="dl-explore" onClick={() => navigate(`/categoryproduct/${row.id}`)}>
                  Explore {row.name} <ArrowRight size={15} />
                </button>
              </motion.div>

              <div className="dl-row-grid">
                {row.items.map((product, idx) => (
                  <div className="dl-row-cell" key={product.id}>
                    <ProductCard
                      product={product as any}
                      index={idx}
                      isRetailer={isRetailer}
                      userId={userId}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
};

export default CategorySlider;