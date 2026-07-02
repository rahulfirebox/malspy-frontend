'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { scanService } from '@/services/scanService';
import { billingService } from '@/services/billingService';
import { useAuthStore } from '@/stores/authStore';
import { AuthScanSchema } from '@/lib/schemas/scan';
import { ERROR_CODES } from '@/lib/constants/errorCodes';
import toast from 'react-hot-toast';

export default function NewScanPage() {
  const router = useRouter();
  const userId = useAuthStore(s => s.user?.id);
  const [url, setUrl] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [urlError, setUrlError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const submitCooldownRef = useRef(false);

  const billingQuery = useQuery({
    queryKey: ['billing', 'quota', userId],
    queryFn: () => billingService.getOrgBilling(),
    enabled: !!userId,
    staleTime: 60_000,
  });
  const quotaUsed = billingQuery.data?.scan_quota_used ?? 0;
  const quotaLimit = billingQuery.data?.scan_quota_limit ?? -1;
  const atLimit = quotaLimit !== -1 && quotaUsed >= quotaLimit;
  const quotaPercent = quotaLimit > 0 ? Math.min(100, (quotaUsed / quotaLimit) * 100) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setUrlError(undefined);

    const result = AuthScanSchema.safeParse({ url, notify_email: notifyEmail, schedule: null });
    if (!result.success) {
      const err = result.error.errors.find(e => e.path[0] === 'url');
      if (err) setUrlError(err.message);
      return;
    }

    submitCooldownRef.current = true;
    setTimeout(() => { submitCooldownRef.current = false; }, 2000);
    setLoading(true);
    try {
      const scan = await scanService.createScan(result.data);
      toast.success('Scan started!');
      router.push(`/dashboard/scans/${scan.id}`);
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { error?: { code?: string; message?: string } } };
      };
      const code = apiErr?.response?.data?.error?.code;
      const msg = apiErr?.response?.data?.error?.message;

      if (code === ERROR_CODES.QUOTA_EXCEEDED) {
        toast.error('Monthly scan quota reached. Please upgrade your plan.');
      } else if (code === ERROR_CODES.CONFLICT) {
        toast.error('This domain is already being scanned.');
      } else {
        toast.error(msg || 'Failed to start scan.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (billingQuery.isPending) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-bold text-text-primary mb-6">New Scan</h1>
        <SkeletonCard />
      </div>
    );
  }

  if (billingQuery.isError) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-bold text-text-primary mb-6">New Scan</h1>
        <ErrorState
          message="Failed to load billing info."
          onRetry={() => billingQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-text-primary mb-6">New Scan</h1>
      {quotaLimit !== -1 && (
        <div className="mb-4 p-4 bg-white border border-border rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Scan quota</span>
            <span className="font-medium text-text-primary">{quotaUsed} / {quotaLimit}</span>
          </div>
          <div
            className="w-full h-2 bg-border rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={quotaUsed}
            aria-valuemax={quotaLimit}
            aria-label="Scan quota usage"
          >
            <div
              className={`h-full rounded-full transition-all ${atLimit ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          {atLimit && (
            <p className="text-xs text-red-600 mt-2">
              Monthly quota reached.{' '}
              <a href="/dashboard/billing" className="underline font-medium">Upgrade your plan</a>
            </p>
          )}
        </div>
      )}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Scan a website</h2>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Website URL"
            type="url"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              setUrlError(undefined);
            }}
            error={urlError}
            placeholder="https://www.example.com"
            mono
            autoFocus
            required
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notify-email"
              checked={notifyEmail}
              onChange={e => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-border-dark text-primary focus:ring-primary"
            />
            <label htmlFor="notify-email" className="text-sm text-text-primary">
              Email me when scan completes
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" size="md" loading={loading} disabled={atLimit}>
              Start Scan
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
