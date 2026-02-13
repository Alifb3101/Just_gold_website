import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';
import { Skeleton } from '@/app/components/ui/skeleton';
import { ProductGrid } from '@/app/components/shop/ProductGrid';
import type { ProductCursorPage, ProductFilters } from '@/app/features/products/product-cursor-list.model';
import { getProducts } from '@/services/productService';

const PAGE_SIZE = 12;

const FilterSidebarLazy = React.lazy(() =>
  import('@/app/components/shop/FilterSidebar').then((module) => ({ default: module.FilterSidebar }))
);

const DEFAULT_FILTERS: ProductFilters = {
  category: null,
  minPrice: null,
  maxPrice: null,
  color: null,
  size: null,
  sort: 'newest',
};

function serializeFilters(filters: ProductFilters) {
  return {
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    color: filters.color,
    size: filters.size,
    sort: filters.sort,
  };
}

export function ProductPage() {
  const location = useLocation();
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const preserveScrollRef = useRef<number | null>(null);

  const stableFilters = useMemo(() => serializeFilters(filters), [filters]);
  const queryKey = useMemo(() => ['products', 'cursor-list', stableFilters] as const, [stableFilters]);

  const urlFilters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    return {
      category: category?.trim() || null,
    };
  }, [location.search]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.category === urlFilters.category) return prev;
      preserveScrollRef.current = window.scrollY;
      return { ...prev, category: urlFilters.category };
    });
  }, [urlFilters]);

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery<ProductCursorPage, Error>({
    queryKey,
    initialPageParam: null as unknown as null,
    queryFn: ({ pageParam, signal }) =>
      getProducts(
        {
          ...filters,
          cursor: pageParam as number | null | undefined,
        },
        signal
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(() => data?.pages.flatMap((page) => page.products) ?? [], [data]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (preserveScrollRef.current === null) return;
    if (isFetching) return;
    const y = preserveScrollRef.current;
    preserveScrollRef.current = null;
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
  }, [isFetching]);

  const handleFiltersChange = useCallback((next: ProductFilters) => {
    preserveScrollRef.current = window.scrollY;
    setFilters(next);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block flex-shrink-0 w-[280px]">
            <Suspense fallback={<Skeleton className="w-[280px] h-[720px] rounded-lg" />}>
              <FilterSidebarLazy filters={filters} onChange={handleFiltersChange} />
            </Suspense>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4">
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-white transition-colors">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-['Playfair_Display'] text-2xl text-[#3E2723]">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <Suspense fallback={<Skeleton className="w-full h-[480px] rounded-lg" />}>
                      <FilterSidebarLazy filters={filters} onChange={handleFiltersChange} />
                    </Suspense>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-semibold"
                  >
                    Show Results
                  </button>
                </SheetContent>
              </Sheet>
            </div>

            {isError ? (
              <div className="text-red-600 text-sm mb-6">{error?.message || 'Failed to load products.'}</div>
            ) : null}

            <ProductGrid
              products={products}
              isInitialLoading={isPending}
              isFetchingNextPage={isFetchingNextPage}
              pageSize={PAGE_SIZE}
            />

            <div ref={loadMoreRef} className="h-10" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
