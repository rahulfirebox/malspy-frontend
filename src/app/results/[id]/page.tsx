'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ScanProgress } from '@/components/scan/ScanProgress';
import { ScanResultLayout } from '@/components/scan/ScanResultLayout';
import { ErrorState } from '@/components/ui/ErrorState';
import { scanService } from '@/services/scanService';
import type { ScanDetail, ScanStatus } from '@/types';

export default function PublicResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const domain = decodeURIComponent(params.id as string);
  const scanId = searchParams.get('scan_id');

  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [status, setStatus] = useState<ScanStatus>('queued');
  const [progress, setProgress] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!scanId) {
      setError('No scan ID provided.');
      return;
    }

    function startPolling() {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusData = await scanService.pollPublicScan(scanId!);
          setStatus(statusData.status);
          setProgress(statusData.progress_percent);
          setEstimatedSeconds(statusData.estimated_seconds_remaining);

          if (statusData.status === 'completed' || statusData.status === 'failed') {
            const id = pollIntervalRef.current;
            if (id) clearInterval(id);
            if (statusData.status === 'completed') {
              const result = await scanService.getPublicScanById(scanId!);
              setScan(result);
            } else {
              setError('Scan failed. Please try again.');
            }
          }
        } catch {
          const id = pollIntervalRef.current;
          if (id) clearInterval(id);
          setError('Failed to retrieve scan status.');
        }
      }, 3000);
    }

    async function init() {
      try {
        const statusData = await scanService.pollPublicScan(scanId!);
        setStatus(statusData.status);
        setProgress(statusData.progress_percent);

        if (statusData.status === 'completed') {
          const result = await scanService.getPublicScanById(scanId!);
          setScan(result);
        } else if (statusData.status === 'failed') {
          setError('Scan failed. Please try again.');
        } else {
          startPolling();
        }
      } catch {
        setError('Failed to load scan result.');
      }
    }

    init();

    return () => {
      const id = pollIntervalRef.current;
      if (id) clearInterval(id);
    };
  }, [scanId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mx-4">
          <ScanProgress
            domain={domain}
            progressPercent={progress}
            estimatedSeconds={estimatedSeconds}
          />
        </div>
      </div>
    );
  }

  return <ScanResultLayout scan={scan} />;
}
