import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <XCircle className="h-12 w-12 text-danger mb-4" aria-hidden="true" />
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" size="md" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
