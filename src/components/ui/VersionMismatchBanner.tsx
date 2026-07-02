'use client';
import { useState, useEffect } from 'react';

export function VersionMismatchBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleMismatch = () => setShowBanner(true);
    window.addEventListener('api:version-mismatch', handleMismatch);
    return () => window.removeEventListener('api:version-mismatch', handleMismatch);
  }, []);

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9998] bg-warning text-white p-4 rounded-lg max-w-xs"
    >
      A new version is available.{' '}
      <button
        onClick={() => window.location.reload()}
        className="underline cursor-pointer bg-transparent border-none text-white font-[inherit]"
      >
        Reload
      </button>
    </div>
  );
}
