'use client';

import React from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorState title="Something went wrong" message="An unexpected error occurred." onRetry={reset} />
    </div>
  );
}
