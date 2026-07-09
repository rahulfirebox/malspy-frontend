'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { alertService } from '@/services/alertService';
import { useAuth } from '@/hooks/useAuth';
import { useAlertFilters, buildAlertListParams } from '@/hooks/useAlertFilters';
import { useDebouncedUrlSearch } from '@/hooks/useDebouncedUrlSearch';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { tableRowSerial } from '@/lib/pagination';
import { formatDateShort } from '@/lib/apiUtils';
import {
  ALERT_SEVERITY_FILTER_OPTIONS,
  ALERT_STATUS_FILTER_OPTIONS,
  ALERT_TYPE_FILTER_OPTIONS,
  ALERT_TYPE_LABELS,
} from '@/lib/constants/alertFilters';
import toast from 'react-hot-toast';
import type { Alert, AlertSeverity } from '@/types';

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  high: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  medium: 'bg-[#fefce8] text-[#713f12] border-[#fde68a]',
  low: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
};

function alertDomain(alert: Alert): string {
  return alert.scan_domain ?? alert.domain ?? '—';
}

export default function AlertsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const {
    severity,
    status,
    type,
    date,
    setSeverity,
    setStatus,
    setType,
    setDate,
    clearFilters,
    hasActiveFilters,
  } = useAlertFilters();
  const { search: domain, setSearch: setDomain, debouncedSearch: debouncedDomain } =
    useDebouncedUrlSearch({ paramKey: 'domain' });
  const { page, pageSize, cursor, apiParams, goNext, goPrevious, getMeta } = useUrlPagination(10);

  const listParams = useMemo(
    () =>
      buildAlertListParams({
        severity,
        status,
        type,
        date,
        domain: debouncedDomain || undefined,
      }),
    [severity, status, type, date, debouncedDomain]
  );

  const alertsQuery = useQuery({
    queryKey: ['alerts', userId, listParams, { page, cursor, pageSize }],
    queryFn: () =>
      alertService.listAlerts({
        ...listParams,
        ...apiParams,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const alerts = useMemo(() => alertsQuery.data?.results ?? [], [alertsQuery.data]);
  const paginationMeta = getMeta(alertsQuery.data);

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertService.resolveAlert(id),
    retry: false,
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: ['alerts', userId] });
      const queryKey = ['alerts', userId, listParams, { page, cursor, pageSize }];
      const previous = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old: unknown) => {
        const prev = old as { results?: Alert[]; count?: number } | undefined;
        return {
          ...prev,
          results:
            prev?.results?.map((a: Alert) => (a.id === id ? { ...a, is_resolved: true } : a)) ?? [],
        };
      });
      return { previous, queryKey };
    },
    onSuccess: (_data) => {
      void qc.invalidateQueries({ queryKey: ['alerts', userId] });
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.queryKey) {
        qc.setQueryData(ctx.queryKey, ctx.previous);
      }
      toast.error('Failed to resolve alert');
    },
  });

  const emptyTitle = status === 'resolved' ? 'No resolved alerts' : 'No active alerts';

  const emptyDescription =
    status === 'resolved'
      ? 'Resolved alerts will appear here.'
      : hasActiveFilters
        ? 'No alerts match the current filters.'
        : 'All your monitored domains are clean.';

  return (
    <div className="space-y-5">
      <PageHeader title="Alerts" />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="search"
              label="Domain"
              placeholder="Search by domain…"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              aria-label="Search alerts by domain"
            />
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={e => setDate(e.target.value)}
              aria-label="Filter alerts by date"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="md" className="shrink-0" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            id="alert-severity-filter"
            label="Severity"
            value={severity}
            onChange={setSeverity}
            options={ALERT_SEVERITY_FILTER_OPTIONS}
          />
          <Select
            id="alert-status-filter"
            label="Status"
            value={status}
            onChange={setStatus}
            options={ALERT_STATUS_FILTER_OPTIONS}
          />
          <Select
            id="alert-type-filter"
            label="Type"
            value={type}
            onChange={setType}
            options={ALERT_TYPE_FILTER_OPTIONS}
          />
        </div>
      </div>

      {alertsQuery.isPending ? (
        <SkeletonTable rows={5} />
      ) : alertsQuery.isError ? (
        <ErrorState message="Failed to load alerts." onRetry={() => alertsQuery.refetch()} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="h-12 w-12 text-[#22c55e]" />}
          title={emptyTitle}
          description={emptyDescription}
          cta={
            hasActiveFilters ? (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-bg-card border border-border rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col" className="w-12">#</Th>
                <Th scope="col">Severity</Th>
                <Th scope="col">Type</Th>
                <Th scope="col">Scanned Domain</Th>
                <Th scope="col">Message</Th>
                <Th scope="col">Date</Th>
                <Th scope="col">Action</Th>
              </tr>
            </TableHead>
            <TableBody>
              {alerts.map((alert, index) => (
                <tr key={alert.id} className="hover:bg-bg-page transition-colors">
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {tableRowSerial(index, page, pageSize)}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${SEVERITY_STYLES[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm text-text-primary">
                      {ALERT_TYPE_LABELS[alert.type] ?? alert.type}
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
