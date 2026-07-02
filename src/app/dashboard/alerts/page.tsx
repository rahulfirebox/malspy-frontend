'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { alertService } from '@/services/alertService';
import { useAuth } from '@/hooks/useAuth';
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

export default function AlertsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');

  const alertsQuery = useQuery({
    queryKey: ['alerts', userId, filter],
    queryFn: () => alertService.listAlerts({ is_resolved: filter === 'all' ? undefined : false }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const alerts = useMemo(() => alertsQuery.data?.results ?? [], [alertsQuery.data]);

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertService.resolveAlert(id),
    retry: false,
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: ['alerts', userId] });
      const previous = qc.getQueryData(['alerts', userId, filter]);
      qc.setQueryData(['alerts', userId, filter], (old: unknown) => {
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
      qc.setQueryData(['alerts', userId, filter], ctx?.previous);
      toast.error('Failed to resolve alert');
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1f2937]">Alerts</h1>
        <div className="flex rounded-lg border border-[#e5e7eb] overflow-hidden">
          {(['unresolved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#2B7DBC] text-white'
                  : 'bg-white text-[#6b7280] hover:bg-bg-page'
              }`}
            >
              {f === 'unresolved' ? 'Active' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {alertsQuery.isFetching && !alertsQuery.isLoading && (
        <div className="flex justify-end">
          <span className="text-xs text-[#6b7280]">Refreshing…</span>
        </div>
      )}

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
        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col">Severity</Th>
                <Th scope="col">Type</Th>
                <Th scope="col">Domain</Th>
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
                    <span className="text-sm text-[#1f2937]">
                      {TYPE_LABELS[alert.type] ?? alert.type}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-sm text-[#6b7280]">{alert.domain}</span>
                  </Td>
                  <Td>
                    <span className="text-sm text-[#6b7280] max-w-xs truncate block">
                      {alert.description}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[#6b7280]">
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
                        aria-label={`Resolve alert for ${alert.domain}`}
                      >
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-[#6b7280]">Resolved</span>
                    )}
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-[#e5e7eb] text-xs text-[#6b7280]">
            {alertsQuery.data.count} alert{alertsQuery.data.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
