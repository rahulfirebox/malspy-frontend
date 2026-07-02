import React from 'react';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 bg-border rounded w-32 motion-safe:animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`skel-${i}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
