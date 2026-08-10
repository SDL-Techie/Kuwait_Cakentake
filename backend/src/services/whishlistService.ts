import { api } from "./api";

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  currency: string;
}

export const getWishlist = async (
  userId: number,
  currency?: string
): Promise<WishlistItem[]> => {
  const selectedCurrency =
    currency || localStorage.getItem("currency") || "KWD";

  const res = await api.get(`/wishlist/${userId}`, {
    headers: {
      "X-Currency": selectedCurrency,
    },
  });

  return res.data.items ?? [];
};

export const addToWishlist = async (
  userId: number,
  productId: number
) => {
  const res = await api.post("/wishlist", {
    user_id: userId,
    product_id: productId,
  });

  return res.data.wishlist;
};

export const deleteWishlistItem = async (id: number) => {
  await api.delete(`/wishlist/${id}`);
};

export const updateWishlist = async (
  id: number,
  product_id: number
) => {
  const res = await api.put(`/wishlist/${id}`, {
    product_id,
  });

  return res.data;
};