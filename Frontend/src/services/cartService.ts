// import {api} from './api'; // your existing configured axios instance

// // Default currency is KWD per your app's requirement.
// const getCurrency = () => localStorage.getItem('currency') || 'KWD';

// // export const addToCart = async (
// //   userId: number,
// //   productId: number,
// //   quantity: number,
// //   variantId?: number | null,
// //   flavorId?: number | null,
// //   shape?: string,
// //   addons: any[] = []
// // ) => {
// //   const currency = getCurrency();

// //   const res = await api.post(
// //     '/cart',
// //     {
// //       user_id: userId,
// //       product_id: productId,
// //       quantity,
// //       variant_id: variantId ?? null,
// //       flavor_id: flavorId ?? null,
// //       shape: shape ?? null,
// //       // Only send IDs — backend recomputes price itself, never trust client price.
// //       addons: addons.map(a => ({ id: a.id })),
// //     },
// //     { headers: { 'X-Currency': currency } }
// //   );
// //   return res.data;
// // };


// export const addToCart = async (
//   userId: number,
//   productId: number,
//   quantity: number
// ) => {
//   const currency = getCurrency();

//   const res = await api.post(
//     '/cart',
//     {
//       user_id: userId,
//       product_id: productId,
//       quantity,
//     },
//     { headers: { 'X-Currency': currency } }
//   );
//   return res.data;
// };

// export const getCart = async (userId: number, currency?: string) => {
//   const res = await api.get(`/cart/${userId}`, {
//     headers: { 'X-Currency': currency || getCurrency() },
//   });
//   return res.data;
// };

// export const updateCartItem = async (itemId: number, quantity: number) => {
//   const res = await api.put(`/cart/item/${itemId}`, { quantity });
//   return res.data;
// };

// export const removeCartItem = async (itemId: number) => {
//   const res = await api.delete(`/cart/item/${itemId}`);
//   return res.data;
// };

// export const clearCart = async (userId: number) => {
//   const res = await api.delete(`/cart/${userId}`);
//   return res.data;
// };

// // --- Wishlist (same currency-header pattern, since backend now respects it too) ---

// export const addToWishlist = async (userId: number, productId: number) => {
//   const res = await api.post(
//     '/api/wishlist',
//     { user_id: userId, product_id: productId },
//     { headers: { 'X-Currency': getCurrency() } }
//   );
//   return res.data;
// };

// export const getWishlist = async (userId: number, currency?: string) => {
//   const res = await api.get(`/api/wishlist/${userId}`, {
//     headers: { 'X-Currency': currency || getCurrency() },
//   });
//   return res.data;
// };

// export const removeFromWishlist = async (wishlistId: number) => {
//   const res = await api.delete(`/api/wishlist/${wishlistId}`);
//   return res.data;
// };


import { api } from './api'; // your existing configured axios instance

/* ==========================================================================
   Cart service — matches the backend cart API (routes/cart_route.py)

   • Every call needs the login token (added automatically by api.ts).
   • The cart accepts only KWD / AED / USD / INR. Any other currency the
     site is showing (SAR, SGD…) falls back to KWD for the cart.
   • message_on_cake = the writing for ONE cart line (max 80 characters).
     Two lines with different messages stay separate in the cart.
   ========================================================================== */

export const CART_CURRENCIES = ['KWD', 'AED', 'USD', 'INR'];
export const CAKE_MESSAGE_MAX = 80;

const getCurrency = () => localStorage.getItem('currency') || 'KWD';

/** Currency the cart API will accept for this request. */
export const cartCurrency = (currency?: string) => {
  const code = String(currency || getCurrency()).toUpperCase();
  return CART_CURRENCIES.includes(code) ? code : 'KWD';
};

export interface CartAddonInput {
  id: number;
  [key: string]: any;
}

/**
 * Add one line to the cart.
 * Arguments stay positional so existing callers (Wishlist, ProductDetails)
 * keep working; messageOnCake is the new last argument.
 */
export const addToCart = async (
  userId: number | string,
  productId: number | string,
  quantity: number = 1,
  variantId?: number | null,
  flavorId?: number | null,
  shape?: string | null,
  addons: CartAddonInput[] = [],
  messageOnCake: string = ''
) => {
  const res = await api.post(
    '/cart',
    {
      user_id: Number(userId),
      product_id: Number(productId),
      quantity,
      variant_id: variantId ?? null,
      flavor_id: variantId ? flavorId ?? null : null, // a flavour needs a variant
      shape: shape ?? null,
      // Only IDs — the backend recalculates every price itself.
      addon_ids: (addons || []).map((a) => Number(a.id)).filter(Boolean),
      message_on_cake: (messageOnCake || '').trim().slice(0, CAKE_MESSAGE_MAX),
    },
    { headers: { 'X-Currency': cartCurrency() } }
  );
  return res.data;
};

export const getCart = async (userId: number, currency?: string) => {
  const res = await api.get(`/cart/${userId}`, {
    headers: { 'X-Currency': cartCurrency(currency) },
  });
  return res.data;
};

/** Change quantity and/or the cake message of one cart line. */
export const updateCartItem = async (
  itemId: number,
  changes: number | { quantity?: number; message_on_cake?: string }
) => {
  const body = typeof changes === 'number' ? { quantity: changes } : changes;
  if (typeof body.message_on_cake === 'string') {
    body.message_on_cake = body.message_on_cake.trim().slice(0, CAKE_MESSAGE_MAX);
  }
  const res = await api.put(`/cart/item/${itemId}`, body);
  // { message, item_id, merged } — merged=true when the line joined an identical one
  return res.data;
};

/** Convenience wrapper: save only the cake message of a line. */
export const updateCartItemMessage = (itemId: number, message: string) =>
  updateCartItem(itemId, { message_on_cake: message });

export const removeCartItem = async (itemId: number) => {
  const res = await api.delete(`/cart/item/${itemId}`);
  return res.data;
};

export const clearCart = async (userId: number) => {
  const res = await api.delete(`/cart/${userId}`);
  return res.data;
};

// --- Wishlist (same currency-header pattern) ---

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
    headers: { 'X-CakeInscriptionCurrency': currency || getCurrency() },
  });
  return res.data;
};

export const removeFromWishlist = async (wishlistId: number) => {
  const res = await api.delete(`/api/wishlist/${wishlistId}`);
  return res.data;
};