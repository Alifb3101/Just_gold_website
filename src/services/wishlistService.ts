import { fetchJson } from "@/app/api/http";
import { authHeader } from "@/services/authService";

export type WishlistItemApi = {
  product_id: string;
  product_variant_id: string;
  product_name: string;
  color: string | null;
  color_type: string | null;
  size: string | null;
  current_price: number;
  stock: number;
  created_at: string;
};

export type WishlistResponse = {
  items: WishlistItemApi[];
};

export async function getWishlist(token: string, signal?: AbortSignal): Promise<WishlistResponse> {
  return fetchJson<WishlistResponse>("/wishlist", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    signal,
  });
}

export async function addToWishlist(
  token: string,
  productVariantId: string,
  signal?: AbortSignal
): Promise<WishlistResponse> {
  return fetchJson<WishlistResponse>("/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ product_variant_id: Number(productVariantId) }),
    signal,
  });
}

export async function removeFromWishlist(
  token: string,
  productVariantId: string,
  signal?: AbortSignal
): Promise<WishlistResponse> {
  return fetchJson<WishlistResponse>(`/wishlist/${productVariantId}`, {
    method: "DELETE",
    headers: {
      ...authHeader(token),
    },
    signal,
  });
}
