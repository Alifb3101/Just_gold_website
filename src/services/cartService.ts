import { fetchJson } from "@/app/api/http";
import { authHeader } from "@/services/authService";

export type CartPayloadValidationErrorCode =
  | 'NO_PRODUCT'
  | 'NO_VARIANT'
  | 'VARIANT_NOT_IN_PRODUCT'
  | 'PRODUCT_VARIANT_MISMATCH';

export class CartPayloadValidationError extends Error {
  code: CartPayloadValidationErrorCode;

  constructor(code: CartPayloadValidationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export type CartVariantLike = {
  id: string | number;
  name?: string;
  shade?: string;
  productId?: string | number;
  product_id?: string | number;
};

export type CartProductLike = {
  id: string | number;
  name?: string;
  variants?: CartVariantLike[];
};

export type ValidatedCartPayload = {
  product_id: number;
  product_variant_id?: number;
  quantity?: number;
  productName: string;
  variantShade: string;
};

const normalizeId = (value: string | number): number => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new CartPayloadValidationError(
      'PRODUCT_VARIANT_MISMATCH',
      'Invalid variant selection. Please reselect.'
    );
  }
  return normalized;
};

const isPositiveInteger = (value: number) => Number.isInteger(value) && value > 0;

export const getValidatedCartPayload = (
  selectedProduct: CartProductLike | undefined,
  selectedVariant: CartVariantLike | undefined,
  quantity: number
): ValidatedCartPayload => {
  if (!selectedProduct) {
    throw new CartPayloadValidationError('NO_PRODUCT', 'Product is not loaded.');
  }

  const productId = normalizeId(selectedProduct.id);

  let variantFromProduct: CartVariantLike | undefined;
  if (selectedVariant) {
    const variants = selectedProduct.variants ?? [];
    variantFromProduct = variants.find((variant) => String(variant.id) === String(selectedVariant.id));

    if (!variantFromProduct) {
      throw new CartPayloadValidationError(
        'VARIANT_NOT_IN_PRODUCT',
        'Invalid variant selection. Please reselect.'
      );
    }

    const relationProductId = variantFromProduct.product_id ?? variantFromProduct.productId;
    if (relationProductId !== undefined && relationProductId !== null) {
      const normalizedRelationProductId = normalizeId(relationProductId);
      if (normalizedRelationProductId !== productId) {
        throw new CartPayloadValidationError(
          'PRODUCT_VARIANT_MISMATCH',
          'Invalid variant selection. Please reselect.'
        );
      }
    }
  }

  const safeQuantity = isPositiveInteger(quantity) ? quantity : undefined;

  return {
    product_id: productId,
    product_variant_id: variantFromProduct ? normalizeId(variantFromProduct.id) : undefined,
    quantity: safeQuantity,
    productName: selectedProduct.name ?? '',
    variantShade: variantFromProduct?.name ?? variantFromProduct?.shade ?? '',
  };
};

export const isVariantMismatchApiError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;

  const hasStatus400 = status === 400;
  if (!hasStatus400) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes('variant') ||
    message.includes('product') ||
    message.includes('mismatch') ||
    message.includes('invalid')
  );
};

export type CartItemApi = {
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  color_panel_type: string | null;
  color_panel_value: string | null;
  variant_model_no: string | null;
  product_model_no: string | null;
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

export type CartTotalsApi = {
  subtotal: number;
  items: number;
  discount?: number;
  shipping?: number;
  total?: number;
  currency?: string;
  free_shipping_remaining?: number | null;
  is_free_shipping?: boolean;
};

export type CartResponse = {
  items: CartItemApi[];
  totals: CartTotalsApi;
  coupon?: {
    code: string | null;
    type?: string | null;
    value?: number | null;
    discount_amount?: number | null;
    max_discount_amount?: number | null;
  } | null;
  free_shipping_remaining?: number;
  is_free_shipping?: boolean;
};

export type AddToCartPayload = {
  productId?: number;
  productVariantId?: number;
  quantity?: number;
  product_id?: number;
  product_variant_id?: number;
};

type AddToCartRequestBody = {
  productId: number;
  productVariantId?: number;
  quantity?: number;
};

const getPositiveIntegerOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const normalized = Number(value);
  return isPositiveInteger(normalized) ? normalized : undefined;
};

const buildAddToCartRequestBody = (payload: AddToCartPayload): AddToCartRequestBody => {
  const productIdCandidate = payload.productId ?? payload.product_id;
  const productId = getPositiveIntegerOrUndefined(productIdCandidate);

  if (!productId) {
    throw new Error('Invalid productId for cart request.');
  }

  const productVariantId = getPositiveIntegerOrUndefined(
    payload.productVariantId ?? payload.product_variant_id
  );
  const quantity = getPositiveIntegerOrUndefined(payload.quantity);

  return {
    productId,
    ...(productVariantId ? { productVariantId } : {}),
    ...(quantity ? { quantity } : {}),
  };
};

const buildAuthHeaders = (token?: string | null) => (token ? authHeader(token) : {});

export async function getCart(
  token?: string | null,
  signal?: AbortSignal
): Promise<CartResponse> {
  // Backend auto-loads saved coupon per user/guest, no need to send coupon_code
  return fetchJson<CartResponse>('/cart', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(token),
    },
    signal,
  });
}

export async function addToCart(
  token: string | null,
  payload: AddToCartPayload,
  signal?: AbortSignal
): Promise<CartResponse> {
  const requestBody = buildAddToCartRequestBody(payload);

  try {
    const response = await fetchJson<CartResponse>("/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    const firstItem = response?.items?.[0];
    console.debug('[cart][frontend] add.response', {
      ok: true,
      status: 200,
      item: firstItem
        ? {
            productId: firstItem.product_id,
            variantId: firstItem.product_variant_id,
            quantity: firstItem.quantity,
          }
        : null,
    });
    return response;
  } catch (error) {
    console.error('[cart][frontend] add.error', { payload: requestBody, error });
    throw error;
  }
}

export async function updateQuantity(
  token: string | null,
  productVariantId: string,
  quantity: number,
  signal?: AbortSignal
): Promise<CartResponse> {
  return fetchJson<CartResponse>(`/cart/${productVariantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify({ quantity }),
    signal,
  });
}

export async function removeFromCart(
  token: string | null,
  productVariantId: string,
  signal?: AbortSignal
): Promise<CartResponse> {
  return fetchJson<CartResponse>(`/cart/${productVariantId}`, {
    method: "DELETE",
    headers: {
      ...buildAuthHeaders(token),
    },
    signal,
  });
}

export async function applyCoupon(
  token: string | null,
  code: string,
  signal?: AbortSignal
): Promise<CartResponse> {
  const normalized = code.trim();
  return fetchJson<CartResponse>('/cart/apply-coupon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify({ coupon_code: normalized }),
    signal,
  });
}

export async function removeCoupon(
  token: string | null,
  signal?: AbortSignal
): Promise<CartResponse> {
  return fetchJson<CartResponse>('/cart/remove-coupon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(token),
    },
    signal,
  });
}
