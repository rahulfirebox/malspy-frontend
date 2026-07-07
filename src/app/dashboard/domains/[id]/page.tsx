'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { domainService } from '@/services/domainService';
import { formatDateShort } from '@/lib/apiUtils';
import { getFrequencyLabel } from '@/lib/constants/domainFrequency';
import toast from 'react-hot-toast';
import type { ScanListItem } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  clean: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
  infected: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  blacklisted: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  unknown: 'bg-[#FAFAF7] text-[#5B5B6B] border-[#E0E0DA]',
};

const SCAN_STATUS_COLORS: Record<string, string> = {
  completed: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
  failed: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  scanning: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
  queued: 'bg-[#FAFAF7] text-[#5B5B6B] border-[#E0E0DA]',
};

const RATING_COLORS: Record<string, string> = {
  A: 'text-[#166534] font-bold',
  B: 'text-[#1e40af] font-bold',
  C: 'text-[#713f12] font-bold',
  D: 'text-[#7f1d1d] font-bold',
};

export default function DomainDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);

  const domainQuery = useQuery({
    queryKey: ['domain', id],
    queryFn: () => domainService.getDomain(id),
    enabled: !!id && !!userId,
    staleTime: 30_000,
  });

  const scansQuery = useQuery({
    queryKey: ['domain-scans', id],
    queryFn: () => domainService.listDomainScans(id, { page_size: 10 }),
    enabled: !!id && !!userId,
    staleTime: 30_000,
  });

  const domainScans = useMemo(() => scansQuery.data?.results ?? [], [scansQuery.data]);

  const triggerMutation = useMutation({
    mutationFn: () => domainService.triggerScan(id),
    retry: false,
    onSuccess: () => {
      toast.success('Scan started');
      qc.invalidateQueries({ queryKey: ['domain-scans', id] });
    },
    onError: () => toast.error('Failed to start scan'),
  });

  const domain = domainQuery.data;

  if (domainQuery.isPending) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-[#E0E0DA] rounded motion-safe:animate-pulse" />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (domainQuery.isError || !domain) {
    return <ErrorState message="Failed to load domain." onRetry={() => domainQuery.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/dashboard/domains');
            }
          }}
          className="p-1.5 rounded hover:bg-gray-50 text-[#5B5B6B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-bold text-[#0E0E14]">{domain.domain}</h1>
      </div>

      
      <div className="bg-bg-card border border-[#E0E0DA] rounded-lg shadow-md p-5">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-[#5B5B6B] mb-1">Status</p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[domain.last_status] ?? STATUS_COLORS.unknown}`}
            >
              {domain.last_status === 'clean'
                ? '✓ Clean'
                : domain.last_status === 'infected'
                  ? '✗ Infected'
                  : domain.last_status === 'blacklisted'
                    ? '✗ Blacklisted'
                    : 'Unknown'}
            </span>
          </div>
          <div>
            <p className="text-xs text-[#5B5B6B] mb-1">Rating</p>
            <span
              className={`text-sm ${RATING_COLORS[domain.last_rating ?? ''] ?? 'text-[#5B5B6B]'}`}
            >
              {domain.last_rating ?? '—'}
            </span>
          </div>
          <div>
            <p className="text-xs text-[#5B5B6B] mb-1">Frequency</p>
            <span className="text-sm text-[#0E0E14]">{getFrequencyLabel(domain.frequency)}</span>
          </div>
          <div>
            <p className="text-xs text-[#5B5B6B] mb-1">Monitoring</p>
            <span className={`text-sm ${domain.is_active ? 'text-[#166534]' : 'text-[#5B5B6B]'}`}>
              {domain.is_active ? 'Active' : 'Paused'}
            </span>
          </div>
          <div>
            <p className="text-xs text-[#5B5B6B] mb-1">Added</p>
            <span className="text-sm text-[#5B5B6B]">{formatDateShort(domain.created_at)}</span>
          </div>
          <div className="ml-auto">
            <Button
              size="md"
              loading={triggerMutation.isPending}
              onClick={() => triggerMutation.mutate()}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Scan Now
            </Button>
          </div>
        </div>
      </div>

      
      <div>
        <h2 className="text-base font-semibold text-[#0E0E14] mb-3">Scan History</h2>
        {scansQuery.isPending ? (
          <SkeletonTable rows={5} />
        ) : scansQuery.isError ? (
          <ErrorState message="Failed to load scan history." onRetry={() => scansQuery.refetch()} />
        ) : !(scansQuery.data?.results ?? []).length ? (
          <EmptyState
            icon={<Globe className="h-12 w-12" />}
            title="No scans yet"
            description="Run a scan to start seeing results here."
          />
        ) : (
          <div className="bg-bg-card border border-[#E0E0DA] rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHead>
                <tr>
                  <Th scope="col">Date</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Rating</Th>
                  <Th scope="col">Malware</Th>
                  <Th scope="col">Blacklisted</Th>
                  <Th scope="col">Duration</Th>
                </tr>
              </TableHead>
              <TableBody>
                {domainScans.map((scan: ScanListItem) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/scans/${scan.id}`)}
                    aria-label={`View scan from ${formatDateShort(scan.created_at)}`}
                  >
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">
                        {formatDateShort(scan.created_at)}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${SCAN_STATUS_COLORS[scan.status] ?? SCAN_STATUS_COLORS.queued}`}
                      >
                        {scan.status}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`text-sm ${RATING_COLORS[scan.rating ?? ''] ?? 'text-[#5B5B6B]'}`}
                      >
                        {scan.rating ?? '—'}
                      </span>
                    </Td>
                    <Td>
                      {scan.malware_detected ? (
                        <span className="text-xs text-[#7f1d1d] font-medium">Detected</span>
                      ) : (
                        <span className="text-xs text-[#166534]">Clean</span>
                      )}
                    </Td>
                    <Td>
                      {scan.blacklisted ? (
                        <span className="text-xs text-[#7f1d1d] font-medium">Listed</span>
                      ) : (
                        <span className="text-xs text-[#166534]">Clear</span>
                      )}
                    </Td>
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">
                        {scan.duration_seconds != null ? `${scan.duration_seconds}s` : '—'}
                      </span>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
            <div className="px-4 py-3 border-t border-[#E0E0DA] text-xs text-[#5B5B6B]">
              {scansQuery.data.count} scan{scansQuery.data.count !== 1 ? 's' : ''} total
            </div>
          </div>
        )}
      </div>

      
      {scansQuery.data?.results[0]?.status === 'completed' && (
        <div className="bg-bg-card border border-[#E0E0DA] rounded-lg shadow-md p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[#4F46E5]" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-[#0E0E14]">TLS / SSL</h2>
          </div>
          <p className="text-xs text-[#5B5B6B]">
            View full TLS details in the{' '}
            <a
              href={`/dashboard/scans/${scansQuery.data.results[0].id}`}
              className="text-[#4F46E5] hover:underline"
            >
              latest scan report
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
