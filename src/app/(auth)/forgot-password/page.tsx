'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Shield, Mail, Lock, KeyRound, ArrowRight, MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { ForgotPasswordSchema } from '@/lib/schemas/auth';
import toast from 'react-hot-toast';

const features = [
  { icon: Mail, label: 'Secure reset link sent to your inbox' },
  { icon: Lock, label: 'Encrypted password recovery process' },
  { icon: KeyRound, label: 'Set a new password in minutes' },
] as const;

function AuthBrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #2563EB 0%, #1D4ED8 55%, #1e3a8a 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 85%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.12) 0%, transparent 40%)',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />

      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">SecureScan</span>
        </Link>

        <h2 className="mt-10 text-3xl font-bold leading-tight tracking-tight">
          Recover access to your account
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
          We&apos;ll send you a secure link to reset your password and get back to monitoring.
        </p>
      </div>

      <ul className="relative z-10 mt-10 space-y-4">
        {features.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-white/90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[920px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_25px_60px_-15px_rgba(37,99,235,0.2)]">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <AuthBrandPanel />
          {children}
        </div>
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submitCooldownRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setError(undefined);

    const result = ForgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    submitCooldownRef.current = true;
    setTimeout(() => {
      submitCooldownRef.current = false;
    }, 2000);
    setLoading(true);
    try {
      await authService.forgotPassword(result.data);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-1 lg:col-start-2">
          <div className="mx-auto w-full max-w-md text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
              <MailCheck className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Check your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              We sent password reset instructions to{' '}
              <span className="font-semibold text-text-primary">{email}</span>. Check your inbox and
              spam folder.
            </p>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-bg-card px-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Next step
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-11"
            >
              Back to Sign In
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 lg:hidden">
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Reset your password</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            error={error}
            autoComplete="email"
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full shadow-md shadow-primary/20">
            Send Reset Link
            {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </form>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-bg-card px-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Remember your password?
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary">
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
