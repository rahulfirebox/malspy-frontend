'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { ForgotPasswordSchema } from '@/lib/schemas/auth';
import toast from 'react-hot-toast';

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
    setTimeout(() => { submitCooldownRef.current = false; }, 2000);
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
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <CheckCircle className="h-12 w-12 text-[#22c55e] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#1f2937] mb-2">Check your email</h2>
          <p className="text-sm text-[#6b7280]">
            We sent password reset instructions to <strong>{email}</strong>. Check your inbox and
            spam folder.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-[#2B7DBC] hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Shield className="h-10 w-10 text-[#2B7DBC] mb-3" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1f2937]">Reset your password</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          <Link href="/login" className="text-[#2B7DBC] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
