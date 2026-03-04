// @ts-check
import { fetchJson } from '@/app/api/http';
import { mapApiProductCursorListResponse } from '@/app/api/products/product-cursor-list.mapper';

/** @param {string | number | null | undefined} value */
const toOptionalString = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length ? str : null;
};

/**
 * Fetch products from the backend with server-driven filtering and cursor-based pagination.
 * @param {object} filters
 * @param {string | number | null} [filters.category]
 * @param {string | null} [filters.search]
 * @param {number | null} [filters.minPrice]
 * @param {number | null} [filters.maxPrice]
 * @param {string | null} [filters.color]
 * @param {string | null} [filters.size]
 * @param {import('@/app/features/products/product-cursor-list.model').ProductSort} [filters.sort]
 * @param {number | null} [filters.cursor]
 * @param {AbortSignal} [signal]
 */
export async function getProducts(filters = {}, signal) {
  const params = new URLSearchParams();

  const category = toOptionalString(filters.category);
  const search = toOptionalString(filters.search);
  const minPrice = toOptionalString(filters.minPrice);
  const maxPrice = toOptionalString(filters.maxPrice);
  const color = toOptionalString(filters.color);
  const size = toOptionalString(filters.size);
  const sort = toOptionalString(filters.sort) ?? 'newest';
  const cursor = filters.cursor ?? null;

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

  try {
    console.debug('[products] fetch', url);
    const response = await fetchJson(url, { signal });

    // Backend currently returns { page, limit, count, products: [...] } without cursor fields.
    // Normalize into the cursor-based shape expected by the mapper.
    const page = Number(response.page ?? 1);
    const limit = Number(response.limit ?? (response.products?.length ?? 0));
    const total = Number(response.count ?? 0);
    const products = Array.isArray(response.products) ? response.products : [];
    const hasMore = limit > 0 ? page * limit < total : false;
    const nextCursor = hasMore ? page + 1 : null;

    return mapApiProductCursorListResponse({
      products,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    // Ignore aborts caused by React Query cancellations or rapid navigations.
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.debug('[products] fetch aborted', { url });
      return { products: [], nextCursor: null, hasMore: false };
    }

    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : String(error);
    console.error('[products] fetch error', { url, message: errorMessage, error });
    throw error instanceof Error ? error : new Error(errorMessage || 'Failed to fetch products');
  }
}
