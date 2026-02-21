import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { addToCart as apiAddToCart, getCart as apiGetCart, removeFromCart as apiRemoveFromCart, updateQuantity as apiUpdateQuantity } from '@/services/cartService';
import type { CartResponse, CartItemApi } from '@/services/cartService';
import { useAuth } from './AuthContext';
import { ApiError } from '@/app/api/http';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  priceAtAdded: number;
  originalPrice?: number;
  category?: string;
  shade?: string | null;
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
  addToCart: (productVariantId: string, quantity?: number, meta?: { name?: string; image?: string }) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  subtotal: number;
  applyPromoCode: (code: string) => boolean;
  promoCode: string | null;
  discount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapCartItem = (item: CartItemApi): CartItem => ({
  id: String(item.product_variant_id),
  productId: String(item.product_id),
  name: item.product_name,
  image: item.main_image || item.secondary_image || '',
  price: Number(item.current_price),
  priceAtAdded: Number(item.price_at_added),
  originalPrice: item.price_at_added !== item.current_price ? Number(item.price_at_added) : undefined,
  category: 'Beauty',
  shade: item.color,
  size: item.size,
  quantity: item.quantity,
  inStock: item.stock > 0,
  maxQuantity: item.stock,
  stock: item.stock,
  subtotal: Number(item.subtotal),
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<{ subtotal: number; items: number }>({ subtotal: 0, items: 0 });
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const syncFromResponse = useCallback((data?: Partial<CartResponse> | null) => {
    if (!data || !Array.isArray(data.items)) {
      // If the API did not return the cart payload, signal the caller to refetch.
      return false;
    }

    const nextTotals = data.totals ?? { subtotal: 0, items: 0 };
    setItems(data.items.map(mapCartItem));
    setTotals({ subtotal: Number(nextTotals.subtotal ?? 0), items: Number(nextTotals.items ?? 0) });
    return true;
  }, []);

  const handleApiError = useCallback((err: unknown, action: string) => {
    if (err instanceof ApiError && err.status === 401) {
      toast.error('Session expired. Please login again.');
      logout();
      return;
    }
    const message = err instanceof Error ? err.message : 'Something went wrong';
    toast.error(`${action} failed: ${message}`);
  }, [logout]);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      setTotals({ subtotal: 0, items: 0 });
      return;
    }
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

  const addToCart = useCallback(async (productVariantId: string, quantity: number = 1, meta?: { name?: string; image?: string }) => {
    if (!token) {
      toast.error('Please login to add items to your cart');
      return;
    }
    try {
      const data = await apiAddToCart(token, productVariantId, quantity);
      const updated = syncFromResponse(data);
      if (!updated) {
        await refresh();
      }
      if (meta?.name) {
        toast.success(`Added ${meta.name} to cart`);
      } else {
        toast.success('Item added to cart');
      }
    } catch (err) {
      handleApiError(err, 'Add to cart');
    }
  }, [token, syncFromResponse, handleApiError]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    if (!token) {
      toast.error('Please login to update your cart');
      return;
    }
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
    if (!token) {
      toast.error('Please login to update your cart');
      return;
    }
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
    if (!token) {
      setItems([]);
      setTotals({ subtotal: 0, items: 0 });
      return;
    }
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
    const validCodes: { [key: string]: number } = {
      GOLD10: 10,
      GOLD20: 20,
      WELCOME15: 15,
    };

    const normalized = code.toUpperCase();
    if (validCodes[normalized]) {
      setPromoCode(normalized);
      setDiscount(validCodes[normalized]);
      toast.success(`Promo code applied! ${validCodes[normalized]}% off`);
      return true;
    }
    toast.error('Invalid promo code');
    return false;
  };

  const cartCount = useMemo(() => totals.items ?? items.reduce((sum, item) => sum + item.quantity, 0), [totals.items, items]);
  const subtotal = useMemo(() => Number(totals.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0)), [totals.subtotal, items]);

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
        applyPromoCode,
        promoCode,
        discount,
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
