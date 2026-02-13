import React, { useMemo } from 'react';
import type { ProductListItem } from '@/app/features/products/product-list.model';
import { ProductCard } from '@/app/components/shop/ProductCard';
import { SkeletonCard } from '@/app/components/shop/SkeletonCard';

type ProductGridProps = {
  products: ProductListItem[];
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  pageSize: number;
};

export const ProductGrid = React.memo(function ProductGrid({
  products,
  isInitialLoading,
  isFetchingNextPage,
  pageSize,
}: ProductGridProps) {
  const skeletons = useMemo(() => Array.from({ length: pageSize }), [pageSize]);

  if (isInitialLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {skeletons.map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {isFetchingNextPage
        ? skeletons.slice(0, Math.min(4, pageSize)).map((_, index) => (
            <SkeletonCard key={`skeleton-next-${index}`} />
          ))
        : null}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';
