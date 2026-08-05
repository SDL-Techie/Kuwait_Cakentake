import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, AlertCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';
import { getOrdersByCustomer } from '@/src/services/orderService';
import { createPayment } from '@/src/services/paymentService';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface CategoryDetails {
  id: number;
  name: string;
}

interface ProductDetails {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: CategoryDetails;
}

interface OrderItem {
  id: number;
  price: number;
  quantity: number;
  product: ProductDetails | null;
  selectedAddOns?: string[];
  add_ons?: string[];
  addons?: string[];
  custom_json?: any;
}

interface OrderUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Order {
  id: number;
  status: string;
  total: number;
  currency?: string;
  coupon_id?: string | null;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  order_addons?: {
    addon_id: number;
    addon_name?: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  order_addons_total?: number;
  user?: OrderUser;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const getStatusBadgeClass = (status: string) => {
  const statusLower = (status || 'pending').toLowerCase();
  return `ct-status-badge ct-status-${statusLower}`;
};

const getItemAddOns = (item: OrderItem): string[] => {
  const rawAddOns =
    item.selectedAddOns ||
    item.add_ons ||
    item.addons ||
    item.custom_json?.selectedAddOns ||
    item.custom_json?.add_ons ||
    item.custom_json?.addons ||
    item.custom_json?.selected_add_ons;

  if (Array.isArray(rawAddOns)) {
    return rawAddOns.filter(Boolean).map(String);
  }

  if (typeof rawAddOns === 'string') {
    return rawAddOns.split(',').map((text) => text.trim()).filter(Boolean);
  }

  return [];
};

/* ─────────────────────────────────────────
   Order List Card Component
───────────────────────────────────────── */
  const OrderListCard: React.FC<{ order: Order }> = ({ order }) => {
  const currentCurrency = order.currency || 'INR';
  const symbol = currentCurrency === 'INR' ? '₹' : currentCurrency;

  // compute item subtotal and addons total as a fallback when backend does not include them
  const itemSubtotal = (order.items || []).reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  const addonsTotal = Number(order.order_addons_total ?? (order.order_addons ? order.order_addons.reduce((s, a) => s + Number(a.total || 0), 0) : 0));
  const computedTotal = Number(order.total) || (itemSubtotal + addonsTotal);

// const createPayment = async (
//   orderId: number,
//   gateway: "STRIPE" | "TAP"
// ) => {
//   try {
//     const token = localStorage.getItem("token");

//     const response = await axios.post(
//       "http://127.0.0.1:5000/payments/create-link",
//       {
//         order_id: orderId,
//         payment_gateway: gateway,
//         payment_method: gateway === "STRIPE" ? "CARD" : "KNET",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     window.location.href = response.data.payment_url;
//   } catch (err: any) {
//     alert(err.response?.data?.error || "Payment creation failed.");
//   }
// };

  return (
    <div className="ct-order-list-card">
      <div className="ct-card-header">
        <div className="ct-card-info">
          <h3 className="ct-card-title">Order #{String(order.id).padStart(6, '0')}</h3>
          {order.user?.first_name && order.user?.last_name && (
            <p className="ct-card-customer">Customer: {order.user.first_name} {order.user.last_name}</p>
          )}
          <p className="ct-card-date">{fmtDate(order.created_at)} at {fmtTime(order.created_at)}</p>
        </div>
        <span className={`ct-status-badge ${getStatusBadgeClass(order.status)}`}>
          {(order.status || 'pending').toUpperCase()}
        </span>
      </div>

      <div className="ct-card-body">
        <div className="ct-card-items">
          {order.items.length > 0 ? (
            <>
              {order.items.slice(0, 2).map((item, idx) => {
                const itemAddOns = getItemAddOns(item);
                return (
                  <div key={item.id || idx} className="ct-card-item">
                    <img 
                      className="ct-item-img" 
                      src={item.product?.image_url || 'Item'} 
                      alt={item.product?.name || 'Item'} 
                    />
                    <span className="ct-item-name">{item.product?.name || 'Item'}</span>
                    <span className="ct-item-qty">×{item.quantity}</span>
                    {itemAddOns.length > 0 && (
                      <span className="ct-item-addons">Add-ons: {itemAddOns.join(', ')}</span>
                    )}
                  </div>
                );
              })}
              {order.items.length > 2 && (
                <p className="ct-more-items">+{order.items.length - 2} more items</p>
              )}
              {addonsTotal > 0 && (
                <p className="ct-order-addons-summary">
                  Add-ons: {symbol}{Number(addonsTotal).toFixed(2)}
                </p>
              )}
            </>
          ) : (
            <p className="ct-no-items-text">No items</p>
          )}
        </div>
        
        <div className="ct-card-meta-details" style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
          <p><strong>Payment Method:</strong> {order.payment_method || 'N/A'}</p>
          <p><strong>Payment Status:</strong> {order.payment_status || 'Pending'}</p>
        </div>


        {order.status === "ACCEPTED" &&
 order.payment_status !== "PAID" && (
  <div className="payment-buttons">

    {/* <button
      className="stripe-btn"
      onClick={() => createPayment(order.id, "STRIPE")}
    >
      Pay with Card
    </button> */}

    {/* <button
      className="knet-btn"
      onClick={() => createPayment(order.id, "TAP")}
    >
      Pay with KNET
    </button> */}


<button
  className="stripe-btn"
  onClick={async () => {
    try {
      const res = await createPayment(order.id, "STRIPE");

 

      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        alert("No payment URL returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to create Stripe payment.");
    }
  }}
>
  Pay with Stripe(INR)
</button>

<button
  className="knet-btn"
  onClick={async () => {
    try {
      const res = await createPayment(order.id, "TAP");

  

      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        alert("No payment URL returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to create KNET payment.");
    }
  }}
>
  Pay with KNET(KWT)
</button>
  </div>
)}

        <div className="ct-card-footer">
          <p className="ct-card-total">{symbol}{Number(computedTotal).toFixed(2)}</p>
        </div>

      </div>
{/*       
        <div className='view-btn'>
          <Link to={"/trackorder"}>View</Link>
        </div> */}

        <div className='view-btn'>
  <Link to={`/track-order/${order.id}`}>View</Link>
</div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Orders Component
───────────────────────────────────────── */
const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);

//         // Fetching user verification variables directly matching your updated auth architecture
//         const userIdString = localStorage.getItem('userId');
//         const token = localStorage.getItem('token');
//         const userId = userIdString ? JSON.parse(userIdString) : null;

//         if (!userId || !token) {
//           setError('User not authenticated. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         // Request user orders using standard auth configurations if necessary
//         // const { data } = await axios.get<Order | Order[]>(
//         //   `http://127.0.0.1:5000/orders/user/${userId}`,
//         //   {
//         //     headers: {
//         //       Authorization: `Bearer ${token}`
//         //     }
//         //   }
//         // );

//         const data = await getOrdersByCustomer(userId);

//         const list = data.orders || [];

// setOrders(list);

        
//         const list = Array.isArray(data) ? data : [data];

//         // Sort descending by creation date
//         list.sort(
//           (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         );

//         setOrders(list);
//       } catch (err: any) {
//         console.error('Orders fetch error:', err);
//         setError(err.response?.data?.message ?? 'Could not load orders. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);


useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userId = Number(localStorage.getItem("userId"));

      if (!token || !userId) {
        setError("User not authenticated. Please login again.");
        return;
      }

      const response = await getOrdersByCustomer(userId);

      // Backend returns:
      // { orders: [...] }
      const list: Order[] = response.orders ?? [];

      // newest first
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setOrders(list);
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 403) {
        setError("You are not allowed to view these orders.");
      } else if (err.response?.status === 401) {
        setError("Please login again.");
      } else {
        setError(
          err.response?.data?.error ||
          "Could not load orders."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, []);

  /* Loading State */
  if (loading) {
    return (
      <div className="ct-page-center">
        <div className="ct-loader">
          <div className="ct-cake-icon">🍰</div>
          <Loader2 className="ct-spinner" size={40} />
        </div>
        <p className="ct-loading-text">Fetching your order history…</p>
      </div>
    );
  }

  /* Error State */
  if (error) {
    return (
      <div className="ct-orders-page">
        <div className="ct-orders-wrapper">
          <div className="ct-error-box">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <div className="ct-empty-state">
            <Package size={56} />
            <h2>Something went wrong</h2>
            <p>We couldn't reach the server. Check your connection and try again.</p>
            <Link to="/products" className="ct-cta-btn">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  /* Empty State */
  if (!orders.length || !orders[0]?.id) {
    return (
      <div className="ct-orders-page">
        <div className="ct-orders-wrapper">
          <div className="ct-empty-state">
            <ShoppingBag size={56} />
            <h2>No orders yet</h2>
            <p>Your order history will appear here after your first purchase.</p>
            <Link to="/products" className="ct-cta-btn">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  /* Orders List View */
  return (
    <div className="ct-orders-page">
      <div className="ct-orders-wrapper">
        <div className="ct-orders-header">
          <div>
            <h1>Your Orders</h1>
          </div>
          <div className="ct-order-count">
            <ShoppingBag size={16} />
            <span>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>
        </div>

        <div className="ct-orders-grid">
          {orders.map(order => (
            <OrderListCard
              key={order.id}
              order={order}
            />

          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;