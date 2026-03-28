import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { addToWishlist as apiAddToWishlist, getWishlist as apiGetWishlist, removeFromWishlist as apiRemoveFromWishlist } from '@/services/wishlistService';
import type { WishlistItemApi, WishlistResponse } from '@/services/wishlistService';
import { useAuth } from './AuthContext';
import { ApiError } from '@/app/api/http';
import { getProductImage } from '@/app/utils/productImage';

export interface WishlistItem {
  id: string;
  productId: string;
  productVariantId?: string | null;
  name: string;
  image: string;
  price: number;
  category?: string;
  colorPanelType?: string | null;
  colorPanelValue?: string | null;
  variantModelNo?: string | null;
  productModelNo?: string | null;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  addedDate: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (
    productId: string,
    productVariantId?: string,
    meta?: { name?: string; image?: string }
  ) => Promise<void>;
  removeFromWishlist: (productId: string, productVariantId?: string | null) => Promise<void>;
  isInWishlist: (productId: string, productVariantId?: string | null) => boolean;
  wishlistCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const buildWishlistItemKey = (productId: string, productVariantId?: string | null) =>
  productVariantId ? `${productId}:${productVariantId}` : `${productId}:base`;

const mapWishlistItem = (item: WishlistItemApi, prevItems: WishlistItem[]): WishlistItem => {
  const productId = String(item.product_id);
  const productVariantId = item.product_variant_id ? String(item.product_variant_id) : null;
  const itemId = buildWishlistItemKey(productId, productVariantId);
  const existing = prevItems.find((p) => p.id === itemId);
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

  return {
    id: itemId,
    productId,
    productVariantId,
    name: item.product_name,
    image: mainVariantMedium || secondaryVariantMedium || existing?.image || '',
    price: Number(item.current_price),
    category: item.product_model_no ? `Model No: ${item.product_model_no}` : undefined,
    colorPanelType: item.color_panel_type,
    colorPanelValue: item.color_panel_value,
    variantModelNo: item.variant_model_no,
    productModelNo: item.product_model_no,
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
    if (!data || !Array.isArray(data.items)) {
      return false;
    }

    const itemsArray = data.items;
    setItems((prev) => itemsArray.map((item) => mapWishlistItem(item, prev)));
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

  const addToWishlist = useCallback(async (
    productId: string,
    productVariantId?: string,
    meta?: { name?: string; image?: string }
  ) => {
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    const itemId = buildWishlistItemKey(productId, productVariantId ?? null);
    const hasExisting = items.some((item) =>
      productVariantId
        ? item.productId === String(productId) && item.productVariantId === String(productVariantId)
        : item.productId === String(productId)
    );

    if (!hasExisting) {
      setItems((prev) => [
        {
          id: itemId,
          productId,
          productVariantId: productVariantId ?? null,
          name: meta?.name ?? 'Product',
          image: meta?.image ?? '',
          price: 0,
          inStock: true,
          addedDate: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    try {
      const data = await apiAddToWishlist(token, {
        productId: Number(productId),
        ...(productVariantId ? { productVariantId: Number(productVariantId) } : {}),
      });
      const updated = syncFromResponse(data);
      if (!updated) {
        await refresh();
      }
      toast.success(meta?.name ? `Saved ${meta.name}` : 'Added to wishlist');
    } catch (err) {
      if (!hasExisting) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      }
      handleApiError(err, 'Add to wishlist');
    }
  }, [token, items, syncFromResponse, handleApiError, refresh]);

  const removeFromWishlist = useCallback(async (productId: string, productVariantId?: string | null) => {
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }

    const normalizedProductId = String(productId);
    const matchingItems = items.filter((item) => item.productId === normalizedProductId);
    const resolvedVariantId =
      productVariantId !== undefined && productVariantId !== null
        ? String(productVariantId)
        : matchingItems[0]?.productVariantId ?? null;

    if (!matchingItems.length) {
      return;
    }

    const previousItems = items;
    setItems((prev) =>
      prev.filter((item) => {
        if (resolvedVariantId) {
          return !(item.productId === normalizedProductId && item.productVariantId === resolvedVariantId);
        }
        return item.productId !== normalizedProductId;
      })
    );

    try {
      const data = await apiRemoveFromWishlist(token, {
        productId: normalizedProductId,
        productVariantId: resolvedVariantId,
      });
      const updated = syncFromResponse(data);
      if (!updated) {
        await refresh();
      }
      toast.success('Removed from wishlist');
    } catch (err) {
      setItems(previousItems);
      handleApiError(err, 'Remove from wishlist');
    }
  }, [token, items, syncFromResponse, handleApiError, refresh]);

  const isInWishlist = useCallback((productId: string, productVariantId?: string | null) => {
    if (productVariantId) {
      return items.some((item) => item.productId === String(productId) && item.productVariantId === String(productVariantId));
    }
    return items.some((item) => item.productId === String(productId));
  }, [items]);

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
