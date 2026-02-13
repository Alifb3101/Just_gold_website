import type { ApiProductListItem } from '@/app/api/products/product-list.api-model';

export interface ApiProductCursorListResponse {
  products: ApiProductListItem[];
  nextCursor: number | null;
  hasMore: boolean;
}
