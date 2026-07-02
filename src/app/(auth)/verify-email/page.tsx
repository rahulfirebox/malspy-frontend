'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

type VerifyState = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState('error');
      setErrorMessage('Verification link is missing the token. Please use the link from your email.');
      return;
    }

    let cancelled = false;
    authService
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) setState('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
        const msg =
          apiErr?.response?.data?.error?.message ||
          'This verification link is invalid or has expired. Please request a new one.';
        setErrorMessage(msg);
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Shield className="h-10 w-10 text-[#2B7DBC] mb-3" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1f2937]">Email Verification</h1>
        </div>

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-6" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 text-[#2B7DBC] motion-safe:animate-spin" aria-hidden="true" />
            <p className="text-sm text-[#6b7280]">Verifying your email address…</p>
          </div>
        )}

        {state === 'success' && (
          <div className="flex flex-col items-center gap-4 py-4" role="status" aria-live="polite">
            <CheckCircle className="h-12 w-12 text-green-500" aria-hidden="true" />
            <p className="text-base font-medium text-[#1f2937] text-center">
              Your email has been verified successfully!
            </p>
            <p className="text-sm text-[#6b7280] text-center">
              You can now sign in to your SecureScan account.
            </p>
            <Link
              href="/login"
              className="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4" role="alert" aria-live="assertive">
            <XCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
            <p className="text-base font-medium text-[#1f2937] text-center">Verification failed</p>
            <p className="text-sm text-[#6b7280] text-center">{errorMessage}</p>
            <Link
              href="/login"
              className="mt-2 text-sm text-[#2B7DBC] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] rounded"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
