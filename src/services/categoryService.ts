import type { ApiCategoryNode } from '@/app/api/categories/categories.api-model';
import { fetchJson } from '@/app/api/http';

const CATEGORIES_ENDPOINT = '/categories';

export async function getCategories(signal?: AbortSignal): Promise<ApiCategoryNode[]> {
  try {
    return await fetchJson<ApiCategoryNode[]>(CATEGORIES_ENDPOINT, { signal });
  } catch (error) {
    throw error;
  }
}
