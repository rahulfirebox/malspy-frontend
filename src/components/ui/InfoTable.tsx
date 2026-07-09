import React from 'react';

export interface InfoTableRow {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

interface InfoTableProps {
  rows: InfoTableRow[];
}

export function InfoTable({ rows }: InfoTableProps) {
  return (
    <dl className="divide-y divide-border text-sm">
      {rows.map(row => (
        <div
          key={row.label}
          className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 gap-0.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4 sm:items-start"
        >
          <dt className="text-text-secondary font-medium sm:font-normal shrink-0">{row.label}</dt>
          <dd className={`min-w-0 break-words ${row.valueClassName ?? 'text-text-primary'}`}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
