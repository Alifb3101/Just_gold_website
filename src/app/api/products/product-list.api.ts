import { fetchJson } from "@/app/api/http";
import type { ApiProductListResponse } from "@/app/api/products/product-list.api-model";
import { mapApiProductListResponse } from "@/app/api/products/product-list.mapper";
import type { ProductListPage } from "@/app/features/products/product-list.model";

export async function fetchProductList(
  page: number,
  limit = 12,
  signal?: AbortSignal
): Promise<ProductListPage> {
  const response = await fetchJson<ApiProductListResponse>(
    `/products?page=${page}&limit=${limit}`,
    { signal }
  );
  return mapApiProductListResponse(response);
}
