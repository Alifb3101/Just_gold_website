import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { ApiCategoryNode } from '@/app/api/categories/categories.api-model';
import { getCategories } from '@/services/categoryService';

export type CategoryState = {
  categories: ApiCategoryNode[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  refresh: () => void;
};

const CategoryContext = createContext<CategoryState | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ApiCategoryNode[]>([]);
  const [status, setStatus] = useState<CategoryState['status']>('idle');
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const load = useCallback(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setStatus('loading');
    setError(null);

    getCategories()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setStatus('success');
      })
      .catch((err: any) => {
        setStatus('error');
        setError(err?.message ?? 'Failed to load categories');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<CategoryState>(
    () => ({ categories, status, error, refresh: load }),
    [categories, status, error, load]
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider');
  return ctx;
}
