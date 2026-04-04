import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';
import { Skeleton } from '@/app/components/ui/skeleton';
import { ProductGrid } from '@/app/components/shop/ProductGrid';
import type { ProductCursorPage, ProductFilters, ProductSort } from '@/app/features/products/product-cursor-list.model';
import { getProducts } from '@/services/productService';
import { SEOHead, CategorySchema, BreadcrumbSchema } from '@/app/components/seo';
import { SEO_CONFIG } from '@/app/utils/seo';
import { useCategories } from '@/store/categoryStore';

const PAGE_SIZE = 12;

const FilterSidebarLazy = React.lazy(() =>
  import('@/app/components/shop/FilterSidebar').then((module) => ({ default: module.FilterSidebar }))
);

const DEFAULT_FILTERS: ProductFilters = {
  category: null,
  search: null,
  minPrice: null,
  maxPrice: null,
  color: null,
  size: null,
  sort: 'newest',
};

const VALID_SORTS: ProductSort[] = ['newest', 'popular', 'price_low', 'price_high'];
const DEFAULT_SHOP_BANNER_IMAGE_URL = 'https://i.postimg.cc/yYTcSCZj/Liquid-Highlighter.jpg';

// Add category-level banner URLs here (key = parent category id)
const SHOP_BANNER_BY_PARENT_CATEGORY_ID: Record<number, string> = {
  // 5: 'https://your-cdn.com/eyes-parent-banner.jpg',
};

// Add subcategory-level banner URLs here (key = subcategory id)
const SHOP_BANNER_BY_SUBCATEGORY_ID: Record<number, string> = {
  // 12: 'https://your-cdn.com/eyeliner-sub-banner.jpg',
};

