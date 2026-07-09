import React from 'react';

interface StatsCardProps {
  label?: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  accent?: string;
}

export function StatsCard({ label, value, icon, subtext, accent }: StatsCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-4 sm:p-6 shadow-md flex items-start gap-3 sm:gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${!accent ? 'bg-primary-light' : ''}`}
        style={accent ? { backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` } : undefined}
      >
        <div style={{ color: accent || 'var(--color-primary)' }}>{icon}</div>
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold text-text-primary">{value}</p>
        {label ? <p className="text-sm text-text-secondary">{label}</p> : null}
        {subtext && <p className="text-xs text-text-secondary mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}
