'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { scanService } from '@/services/scanService';
import { billingService } from '@/services/billingService';
import { useAuthStore } from '@/stores/authStore';
import { AuthScanSchema } from '@/lib/schemas/scan';
import { ERROR_CODES } from '@/lib/constants/errorCodes';
import { extractDomain, normalizeDomainUrlInput, parseApiError, type DomainProtocol } from '@/lib/apiUtils';
import { PROTOCOL_SELECT_OPTIONS } from '@/lib/constants/scanFilters';
import toast from 'react-hot-toast';

interface NewScanModalProps {
  open: boolean;
  onClose: () => void;
  onScanStarted: (scanId: string) => void;
}

function isAlreadyScanningError(code: string, message: string): boolean {
  return (
    code === ERROR_CODES.CONFLICT ||
    /already being scanned/i.test(message)
  );
}

async function findExistingScanId(url: string): Promise<string | null> {
  const domain = extractDomain(url).toLowerCase();
  const { results } = await scanService.listScans({ q: domain, page_size: 50 });

  const active = results.find(
    scan =>
      scan.domain.toLowerCase() === domain &&
      (scan.status === 'queued' || scan.status === 'scanning')
  );
  if (active) return active.id;

  const latest = results.find(scan => scan.domain.toLowerCase() === domain);
  return latest?.id ?? null;
}

export function NewScanModal({ open, onClose, onScanStarted }: NewScanModalProps) {
  const userId = useAuthStore(s => s.user?.id);
  const [url, setUrl] = useState('');
  const [urlProtocol, setUrlProtocol] = useState<DomainProtocol>('https');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [urlError, setUrlError] = useState<string | undefined>();
  const [conflictMessage, setConflictMessage] = useState<string | undefined>();
  const [rescanMode, setRescanMode] = useState(false);
  const [existingScanId, setExistingScanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submitCooldownRef = useRef(false);

  const billingQuery = useQuery({
    queryKey: ['billing', 'quota', userId],
    queryFn: () => billingService.getOrgBilling(),
    enabled: !!userId && open,
    staleTime: 60_000,
  });

  const quotaUsed = billingQuery.data?.scan_quota_used ?? 0;
  const quotaLimit = billingQuery.data?.scan_quota_limit ?? -1;
  const atLimit = quotaLimit !== -1 && quotaUsed >= quotaLimit;
  const quotaPercent = quotaLimit > 0 ? Math.min(100, (quotaUsed / quotaLimit) * 100) : 0;

  function resetConflictState() {
    setConflictMessage(undefined);
    setRescanMode(false);
    setExistingScanId(null);
  }

  useEffect(() => {
    if (!open) {
      setUrl('');
      setUrlProtocol('https');
      setNotifyEmail(true);
      setUrlError(undefined);
      resetConflictState();
    }
  }, [open]);

  async function enableRescanMode(scanUrl: string, message: string, scanIdFromError?: string) {
    setConflictMessage(message);
    setRescanMode(true);

    if (scanIdFromError) {
      setExistingScanId(scanIdFromError);
      return;
    }

    try {
      const scanId = await findExistingScanId(scanUrl);
      setExistingScanId(scanId);
    } catch {
      setExistingScanId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitCooldownRef.current) return;
    setUrlError(undefined);

    const normalizedUrl = normalizeDomainUrlInput(url, urlProtocol);
    const result = AuthScanSchema.safeParse({
      url: normalizedUrl,
      notify_email: notifyEmail,
      schedule: null,
    });
    if (!result.success) {
      const err = result.error.errors.find(e => e.path[0] === 'url');
      if (err) setUrlError(err.message);
      return;
    }

    submitCooldownRef.current = true;
    setTimeout(() => {
      submitCooldownRef.current = false;
    }, 2000);
    setLoading(true);

    try {
      if (rescanMode && existingScanId) {
        const rescanned = await scanService.rescan(existingScanId);
        toast.success('Rescan started!');
        onScanStarted(rescanned.id);
        onClose();
        return;
      }

      const created = await scanService.createScan(result.data);
      toast.success('Scan started!');
      onScanStarted(created.id);
      onClose();
    } catch (err: unknown) {
      const apiErr = parseApiError(err);

      if (apiErr.code === ERROR_CODES.QUOTA_EXCEEDED) {
        toast.error('Monthly scan quota reached. Please upgrade your plan.');
      } else if (isAlreadyScanningError(apiErr.code, apiErr.message)) {
        await enableRescanMode(
          result.data.url,
          apiErr.message || 'This domain is already being scanned.',
          apiErr.scanId
        );
      } else {
        toast.error(apiErr.message || 'Failed to start scan.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Scan" size="md">
      {billingQuery.isPending ? (
        <SkeletonCard />
      ) : billingQuery.isError ? (
        <ErrorState
          message="Failed to load billing info."
          onRetry={() => billingQuery.refetch()}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {quotaLimit !== -1 && (
            <div className="p-4 bg-bg-page border border-border rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Scan quota</span>
                <span className="font-medium text-text-primary">
                  {quotaUsed} / {quotaLimit}
                </span>
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
                  <a href="/dashboard/billing" className="underline font-medium">
                    Upgrade your plan
                  </a>
                </p>
              )}
            </div>
          )}

          {conflictMessage && (
            <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2" role="status">
              {conflictMessage}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="new-scan-url" className="text-sm font-medium text-text-primary">
              Website URL
            </label>
            <div className="flex gap-2">
              <Select
                id="new-scan-protocol"
                value={urlProtocol}
                onChange={value => {
                  setUrlProtocol(value as DomainProtocol);
                  setUrlError(undefined);
                  resetConflictState();
                }}
                options={PROTOCOL_SELECT_OPTIONS}
                className="w-28 shrink-0"
                triggerClassName="font-mono"
                aria-label="Protocol"
              />
              <input
                id="new-scan-url"
                type="text"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  setUrlError(undefined);
                  resetConflictState();
                }}
                placeholder="example.com"
                autoFocus
                required
                className={`min-w-0 flex-1 border rounded-lg px-3 py-2 bg-bg-elevated text-text-primary placeholder-text-secondary font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page shadow-sm transition ${
                  urlError ? 'border-danger' : 'border-border-dark'
                }`}
                aria-label="Website URL"
                aria-describedby={urlError ? 'new-scan-url-error' : 'new-scan-url-help'}
              />
            </div>
            {urlError ? (
              <p id="new-scan-url-error" className="text-sm text-danger">
                {urlError}
              </p>
            ) : (
              <p id="new-scan-url-help" className="text-sm text-text-secondary">
                Enter a domain or paste a full URL with http:// or https://
              </p>
            )}
          </div>
{/* 
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="new-scan-notify-email"
              checked={notifyEmail}
              onChange={e => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-border-dark text-primary focus:ring-primary"
            />
            <label htmlFor="new-scan-notify-email" className="text-sm text-text-primary">
              Email me when scan completes
            </label>
          </div> */}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              loading={loading}
              disabled={atLimit || (rescanMode && !existingScanId)}
            >
              {rescanMode ? 'Rescan' : 'Start Scan'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
