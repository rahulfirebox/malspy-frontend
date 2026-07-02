'use client';
import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { logger } from '@/lib/logger';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error(error.message, {});
  }, [error]);
  return <ErrorState message="Something went wrong." onRetry={reset} />;
}
