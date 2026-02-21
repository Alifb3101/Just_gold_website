import { fetchJson } from '@/app/api/http';

export type SearchSuggestion = {
  name: string;
  slug: string;
  thumbnail?: string | null;
};

export type TrendingSearch = {
  query: string;
  search_count: number;
};

export async function fetchSearchSuggestions(query: string, signal?: AbortSignal) {
  const url = `/search/suggestions?q=${encodeURIComponent(query)}`;
  console.debug('[search] suggestions ->', url);
  const res = await fetchJson<{ suggestions: SearchSuggestion[] }>(url, { signal }).catch((err) => {
    console.error('[search] suggestions error', err);
    throw err;
  });
  return res.suggestions ?? [];
}

export async function fetchTrendingSearches(signal?: AbortSignal) {
  const url = `/search/trending`;
  console.debug('[search] trending ->', url);
  const res = await fetchJson<{ trending: TrendingSearch[] }>(url, { signal }).catch((err) => {
    console.error('[search] trending error', err);
    throw err;
  });
  return res.trending ?? [];
}
