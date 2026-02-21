import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { addToWishlist as apiAddToWishlist, getWishlist as apiGetWishlist, removeFromWishlist as apiRemoveFromWishlist } from '@/services/wishlistService';
import type { WishlistItemApi, WishlistResponse } from '@/services/wishlistService';
import { useAuth } from './AuthContext';
import { ApiError } from '@/app/api/http';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  addedDate: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (productVariantId: string, meta?: { name?: string; image?: string }) => Promise<void>;
  removeFromWishlist: (variantId: string) => Promise<void>;
  isInWishlist: (variantId: string) => boolean;
  wishlistCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const mapWishlistItem = (item: WishlistItemApi, prevItems: WishlistItem[]): WishlistItem => {
  const existing = prevItems.find((p) => p.id === String(item.product_variant_id));
  return {
    id: String(item.product_variant_id),
    productId: String(item.product_id),
    name: item.product_name,
    image: existing?.image || '',
    price: Number(item.current_price),
    category: 'Beauty',
    rating: existing?.rating ?? 0,
    reviews: existing?.reviews ?? 0,
    inStock: item.stock > 0,
    addedDate: item.created_at,
  };
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const syncFromResponse = useCallback((data?: Partial<WishlistResponse> | null) => {
    const itemsArray = Array.isArray(data?.items) ? data.items : [];
    setItems((prev) => itemsArray.map((item) => mapWishlistItem(item, prev)));
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
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiGetWishlist(token);
      syncFromResponse(data);
    } catch (err) {
      handleApiError(err, 'Fetch wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [token, syncFromResponse, handleApiError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToWishlist = useCallback(async (variantId: string, meta?: { name?: string; image?: string }) => {
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      const data = await apiAddToWishlist(token, variantId);
      syncFromResponse(data);
      toast.success(meta?.name ? `Saved ${meta.name}` : 'Added to wishlist');
    } catch (err) {
      handleApiError(err, 'Add to wishlist');
    }
  }, [token, syncFromResponse, handleApiError]);

  const removeFromWishlist = useCallback(async (variantId: string) => {
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      const data = await apiRemoveFromWishlist(token, variantId);
      syncFromResponse(data);
      toast.success('Removed from wishlist');
    } catch (err) {
      handleApiError(err, 'Remove from wishlist');
    }
  }, [token, syncFromResponse, handleApiError]);

  const isInWishlist = useCallback((variantId: string) => items.some((item) => item.id === String(variantId)), [items]);

  const wishlistCount = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
        isLoading,
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
