import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  removeFromCart as apiRemoveFromCart,
  updateQuantity as apiUpdateQuantity,
  applyCoupon as apiApplyCoupon,
  removeCoupon as apiRemoveCoupon,
} from '@/services/cartService';
import type { CartResponse, CartItemApi } from '@/services/cartService';
import { isVariantMismatchApiError } from '@/services/cartService';
import { useAuth } from './AuthContext';
import { ApiError, ASSET_BASE_URL } from '@/app/api/http';
import { getProductImage } from '@/app/utils/productImage';

export interface CartItem {
  id: string;
  productId: string;
  selectedVariantId?: string | null;
  name: string;
  image: string;
  price: number;
  priceAtAdded: number;
  originalPrice?: number;
  category?: string;
  shade?: string | null;
  colorPanelType?: string | null;
  colorPanelValue?: string | null;
  variantModelNo?: string | null;
  productModelNo?: string | null;
  size?: string | null;
  quantity: number;
  inStock: boolean;
  maxQuantity: number;
  stock: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    productId: string,
    productVariantId?: string,
    quantity?: number,
    meta?: {
      name?: string;
      image?: string;
      variantName?: string;
      onVariantMismatch?: () => void | Promise<void>;
    }
  ) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartLocal: () => void;
  cartCount: number;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  total: number;
  currency: string;
  freeShippingRemaining: number | null;
  isFreeShipping: boolean;
  applyPromoCode: (code: string) => Promise<boolean>;
  promoCode: string | null;
  coupon: AppliedCoupon | null;
  isApplyingCoupon: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

type AppliedCoupon = {
  code: string | null;
  type?: string | null;
  value?: number | null;
  discount_amount?: number | null;
  max_discount_amount?: number | null;
};

