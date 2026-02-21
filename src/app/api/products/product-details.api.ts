import { fetchJson } from '@/app/api/http';
import { mapApiProductToProduct } from '@/app/api/products/product-details.mapper';
import type { ApiProduct } from '@/app/api/products/product-details.api-model';
import type { Product } from '@/app/features/products/product-details.model';

export async function fetchProductByIdSlug(
  id: string | number,
  slug?: string,
  signal?: AbortSignal
): Promise<Product> {
  const slugSegment = slug ? `${id}-${slug}` : String(id);
  const url = `/product/${slugSegment}`;
  console.debug('[product details] fetch', url);
  const apiProduct = await fetchJson<ApiProduct>(url, {
    signal,
  }).catch((err) => {
    console.error('[product details] fetch error', { url, err });
    throw err;
  });
  return mapApiProductToProduct(apiProduct);
}
