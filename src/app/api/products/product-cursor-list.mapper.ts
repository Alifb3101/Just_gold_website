import type { ApiProductCursorListResponse } from '@/app/api/products/product-cursor-list.api-model';
import type { ProductCursorPage } from '@/app/features/products/product-cursor-list.model';
import { mapApiListProductToProduct } from '@/app/api/products/product-list.mapper';

export const mapApiProductCursorListResponse = (
  api: ApiProductCursorListResponse
): ProductCursorPage => ({
  products: api.products.map(mapApiListProductToProduct),
  nextCursor: api.nextCursor ?? null,
  hasMore: Boolean(api.hasMore),
});
