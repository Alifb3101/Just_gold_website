import React from 'react';
import { Skeleton } from '@/app/components/ui/skeleton';

export const SkeletonCard = React.memo(function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';
