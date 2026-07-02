import React from 'react';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 bg-border rounded w-40 motion-safe:animate-pulse" />
      <SkeletonCard />
    </div>
  );
}
