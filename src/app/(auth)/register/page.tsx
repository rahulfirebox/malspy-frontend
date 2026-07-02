'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Shield, MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { RegisterSchema } from '@/lib/schemas/auth';
import toast from 'react-hot-toast';
import type { z } from 'zod';

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'org_name', string>>;

export default function RegisterPage() {
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    org_name: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const submitCooldownRef = useRef(false);

  function setField(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setErrors({});

    const result = RegisterSchema.safeParse(form);
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

    submitCooldownRef.current = true;
    setTimeout(() => { submitCooldownRef.current = false; }, 2000);
    setLoading(true);
    try {
      await authService.register(result.data);
      setRegisteredEmail(result.data.email);
      setRegistered(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = apiErr?.response?.data?.error?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4 py-8">
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
            <MailCheck className="h-12 w-12 text-[#2B7DBC]" aria-hidden="true" />
            <h1 className="text-xl font-bold text-[#1f2937] text-center">Check your email</h1>
            <p className="text-sm text-[#6b7280] text-center">
              We sent a verification link to{' '}
              <span className="font-medium text-[#1f2937]">{registeredEmail}</span>.
              Click the link in the email to activate your account.
            </p>
            <p className="text-xs text-[#9ca3af] text-center mt-2">
              Didn&apos;t receive it? Check your spam folder.
            </p>
            <Link
              href="/login"
              className="mt-2 text-sm text-[#2B7DBC] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] rounded"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Shield className="h-10 w-10 text-[#2B7DBC] mb-3" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1f2937]">Create your account</h1>
          <p className="text-sm text-[#6b7280] mt-1">Start scanning for free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate method="POST">
          <Input
            label="Full name"
            type="text"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            error={errors.name}
            autoComplete="name"
            required
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setField('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            helperText="Minimum 8 characters"
            required
          />
          <Input
            label="Organization name"
            type="text"
            value={form.org_name}
            onChange={e => setField('org_name', e.target.value)}
            error={errors.org_name}
            helperText="Your company or personal workspace name"
            required
          />

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#2B7DBC] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
