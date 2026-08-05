import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { ArrowLeft, Star, ShoppingCart, Zap, Heart, Share2, Leaf, Info, Loader2 } from 'lucide-react';
import { getWishlist, addToWishlist, deleteWishlistItem } from '../../services/whishlistService';
import toast, { Toaster } from 'react-hot-toast';
import { getProductById, getAllAddons } from '../../services/productService'; // Using your service layer
import { addToCart } from '../../services/cartService'; // ADJUST THIS PATH IF NECESSARY
import "./ProductDetails.css";

// --- UPDATED TYPE DEFINITIONS MATCHING FLASK API PAYLOAD ---
interface Flavor {
  id: number;
  name: string;
  is_active: boolean;
  price_modifier: number;
  variant_id: number;
}

interface Variant {
  id: number;
  name: string;
  is_active: boolean;
  price_modifier: number;
  product_id: number;
  flavors: Flavor[];
}

// ── Promotion type matching the backend payload ──
interface PromotionFreeItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: { id: number; name: string; image_url?: string };
}

interface PromotionData {
  id: number;
  name: string;
  description?: string;
  promotion_type: 'DISCOUNT' | 'FREE_ITEM';
  discount_type?: 'PERCENT' | 'FLAT';
  discount_value?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  free_items: PromotionFreeItem[];
}

interface ProductData {
  id: number;
  name: string;
  categoryName: string;
  price: number;
  original_price?: number;
  wholesaleprice?: number;
  currency: string;
  description: string;
  ingredients: string;
  image: string;
  images: string[];
  stock: number;
  variants: Variant[];
  promotion?: PromotionData | null;
}


