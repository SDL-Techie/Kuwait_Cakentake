
// import React, { useState, useEffect } from 'react';
// import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, Zap } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import './Cart.css';
// import { useCustomerAuth } from '@/src/context/CustomerAuthContext';
// import { useCurrency } from '../../context/CurrencyContext';
// import { getCart, updateCartItem, removeCartItem } from '../../services/cartService';

// interface CartAddon {
//   id: number;
//   name: string;
//   price: number;
// }

// interface CartItem {
//   id: number;                 // cart item id
//   product_id: number;
//   name: string;
//   image_url: string;

//   variant_id: number | null;
//   variant: string | null;

//   flavor_id: number | null;
//   flavor: string | null;

//   shape: string | null;
//   addons: CartAddon[];

//   quantity: number;
//   unit_price: number;
//   original_price: number;
//   has_discount: boolean;      // already currency-converted by backend
//   subtotal: number;           // already currency-converted by backend
//   currency: string;
// }

// const Cart: React.FC = () => {
//   const { customer, isLoggedIn } = useCustomerAuth();
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState<number | null>(null);
//   const navigate = useNavigate();

//   const getUserId = (): string | null => {
//     const storedId = localStorage.getItem('userId');
//     if (!storedId) return null;
//     try {
//       return JSON.parse(storedId);
//     } catch {
//       return storedId;
//     }
//   };

//   const userId = customer?.id || getUserId();
//   const activeSession = isLoggedIn || !!userId;

//   const { currency, setCurrency } = useCurrency();

//   const currencySymbol: Record<string, string> = {
//     INR: '₹',
//     USD: '$',
//     AED: 'AED ',
//     SAR: 'SAR ',
//     KWD: 'KWD ',
//   };
//   const symbol = currencySymbol[currency] || `${currency} `;

//   const fetchCart = async (curr: string) => {
//     if (!userId) {
//       setLoading(false);
//       return;
//     }
//     try {
//       const data = await getCart(Number(userId), curr);
//       if (data && data.items) {
//         setCartItems(data.items as CartItem[]);
//       } else {
//         setCartItems([]);
//       }
//     } catch (error: any) {
//       if (error.response && error.response.status === 404) {
//         setCartItems([]);
//       } else {
//         toast.error('Failed to load cart');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     setLoading(true);
//     fetchCart(currency);
//   }, [userId, currency]);

