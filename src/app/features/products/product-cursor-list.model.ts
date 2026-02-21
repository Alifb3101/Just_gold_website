import type { ProductListItem } from '@/app/features/products/product-list.model';

export type ProductSort = 'price_low' | 'price_high' | 'newest' | 'popular';

export type ProductFilters = {
  category: string | number | null;
  search: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  color: string | null;
  size: string | null;
  sort: ProductSort;
};

export type ProductCursorPage = {
  products: ProductListItem[];
  nextCursor: number | null;
  hasMore: boolean;
};
