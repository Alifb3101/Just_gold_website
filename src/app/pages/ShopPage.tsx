import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ShopProductCard } from '@/app/components/shop/ShopProductCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Skeleton } from '@/app/components/ui/skeleton';
import { fetchProductList } from '@/app/api/products/product-list.api';
import type { ProductListItem } from '@/app/features/products/product-list.model';
import { fetchProductByIdSlug } from '@/app/api/products/product-details.api';

const PAGE_SIZE = 12;
const FilterSidebarLazy = lazy(() =>
  import('@/app/components/shop/FilterSidebar').then((module) => ({ default: module.FilterSidebar }))
);

export function ShopPage() {
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['products', 'list', PAGE_SIZE],
    queryFn: ({ pageParam = 1 }) => fetchProductList(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.count / lastPage.limit);
      const nextPage = lastPage.page + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  const totalCount = data?.pages?.[0]?.count ?? 0;

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
      { rootMargin: '320px' }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePrefetchProduct = useCallback(
    (product: ProductListItem) => {
      queryClient.prefetchQuery({
        queryKey: ['product', product.id],
        queryFn: ({ signal }) => fetchProductByIdSlug(product.id, product.slug, signal),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg overflow-hidden border border-gray-100"
        >
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* Hero Section */}
      <div
        className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-[#D4AF37] via-[#B76E79] to-[#D4AF37] flex items-center justify-center"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        <div className="text-center text-white z-10">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Discover Your Gold
          </h1>
          <p className="text-lg md:text-xl opacity-90">Premium cosmetics for every look</p>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#D4AF37] cursor-pointer">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#D4AF37] font-semibold">Shop All</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block flex-shrink-0">
            <Suspense
              fallback={<Skeleton className="w-[280px] h-[720px] rounded-lg" />}
            >
              <FilterSidebarLazy onFilterChange={setActiveFilters} activeFilters={activeFilters} />
            </Suspense>
          </aside>

          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and Mobile Filter Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-white transition-colors">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-['Playfair_Display'] text-2xl text-[#3E2723]">
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <Suspense fallback={<Skeleton className="w-full h-[480px] rounded-lg" />}>
                      <FilterSidebarLazy onFilterChange={setActiveFilters} activeFilters={activeFilters} />
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

              <div className="flex-1" />

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-[#D4AF37] focus:ring-[#D4AF37]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="bestselling">Best Selling</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-6">
              Showing <span className="font-semibold text-[#D4AF37]">{products.length}</span>
              {totalCount ? ` of ${totalCount}` : ''} products
            </p>

            {isError ? (
              <div className="text-red-600 text-sm">{(error as Error).message || 'Failed to load products.'}</div>
            ) : null}

            {/* Product Grid */}
            {isLoading && products.length === 0 ? (
              renderSkeletons()
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    onPrefetch={() => handlePrefetchProduct(product)}
                  />
                ))}
                {isFetchingNextPage
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`loading-${index}`}
                        className="bg-white rounded-lg overflow-hidden border border-gray-100"
                      >
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            )}

            {/* Infinite Scroll Sentinel & Fallback Button */}
            <div ref={loadMoreRef} className="h-10" aria-hidden />
            {hasNextPage && !isLoading ? (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 border-2 border-[#D4AF37] text-[#D4AF37] rounded-lg font-semibold hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Loading more…' : 'Load More'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}