const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, isLoggedIn } = useCustomerAuth();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // --- SELECTION STATES FOR CAKE LOGIC ---
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);

  const isRetailer = isLoggedIn && customer?.role?.toLowerCase() === 'retailer';

  // Use the same source of truth as Home/Products/ProductCard.
  // Prefer the auth context's id if present, otherwise fall back to the
  // 'user' object stored in localStorage (NOT a separate 'userId' key,
  // which nothing in this app ever sets).
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = customer?.id || user.id;

  const SHAPES = [
    "Round",
    "Heart",
    "Square",
    "Rectangle"
  ];

  const [selectedShape, setSelectedShape] = useState("Round");

  const [addons, setAddons] = useState<any[]>([]);

  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  // ── live countdown string for the active promotion ──
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const fetchProductAndWishlistStatus = async () => {
      if (!id) return;
      setLoading(true);

      setSelectedVariant(null);
      setSelectedFlavor(null);
      setSelectedShape("Round");
      setSelectedAddons([]);
      try {
        // 1. Fetch data using your clean asynchronous service layout
        const data = await getProductById(Number(id));

        // Find active variants from the API response
        const activeVariants = (data.variants || []).filter((v: any) => v.is_active);

        setProduct({
          id: data.id,
          name: data.name,
          price: Number(data.price),
          original_price: data.original_price ? Number(data.original_price) : undefined,
          wholesaleprice: data.wholesaleprice ? Number(data.wholesaleprice) : undefined,
          currency: data.currency || "INR",
          description: data.description || "",
          ingredients: data.ingredients || "Flour, Sugar, Butter, Baking Powder",
          image: data.image_url || "",
          images: [data.image_url || ""],
          categoryName: data.category?.name || "Cake",
          stock: data.stock,
          variants: activeVariants,
          promotion: data.promotion|| null,
        });

        const addonList = await getAllAddons();
        setAddons(addonList);

        // Auto-select the first available weight variant
        if (activeVariants.length > 0) {
          setSelectedVariant(activeVariants[0]);
          if (activeVariants[0].flavors && activeVariants[0].flavors.length > 0) {
            const activeFlavors = activeVariants[0].flavors.filter((f: any) => f.is_active);
            if (activeFlavors.length > 0) {
              setSelectedFlavor(activeFlavors[0]);
            }
          }
        }

        // 2. Query user's current wishlist state (same service used everywhere else)
        if (userId) {
          try {
            const currency = localStorage.getItem('currency') || 'KWD';
            const items = await getWishlist(userId, currency);
            const existingItem = items.find((item) => item.product_id === data.id);
            if (existingItem) {
              setIsWishlisted(true);
              setWishlistId(existingItem.id);
            } else {
              setIsWishlisted(false);
              setWishlistId(null);
            }
          } catch (err) {
            console.error("Error fetching wishlist status:", err);
          }
        }

      } catch (error) {
        console.error("Fetch Details Error:", error);
        toast.error("Bakery item not found");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndWishlistStatus();
  }, [id, navigate, userId]);

  // ── countdown ticker for promotion.end_date ──
  useEffect(() => {
    if (!product?.promotion?.end_date) {
      setTimeLeft('');
      return;
    }

    const updateCountdown = () => {
      const end = new Date(product.promotion!.end_date).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const pad = (n: number) => String(n).padStart(2, '0');

      if (days > 0) {
        setTimeLeft(`${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [product?.promotion?.end_date]);

  // --- CALCULATION LOGIC INCORPORATING BACKEND MODIFIERS ---
  // NOTE: promotion discount is already baked into product.price by the backend.
  // This function is untouched — it does NOT apply any promotion math.
  const getCalculatedPrice = () => {
    if (!product) return 0;

    let base = isRetailer
      ? (product.wholesaleprice ?? product.price)
      : product.price;

    if (selectedVariant)
      base += Number(selectedVariant.price_modifier || 0);

    if (selectedFlavor)
      base += Number(selectedFlavor.price_modifier || 0);

    selectedAddons.forEach((addon) => {
      base += Number(addon.price);
    });

    return base;
  };

  const displayPrice = getCalculatedPrice();
  const currencySymbol = product?.currency || 'INR';

  // Handle runtime option switches safely
  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
    const activeFlavors = (variant.flavors || []).filter(f => f.is_active);
    if (activeFlavors.length > 0) {
      setSelectedFlavor(activeFlavors[0]);
    } else {
      setSelectedFlavor(null);
    }
  };

  // ── Wishlist Toggle Controller (uses whishlistService, same as ProductCard) ──
  const handleWishlistToggle = async () => {
    if (!userId) {
      toast.error("Please login to save favorites.");
      navigate('/login');
      return;
    }
    if (!product || isSyncing) return;

    setIsSyncing(true);

    if (!isWishlisted) {
      try {
        const wishlistItem = await addToWishlist(userId, product.id);
        setIsWishlisted(true);
        setWishlistId(wishlistItem.id);
        toast.success("Added to favorites");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to add to wishlist");
      }
    } else {
      try {
        if (wishlistId != null) {
          await deleteWishlistItem(wishlistId);
        }
        setIsWishlisted(false);
        setWishlistId(null);
        toast.success("Removed from favorites");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Could not remove from wishlist");
      }
    }

    setIsSyncing(false);
  };

  // ── Add to Cart ──
  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please login to add items to cart.");
      navigate("/login");
      return;
    }
    if (!product) return;

    try {
      setCartLoading(true);

      await addToCart(
        userId,
        product.id,
        1,
        selectedVariant?.id,
        selectedFlavor?.id,
        selectedShape,
        selectedAddons
      );

      toast.success("Added to cart successfully! 🛒");
    } catch (error: any) {
      console.error("Cart Error:", error);
      toast.error(error?.response?.data?.error || "Failed to add item to cart");
    } finally {
      setCartLoading(false);
    }
  };

  // ── Buy Now ──
  const handleBuyNow = () => {
    if (!userId) {
      toast.error("Please login to purchase.");
      navigate('/login');
      return;
    }
    if (!product || !displayPrice) return;

    const buyNowItem = {
      product_id: product.id,
      name: product.name,
      image_url: product.image,
      price: displayPrice,
      currency: currencySymbol,
      quantity: 1,

      variant_id: selectedVariant?.id ?? null,
      variant_name: selectedVariant?.name ?? "",

      flavor_id: selectedFlavor?.id ?? null,
      flavor_name: selectedFlavor?.name ?? "",

      shape: selectedShape,

      addons: selectedAddons,
    };

    localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    navigate('/checkout', {
      state: {
        isBuyNow: true,
        items: [buyNowItem],
      },
    });
  };

  if (loading || !product || displayPrice === undefined) {
    return (
      <div className="bakery-pd-loader">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="loader-ring" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bakery-pd-wrapper">
        <div className="bakery-pd-container">

          {/* Top Navigation */}
          <div className="bakery-pd-nav">
            <button onClick={() => navigate(-1)} className="bakery-back-btn">
              <ArrowLeft size={18} /> <span>Back to Bakery</span>
            </button>
            <div className="bakery-pd-breadcrumb">
              <Link to="/">Home</Link> / <span>{product.categoryName}</span>
            </div>
          </div>

          <div className="bakery-pd-grid">

            {/* Left Column: Visuals */}
            <div className="bakery-pd-visuals">
              <div className="bakery-pd-main-frame">
                <div className="bakery-pd-ornate-box">
                  <div className="bakery-pd-image-clipper">
                    <motion.img
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={product.images[selectedImage]}
                      alt={product.name}
                    />
                  </div>
                </div>

                {/* Floating Actions */}
                <div className="bakery-pd-floating-actions">
                  <button
                    className={`action-circle ${isWishlisted ? 'active' : ''} ${isSyncing ? 'opacity-50' : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={isSyncing}
                  >
                    <Heart size={20} fill={isWishlisted ? "var(--color-rose)" : "none"} color={isWishlisted ? "var(--color-rose)" : "currentColor"} />
                  </button>
                  <button className="action-circle" onClick={() => navigator.share({ title: product.name, url: window.location.href })}>
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="bakery-pd-thumbs">
                  {product.images.map((img, i) => (
                    <div key={i} className={`thumb-item ${selectedImage === i ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                      <img src={img} alt="preview" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Content */}
            <div className="bakery-pd-content">
              <span className="bakery-pd-tag">{product.categoryName}</span>
              <h1 className="bakery-pd-title">{product.name}</h1>

              <div className="bakery-pd-meta">
                <div className="bakery-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--color-tan)" color="var(--color-tan)" />)}
                  <span>(12 Reviews)</span>
                </div>
                {product.stock > 0 ? (
                  <span className="bakery-stock in">● In Stock ({product.stock})</span>
                ) : (
                  <span className="bakery-stock out">● Out of Stock</span>
                )}
              </div>

              {/* Dynamic Price Box */}
              <div className="bakery-pd-price-box" style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <h2 className="bakery-pd-price" style={{ margin: 0 }}>
                  {displayPrice.toFixed(2)} {currencySymbol}
                </h2>
                {product.original_price && product.original_price > displayPrice && (
                  <span className="bakery-pd-original-price" style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.2rem' }}>
                    {product.original_price.toFixed(2)} {currencySymbol}
                  </span>
                )}
                {isRetailer && <span className="wholesale-label" style={{ marginLeft: '4px' }}>Wholesale Price Active</span>}
              </div>

              {/* Promotion display (read-only, no price math here) */}
              {product.promotion && product.promotion.is_active && (
                <div className="bakery-promo-banner">
                  <div className="bakery-promo-badge">
                    <Zap size={14} />
                    {product.promotion.promotion_type === 'DISCOUNT'
                      ? (product.promotion.discount_type === 'PERCENT'
                        ? `${product.promotion.discount_value}% OFF`
                        : `${product.promotion.discount_value} ${currencySymbol} OFF`)
                      : 'Free Gift Included'}
                  </div>
                  <span className="bakery-promo-name">{product.promotion.name}</span>
                  {timeLeft && <span className="bakery-promo-timer">⏳ {timeLeft}</span>}
                  {product.promotion.promotion_type === 'FREE_ITEM' &&
                    product.promotion.free_items.length > 0 && (
                      <div className="bakery-promo-freeitems">
                        {product.promotion.free_items.map(fi => (
                          <span key={fi.id}>🎁 {fi.product?.name || 'Item'} ×{fi.quantity}</span>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* --- INTERACTIVE ATTRIBUTE UI SECTIONS --- */}
              {product.variants.length > 0 && (
                <div className="bakery-attribute-section">
                  <h4 className="attribute-title">Select Weight / Size:</h4>
                  <div className="attribute-options-grid">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={`attribute-pill ${selectedVariant?.id === v.id ? 'active' : ''}`}
                        onClick={() => handleVariantChange(v)}
                      >
                        {v.name} {v.price_modifier > 0 ? `(+${v.price_modifier})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedVariant && selectedVariant.flavors && selectedVariant.flavors.filter(f => f.is_active).length > 0 && (
                <div className="bakery-attribute-section" style={{ marginTop: '16px' }}>
                  <h4 className="attribute-title">Select Flavor Choice:</h4>
                  <div className="attribute-options-grid">
                    {selectedVariant.flavors.filter(f => f.is_active).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`attribute-pill flavor ${selectedFlavor?.id === f.id ? 'active' : ''}`}
                        onClick={() => setSelectedFlavor(f)}
                      >
                        {f.name} {f.price_modifier > 0 ? `(+${f.price_modifier})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bakery-pd-description" style={{ marginTop: '24px' }}>
                <h3><Info size={18} /> The Baker's Note</h3>
                <p>{product.description}</p>
              </div>

              <div className="bakery-pd-ingredients">
                <h3><Leaf size={18} /> Product Profile / Ingredients</h3>
                <p className="ingredients-text-block" style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                  {product.ingredients}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="bakery-pd-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartLoading}
                >
                  {cartLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  <Zap size={20} /> Buy it Now
                </motion.button>
              </div>

              <div className="bakery-pd-features">
                <div className="feature-item">🥐 Fresh Daily</div>
                <div className="feature-item">🍓 Real Ingredients</div>
                <div className="feature-item">📦 Eco-Packaging</div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductDetails;