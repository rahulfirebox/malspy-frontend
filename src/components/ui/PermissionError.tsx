import React from 'react';
import { ShieldOff } from 'lucide-react';

interface PermissionErrorProps {
  message?: string;
}

export function PermissionError({
  message = "You don't have permission to perform this action.",
}: PermissionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <ShieldOff className="h-12 w-12 text-warning mb-4" aria-hidden="true" />
      <h3 className="text-base font-semibold text-text-primary mb-1">Access Denied</h3>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}