//   const handleQuantityChange = async (itemId: number, newQty: number) => {
//     if (newQty < 1) return;
//     setUpdatingId(itemId);
//     try {
//       await updateCartItem(itemId, newQty);
//       await fetchCart(currency);
//     } catch (error) {
//       toast.error('Update failed');
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const handleRemove = async (itemId: number) => {
//     try {
//       await removeCartItem(itemId);
//       setCartItems(prev => prev.filter(item => item.id !== itemId));
//       toast.success('Removed from cart');
//     } catch (error) {
//       toast.error('Remove failed');
//     }
//   };

//   const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
//   const delivery = subtotal > 500 || subtotal === 0 ? 0 : 50;
//   const total = subtotal;

//   const buildCheckoutItem = (item: CartItem) => ({
//     product_id: item.product_id,
//     id: item.product_id,
//     name: item.name,
//     price: item.unit_price,
//     image_url: item.image_url,
//     quantity: item.quantity,
//     variant_id: item.variant_id,
//     variant_name: item.variant,
//     flavor_id: item.flavor_id,
//     flavor_name: item.flavor,
//     shape: item.shape,
//     addons: item.addons,
//     currency,
//   });

//   const handlePlaceOrder = () => {
//     if (cartItems.length === 0) {
//       toast.error('Cart is empty');
//       return;
//     }
//     const checkoutItems = cartItems.map(buildCheckoutItem);
//     navigate('/checkout', {
//       state: { items: checkoutItems, subtotal, delivery, total, currency },
//     });
//   };

//   const handleBuyNow = (item: CartItem) => {
//     const checkoutItem = buildCheckoutItem(item);
//     const itemTotal = item.subtotal;
//     const itemDelivery = itemTotal > 500 ? 0 : 50;

//     navigate('/checkout', {
//       state: {
//         items: [checkoutItem],
//         subtotal: itemTotal,
//         delivery: itemDelivery,
//         total: itemTotal + itemDelivery,
//         isBuyNow: true,
//         currency,
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="cart-loading-container">
//         <Loader2 className="cart-spinner" size={40} />
//         <p>Fetching your cart...</p>
//       </div>
//     );
//   }

//   if (!activeSession) {
//     return (
//       <div className="cart-empty-container">
//         <ShoppingBag size={64} />
//         <h2>Please Login</h2>
//         <p>Login to view and manage your shopping cart.</p>
//         <Link to="/login" className="cart-action-btn">Login Now</Link>
//       </div>
//     );
//   }

//   if (cartItems.length === 0) {
//     return (
//       <div className="cart-empty-container">
//         <ShoppingBag size={64} />
//         <h2>Your cart is empty!</h2>
//         <Link to="/products" className="cart-action-btn">Shop Now</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="cart-page">
//       <div className="cart-wrapper">
//         <div className="cart-main">
//           <div className="cart-header">
//             <h1>My Cart</h1>
//             <span className="cart-count">({cartItems.length} items)</span>
//           </div>

//           <div className="cart-items-list">
//             {cartItems.map(item => (
//               <div key={item.id} className="cart-item-card">
//                 <div className="cart-item-image-wrapper">
//                   <img src={item.image_url} alt={item.name} className="cart-item-image" />
//                 </div>

//                 <div className="cart-item-content">
//                   <div className="cart-item-header">
//                     <Link to={`/product/${item.product_id}`} className="cart-item-title">
//                       {item.name}
//                     </Link>
//                     <p className="cart-item-seller">CakenTake</p>
//                   </div>

//                   {/* Customization summary — variant, flavor, shape, addons */}
//                   {(item.variant || item.flavor || item.shape || (item.addons && item.addons.length > 0)) && (
//                     <div className="cart-item-customizations">
//                       {item.variant && <span className="cart-tag">Size: {item.variant}</span>}
//                       {item.flavor && <span className="cart-tag">Flavor: {item.flavor}</span>}
//                       {item.shape && <span className="cart-tag">Shape: {item.shape}</span>}
//                       {item.addons && item.addons.length > 0 && (
//                         <span className="cart-tag">
//                           Add-ons: {item.addons.map(a => `${a.name} (+${symbol}${a.price})`).join(', ')}
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   <div className="cart-price-group">
//                     <div className="cart-price-row">
//                       {item.has_discount && (
//                         <span className="cart-original-price">
//                           {symbol}{item.original_price.toFixed(2)}
//                         </span>
//                       )}
//                       <span className="cart-unit-price">{symbol}{item.unit_price.toFixed(2)}</span>
//                     </div>
//                     <span className="cart-subtotal">
//                       Subtotal: {symbol}{item.subtotal.toFixed(2)}
//                     </span>
//                   </div>

//                   <div className="cart-item-actions">
//                     <button className="cart-buy-btn" onClick={() => handleBuyNow(item)}>
//                       <Zap size={14} /> BUY NOW
//                     </button>
//                     <button className="cart-delete-btn" onClick={() => handleRemove(item.id)}>
//                       <Trash2 size={14} /> REMOVE
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="cart-continue-section">
//             <Link to="/products" className="cart-continue-btn">
//               <ArrowLeft size={18} /> CONTINUE SHOPPING
//             </Link>
//           </div>
//         </div>

//         <div className="cart-summary-panel">
//           <h2 className="summary-title">PRICE DETAILS</h2>

//           <div className="summary-content">
//             <div className="summary-row">
//               <span>Price ({cartItems.length} items)</span>
//               <span>{symbol}{subtotal.toFixed(2)}</span>
//             </div>
//             <div className="summary-divider" />
//             <div className="summary-row summary-total">
//               <span>Total Amount</span>
//               <span>{symbol}{total.toFixed(2)}</span>
//             </div>
//           </div>

//           <button className="checkout-button" onClick={handlePlaceOrder}>
//             PLACE ORDER ({cartItems.length} items)
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;


import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, Zap, PenLine, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Cart.css';
import { useCustomerAuth } from '@/src/context/CustomerAuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  getCart,
  updateCartItem,
  removeCartItem,
  cartCurrency,
  CAKE_MESSAGE_MAX,
} from '../../services/cartService';

/* ==========================================================================
   Cart — same behaviour as the mobile app:
   • every cart line can carry its own "Message on Cake" (max 80 chars),
     edited right here and saved to the backend
   • quantity + / − per line
   • the message travels to checkout and is saved on the order item, so the
     kitchen sees it as "Writing"
   ========================================================================== */

interface CartAddon {
  id: number;
  name: string;
  price: number;
}

interface CartItem {
  id: number; // cart item id
  product_id: number;
  name: string;
  image_url: string;

  variant_id: number | null;
  variant: string | null;

  flavor_id: number | null;
  flavor: string | null;

  shape: string | null;
  message_on_cake: string;
  addons: CartAddon[];

  quantity: number;
  unit_price: number;
  original_price: number | null;
  has_discount: boolean; // already currency-converted by backend
  subtotal: number; // already currency-converted by backend
  currency: string;
}

type SaveState = 'idle' | 'saving' | 'saved';

