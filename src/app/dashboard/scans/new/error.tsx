'use client';

import React from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Scan Error" message="Failed to load the scan form." onRetry={reset} />;
}
