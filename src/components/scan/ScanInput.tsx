'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, CheckCircle, Search } from 'lucide-react';
import { scanService } from '@/services/scanService';
import { PublicScanSchema } from '@/lib/schemas/scan';
import { parseApiError } from '@/lib/apiUtils';

interface ScanInputProps {
  variant?: 'light' | 'dark';
}

export function ScanInput({ variant = 'light' }: ScanInputProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitCooldownRef = useRef(false);
  const isDark = variant === 'dark';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setError(null);

    const result = PublicScanSchema.safeParse({ url });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    submitCooldownRef.current = true;
    setTimeout(() => { submitCooldownRef.current = false; }, 2000);
    setLoading(true);
    try {
      const scan = await scanService.publicScan(result.data.url);
      if (!scan.scan_id) {
        setError('Scan started but no result id was returned. Please try again.');
        return;
      }
      router.push(`/results/${scan.scan_id}`);
    } catch (err: unknown) {
      const apiErr = parseApiError(err);
      setError(apiErr.message || 'Failed to start scan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const wrapperClass = isDark
    ? 'w-full max-w-3xl mx-auto rounded-2xl border border-border/60 bg-bg-card/55 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_80px_rgba(37,99,235,0.12)]'
    : 'bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl mx-auto';

  const labelClass = isDark
    ? 'text-sm font-medium text-text-primary mb-5 text-center'
    : 'text-sm font-medium text-text-secondary mb-3';

  const inputClass = isDark
    ? `w-full h-[52px] border rounded-lg pl-11 pr-4 font-mono text-text-primary placeholder-text-secondary bg-bg-elevated/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-primary/50 transition ${
        error ? 'border-danger' : 'border-border-dark'
      }`
    : `w-full h-[52px] border rounded-md px-4 font-mono text-text-primary placeholder-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-transparent ${
        error ? 'border-danger' : 'border-border-dark'
      }`;

  return (
    <div className={wrapperClass}>
      <p className={labelClass}>Enter your website URL to scan</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" noValidate>
        <div className="flex-1 relative">
          {isDark && (
            <Globe
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none"
              aria-hidden="true"
            />
          )}
          <input
            type="url"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://www.example.com"
            className={inputClass}
            aria-label="Website URL"
            aria-describedby={error ? 'scan-error' : undefined}
            disabled={loading}
          />
          {error && (
            <p id="scan-error" className="text-sm text-danger mt-1">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`h-[52px] px-8 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page ${
            isDark ? 'shadow-glow' : ''
          }`}
        >
          {loading ? (
            <>
              <svg
                className="motion-safe:animate-spin h-4 w-4"
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
              Scanning…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden="true" />
              Scan Website
            </>
          )}
        </button>
      </form>
      {isDark && (
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
          {['No installation required', 'Instant results', 'Private & Secure'].map(item => (
            <li key={item} className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-accent-green shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
