import { fetchJson } from '@/app/api/http';
import type { ApiCategoryNode } from '@/app/api/categories/categories.api-model';

export type CategoryOption = {
  id: number;
  label: string;
};

export async function fetchCategories(signal?: AbortSignal): Promise<ApiCategoryNode[]> {
  return fetchJson<ApiCategoryNode[]>('/categories', { signal });
}

export function flattenCategoryOptions(nodes: ApiCategoryNode[]): CategoryOption[] {
  const options: CategoryOption[] = [];

  nodes.forEach((node) => {
    const subs = node.subcategories ?? [];
    if (subs.length === 0) {
      options.push({ id: node.id, label: node.name });
      return;
    }
    subs.forEach((sub) => {
      options.push({ id: sub.id, label: `${node.name} / ${sub.name}` });
    });
  });

  return options;
}