type CartTotals = {
  subtotal: number;
  items: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  freeShippingRemaining: number | null;
  isFreeShipping: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeColorPanelType = (type?: string | null): string | null => {
  if (!type) return null;
  return type.toLowerCase();
};

const normalizeColorPanelValue = (type: string | null, value?: string | null): string | null => {
  if (!value) return null;
  if (type !== 'image') return value;
  if (value.startsWith('http')) return value;
  if (value.startsWith('/')) return `${ASSET_BASE_URL}${value}`;
  return `${ASSET_BASE_URL}/${value}`;
};

const mapCartItem = (item: CartItemApi): CartItem => {
  const colorPanelType = normalizeColorPanelType(item.color_panel_type);
  const colorPanelValue = normalizeColorPanelValue(colorPanelType, item.color_panel_value);
  const mainVariantMedium = getProductImage(
    {
      image: item.main_image,
      image_variants: item.main_image_variants,
    },
    'medium'
  );
  const secondaryVariantMedium = getProductImage(
    {
      image: item.secondary_image,
      image_variants: item.secondary_image_variants,
    },
    'medium'
  );

  return ({
  id: item.product_variant_id ? String(item.product_variant_id) : String(item.product_id),
  productId: String(item.product_id),
  selectedVariantId:
    item.variant_model_no && item.variant_model_no !== 'NULL' && item.product_variant_id
      ? String(item.product_variant_id)
      : null,
  name: item.product_name,
  image: mainVariantMedium || secondaryVariantMedium || '',
  price: Number(item.current_price),
  priceAtAdded: Number(item.price_at_added),
  originalPrice: item.price_at_added !== item.current_price ? Number(item.price_at_added) : undefined,
  category: item.product_model_no ? `Model No: ${item.product_model_no}` : undefined,
  shade: colorPanelValue,
  colorPanelType,
  colorPanelValue,
  variantModelNo: item.variant_model_no,
  productModelNo: item.product_model_no,
  size: item.size,
  quantity: item.quantity,
  inStock: item.stock > 0,
  maxQuantity: item.stock,
  stock: item.stock,
  subtotal: Number(item.subtotal),
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  });
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, guestToken, logout } = useAuth();
  const quantitySyncTimersRef = React.useRef<Record<string, number>>({});
  const pendingQuantityRef = React.useRef<Record<string, number>>({});
  const inFlightOperationRef = React.useRef<Record<string, Promise<void>>>({});
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    items: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    currency: 'AED',
    freeShippingRemaining: null,
    isFreeShipping: false,
  });
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const clearQuantitySyncTimer = useCallback((variantId: string) => {
    const timer = quantitySyncTimersRef.current[variantId];
    if (timer) {
      window.clearTimeout(timer);
      delete quantitySyncTimersRef.current[variantId];
    }
    delete pendingQuantityRef.current[variantId];
  }, []);

  const buildItemTotals = useCallback((cartItems: CartItem[]) => {
    const subtotalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      subtotal: Number(subtotalAmount.toFixed(2)),
      items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      total: Number((subtotalAmount + totals.shipping - totals.discount).toFixed(2)),
    };
  }, [totals.discount, totals.shipping]);

  const applyOptimisticSnapshot = useCallback((nextItems: CartItem[]) => {
    const nextTotals = buildItemTotals(nextItems);
    setItems(nextItems);
    setTotals((prevTotals) => ({
      ...prevTotals,
      subtotal: nextTotals.subtotal,
      items: nextTotals.items,
      total: nextTotals.total,
    }));
  }, [buildItemTotals]);

  const runUniqueCartOperation = useCallback(async (operationKey: string, operation: () => Promise<void>) => {
    if (inFlightOperationRef.current[operationKey]) {
      return inFlightOperationRef.current[operationKey];
    }

    const promise = operation().finally(() => {
      delete inFlightOperationRef.current[operationKey];
    });

    inFlightOperationRef.current[operationKey] = promise;
    return promise;
  }, []);

  const syncFromResponse = useCallback((data?: Partial<CartResponse> | null) => {
    console.debug('[cart] syncFromResponse.input', {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      hasItems: Array.isArray(data?.items),
      itemCount: data?.items?.length ?? 0,
      data: data,
    });
    
    if (!data || !Array.isArray(data.items)) {
      // If the API did not return the cart payload, signal the caller to refetch.
      console.warn('[cart] syncFromResponse: no items array in response');
      return false;
    }

    const nextTotals = data.totals ?? { subtotal: 0, items: 0 };
    const discountAmount = Number(nextTotals.discount ?? data.coupon?.discount_amount ?? 0) || 0;
    const shippingAmount = Number(nextTotals.shipping ?? 0) || 0;
    const subtotalAmount = Number(nextTotals.subtotal ?? 0) || 0;
    const totalAmount = Number(nextTotals.total ?? subtotalAmount + shippingAmount - discountAmount) || 0;

    setItems(data.items.map(mapCartItem));
    setTotals({
      subtotal: subtotalAmount,
      items: Number(nextTotals.items ?? 0),
      discount: discountAmount,
      shipping: shippingAmount,
      total: totalAmount,
      currency: nextTotals.currency ?? 'AED',
      freeShippingRemaining:
        data.free_shipping_remaining ?? nextTotals.free_shipping_remaining ?? null,
      isFreeShipping: Boolean(data.is_free_shipping ?? nextTotals.is_free_shipping ?? shippingAmount === 0),
    });
    setPromoCode(data.coupon?.code ?? null);
    setCoupon(
      data.coupon
        ? {
            code: data.coupon.code ?? null,
            type: data.coupon.type ?? null,
            value: data.coupon.value ?? null,
            discount_amount: data.coupon.discount_amount ?? null,
            max_discount_amount: data.coupon.max_discount_amount ?? null,
          }
        : null
    );
    return true;
  }, []);

  const handleApiError = useCallback((err: unknown, action: string) => {
    if (err instanceof ApiError && err.status === 401) {
      if (token) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error('Please sign in to continue.');
      }
      return;
    }
    const message = err instanceof Error ? err.message : 'Something went wrong';
    toast.error(`${action} failed: ${message}`);
  }, [logout, token]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Backend auto-loads saved coupon, no need to send coupon_code on every fetch
      const data = await apiGetCart(token, undefined, guestToken);
      console.debug('[cart] refresh.before_sync', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: typeof data === 'object' && data ? Object.keys(data) : [],
        isAuthenticated: !!token,
        hasGuestToken: !!guestToken,
      });
      const success = syncFromResponse(data);
      if (!success) {
        console.warn('[cart] refresh: syncFromResponse returned false, retrying...');
      } else {
        console.debug('[cart] refresh: sync successful');
      }
    } catch (err) {
      console.error('[cart] refresh.error', { isAuthenticated: !!token, hasGuestToken: !!guestToken, error: err });
      handleApiError(err, 'Fetch cart');
    } finally {
      setIsLoading(false);
    }
  }, [token, guestToken, syncFromResponse, handleApiError]);

  // Refresh on mount and when token or guestToken changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, guestToken]);

  const addToCart = useCallback(async (
    productId: string,
    productVariantId?: string,
    quantity: number = 1,
    meta?: {
      name?: string;
      image?: string;
      variantName?: string;
      onVariantMismatch?: () => void | Promise<void>;
    }
  ) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    const cartOperationKey = `add:${productId}:${productVariantId ?? 'no-variant'}`;
    if (inFlightOperationRef.current[cartOperationKey]) {
      return inFlightOperationRef.current[cartOperationKey];
    }

    console.debug('[cart] add from context', {
      productId,
      productVariantId,
      quantity: safeQuantity,
      meta,
      isAuthenticated: !!token,
      hasGuestToken: !!guestToken,
    });
    const previousItems = items;
    const existingItemIndex = previousItems.findIndex((item) => item.id === (productVariantId ? String(productVariantId) : String(productId)));
    const optimisticItems = existingItemIndex >= 0
      ? previousItems.map((item, index) => {
          if (index !== existingItemIndex) return item;
          const nextQuantity = item.quantity + safeQuantity;
          const nextSubtotal = Number((item.price * nextQuantity).toFixed(2));
          return {
            ...item,
            quantity: nextQuantity,
            subtotal: nextSubtotal,
          };
        })
      : previousItems;

    if (existingItemIndex >= 0) {
      applyOptimisticSnapshot(optimisticItems);
    }

    return runUniqueCartOperation(cartOperationKey, async () => {
      try {
        const data = await apiAddToCart(
          token,
          {
            productId: Number(productId),
            ...(productVariantId ? { productVariantId: Number(productVariantId) } : {}),
            ...(safeQuantity ? { quantity: safeQuantity } : {}),
          },
          undefined,
          guestToken
        );
        console.debug('[cart] addToCart.response', {
          dataType: typeof data,
          isArray: Array.isArray(data),
          keys: typeof data === 'object' && data ? Object.keys(data) : [],
          hasItems: Array.isArray(data?.items),
          itemCount: data?.items?.length ?? 0,
          isAuthenticated: !!token,
          hasGuestToken: !!guestToken,
        });
        const updated = syncFromResponse(data);
        if (!updated) {
          console.warn('[cart] addToCart: syncFromResponse returned false, calling refresh...');
          await refresh();
        }
        if (meta?.name) {
          toast.success(`Added ${meta.name}${meta?.variantName ? ` (${meta.variantName})` : ''} to cart`);
        } else {
          toast.success('Item added to cart');
        }
      } catch (err) {
        if (isVariantMismatchApiError(err)) {
          setItems(previousItems);
          await refresh();
          toast.error('Invalid variant selection. Please reselect.');
          if (meta?.onVariantMismatch) {
            await meta.onVariantMismatch();
          }
          return;
        }
        setItems(previousItems);
        await refresh();
        console.error('[cart] addToCart.error', { isAuthenticated: !!token, hasGuestToken: !!guestToken, error: err });
        handleApiError(err, 'Add to cart');
      }
    });
  }, [token, guestToken, syncFromResponse, handleApiError, refresh, items, applyOptimisticSnapshot, runUniqueCartOperation]);

  const removeFromCart = useCallback(async (variantId: string) => {
    clearQuantitySyncTimer(variantId);
    const cartOperationKey = `remove:${variantId}`;
    if (inFlightOperationRef.current[cartOperationKey]) {
      return inFlightOperationRef.current[cartOperationKey];
    }

    const previousItems = items;
    const nextItems = previousItems.filter((item) => item.id !== variantId);
    applyOptimisticSnapshot(nextItems);

    return runUniqueCartOperation(cartOperationKey, async () => {
      try {
        const data = await apiRemoveFromCart(token, variantId, undefined, guestToken);
        const updated = syncFromResponse(data);
        if (!updated) {
          await refresh();
        }
        toast.success('Item removed from cart');
      } catch (err) {
        setItems(previousItems);
        await refresh();
        handleApiError(err, 'Remove from cart');
      }
    });
  }, [token, guestToken, syncFromResponse, handleApiError, refresh, clearQuantitySyncTimer, items, applyOptimisticSnapshot, runUniqueCartOperation]);

  const clearCart = useCallback(async () => {
    Object.keys(quantitySyncTimersRef.current).forEach((variantId) => clearQuantitySyncTimer(variantId));
    const variants = items.map((item) => item.id);
    for (const id of variants) {
      try {
        const data = await apiRemoveFromCart(token, id, undefined, guestToken);
        const updated = syncFromResponse(data);
        if (!updated) {
          await refresh();
          break;
        }
      } catch (err) {
        handleApiError(err, 'Clear cart');
        break;
      }
    }
  }, [token, guestToken, items, syncFromResponse, handleApiError, refresh, clearQuantitySyncTimer]);

  const clearCartLocal = useCallback(() => {
    Object.keys(quantitySyncTimersRef.current).forEach((variantId) => clearQuantitySyncTimer(variantId));
    setItems([]);
    setTotals({
      subtotal: 0,
      items: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      currency: 'AED',
      freeShippingRemaining: null,
      isFreeShipping: false,
    });
    setPromoCode(null);
    setCoupon(null);
  }, [clearQuantitySyncTimer]);

  const applyPromoCode = useCallback(
    async (code: string): Promise<boolean> => {
      const normalized = code.trim();
      setIsApplyingCoupon(true);
      try {
        if (!normalized) {
          const data = await apiRemoveCoupon(token, undefined, guestToken);
          const updated = syncFromResponse(data);
          if (!updated) {
            await refresh();
          }
          toast.success('Coupon removed');
          return true;
        }

        const data = await apiApplyCoupon(token, normalized, undefined, guestToken);
        const updated = syncFromResponse(data);
        if (!updated) {
          await refresh();
        }
        toast.success('Coupon applied');
        return true;
      } catch (err) {
        handleApiError(err, 'Apply coupon');
        return false;
      } finally {
        setIsApplyingCoupon(false);
      }
    },
    [token, guestToken, syncFromResponse, handleApiError, refresh]
  );

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    const nextQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    const existingItem = items.find((item) => item.id === variantId);
    if (!existingItem) return;

    if (existingItem.quantity !== nextQuantity) {
      const quantityDelta = nextQuantity - existingItem.quantity;
      const priceBase = Number(existingItem.price) || 0;
      const subtotalDelta = priceBase * quantityDelta;

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === variantId
            ? {
                ...item,
                quantity: nextQuantity,
                subtotal: Number((priceBase * nextQuantity).toFixed(2)),
              }
            : item
        )
      );

      setTotals((prevTotals) => {
        const nextSubtotal = Number((prevTotals.subtotal + subtotalDelta).toFixed(2));
        const nextItems = Math.max(0, prevTotals.items + quantityDelta);
        const nextTotal = Number((nextSubtotal + prevTotals.shipping - prevTotals.discount).toFixed(2));

        return {
          ...prevTotals,
          subtotal: nextSubtotal,
          items: nextItems,
          total: nextTotal,
        };
      });
    }

    pendingQuantityRef.current[variantId] = nextQuantity;
    const pendingTimer = quantitySyncTimersRef.current[variantId];
    if (pendingTimer) window.clearTimeout(pendingTimer);

    quantitySyncTimersRef.current[variantId] = window.setTimeout(async () => {
      const queuedQuantity = pendingQuantityRef.current[variantId];
      delete quantitySyncTimersRef.current[variantId];
      delete pendingQuantityRef.current[variantId];
      if (queuedQuantity === undefined) return;

      try {
        const data = await apiUpdateQuantity(token, variantId, queuedQuantity, undefined, guestToken);
        const updated = syncFromResponse(data);
        if (!updated) {
          await refresh();
        }
      } catch (err) {
        await refresh();
        handleApiError(err, 'Update quantity');
      }
    }, 350);
  }, [token, guestToken, syncFromResponse, handleApiError, refresh, items]);

  useEffect(() => {
    return () => {
      Object.keys(quantitySyncTimersRef.current).forEach((variantId) => {
        window.clearTimeout(quantitySyncTimersRef.current[variantId]);
      });
      quantitySyncTimersRef.current = {};
      pendingQuantityRef.current = {};
    };
  }, []);

  const cartCount = useMemo(
    () => totals.items ?? items.reduce((sum, item) => sum + item.quantity, 0),
    [totals.items, items]
  );
  const subtotal = useMemo(
    () => Number(totals.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0)),
    [totals.subtotal, items]
  );
  const shipping = totals.shipping ?? 0;
  const discountAmount = totals.discount ?? 0;
  const total = totals.total ?? Math.max(0, subtotal + shipping - discountAmount);
  const currency = totals.currency ?? 'AED';
  const freeShippingRemaining = totals.freeShippingRemaining ?? null;
  const isFreeShipping = totals.isFreeShipping ?? shipping <= 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearCartLocal,
        cartCount,
        subtotal,
        shipping,
        discountAmount,
        total,
        currency,
        freeShippingRemaining,
        isFreeShipping,
        applyPromoCode,
        promoCode,
        coupon,
        isApplyingCoupon,
        isLoading,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
