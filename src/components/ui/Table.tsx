import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto -mx-px">
      <table className={`w-full min-w-[640px] text-sm text-left ${className}`}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-bg-page border-b border-border">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Th({
  children,
  className = '',
  scope = 'col',
}: {
  children?: React.ReactNode;
  className?: string;
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
}) {
  return (
    <th
      scope={scope}
      className={`px-2 py-2 sm:px-4 sm:py-3 text-xs font-medium text-text-secondary uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-2 py-2 sm:px-4 sm:py-3 text-text-primary ${className}`}>{children}</td>;
}
