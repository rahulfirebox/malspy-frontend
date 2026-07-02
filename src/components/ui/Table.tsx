import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`}>{children}</table>
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
      className={`px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider ${className}`}
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
  return <td className={`px-4 py-3 text-text-primary ${className}`}>{children}</td>;
}
