import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { addToCart as apiAddToCart, getCart as apiGetCart, removeFromCart as apiRemoveFromCart, updateQuantity as apiUpdateQuantity } from '@/services/cartService';
import type { CartResponse, CartItemApi } from '@/services/cartService';
import { isVariantMismatchApiError } from '@/services/cartService';
import { useAuth } from './AuthContext';
import { ApiError, ASSET_BASE_URL } from '@/app/api/http';

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
  cartCount: number;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  total: number;
  currency: string;
  freeShippingRemaining: number | null;
  isFreeShipping: boolean;
  applyPromoCode: (code: string) => boolean;
  promoCode: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

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

  return ({
  id: item.product_variant_id ? String(item.product_variant_id) : String(item.product_id),
  productId: String(item.product_id),
  selectedVariantId:
    item.variant_model_no && item.variant_model_no !== 'NULL' && item.product_variant_id
      ? String(item.product_variant_id)
      : null,
  name: item.product_name,
  image: item.main_image || item.secondary_image || '',
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
  const { token, logout } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);

  const syncFromResponse = useCallback((data?: Partial<CartResponse> | null) => {
    if (!data || !Array.isArray(data.items)) {
      // If the API did not return the cart payload, signal the caller to refetch.
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
      const data = await apiGetCart(token);
      syncFromResponse(data);
    } catch (err) {
      handleApiError(err, 'Fetch cart');
    } finally {
      setIsLoading(false);
    }
  }, [token, syncFromResponse, handleApiError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    console.debug('[cart] add from context', {
      productId,
      productVariantId,
      quantity: safeQuantity,
      meta,
    });
    try {
      const data = await apiAddToCart(token, {
        productId: Number(productId),
        ...(productVariantId ? { productVariantId: Number(productVariantId) } : {}),
        ...(safeQuantity ? { quantity: safeQuantity } : {}),
      });
      const updated = syncFromResponse(data);
      if (!updated) {
        await refresh();
      }
      if (meta?.name) {
        toast.success(`Added ${meta.name}${meta?.variantName ? ` (${meta.variantName})` : ''} to cart`);
      } else {
        toast.success('Item added to cart');
      }
    } catch (err) {
      if (isVariantMismatchApiError(err)) {
        toast.error('Invalid variant selection. Please reselect.');
        if (meta?.onVariantMismatch) {
          await meta.onVariantMismatch();
        }
        return;
      }
      handleApiError(err, 'Add to cart');
    }
  }, [token, syncFromResponse, handleApiError]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    try {
      const data = await apiUpdateQuantity(token, variantId, quantity);
      const updated = syncFromResponse(data);
      if (!updated) {
        await refresh();
      }
    } catch (err) {
      handleApiError(err, 'Update quantity');
    }
  }, [token, syncFromResponse, handleApiError]);

  const removeFromCart = useCallback(async (variantId: string) => {
    try {
      const data = await apiRemoveFromCart(token, variantId);
      const updated = syncFromResponse(data);
      if (!updated) {
        await refresh();
      }
      toast.success('Item removed from cart');
    } catch (err) {
      handleApiError(err, 'Remove from cart');
    }
  }, [token, syncFromResponse, handleApiError]);

  const clearCart = useCallback(async () => {
    const variants = items.map((item) => item.id);
    for (const id of variants) {
      try {
        const data = await apiRemoveFromCart(token, id);
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
  }, [token, items, syncFromResponse, handleApiError, refresh]);

  const applyPromoCode = (code: string): boolean => {
    const normalized = code.trim();
    if (!normalized) {
      setPromoCode(null);
      toast.info('Promo codes cleared. Cart totals will use backend values.');
      void refresh();
      return true;
    }

    setPromoCode(normalized);
    toast.info('Promo codes are validated on the server. Totals will refresh if the code is applied.');
    void refresh();
    return true;
  };

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
