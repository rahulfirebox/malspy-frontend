'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Results page error:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
      <ErrorState
        title="Failed to load results"
        message="We couldn't load the scan results. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
