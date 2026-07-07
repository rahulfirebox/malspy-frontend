'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Bug, Globe, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { LoginSchema } from '@/lib/schemas/auth';
import { parseApiError } from '@/lib/apiUtils';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore(s => s.setAuth);
  const setAccessToken = useAuthStore(s => s.setAccessToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const submitCooldownRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setErrors({});

    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    submitCooldownRef.current = true;
    setTimeout(() => { submitCooldownRef.current = false; }, 2000);
    setLoading(true);
    try {
      const loginResult = await authService.login(result.data);
      setAccessToken(loginResult.access);
      const user = loginResult.user ?? (await authService.getMe());
      setAuth(loginResult.access, loginResult.refresh, user, user.organization);
      const rawReturnUrl = searchParams.get('returnUrl');
      const destination =
        rawReturnUrl && /^\/(?!\/|\\)/.test(rawReturnUrl) ? rawReturnUrl : '/dashboard';
      router.replace(destination);
    } catch (err: unknown) {
      toast.error(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: Bug, label: 'Malware & injection detection' },
    { icon: Globe, label: 'Blacklist monitoring across 7 databases' },
    { icon: Lock, label: 'SSL/TLS & security analysis' },
  ] as const;

  return (
    <div className="w-full max-w-[920px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_25px_60px_-15px_rgba(37,99,235,0.2)]">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
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
                Secure your websites with confidence
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
                Monitor domains, catch threats early, and keep your business safe online.
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

          <div className="p-8 sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 lg:hidden">
                <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h1>
              <p className="mt-1.5 text-sm text-text-secondary">
                Sign in to continue monitoring your websites
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate method="POST">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary transition-colors hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" size="lg" loading={loading} className="w-full shadow-md shadow-primary/20">
                Sign In
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-bg-card px-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
                  New here?
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                Create a free account
              </Link>
            </p>
          </div>
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
