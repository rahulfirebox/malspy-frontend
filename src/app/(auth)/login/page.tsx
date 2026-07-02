'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { LoginSchema } from '@/lib/schemas/auth';
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
      const tokens = await authService.login(result.data);
      setAccessToken(tokens.access);
      const user = await authService.getMe();
      setAuth(tokens.access, tokens.refresh, user, user.organization);
      const rawReturnUrl = searchParams.get('returnUrl');
      router.replace(
        rawReturnUrl && /^\/(?!\/|\\)/.test(rawReturnUrl) ? rawReturnUrl : '/dashboard'
      );
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = apiErr?.response?.data?.error?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Shield className="h-10 w-10 text-[#2B7DBC] mb-3" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1f2937]">Sign in to SecureScan</h1>
          <p className="text-sm text-[#6b7280] mt-1">Monitor and protect your websites</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate method="POST">
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
              className="text-xs text-[#2B7DBC] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] rounded"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-[#2B7DBC] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] rounded"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
