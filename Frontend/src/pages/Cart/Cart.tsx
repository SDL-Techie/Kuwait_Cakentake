// import React, { useState, useEffect } from 'react';
// import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, Zap } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import './Cart.css';
// import { useCustomerAuth } from '@/src/context/CustomerAuthContext';
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
//   unit_price: number;         // already currency-converted by backend
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

//   // Default currency is KWD.
//   const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'KWD');

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

//   // React to currency changes made elsewhere in the app (e.g. a header currency switcher
//   // that writes to localStorage). Poll-free approach: listen for the 'storage' event,
//   // which fires on other tabs, plus a custom event you can dispatch from your currency switcher.
//   useEffect(() => {
//     const handleCurrencyChange = () => {
//       const newCurrency = localStorage.getItem('currency') || 'KWD';
//       setCurrency(newCurrency);
//     };
//     window.addEventListener('storage', handleCurrencyChange);
//     window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
//     window.addEventListener('currencychange', handleCurrencyChange as EventListener);
//     return () => {
//       window.removeEventListener('storage', handleCurrencyChange);
//       window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
//       window.removeEventListener('currencychange', handleCurrencyChange as EventListener);
//     };
//   }, []);

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
//       <div className="rasi-cart-loading-container">
//         <Loader2 className="rasi-cart-spinner" size={40} />
//         <p>Fetching your cart...</p>
//       </div>
//     );
//   }

//   if (!activeSession) {
//     return (
//       <div className="rasi-cart-empty-container">
//         <ShoppingBag size={64} />
//         <h2>Please Login</h2>
//         <p>Login to view and manage your shopping cart.</p>
//         <Link to="/login" className="rasi-cart-action-btn">Login Now</Link>
//       </div>
//     );
//   }

//   if (cartItems.length === 0) {
//     return (
//       <div className="rasi-cart-empty-container">
//         <ShoppingBag size={64} />
//         <h2>Your cart is empty!</h2>
//         <Link to="/products" className="rasi-cart-action-btn">Shop Now</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="rasi-cart-page">
//       <div className="rasi-cart-wrapper">
//         <div className="rasi-cart-main">
//           <div className="rasi-cart-header">
//             <h1>My Cart</h1>
//             <span className="rasi-cart-count">({cartItems.length} items)</span>
//           </div>

//           <div className="rasi-cart-items-list">
//             {cartItems.map(item => (
//               <div key={item.id} className="rasi-cart-item-card">
//                 <div className="rasi-cart-item-image-wrapper">
//                   <img src={item.image_url} alt={item.name} className="rasi-cart-item-image" />
//                 </div>

//                 <div className="rasi-cart-item-content">
//                   <div className="rasi-cart-item-header">
//                     <Link to={`/product/${item.product_id}`} className="rasi-cart-item-title">
//                       {item.name}
//                     </Link>
//                     <p className="rasi-cart-item-seller">Rasi Bakery</p>
//                   </div>

//                   {/* Customization summary — variant, flavor, shape, addons */}
//                   {(item.variant || item.flavor || item.shape || (item.addons && item.addons.length > 0)) && (
//                     <div className="rasi-cart-item-customizations">
//                       {item.variant && <span className="rasi-cart-tag">Size: {item.variant}</span>}
//                       {item.flavor && <span className="rasi-cart-tag">Flavor: {item.flavor}</span>}
//                       {item.shape && <span className="rasi-cart-tag">Shape: {item.shape}</span>}
//                       {item.addons && item.addons.length > 0 && (
//                         <span className="rasi-cart-tag">
//                           Add-ons: {item.addons.map(a => `${a.name} (+${symbol}${a.price})`).join(', ')}
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   <div className="rasi-cart-item-price-section">
//                     <div className="rasi-cart-price-group">
//                       <span className="rasi-cart-unit-price">{symbol}{item.unit_price}</span>
//                       <span className="rasi-cart-subtotal">
//                         Subtotal: {symbol}{item.subtotal}
//                       </span>
//                     </div>

