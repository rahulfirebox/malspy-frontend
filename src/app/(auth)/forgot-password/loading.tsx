import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="min-h-screen bg-bg-page flex items-center justify-center px-4">
      <div className="bg-white border border-border rounded-xl shadow-lg p-8 w-full max-w-md space-y-4">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
