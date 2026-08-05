import {api} from './api'; // your existing configured axios instance

// Default currency is KWD per your app's requirement.
const getCurrency = () => localStorage.getItem('currency') || 'KWD';

// export const addToCart = async (
//   userId: number,
//   productId: number,
//   quantity: number,
//   variantId?: number | null,
//   flavorId?: number | null,
//   shape?: string,
//   addons: any[] = []
// ) => {
//   const currency = getCurrency();

//   const res = await api.post(
//     '/cart',
//     {
//       user_id: userId,
//       product_id: productId,
//       quantity,
//       variant_id: variantId ?? null,
//       flavor_id: flavorId ?? null,
//       shape: shape ?? null,
//       // Only send IDs — backend recomputes price itself, never trust client price.
//       addons: addons.map(a => ({ id: a.id })),
//     },
//     { headers: { 'X-Currency': currency } }
//   );
//   return res.data;
// };


export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number
) => {
  const currency = getCurrency();

  const res = await api.post(
    '/cart',
    {
      user_id: userId,
      product_id: productId,
      quantity,
    },
    { headers: { 'X-Currency': currency } }
  );
  return res.data;
};

export const getCart = async (userId: number, currency?: string) => {
  const res = await api.get(`/cart/${userId}`, {
    headers: { 'X-Currency': currency || getCurrency() },
  });
  return res.data;
};

export const updateCartItem = async (itemId: number, quantity: number) => {
  const res = await api.put(`/cart/item/${itemId}`, { quantity });
  return res.data;
};

export const removeCartItem = async (itemId: number) => {
  const res = await api.delete(`/cart/item/${itemId}`);
  return res.data;
};

export const clearCart = async (userId: number) => {
  const res = await api.delete(`/cart/${userId}`);
  return res.data;
};

// --- Wishlist (same currency-header pattern, since backend now respects it too) ---

export const addToWishlist = async (userId: number, productId: number) => {
  const res = await api.post(
    '/api/wishlist',
    { user_id: userId, product_id: productId },
    { headers: { 'X-Currency': getCurrency() } }
  );
  return res.data;
};

export const getWishlist = async (userId: number, currency?: string) => {
  const res = await api.get(`/api/wishlist/${userId}`, {
    headers: { 'X-Currency': currency || getCurrency() },
  });
  return res.data;
};

export const removeFromWishlist = async (wishlistId: number) => {
  const res = await api.delete(`/api/wishlist/${wishlistId}`);
  return res.data;
};