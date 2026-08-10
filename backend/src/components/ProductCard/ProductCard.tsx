import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Star, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ProductCard.css';
import { getWishlist, addToWishlist, deleteWishlistItem } from '../../services/whishlistService';
import { useCurrency } from '../../context/CurrencyContext';

// --- Promotion shape (matches actual /products API response) ---
interface Promotion {
  id: number;
  name: string;
  description?: string;
  discount_type: 'PERCENT' | 'FLAT' | 'AMOUNT' | string;
  discount_value: number;
  promotion_type: 'DISCOUNT' | 'FREE_ITEM' | string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  free_items?: any[];
}

// TypeScript Interface matching your Backend Object
interface ProductProp {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  wholesaleprice?: number;
  currency: string;
  image_url: string;
  category_name?: string;
  category?: {
    id: number;
    name: string;
  };
  promotion?: Promotion | null;
}

interface ProductCardProps {
  product: ProductProp;
  index: number;
  isRetailer: boolean;
  userId?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, isRetailer, userId }) => {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const effectiveUserId = userId ?? parsedUser?.id ?? null;

  // Determine base display price
  const displayPrice = isRetailer ? product.wholesaleprice || product.price : product.price;
  const currencySymbol = product.currency || 'AED';

  // --- Determine promotion label from the real `promotion` object ---
  const getPromoLabel = (): string | null => {
    const promo = product.promotion;
    if (!promo || !promo.is_active) return null;

    // Skip if the promo window has already ended
    if (promo.end_date && new Date(promo.end_date) < new Date()) return null;

    const hasFreeItems = Array.isArray(promo.free_items) && promo.free_items.length > 0;

    if (promo.promotion_type === 'FREE_ITEM' || hasFreeItems) {
      return 'FREE ITEM';
    }

    if (promo.discount_type === 'PERCENT') {
      return `${promo.discount_value}% OFF`;
    }

    // FLAT / AMOUNT or anything else numeric
    if (promo.discount_value) {
      return `${currencySymbol} ${promo.discount_value} OFF`;
    }

    return null;
  };

  const promoLabel = getPromoLabel();

  // Check if item is already wishlisted when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const items = await getWishlist(effectiveUserId, currency);
        const existingItem = items.find((item) => item.product_id === product.id);
        if (existingItem) {
          setIsWishlisted(true);
          setWishlistId(existingItem.id);
        }
      } catch (error) {
        console.error("Error fetching wishlist status:", error);
      }
    };
    if (effectiveUserId && product.id) checkWishlistStatus();
  }, [effectiveUserId, product.id, currency]);

  // Handle click toggle to Add/Remove from backend
  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);

    if (!effectiveUserId) {
      toast.error("Please log in to add items to your wishlist");
      navigate("/login"); // adjust to your actual login route
      setIsLoading(false);
      return;
    }

    if (!isWishlisted) {
      try {
        const wishlistItem = await addToWishlist(effectiveUserId, product.id);
        setIsWishlisted(true);
        setWishlistId(wishlistItem.id);
        toast.success("Added to favorites");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Something went wrong");
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
        toast.error(error?.response?.data?.message || "Could not remove item");
      }
    }
    setIsLoading(false);
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const productUrl = `${window.location.origin}/product/${product.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this product!\n\n${product.name}\nPrice: ${displayPrice.toFixed(2)} ${currencySymbol}`,
          url: productUrl,
        });
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast.success("Product link copied!");
      }
    } catch (err) {
     
    }
  };

  return (
    <motion.div
      className="bakery-card-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      {isRetailer && <div className="bakery-wholesale-tag">Wholesale</div>}

      {promoLabel && (
        <div className="bakery-promo-tag">
          <Tag size={11} />
          {promoLabel}
        </div>
      )}

      <div className="bakery-floating-actions">
        <button
          className={`bakery-action-btn ${isWishlisted ? 'active' : ''} ${isLoading ? 'opacity-50' : ''}`}
          onClick={handleWishlistToggle}
          disabled={isLoading}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button className="bakery-action-btn"
          onClick={handleShare}
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="bakery-card-frame" onClick={() => navigate(`/product/${product.id}`)}>
        <div className="bakery-card-image-wrapper">
          <img
            src={product.image_url}
            alt={product.name}
            className="bakery-card-image"
          />
        </div>

        <div className="bakery-card-content">
          <span className="bakery-card-category">{product.category_name || product.category?.name || 'Bakery'}</span>
          <h3 className="bakery-card-title">{product.name}</h3>

          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < 5 ? "var(--color-tan)" : "none"} color="var(--color-tan)" />
            ))}
          </div>

          <div className="bakery-card-price-row" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <span className="bakery-card-price" style={{ fontWeight: 'bold' }}>
              {displayPrice.toFixed(2)} {currencySymbol}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;