//                     <div className="rasi-cart-qty-control">
//                       <button
//                         className="rasi-cart-qty-btn"
//                         onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                         disabled={item.quantity <= 1 || updatingId === item.id}
//                         title="Decrease quantity"
//                       >
//                         <Minus size={16} />
//                       </button>
//                       <input
//                         type="number"
//                         className="rasi-cart-qty-input"
//                         value={item.quantity}
//                         onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
//                         min="1"
//                       />
//                       <button
//                         className="rasi-cart-qty-btn"
//                         onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                         disabled={updatingId === item.id}
//                         title="Increase quantity"
//                       >
//                         <Plus size={16} />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="rasi-cart-item-actions">
//                     <button className="rasi-cart-buy-btn" onClick={() => handleBuyNow(item)}>
//                       <Zap size={14} /> BUY NOW
//                     </button>
//                     <button className="rasi-cart-delete-btn" onClick={() => handleRemove(item.id)}>
//                       <Trash2 size={14} /> REMOVE
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="rasi-cart-continue-section">
//             <Link to="/products" className="rasi-cart-continue-btn">
//               <ArrowLeft size={18} /> CONTINUE SHOPPING
//             </Link>
//           </div>
//         </div>

//         <div className="rasi-cart-summary-panel">
//           <h2 className="rasi-summary-title">PRICE DETAILS</h2>

//           <div className="rasi-summary-content">
//             <div className="rasi-summary-row">
//               <span>Price ({cartItems.length} items)</span>
//               <span>{symbol}{subtotal.toFixed(2)}</span>
//             </div>
//             <div className="rasi-summary-divider" />
//             <div className="rasi-summary-row rasi-summary-total">
//               <span>Total Amount</span>
//               <span>{symbol}{total.toFixed(2)}</span>
//             </div>
//           </div>

//           <button className="rasi-checkout-button" onClick={handlePlaceOrder}>
//             PLACE ORDER ({cartItems.length} items)
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;



import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Cart.css';
import { useCustomerAuth } from '@/src/context/CustomerAuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getCart, updateCartItem, removeCartItem } from '../../services/cartService';

interface CartAddon {
  id: number;
  name: string;
  price: number;
}

interface CartItem {
  id: number;                 // cart item id
  product_id: number;
  name: string;
  image_url: string;

  variant_id: number | null;
  variant: string | null;

  flavor_id: number | null;
  flavor: string | null;

  shape: string | null;
  addons: CartAddon[];

  
  quantity: number;
  unit_price: number; 
  original_price: number;     // ← ADD
  has_discount: boolean;        // already currency-converted by backend
  subtotal: number;           // already currency-converted by backend
  currency: string;
}

