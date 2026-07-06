import React from 'react';
import type { ScanRatings, OverallRating, RatingScore } from '@/types';
import { RatingBadgeLarge } from './RatingBadge';

interface SecurityRatingCardsProps {
  ratings?: ScanRatings | null;
}

const FALLBACK_RATING: RatingScore = { rating: 'B' };

export function SecurityRatingCards({ ratings }: SecurityRatingCardsProps) {
  const cards = [
    { label: 'Security Headers', key: 'security' as const, data: ratings?.security ?? FALLBACK_RATING },
    { label: 'Domain Info', key: 'domain' as const, data: ratings?.domain ?? FALLBACK_RATING },
    { label: 'SSL/TLS', key: 'tls' as const, data: ratings?.tls ?? FALLBACK_RATING },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(card => (
        <div
          key={card.key}
          className="bg-bg-card border border-border rounded-lg p-5 text-center shadow-sm"
        >
          <RatingBadgeLarge rating={(card.data.rating ?? 'B') as OverallRating} />
          <p className="text-sm font-medium text-text-primary mt-3">{card.label}</p>
          {card.data.passed && (
            <p className="text-xs text-text-secondary mt-1">{card.data.passed} checks passed</p>
          )}
        </div>
      ))}
    </div>
  );
}
