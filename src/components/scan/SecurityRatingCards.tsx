import React from 'react';
import type { ScanRatings, OverallRating } from '@/types';
import { RatingBadgeLarge } from './RatingBadge';

interface SecurityRatingCardsProps {
  ratings: ScanRatings;
}

export function SecurityRatingCards({ ratings }: SecurityRatingCardsProps) {
  const cards = [
    { label: 'Security Headers', key: 'security' as const, data: ratings.security },
    { label: 'Domain Info', key: 'domain' as const, data: ratings.domain },
    { label: 'SSL/TLS', key: 'tls' as const, data: ratings.tls },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(card => (
        <div
          key={card.key}
          className="bg-white border border-border rounded-lg p-5 text-center shadow-sm"
        >
          <RatingBadgeLarge rating={card.data.rating as OverallRating} />
          <p className="text-sm font-medium text-text-primary mt-3">{card.label}</p>
          {card.data.passed && (
            <p className="text-xs text-text-secondary mt-1">{card.data.passed} checks passed</p>
          )}
        </div>
      ))}
    </div>
  );
}
