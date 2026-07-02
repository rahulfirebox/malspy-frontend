'use client';

import React from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
      <ErrorState title="Login Error" message="Something went wrong." onRetry={reset} />
    </div>
  );
}
