'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { scanService } from '@/services/scanService';
import { PublicScanSchema } from '@/lib/schemas/scan';
import toast from 'react-hot-toast';

interface ScanInputProps {
  variant?: 'default' | 'hero';
}

export function ScanInput({ variant = 'default' }: ScanInputProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitCooldownRef = useRef(false);
  const isHero = variant === 'hero';

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
      router.push(`/results/${encodeURIComponent(scan.domain)}?scan_id=${scan.scan_id}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      if (apiErr?.response?.data?.error?.message) {
        setError(apiErr.response.data.error.message);
      } else {
        toast.error('Failed to start scan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (isHero) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" noValidate>
          <div className="relative flex-1">
            <Globe
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="url"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://www.example.com"
              className={`w-full h-[52px] pl-12 pr-4 bg-bg-card/80 backdrop-blur-sm border rounded-xl font-mono text-text-primary placeholder-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-primary/50 transition ${
                error ? 'border-danger' : 'border-border-dark'
              }`}
              aria-label="Website URL"
              aria-describedby={error ? 'scan-error' : undefined}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-[52px] px-8 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page glow-blue"
          >
            {loading ? (
              <>
                <svg className="motion-safe:animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning…
              </>
            ) : (
              'Scan Website'
            )}
          </button>
        </form>
        {error && (
          <p id="scan-error" className="text-sm text-danger mt-2 text-center sm:text-left">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl shadow-lg border border-border p-8 w-full max-w-2xl mx-auto">
      <p className="text-sm font-medium text-text-secondary mb-3">Enter your website URL to scan</p>
      <form onSubmit={handleSubmit} className="flex gap-3" noValidate>
        <div className="flex-1">
          <input
            type="url"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://www.example.com"
            className={`w-full h-[52px] bg-bg-elevated border rounded-md px-4 font-mono text-text-primary placeholder-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-transparent ${
              error ? 'border-danger' : 'border-border-dark'
            }`}
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
          className="h-[52px] px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <svg className="motion-safe:animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning…
            </>
          ) : (
            'Scan Website'
          )}
        </button>
      </form>
    </div>
  );
}
