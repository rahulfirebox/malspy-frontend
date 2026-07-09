import React from 'react';
import type { BlacklistInfo } from '@/types';

const PROVIDER_LABELS: Record<string, string> = {
  google_safe_browsing: 'Google',
  mcafee: 'McAfee',
  phishtank: 'PhishTank',
  norton_safe_web: 'Norton',
  yandex: 'Yandex',
  opera: 'Opera',
  spamhaus: 'Spamhaus',
};

interface BlacklistProvidersProps {
  blacklists: BlacklistInfo;
}

export function BlacklistProviders({ blacklists }: BlacklistProvidersProps) {
  const providers = Object.entries(blacklists.providers) as [string, boolean][];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {providers.map(([key, isListed]) => (
          <div
            key={key}
            className={`min-w-[6.5rem] flex-1 sm:flex-none sm:w-[7.5rem] h-10 flex items-center justify-center rounded px-2 border text-xs font-medium ${
              isListed
                ? 'bg-danger-bg border-danger text-rating-d-text'
                : 'bg-success-bg border-success text-rating-a-text'
            }`}
          >
            {PROVIDER_LABELS[key] || key} {isListed ? '✗' : '✓'}
          </div>
        ))}
      </div>
      {blacklists.listed && (
        <p className="text-sm text-rating-d-text bg-danger-bg border border-red-200 rounded p-3">
          ⚠ This domain is listed by one or more security providers.
        </p>
      )}
      {!blacklists.listed && (
        <p className="text-sm text-rating-a-text">Not listed by any security provider.</p>
      )}
    </div>
  );
}
