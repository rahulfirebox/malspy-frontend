'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/lib/pagination';

interface PaginationProps {
  meta: PaginationMeta;
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}

function rangeLabel(meta: PaginationMeta): string {
  if (meta.endIndex === 0) return 'No results';
  if (meta.totalCount !== null) {
    return `Showing ${meta.startIndex}–${meta.endIndex} of ${meta.totalCount}`;
  }
  return `Showing ${meta.startIndex}–${meta.endIndex}`;
}

function pageLabel(meta: PaginationMeta): string {
  if (meta.totalPages !== null) {
    return `Page ${meta.page} of ${meta.totalPages}`;
  }
  return `Page ${meta.page}`;
}

export function Pagination({ meta, onNext, onPrevious, className = '' }: PaginationProps) {
  if (meta.endIndex === 0 && !meta.hasPrevious && !meta.hasNext) return null;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border ${className}`}
    >
      <p className="text-xs text-text-secondary">{rangeLabel(meta)}</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!meta.hasPrevious}
          className="inline-flex items-center gap-1 h-8 px-3 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-page disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Prev
        </button>

        <span className="text-xs text-text-secondary px-2">{pageLabel(meta)}</span>

        <button
          type="button"
          onClick={onNext}
          disabled={!meta.hasNext}
          className="inline-flex items-center gap-1 h-8 px-3 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-page disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
