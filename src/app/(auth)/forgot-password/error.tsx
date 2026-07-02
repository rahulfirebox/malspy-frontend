'use client';

import React from 'react';

export default function ForgotPasswordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f6f8]">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-[#1f2937] mb-4">Error</h2>
        <p className="text-sm text-[#6b7280] mb-6">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#2B7DBC] text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
