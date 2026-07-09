import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="w-full max-w-[920px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_25px_60px_-15px_rgba(37,99,235,0.2)]">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="hidden lg:block bg-primary/20 p-10">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="mt-10 h-8 w-64" />
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
          <div className="space-y-4 p-8 sm:p-10">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="mt-4 h-10 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
