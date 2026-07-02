import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-bg text-rating-a-text border-green-200',
  danger: 'bg-danger-bg text-rating-d-text border-red-200',
  warning: 'bg-warning-bg text-rating-b-text border-yellow-200',
  info: 'bg-info-bg text-blue-800 border-blue-200',
  neutral: 'bg-bg-page text-text-secondary border-border',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