function serializeFilters(filters: ProductFilters) {
  return {
    category: filters.category,
    search: filters.search,
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
  const { categories } = useCategories();

  const stableFilters = useMemo(() => serializeFilters(filters), [filters]);
  const queryKey = useMemo(() => ['products', 'cursor-list', stableFilters] as const, [stableFilters]);

  const urlFilters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const search = params.get('search');
    const sortParam = params.get('sort');
    const sort = VALID_SORTS.includes((sortParam ?? '') as ProductSort) ? (sortParam as ProductSort) : 'newest';
    return {
      category: category?.trim() || null,
      search: search?.trim() || null,
      sort,
    };
  }, [location.search]);

  useEffect(() => {
    setFilters((prev) => {
      if (
        prev.category === urlFilters.category &&
        prev.search === urlFilters.search &&
        prev.sort === urlFilters.sort
      )
        return prev;
      preserveScrollRef.current = window.scrollY;
      return { ...prev, category: urlFilters.category, search: urlFilters.search, sort: urlFilters.sort };
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
          search: filters.search,
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

  // SEO data generation
  const currentCategory = useMemo(() => {
    if (!filters.category) return null;
    const categoryId = parseInt(String(filters.category), 10);
    for (const cat of categories) {
      if (cat.id === categoryId) return { parent: cat, sub: null };
      const sub = cat.subcategories?.find((s) => s.id === categoryId);
      if (sub) return { parent: cat, sub };
    }
    return null;
  }, [filters.category, categories]);

  const seoTitle = useMemo(() => {
    if (filters.search) return `Search: ${filters.search}`;
    if (currentCategory?.sub) return `${currentCategory.sub.name} - ${currentCategory.parent.name}`;
    if (currentCategory?.parent) return currentCategory.parent.name;
    return 'Shop All Products';
  }, [filters.search, currentCategory]);

  const seoDescription = useMemo(() => {
    if (filters.search) {
      return `Search results for "${filters.search}" - Find premium luxury cosmetics and beauty products.`;
    }
    if (currentCategory?.sub) {
      return `Shop ${currentCategory.sub.name} from our ${currentCategory.parent.name} collection. Premium luxury cosmetics and beauty products with free shipping.`;
    }
    if (currentCategory?.parent) {
      return `Explore our ${currentCategory.parent.name} collection. Premium luxury cosmetics, skincare, and beauty essentials.`;
    }
    return 'Browse our complete collection of luxury cosmetics, skincare, and premium beauty products. Free shipping on all orders.';
  }, [filters.search, currentCategory]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ name: 'Home', url: SEO_CONFIG.siteUrl }];
    items.push({ name: 'Shop', url: `${SEO_CONFIG.siteUrl}/shop` });
    if (currentCategory?.parent) {
      items.push({
        name: currentCategory.parent.name,
        url: `${SEO_CONFIG.siteUrl}/shop?category=${currentCategory.parent.id}`,
      });
    }
    if (currentCategory?.sub) {
      items.push({
        name: currentCategory.sub.name,
        url: `${SEO_CONFIG.siteUrl}/shop?category=${currentCategory.sub.id}`,
      });
    }
    return items;
  }, [currentCategory]);

  const currentBannerImageUrl = useMemo(() => {
    if (currentCategory?.sub?.id && SHOP_BANNER_BY_SUBCATEGORY_ID[currentCategory.sub.id]) {
      return SHOP_BANNER_BY_SUBCATEGORY_ID[currentCategory.sub.id];
    }

    if (currentCategory?.parent?.id && SHOP_BANNER_BY_PARENT_CATEGORY_ID[currentCategory.parent.id]) {
      return SHOP_BANNER_BY_PARENT_CATEGORY_ID[currentCategory.parent.id];
    }

    const selectedCategoryId = filters.category ? Number(filters.category) : null;
    if (selectedCategoryId && SHOP_BANNER_BY_SUBCATEGORY_ID[selectedCategoryId]) {
      return SHOP_BANNER_BY_SUBCATEGORY_ID[selectedCategoryId];
    }
    if (selectedCategoryId && SHOP_BANNER_BY_PARENT_CATEGORY_ID[selectedCategoryId]) {
      return SHOP_BANNER_BY_PARENT_CATEGORY_ID[selectedCategoryId];
    }

    return DEFAULT_SHOP_BANNER_IMAGE_URL;
  }, [filters.category, currentCategory]);

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* SEO Meta Tags */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        path={`/shop${location.search}`}
        noIndex={!!filters.search}
        keywords={[
          'luxury cosmetics',
          'premium beauty',
          currentCategory?.parent?.name || '',
          currentCategory?.sub?.name || '',
          'skincare',
          'makeup',
        ].filter(Boolean)}
      />
      {currentCategory && (
        <CategorySchema
          name={currentCategory.sub?.name || currentCategory.parent.name}
          description={seoDescription}
          url={`${SEO_CONFIG.siteUrl}/shop?category=${currentCategory.sub?.id || currentCategory.parent.id}`}
        />
      )}
      <BreadcrumbSchema items={breadcrumbItems} />

      <section className="hidden md:block max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 md:pt-6">
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#EADBC2] shadow-[0_18px_44px_rgba(62,39,35,0.14)] aspect-[5/1] min-h-[96px] sm:aspect-[11/2] sm:min-h-[112px] md:aspect-[6/1] md:min-h-[128px] lg:aspect-[3196/525] lg:min-h-0"
        >
          {currentBannerImageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center px-3 sm:px-4 md:px-5 lg:px-0">
              <img
                src={currentBannerImageUrl}
                alt="Shop banner"
                className="h-full w-auto max-w-[88%] sm:max-w-[90%] md:max-w-[92%] lg:max-w-none object-contain lg:object-cover object-center"
                loading="eager"
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1920px"
                {...({ fetchpriority: 'high' } as Record<string, string>)}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#2A1B14_0%,#563326_32%,#C39A56_70%,#F9E8C8_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(26,17,12,0.12)_0%,rgba(26,17,12,0.06)_42%,rgba(255,244,223,0)_76%)] lg:bg-[linear-gradient(96deg,rgba(26,17,12,0.26)_0%,rgba(26,17,12,0.12)_42%,rgba(255,244,223,0)_76%)]" />

          <div className="relative z-10 hidden lg:flex h-full items-center justify-between px-4 sm:px-6 md:px-7 lg:px-12 gap-3">
            <div className="max-w-[82%] sm:max-w-[72%]">
              <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-[#FFF7E8] font-semibold mb-1 sm:mb-2">
                Explore Our Premium products
              </p>
              <h1 className="text-white font-black text-[17px] sm:text-2xl md:text-3xl lg:text-4xl leading-[1.06] drop-shadow-[0_1px_4px_rgba(0,0,0,0.22)] line-clamp-2">
                {currentCategory?.sub?.name || currentCategory?.parent?.name || 'Shop Premium Cosmetics'}
              </h1>

            </div>
            <div className="shrink-0 text-right">
            </div>
          </div>
        </div>
      </section>

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
