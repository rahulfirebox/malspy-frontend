'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { ResetPasswordSchema } from '@/lib/schemas/auth';
import toast from 'react-hot-toast';

type FieldErrors = Partial<Record<'password' | 'confirm_password', string>>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm_password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const submitCooldownRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setErrors({});

    const result = ResetPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FieldErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }

    submitCooldownRef.current = true;
    setTimeout(() => { submitCooldownRef.current = false; }, 2000);
    setLoading(true);
    try {
      await authService.resetPassword(token, result.data);
      setDone(true);
    } catch {
      toast.error('Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <CheckCircle className="h-12 w-12 text-[#22c55e] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#1f2937] mb-2">Password updated!</h2>
          <p className="text-sm text-[#6b7280] mb-6">
            Your password has been changed successfully.
          </p>
          <Button onClick={() => router.push('/login')} size="md">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Shield className="h-10 w-10 text-[#2B7DBC] mb-3" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1f2937]">Set new password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate method="POST">
          <Input
            label="New password"
            type="password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            error={errors.password}
            autoComplete="new-password"
            helperText="Minimum 8 characters"
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={form.confirm_password}
            onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
            error={errors.confirm_password}
            autoComplete="new-password"
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Update Password
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
