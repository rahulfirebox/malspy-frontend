'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { alertService } from '@/services/alertService';
import { useAuth } from '@/hooks/useAuth';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { formatDateShort } from '@/lib/apiUtils';
import toast from 'react-hot-toast';
import type { Alert, AlertSeverity } from '@/types';

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  high: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  medium: 'bg-[#fefce8] text-[#713f12] border-[#fde68a]',
  low: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
};

const TYPE_LABELS: Record<string, string> = {
  malware_detected: 'Malware Detected',
  blacklisted: 'Blacklisted',
  tls_expiring: 'SSL Expiring',
  rating_degraded: 'Rating Degraded',
  missing_headers: 'Missing Headers',
};

function alertDomain(alert: Alert): string {
  return alert.scan_domain ?? alert.domain ?? '—';
}

export default function AlertsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const { page, pageSize, cursor, apiParams, goNext, goPrevious, resetPagination, getMeta } =
    useUrlPagination(10);

  const alertsQuery = useQuery({
    queryKey: ['alerts', userId, filter, { page, cursor, pageSize }],
    queryFn: () =>
      alertService.listAlerts({
        is_resolved: filter === 'all' ? undefined : false,
        ...apiParams,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const alerts = useMemo(() => alertsQuery.data?.results ?? [], [alertsQuery.data]);
  const paginationMeta = getMeta(alertsQuery.data);

  function handleFilterChange(next: 'all' | 'unresolved') {
    if (next === filter) return;
    setFilter(next);
    resetPagination();
  }

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertService.resolveAlert(id),
    retry: false,
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: ['alerts', userId] });
      const previous = qc.getQueryData(['alerts', userId, filter, { page, cursor, pageSize }]);
      qc.setQueryData(['alerts', userId, filter, { page, cursor, pageSize }], (old: unknown) => {
        const prev = old as { results?: Alert[]; count?: number } | undefined;
        return {
          ...prev,
          results:
            prev?.results?.map((a: Alert) => (a.id === id ? { ...a, is_resolved: true } : a)) ?? [],
        };
      });
      return { previous };
    },
    onSuccess: (_data) => {
      void qc.invalidateQueries({ queryKey: ['alerts', userId] });
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(['alerts', userId, filter, { page, cursor, pageSize }], ctx?.previous);
      toast.error('Failed to resolve alert');
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Alerts</h1>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['unresolved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#2B7DBC] text-white'
                  : 'bg-bg-card text-text-secondary hover:bg-bg-page'
              }`}
            >
              {f === 'unresolved' ? 'Active' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* {alertsQuery.isFetching && !alertsQuery.isLoading && (
        <div className="flex justify-end">
          <span className="text-xs text-text-secondary">Refreshing…</span>
        </div>
      )} */}

      {alertsQuery.isPending ? (
        <SkeletonTable rows={5} />
      ) : alertsQuery.isError ? (
        <ErrorState message="Failed to load alerts." onRetry={() => alertsQuery.refetch()} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="h-12 w-12 text-[#22c55e]" />}
          title={filter === 'unresolved' ? 'No active alerts' : 'No alerts found'}
          description={
            filter === 'unresolved'
              ? 'All your monitored domains are clean.'
              : 'No alerts have been triggered yet.'
          }
        />
      ) : (
        <div className="bg-bg-card border border-border rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col">Severity</Th>
                <Th scope="col">Type</Th>
                <Th scope="col">Scanned Domain</Th>
                <Th scope="col">Message</Th>
                <Th scope="col">Date</Th>
                <Th scope="col">Action</Th>
              </tr>
            </TableHead>
            <TableBody>
              {alerts.map(alert => (
                <tr key={alert.id} className="hover:bg-bg-page transition-colors">
                  <Td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${SEVERITY_STYLES[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm text-text-primary">
                      {TYPE_LABELS[alert.type] ?? alert.type}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-sm text-text-secondary">{alertDomain(alert)}</span>
                  </Td>
                  <Td>
                    <span className="text-sm text-text-secondary max-w-xs truncate block">
                      {alert.description}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {formatDateShort(alert.created_at)}
                    </span>
                  </Td>
                  <Td>
                    {!alert.is_resolved ? (
                      <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={
                          resolveMutation.isPending && resolveMutation.variables === alert.id
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-[#22c55e] disabled:opacity-50"
                        aria-label={`Resolve alert for ${alertDomain(alert)}`}
                      >
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-text-secondary">Resolved</span>
                    )}
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
          <Pagination
            meta={paginationMeta}
            onNext={() => goNext(alertsQuery.data?.next)}
            onPrevious={() => goPrevious(alertsQuery.data?.previous)}
          />
        </div>
      )}
    </div>
  );
}
