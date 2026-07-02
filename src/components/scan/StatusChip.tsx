import React from 'react';
import type { ScanStatus } from '@/types';

interface MalwareStatusChipProps {
  detected: boolean;
}

export function MalwareStatusChip({ detected }: MalwareStatusChipProps) {
  if (detected) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-danger-bg text-rating-d-text border border-red-200">
        ✗ Malware Detected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-success-bg text-rating-a-text border border-green-200">
      ✓ Clean
    </span>
  );
}

interface ScanStatusChipProps {
  status: ScanStatus;
}

const statusConfig: Record<ScanStatus, { bgClass: string; textClass: string; label: string }> = {
  queued: { bgClass: 'bg-info-bg', textClass: 'text-blue-800', label: 'Queued' },
  scanning: { bgClass: 'bg-warning-bg', textClass: 'text-rating-b-text', label: 'Scanning…' },
  completed: { bgClass: 'bg-success-bg', textClass: 'text-rating-a-text', label: 'Completed' },
  failed: { bgClass: 'bg-danger-bg', textClass: 'text-rating-d-text', label: 'Failed' },
};

export function ScanStatusChip({ status }: ScanStatusChipProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bgClass} ${config.textClass}`}
    >
      {status === 'scanning' && (
        <svg
          className="motion-safe:animate-spin h-3 w-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {config.label}
    </span>
  );
}
