import React from 'react';
import type { OverallRating } from '@/types';

const ratingConfig: Record<OverallRating, { bgClass: string; label: string }> = {
  A: { bgClass: 'bg-rating-a', label: 'Secure' },
  B: { bgClass: 'bg-rating-b', label: 'Minor Issues' },
  C: { bgClass: 'bg-rating-c', label: 'Vulnerable' },
  D: { bgClass: 'bg-rating-d', label: 'Critical' },
};

interface RatingBadgeLargeProps {
  rating: OverallRating;
}

export function RatingBadgeLarge({ rating }: RatingBadgeLargeProps) {
  const config = ratingConfig[rating];
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out] ${config.bgClass}`}
      >
        <span className="text-4xl font-bold text-white">{rating}</span>
      </div>
      <span className="text-sm text-text-secondary">{config.label}</span>
    </div>
  );
}

interface RatingBadgeSmallProps {
  rating: OverallRating | null;
}

export function RatingBadgeSmall({ rating }: RatingBadgeSmallProps) {
  if (!rating) {
    return (
      <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center">
        <span className="text-xs font-bold text-text-secondary">—</span>
      </div>
    );
  }
  const config = ratingConfig[rating];
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgClass}`}
    >
      <span className="text-xs font-bold text-white">{rating}</span>
    </div>
  );
}
