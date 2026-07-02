import React from 'react';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="min-h-screen bg-bg-page flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mx-4 text-center">
        <svg
          className="motion-safe:animate-spin h-10 w-10 text-primary mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-text-primary font-medium">Loading scan results…</p>
      </div>
    </div>
  );
}
