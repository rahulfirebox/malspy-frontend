import React from 'react';
import { SkeletonTable } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <div className="h-8 bg-border rounded w-20 motion-safe:animate-pulse" />
      <SkeletonTable rows={8} />
    </div>
  );
}