const Cart: React.FC = () => {
  const { customer, isLoggedIn } = useCustomerAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
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

  const { currency, setCurrency } = useCurrency();

  const currencySymbol: Record<string, string> = {
    INR: '₹',
    USD: '$',
    AED: 'AED ',
    SAR: 'SAR ',
    KWD: 'KWD ',
  };
  const symbol = currencySymbol[currency] || `${currency} `;

  const fetchCart = async (curr: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getCart(Number(userId), curr);
      if (data && data.items) {
        setCartItems(data.items as CartItem[]);
      } else {
        setCartItems([]);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setCartItems([]);
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
  }, [userId, currency]);

  // React to currency changes made elsewhere in the app (e.g. a header currency switcher
  // that writes to localStorage). Poll-free approach: listen for the 'storage' event,
  // which fires on other tabs, plus a custom event you can dispatch from your currency switcher.

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);
    try {
      await updateCartItem(itemId, newQty);
      await fetchCart(currency);
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeCartItem(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Remove failed');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const delivery = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal;

  const buildCheckoutItem = (item: CartItem) => ({
    product_id: item.product_id,
    id: item.product_id,
    name: item.name,
    price: item.unit_price,
    image_url: item.image_url,
    quantity: item.quantity,
    variant_id: item.variant_id,
    variant_name: item.variant,
    flavor_id: item.flavor_id,
    flavor_name: item.flavor,
    shape: item.shape,
    addons: item.addons,
    currency,
  });

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    const checkoutItems = cartItems.map(buildCheckoutItem);
    navigate('/checkout', {
      state: { items: checkoutItems, subtotal, delivery, total, currency },
    });
  };

  const handleBuyNow = (item: CartItem) => {
    const checkoutItem = buildCheckoutItem(item);
    const itemTotal = item.subtotal;
    const itemDelivery = itemTotal > 500 ? 0 : 50;

    navigate('/checkout', {
      state: {
        items: [checkoutItem],
        subtotal: itemTotal,
        delivery: itemDelivery,
        total: itemTotal + itemDelivery,
        isBuyNow: true,
        currency,
      },
    });
  };

  if (loading) {
    return (
      <div className="rasi-cart-loading-container">
        <Loader2 className="rasi-cart-spinner" size={40} />
        <p>Fetching your cart...</p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="rasi-cart-empty-container">
        <ShoppingBag size={64} />
        <h2>Please Login</h2>
        <p>Login to view and manage your shopping cart.</p>
        <Link to="/login" className="rasi-cart-action-btn">Login Now</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="rasi-cart-empty-container">
        <ShoppingBag size={64} />
        <h2>Your cart is empty!</h2>
        <Link to="/products" className="rasi-cart-action-btn">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="rasi-cart-page">
      <div className="rasi-cart-wrapper">
        <div className="rasi-cart-main">
          <div className="rasi-cart-header">
            <h1>My Cart</h1>
            <span className="rasi-cart-count">({cartItems.length} items)</span>
          </div>

          <div className="rasi-cart-items-list">
            {cartItems.map(item => (
              <div key={item.id} className="rasi-cart-item-card">
                <div className="rasi-cart-item-image-wrapper">
                  <img src={item.image_url} alt={item.name} className="rasi-cart-item-image" />
                </div>

                <div className="rasi-cart-item-content">
                  <div className="rasi-cart-item-header">
                    <Link to={`/product/${item.product_id}`} className="rasi-cart-item-title">
                      {item.name}
                    </Link>
                    <p className="rasi-cart-item-seller">Rasi Bakery</p>
                  </div>

                  {/* Customization summary — variant, flavor, shape, addons */}
                  {(item.variant || item.flavor || item.shape || (item.addons && item.addons.length > 0)) && (
                    <div className="rasi-cart-item-customizations">
                      {item.variant && <span className="rasi-cart-tag">Size: {item.variant}</span>}
                      {item.flavor && <span className="rasi-cart-tag">Flavor: {item.flavor}</span>}
                      {item.shape && <span className="rasi-cart-tag">Shape: {item.shape}</span>}
                      {item.addons && item.addons.length > 0 && (
                        <span className="rasi-cart-tag">
                          Add-ons: {item.addons.map(a => `${a.name} (+${symbol}${a.price})`).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
{/* 
                  <div className="rasi-cart-item-price-section">
                    <div className="rasi-cart-price-group">
                      <span className="rasi-cart-unit-price">{symbol}{item.unit_price}</span>
                      <span className="rasi-cart-subtotal">
                        Subtotal: {symbol}{item.subtotal}
                      </span>
                    </div>

                    <div className="rasi-cart-qty-control">
                      <button
                        className="rasi-cart-qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingId === item.id}
                        title="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        className="rasi-cart-qty-input"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button
                        className="rasi-cart-qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        title="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div> */}


                  <div className="rasi-cart-price-group">
  <div className="rasi-cart-price-row">
    {item.has_discount && (
      <span className="rasi-cart-original-price">
        {symbol}{item.original_price.toFixed(2)}
      </span>
    )}
    <span className="rasi-cart-unit-price">{symbol}{item.unit_price.toFixed(2)}</span>
  </div>
  <span className="rasi-cart-subtotal">
    Subtotal: {symbol}{item.subtotal.toFixed(2)}
  </span>
</div>

                  <div className="rasi-cart-item-actions">
                    <button className="rasi-cart-buy-btn" onClick={() => handleBuyNow(item)}>
                      <Zap size={14} /> BUY NOW
                    </button>
                    <button className="rasi-cart-delete-btn" onClick={() => handleRemove(item.id)}>
                      <Trash2 size={14} /> REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rasi-cart-continue-section">
            <Link to="/products" className="rasi-cart-continue-btn">
              <ArrowLeft size={18} /> CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        <div className="rasi-cart-summary-panel">
          <h2 className="rasi-summary-title">PRICE DETAILS</h2>

          <div className="rasi-summary-content">
            <div className="rasi-summary-row">
              <span>Price ({cartItems.length} items)</span>
              <span>{symbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="rasi-summary-divider" />
            <div className="rasi-summary-row rasi-summary-total">
              <span>Total Amount</span>
              <span>{symbol}{total.toFixed(2)}</span>
            </div>
          </div>

          <button className="rasi-checkout-button" onClick={handlePlaceOrder}>
            PLACE ORDER ({cartItems.length} items)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;