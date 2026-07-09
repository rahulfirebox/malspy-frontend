'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import { MarketingShell } from '@/components/landing/MarketingShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { ContactRequestSchema } from '@/lib/schemas/auth';
import { parseApiError } from '@/lib/apiUtils';
import toast from 'react-hot-toast';

type FieldErrors = Partial<Record<'name' | 'phone' | 'email' | 'message', string>>;

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = ContactRequestSchema.safeParse(form);
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

    setSending(true);
    try {
      await authService.submitContactRequest(result.data);
      setSubmitted(true);
      setForm({ name: '', phone: '', email: '', message: '' });
      toast.success('Message sent. We will get back to you soon.');
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <MarketingShell title="Contact Us">
      <p>
        Have a question about SecureScan, billing, or enterprise plans? We&apos;re here to help.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 not-prose">
        {[
          {
            icon: Mail,
            title: 'Email',
            detail: 'support@securescan.com',
            href: 'mailto:support@securescan.com',
          },
          {
            icon: Clock,
            title: 'Response time',
            detail: 'Within 1–2 business days',
          },
          {
            icon: MessageSquare,
            title: 'Sales',
            detail: 'Enterprise & custom plans',
            href: '/contact',
          },
        ].map(item => (
          <div
            key={item.title}
            className="rounded-xl border border-border/60 bg-bg-card/60 p-4 space-y-2"
          >
            <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
            {item.href ? (
              <a href={item.href} className="text-sm text-primary hover:underline break-all">
                {item.detail}
              </a>
            ) : (
              <p className="text-sm text-text-secondary">{item.detail}</p>
            )}
          </div>
        ))}
      </div>

      {submitted ? (
        <div
          className="rounded-xl border border-accent-green/30 bg-accent-green/10 p-5 not-prose"
          role="status"
        >
          <p className="text-sm font-medium text-text-primary">Thanks for reaching out!</p>
          <p className="mt-1 text-sm text-text-secondary">
            Your message has been received. We typically respond within 1–2 business days.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => setSubmitted(false)}
          >
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 not-prose" noValidate>
          <Input
            label="Name"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            error={errors.name}
            autoComplete="name"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            error={errors.phone}
            autoComplete="tel"
            placeholder="Optional"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="contact-message" className="text-sm font-medium text-text-primary">
              Message
            </label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={e => setField('message', e.target.value)}
              rows={5}
              required
              className={`w-full border rounded-lg px-3 py-2 bg-bg-elevated text-text-primary placeholder-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page shadow-sm transition resize-y ${
                errors.message ? 'border-danger' : 'border-border-dark'
              }`}
              placeholder="How can we help?"
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
            {errors.message && (
              <p id="contact-message-error" className="text-sm text-danger">
                {errors.message}
              </p>
            )}
          </div>
          <Button type="submit" size="lg" loading={sending} className="w-full sm:w-auto">
            Send Message
          </Button>
        </form>
      )}

      <p className="text-sm pt-2">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>{' '}
        for faster support through your dashboard.
      </p>
    </MarketingShell>
  );
}
