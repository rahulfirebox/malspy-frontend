'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ScanProgress } from '@/components/scan/ScanProgress';
import { ScanResultLayout } from '@/components/scan/ScanResultLayout';
import { ErrorState } from '@/components/ui/ErrorState';
import { scanService } from '@/services/scanService';
import { parseApiError } from '@/lib/apiUtils';
import { isUuid } from '@/lib/uuid';
import type { ScanDetail, ScanStatus } from '@/types';

function resolveScanId(routeId: string, legacyScanId: string | null): string | null {
  if (legacyScanId && legacyScanId !== 'undefined' && isUuid(legacyScanId)) {
    return legacyScanId;
  }
  if (isUuid(routeId)) return routeId;
  return null;
}

export default function PublicResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = decodeURIComponent(params.id as string);
  const scanId = resolveScanId(routeId, searchParams.get('scan_id'));

  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [domainLabel, setDomainLabel] = useState(
    isUuid(routeId) ? 'your website' : routeId
  );
  const [status, setStatus] = useState<ScanStatus>('queued');
  const [progress, setProgress] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!scanId) {
      setError('Invalid scan link. Start a new scan from the home page.');
      return;
    }

    function stopPolling() {
      const id = pollIntervalRef.current;
      if (id) clearInterval(id);
      pollIntervalRef.current = null;
    }

    function startPolling() {
      stopPolling();
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusData = await scanService.pollPublicScan(scanId!);
          setStatus(statusData.status);
          setProgress(statusData.progress_percent);
          setEstimatedSeconds(statusData.estimated_seconds_remaining);

          if (statusData.status === 'completed' || statusData.status === 'failed') {
            stopPolling();
            if (statusData.status === 'completed') {
              const result = await scanService.getPublicScanById(scanId!);
              setScan(result);
              setDomainLabel(result.domain);
            } else {
              setError('Scan failed. Please try again.');
            }
          }
        } catch {
          stopPolling();
          setError('Failed to retrieve scan status.');
        }
      }, 3000);
    }

    async function init() {
      try {
        const result = await scanService.getPublicScanById(scanId!);
        setDomainLabel(result.domain);
        setStatus(result.status);
        setProgress(result.status === 'completed' ? 100 : result.status === 'scanning' ? 65 : 15);

        if (result.status === 'completed') {
          setScan(result);
        } else if (result.status === 'failed') {
          setError('Scan failed. Please try again.');
        } else {
          startPolling();
        }
      } catch (err: unknown) {
        setError(parseApiError(err).message || 'Failed to load scan result.');
      }
    }

    void init();

    return stopPolling;
  }, [scanId]);

  if (error) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
        <ErrorState
          title="Scan Error"
          message={error}
          onRetry={() => {
            window.location.href = '/';
          }}
        />
      </div>
    );
  }

  if (!scan || status === 'queued' || status === 'scanning') {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
        <div className="bg-bg-card border border-border rounded-xl shadow-md p-8 w-full max-w-lg">
          <ScanProgress
            domain={domainLabel}
            progressPercent={progress}
            estimatedSeconds={estimatedSeconds}
          />
        </div>
      </div>
    );
  }

  return <ScanResultLayout scan={scan} />;
}
