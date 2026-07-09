'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full max-w-[920px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card p-8 sm:p-10 text-center shadow-[0_25px_60px_-15px_rgba(37,99,235,0.2)]">
        <h2 className="text-xl font-bold text-text-primary mb-3">Something went wrong</h2>
        <p className="text-sm text-text-secondary mb-6">
          {error.message || 'Please try again.'}
        </p>
        <Button onClick={reset} size="md">
          Try again
        </Button>
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
