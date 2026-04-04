import React, { useMemo } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { ProductListItem } from '@/app/features/products/product-list.model';
import { ProductCard } from '@/app/components/shop/ProductCard';
import { SkeletonCard } from '@/app/components/shop/SkeletonCard';

type ProductGridProps = {
  products: ProductListItem[];
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  pageSize: number;
};

type VirtualizedRowData = {
  items: Array<ProductListItem | null>;
};

const VirtualizedRow = ({ index, style, rowProps }: RowComponentProps<VirtualizedRowData>) => {
  const rowGap = 24;
  const columns = 4;
  const rowItems = rowProps.items.slice(index * columns, index * columns + columns);

  return (
    <div style={style} className="px-1">
      <div className="grid grid-cols-4 gap-6" style={{ height: `calc(100% - ${rowGap}px)` }}>
        {rowItems.map((item, colIdx) => (
          <div key={`${index}-${colIdx}`} className="h-full min-h-0">
            {item ? <ProductCard product={item} /> : <SkeletonCard />}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductGrid = React.memo(function ProductGrid({
  products,
  isInitialLoading,
  isFetchingNextPage,
  pageSize,
}: ProductGridProps) {
  const skeletons = useMemo(() => Array.from({ length: pageSize }), [pageSize]);
  const useVirtualizedGrid = products.length >= 240;

  const virtualizedItems = useMemo(
    () =>
      isFetchingNextPage
        ? products.concat(Array.from({ length: Math.min(4, pageSize) }).map(() => null as ProductListItem | null))
        : products,
    [products, isFetchingNextPage, pageSize]
  );

  if (isInitialLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {skeletons.map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (useVirtualizedGrid) {
    const rowCount = Math.ceil(virtualizedItems.length / 4);

    return (
      <div className="h-[72vh] min-h-[560px]">
        <AutoSizer
          renderProp={({ height, width }) => (
            <List
              height={height ?? 0}
              width={width ?? 0}
              rowCount={rowCount}
              rowHeight={430}
              rowComponent={VirtualizedRow}
              rowProps={{ items: virtualizedItems }}
              overscanCount={3}
            />
          )}
        />
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
