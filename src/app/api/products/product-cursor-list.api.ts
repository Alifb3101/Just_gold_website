import { fetchJson } from '@/app/api/http';
import type { ApiProductCursorListResponse } from '@/app/api/products/product-cursor-list.api-model';
import { mapApiProductCursorListResponse } from '@/app/api/products/product-cursor-list.mapper';
import type { ProductCursorPage, ProductFilters } from '@/app/features/products/product-cursor-list.model';

const toOptionalString = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length ? str : null;
};

export async function fetchProductCursorList(
  filters: ProductFilters,
  cursor: number | null,
  signal?: AbortSignal
): Promise<ProductCursorPage> {
  const params = new URLSearchParams();

  const category = toOptionalString(filters.category);
  const search = toOptionalString(filters.search);
  const minPrice = toOptionalString(filters.minPrice);
  const maxPrice = toOptionalString(filters.maxPrice);
  const color = toOptionalString(filters.color);
  const size = toOptionalString(filters.size);
  const sort = toOptionalString(filters.sort) ?? 'newest';

  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (color) params.set('color', color);
  if (size) params.set('size', size);
  if (sort) params.set('sort', sort);
  if (cursor !== null) params.set('cursor', String(cursor));

  const qs = params.toString();
  const url = `/products${qs ? `?${qs}` : ''}`;

  const response = await fetchJson<ApiProductCursorListResponse>(url, { signal });
  return mapApiProductCursorListResponse(response);
}
