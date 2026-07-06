import React from 'react';
import type { Domain } from '@/types';
import { Globe } from 'lucide-react';

const statusConfig = {
  clean: { dotClass: 'bg-success', label: 'Clean', bgClass: 'bg-success-bg', textClass: 'text-rating-a-text' },
  infected: { dotClass: 'bg-danger', label: 'Infected', bgClass: 'bg-danger-bg', textClass: 'text-rating-d-text' },
  blacklisted: { dotClass: 'bg-danger', label: 'Blacklisted', bgClass: 'bg-danger-bg', textClass: 'text-rating-d-text' },
  unknown: { dotClass: 'bg-border-dark', label: 'Unknown', bgClass: 'bg-bg-page', textClass: 'text-text-secondary' },
};

interface DomainCardProps {
  domain: Domain;
}

export function DomainCard({ domain }: DomainCardProps) {
  const config = statusConfig[domain.last_status];

  return (
    <div className="bg-bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Globe className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.bgClass} ${config.textClass}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${config.dotClass}`}
            aria-hidden="true"
          />
          {config.label}
        </span>
      </div>
      <p className="font-mono text-sm font-semibold text-text-primary truncate mt-1">
        {domain.domain}
      </p>
      <p className="text-xs text-text-secondary mt-1 capitalize">Scan: {domain.frequency}</p>
      {domain.last_scan_id && <p className="text-xs text-text-secondary mt-0.5">Last scan recorded</p>}
    </div>
  );
}
