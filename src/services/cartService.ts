import { fetchJson } from "@/app/api/http";
import { authHeader } from "@/services/authService";

export type CartItemApi = {
  product_id: string;
  product_variant_id: string;
  product_name: string;
  color: string | null;
  color_type: string | null;
  size: string | null;
  quantity: number;
  price_at_added: number;
  current_price: number;
  stock: number;
  subtotal: number;
  main_image: string | null;
  secondary_image: string | null;
  created_at: string;
  updated_at: string;
};

export type CartResponse = {
  items: CartItemApi[];
  totals: {
    subtotal: number;
    items: number;
  };
};

export async function getCart(token: string, signal?: AbortSignal): Promise<CartResponse> {
  return fetchJson<CartResponse>("/cart", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    signal,
  });
}

export async function addToCart(
  token: string,
  productVariantId: string,
  quantity: number,
  signal?: AbortSignal
): Promise<CartResponse> {
  return fetchJson<CartResponse>("/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ product_variant_id: Number(productVariantId), quantity }),
    signal,
  });
}

export async function updateQuantity(
  token: string,
  productVariantId: string,
  quantity: number,
  signal?: AbortSignal
): Promise<CartResponse> {
  return fetchJson<CartResponse>(`/cart/${productVariantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ quantity }),
    signal,
  });
}

export async function removeFromCart(
  token: string,
  productVariantId: string,
  signal?: AbortSignal
): Promise<CartResponse> {
  return fetchJson<CartResponse>(`/cart/${productVariantId}`, {
    method: "DELETE",
    headers: {
      ...authHeader(token),
    },
    signal,
  });
}
