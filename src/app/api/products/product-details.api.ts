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
  const apiProduct = await fetchJson<ApiProduct>(`/product/${slugSegment}`, {
    signal,
  });
  return mapApiProductToProduct(apiProduct);
}
