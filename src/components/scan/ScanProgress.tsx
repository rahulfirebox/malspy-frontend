'use client';

import React, { useEffect, useState } from 'react';

interface ScanProgressProps {
  domain: string;
  progressPercent?: number;
  estimatedSeconds?: number;
}

export function ScanProgress({ domain, progressPercent = 0, estimatedSeconds }: ScanProgressProps) {
  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    const target = Math.max(progressPercent, 5);
    const timer = setTimeout(() => setDisplayWidth(target), 100);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  return (
    <div className="flex flex-col items-center py-12">
      <div className="flex items-center justify-center mb-6">
        <svg
          className="motion-safe:animate-spin h-10 w-10 text-primary"
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
      </div>
      <p className="text-lg font-semibold text-text-primary mb-1">Scanning {domain}…</p>
      <p className="text-sm text-text-secondary mb-6">
        {estimatedSeconds
          ? `About ${estimatedSeconds} seconds remaining`
          : 'This may take 30–60 seconds'}
      </p>
      <div className="w-full max-w-md bg-border rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${displayWidth}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {progressPercent > 0 && <p className="text-xs text-text-secondary mt-2">{progressPercent}%</p>}
    </div>
  );
}
