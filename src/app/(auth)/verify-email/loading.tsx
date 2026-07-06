import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="min-h-screen bg-bg-page flex items-center justify-center px-4">
      <div className="bg-bg-card border border-border rounded-xl shadow-lg p-8 w-full max-w-md">
        <Skeleton className="h-10 w-10 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-6" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