const Cart: React.FC = () => {
  const { customer, isLoggedIn } = useCustomerAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  // Local text while typing, keyed by cart item id.
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [saveState, setSaveState] = useState<Record<number, SaveState>>({});
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const navigate = useNavigate();

  const getUserId = (): string | null => {
    const storedId = localStorage.getItem('userId');
    if (!storedId) return null;
    try {
      return JSON.parse(storedId);
    } catch {
      return storedId;
    }
  };

  const userId = customer?.id || getUserId();
  const activeSession = isLoggedIn || !!userId;

  const { currency: siteCurrency } = useCurrency();
  // The cart only supports KWD / AED / USD / INR (falls back to KWD).
  const currency = cartCurrency(siteCurrency);

  const currencySymbol: Record<string, string> = {
    INR: '₹',
    USD: '$',
    AED: 'AED ',
    KWD: 'KWD ',
  };
  const symbol = currencySymbol[currency] || `${currency} `;
  const decimals = currency === 'KWD' ? 3 : 2;
  const fmt = (n: number | null | undefined) => `${symbol}${Number(n || 0).toFixed(decimals)}`;

  const fetchCart = async (curr: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getCart(Number(userId), curr);
      const items: CartItem[] = data?.items || [];
      setCartItems(items);
      setCartTotal(typeof data?.total === 'number' ? data.total : null);
      setDrafts(Object.fromEntries(items.map((i) => [i.id, i.message_on_cake || ''])));
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setCartItems([]);
        setCartTotal(null);
      } else if (error.response?.status === 401) {
        toast.error('Please login again to see your cart');
      } else {
        toast.error('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCart(currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currency]);

  useEffect(() => {
    const timers = saveTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);
    try {
      await updateCartItem(itemId, { quantity: newQty });
      await fetchCart(currency);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Save the cake message (called on blur, or 800 ms after typing stops).
  const saveMessage = async (item: CartItem) => {
    const text = (drafts[item.id] ?? '').trim();
    if (text === (item.message_on_cake || '').trim()) return;
    setSaveState((s) => ({ ...s, [item.id]: 'saving' }));
    try {
      const res = await updateCartItem(item.id, { message_on_cake: text });
      if (res?.merged) {
        // The line now matches another identical line — reload the cart.
        toast.success('Merged with an identical cake in your cart');
        await fetchCart(currency);
      } else {
        setCartItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, message_on_cake: text } : i)));
      }
      setSaveState((s) => ({ ...s, [item.id]: 'saved' }));
      setTimeout(() => setSaveState((s) => ({ ...s, [item.id]: 'idle' })), 1500);
    } catch (error: any) {
      setSaveState((s) => ({ ...s, [item.id]: 'idle' }));
      toast.error(error?.response?.data?.error || 'Could not save the cake message');
    }
  };

  const handleMessageChange = (item: CartItem, value: string) => {
    setDrafts((d) => ({ ...d, [item.id]: value.slice(0, CAKE_MESSAGE_MAX) }));
    clearTimeout(saveTimers.current[item.id]);
    saveTimers.current[item.id] = setTimeout(() => {
      saveMessage({ ...item });
    }, 800);
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeCartItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setCartTotal(null);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Remove failed');
    }
  };

  const subtotal = cartTotal ?? cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const delivery = 0; // delivery charge is worked out at checkout from the address
  const total = subtotal;
  const totalCakes = cartItems.reduce((n, i) => n + i.quantity, 0);

  const buildCheckoutItem = (item: CartItem) => ({
    _id: `cart-${item.id}`,
    cart_item_id: item.id,
    product_id: item.product_id,
    id: item.product_id,
    name: item.name,
    price: item.unit_price,
    original_price: item.has_discount ? item.original_price : null,
    image_url: item.image_url,
    quantity: item.quantity,
    variant_id: item.variant_id,
    variant_name: item.variant,
    flavor_id: item.flavor_id,
    flavor_name: item.flavor,
    shape: item.shape,
    addons: item.addons,
    // Use the text on screen, even if the auto-save is still pending.
    message_on_cake: (drafts[item.id] ?? item.message_on_cake ?? '').trim(),
    currency,
  });

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    // Flush any message still waiting for its auto-save.
    cartItems.forEach((item) => {
      clearTimeout(saveTimers.current[item.id]);
      saveMessage(item);
    });
    const checkoutItems = cartItems.map(buildCheckoutItem);
    navigate('/checkout', {
      state: { items: checkoutItems, subtotal, delivery, total, currency, fromCart: true },
    });
  };

  const handleBuyNow = (item: CartItem) => {
    clearTimeout(saveTimers.current[item.id]);
    saveMessage(item);
    const checkoutItem = buildCheckoutItem(item);
    navigate('/checkout', {
      state: {
        items: [checkoutItem],
        subtotal: item.subtotal,
        delivery: 0,
        total: item.subtotal,
        isBuyNow: true,
        currency,
      },
    });
  };

  if (loading) {
    return (
      <div className="cart-loading-container">
        <Loader2 className="cart-spinner" size={40} />
        <p>Fetching your cart...</p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="cart-empty-container">
        <ShoppingBag size={64} />
        <h2>Please Login</h2>
        <p>Login to view and manage your shopping cart.</p>
        <Link to="/login" className="cart-action-btn">
          Login Now
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <ShoppingBag size={64} />
        <h2>Your cart is empty!</h2>
        <Link to="/products" className="cart-action-btn">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        <div className="cart-main">
          <div className="cart-header">
            <div>
              <span className="cart-eyebrow">Your order</span>
              <h1>My Cart</h1>
              <p className="cart-sub">Review your cakes before checkout.</p>
            </div>
            <span className="cart-count">
              ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} · {totalCakes}{' '}
              {totalCakes === 1 ? 'cake' : 'cakes'})
            </span>
          </div>

          <div className="cart-items-list">
            <AnimatePresence initial={false}>
              {cartItems.map((item, idx) => {
                const draft = drafts[item.id] ?? item.message_on_cake ?? '';
                const state = saveState[item.id] || 'idle';
                return (
                  <motion.div
                    key={item.id}
                    className="cart-item-card"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                  >
                    <div className="cart-item-image-wrapper">
                      <img src={item.image_url} alt={item.name} className="cart-item-image" />
                    </div>

                    <div className="cart-item-content">
                      <div className="cart-item-header">
                        <Link to={`/product/${item.product_id}`} className="cart-item-title">
                          {item.name}
                        </Link>
                        <p className="cart-item-seller">CakenTake</p>
                      </div>

                      {(item.variant || item.flavor || item.shape || (item.addons && item.addons.length > 0)) && (
                        <div className="cart-item-customizations">
                          {item.variant && <span className="cart-tag">Size: {item.variant}</span>}
                          {item.flavor && <span className="cart-tag">Flavor: {item.flavor}</span>}
                          {item.shape && <span className="cart-tag">Shape: {item.shape}</span>}
                          {item.addons && item.addons.length > 0 && (
                            <span className="cart-tag">
                              Add-ons: {item.addons.map((a) => `${a.name} (+${fmt(a.price)})`).join(', ')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message on cake — editable, auto-saved */}
                      <div className="cart-message-box">
                        <div className="cart-message-head">
                          <span>
                            <PenLine size={13} /> Message on Cake
                          </span>
                          <small>Your personal cake inscription</small>
                        </div>
                        <textarea
                          rows={2}
                          maxLength={CAKE_MESSAGE_MAX}
                          placeholder="e.g. Happy Birthday (optional)"
                          value={draft}
                          onChange={(e) => handleMessageChange(item, e.target.value)}
                          onBlur={() => {
                            clearTimeout(saveTimers.current[item.id]);
                            saveMessage(item);
                          }}
                        />
                        <div className="cart-message-foot">
                          <span className={`cart-message-state is-${state}`}>
                            {state === 'saving' && (
                              <>
                                <Loader2 size={11} className="cart-spinner" /> Saving…
                              </>
                            )}
                            {state === 'saved' && (
                              <>
                                <Check size={11} /> Saved
                              </>
                            )}
                            {state === 'idle' && (draft ? '♡ Written with love' : 'No message')}
                          </span>
                          <span>
                            {draft.length}/{CAKE_MESSAGE_MAX}
                          </span>
                        </div>
                      </div>

                      <div className="cart-price-group">
                        <div className="cart-price-row">
                          {item.has_discount && item.original_price != null && (
                            <span className="cart-original-price">{fmt(item.original_price)}</span>
                          )}
                          <span className="cart-unit-price">{fmt(item.unit_price)}</span>
                        </div>
                        <span className="cart-subtotal">Subtotal: {fmt(item.subtotal)}</span>
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-qty">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingId === item.id}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span>{updatingId === item.id ? <Loader2 size={14} className="cart-spinner" /> : item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updatingId === item.id}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="cart-buy-btn" onClick={() => handleBuyNow(item)}>
                          <Zap size={14} /> BUY NOW
                        </button>
                        <button className="cart-delete-btn" onClick={() => handleRemove(item.id)}>
                          <Trash2 size={14} /> REMOVE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="cart-continue-section">
            <Link to="/products" className="cart-continue-btn">
              <ArrowLeft size={18} /> CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        <div className="cart-summary-panel">
          <h2 className="summary-title">ORDER SUMMARY</h2>

          <div className="summary-content">
            <div className="summary-row">
              <span>
                Price ({totalCakes} {totalCakes === 1 ? 'cake' : 'cakes'})
              </span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="summary-row summary-muted">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Grand Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <button className="checkout-button" onClick={handlePlaceOrder}>
            CHECKOUT ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;