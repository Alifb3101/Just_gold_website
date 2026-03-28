import { fetchJson } from "@/app/api/http";
import { authHeader } from "@/services/authService";

export type WishlistItemApi = {
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  product_model_no: string | null;
  variant_model_no: string | null;
  color_panel_type: string | null;
  color_panel_value: string | null;
  current_price: number;
  stock: number;
  main_image: string | null;
  main_image_variants?: {
    thumbnail?: string | null;
    medium?: string | null;
    large?: string | null;
    zoom?: string | null;
  } | null;
  secondary_image: string | null;
  secondary_image_variants?: {
    thumbnail?: string | null;
    medium?: string | null;
    large?: string | null;
    zoom?: string | null;
  } | null;
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

export type AddToWishlistPayload = {
  productId?: number;
  product_id?: number;
  productVariantId?: number;
  product_variant_id?: number;
  variantId?: number;
  variant_id?: number;
};

type AddToWishlistRequestBody = {
  productId: number;
  productVariantId?: number;
};

const toPositiveInteger = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) return undefined;
  return normalized;
};

const buildAddToWishlistRequestBody = (payload: AddToWishlistPayload): AddToWishlistRequestBody => {
  const productId = toPositiveInteger(payload.productId ?? payload.product_id);
  if (!productId) {
    throw new Error('Invalid productId for wishlist request.');
  }

  const productVariantId = toPositiveInteger(
    payload.productVariantId ?? payload.product_variant_id ?? payload.variantId ?? payload.variant_id
  );

  return {
    productId,
    ...(productVariantId ? { productVariantId } : {}),
  };
};

export async function addToWishlist(
  token: string,
  payload: AddToWishlistPayload,
  signal?: AbortSignal
): Promise<WishlistResponse> {
  const requestBody = buildAddToWishlistRequestBody(payload);

  return fetchJson<WishlistResponse>("/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(requestBody),
    signal,
  });
}

export async function removeFromWishlist(
  token: string,
  payload: {
    productId: string | number;
    productVariantId?: string | number | null;
  },
  signal?: AbortSignal
): Promise<WishlistResponse> {
  const productVariantId = toPositiveInteger(payload.productVariantId);
  const productId = toPositiveInteger(payload.productId);

  if (productVariantId) {
    return fetchJson<WishlistResponse>(`/wishlist/${productVariantId}`, {
      method: "DELETE",
      headers: {
        ...authHeader(token),
      },
      signal,
    });
  }

  if (!productId) {
    throw new Error('Invalid wishlist removal payload.');
  }

  try {
    return await fetchJson<WishlistResponse>(`/wishlist/product/${productId}`, {
      method: "DELETE",
      headers: {
        ...authHeader(token),
      },
      signal,
    });
  } catch {
    try {
      return await fetchJson<WishlistResponse>(`/wishlist?productId=${productId}`, {
        method: "DELETE",
        headers: {
          ...authHeader(token),
        },
        signal,
      });
    } catch {
      return fetchJson<WishlistResponse>(`/wishlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(token),
        },
        body: JSON.stringify({ productId }),
        signal,
      });
    }
  }
}
