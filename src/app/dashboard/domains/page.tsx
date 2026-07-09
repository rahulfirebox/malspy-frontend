'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Globe, Trash2, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { domainService } from '@/services/domainService';
import { useAuthStore } from '@/stores/authStore';
import { useDebouncedUrlSearch } from '@/hooks/useDebouncedUrlSearch';
import { useDomainFilters } from '@/hooks/useDomainFilters';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { tableRowSerial } from '@/lib/pagination';
import { parseApiError, normalizeDomainUrlInput, formatDateShort, type DomainProtocol } from '@/lib/apiUtils';
import {
  DOMAIN_SCHEDULE_FILTER_OPTIONS,
  DOMAIN_STATUS_FILTER_OPTIONS,
} from '@/lib/constants/domainFilters';
import { PROTOCOL_SELECT_OPTIONS } from '@/lib/constants/scanFilters';
import toast from 'react-hot-toast';
import type { Domain } from '@/types';
import { AddDomainSchema } from '@/lib/schemas/domain';
import {
  DOMAIN_FREQUENCY_SELECT_OPTIONS,
  getFrequencyLabel,
  type DomainFrequencyKey,
} from '@/lib/constants/domainFrequency';

const STATUS_COLORS: Record<string, string> = {
  clean: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
  infected: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  blacklisted: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  unknown: 'bg-bg-elevated text-text-secondary border-border',
};

export default function DomainsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const userId = useAuthStore(s => s.user?.id);
  const [deleteTarget, setDeleteTarget] = useState<Domain | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [domainProtocol, setDomainProtocol] = useState<DomainProtocol>('https');
  const [frequency, setFrequency] = useState<DomainFrequencyKey>('daily');
  const [addError, setAddError] = useState<string | null>(null);
  const [rescanningId, setRescanningId] = useState<string | null>(null);
  const { search, setSearch, debouncedSearch } = useDebouncedUrlSearch();
  const {
    schedule,
    status,
    setSchedule,
    setStatus,
    clearFilters,
    hasSelectFilters,
  } = useDomainFilters();
  const { page, pageSize, cursor, apiParams, goNext, goPrevious, getMeta } = useUrlPagination(10);

  const hasActiveFilters = Boolean(debouncedSearch || hasSelectFilters);

  function resetAddForm() {
    setNewDomain('');
    setDomainProtocol('https');
    setFrequency('daily');
    setAddError(null);
  }

  const domainsQuery = useQuery({
    queryKey: [
      'domains',
      userId,
      { q: debouncedSearch, schedule, status, page, cursor, pageSize },
    ],
    queryFn: () =>
      domainService.listDomains({
        q: debouncedSearch || undefined,
        schedule: schedule || undefined,
        status: status || undefined,
        ...apiParams,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: (data: { domain: string; frequency: DomainFrequencyKey }) =>
      domainService.addDomain({
        domain: data.domain,
        frequency: data.frequency,
        notify_email: true,
        slack_webhook_url: null,
      }),
    retry: false,
    onSuccess: () => {
      toast.success('Domain added to monitoring');
      setAddOpen(false);
      resetAddForm();
      void qc.invalidateQueries({ queryKey: ['domains', userId] });
    },
    onError: (err: unknown) => {
      const apiErr = parseApiError(err);
      setAddError(apiErr.message);
    },
  });

  function handleAddDomain() {
    setAddError(null);
    const domainValue = normalizeDomainUrlInput(newDomain, domainProtocol);
    const parsed = AddDomainSchema.safeParse({
      domain: domainValue,
      frequency,
      notify_email: true,
      slack_webhook_url: null,
    });
    if (!parsed.success) {
      setAddError(parsed.error.errors[0]?.message ?? 'Invalid domain');
      return;
    }
    addMutation.mutate(parsed.data);
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => domainService.deleteDomain(id),
    retry: false,
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: ['domains', userId] });
      const queryKey = [
        'domains',
        userId,
        { q: debouncedSearch, schedule, status, page, cursor, pageSize },
      ];
      const previous = qc.getQueryData(queryKey);
      qc.setQueryData(
        queryKey,
        (old: { results?: Domain[]; count?: number } | undefined) => ({
          ...old,
          results: old?.results?.filter((d: Domain) => d.id !== id) ?? [],
        })
      );
      return { previous, queryKey };
    },
    onSuccess: (_data) => {
      toast.dismiss();
      setDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: ['domains', userId] });
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.queryKey) {
        qc.setQueryData(ctx.queryKey, ctx.previous);
      }
      toast.error('Failed to remove domain');
    },
  });

  const rescanMutation = useMutation({
    mutationFn: (id: string) => domainService.triggerScan(id),
    retry: false,
    onMutate: id => {
      setRescanningId(id);
    },
    onSuccess: data => {
      toast.success('Rescan started');
      void qc.invalidateQueries({ queryKey: ['domains', userId] });
      router.push(`/dashboard/scans/${data.id}`);
    },
    onError: () => toast.error('Failed to start rescan. Please try again.'),
    onSettled: () => setRescanningId(null),
  });

  const domains = useMemo(() => domainsQuery.data?.results ?? [], [domainsQuery.data]);
  const paginationMeta = getMeta(domainsQuery.data);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Monitored Domains"
        action={
          <Button size="md" className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Add Domain
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm flex-1">
            <Input
              type="search"
              placeholder="Search domains…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search domains"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="md" className="shrink-0" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <Select
            id="domain-schedule-filter"
            label="Schedule"
            value={schedule}
            onChange={setSchedule}
            options={DOMAIN_SCHEDULE_FILTER_OPTIONS}
          />
          <Select
            id="domain-status-filter"
            label="Status"
            value={status}
            onChange={setStatus}
            options={DOMAIN_STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      {domainsQuery.isFetching && !domainsQuery.isLoading && (
        <div className="flex justify-end">
          <span className="text-xs text-text-secondary">Refreshing…</span>
        </div>
      )}

      {domainsQuery.isPending ? (
        <SkeletonTable rows={6} />
      ) : domainsQuery.isError ? (
        <ErrorState message="Failed to load domains." onRetry={() => domainsQuery.refetch()} />
      ) : domains.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-12 w-12" />}
          title="No monitored domains"
          description={
            hasActiveFilters
              ? 'No domains match the current filters.'
              : 'Add a domain to start continuous security monitoring.'
          }
          cta={
            !hasActiveFilters ? (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add Domain
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-bg-card border border-border rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col" className="w-12">#</Th>
                <Th scope="col">Domain</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Schedule</Th>
                <Th scope="col">Last Scan</Th>
                <Th scope="col">Scans</Th>
                <Th scope="col">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {domains.map((domain, index) => (
                <tr key={domain.id} className="hover:bg-bg-page transition-colors">
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {tableRowSerial(index, page, pageSize)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-sm text-text-primary">{domain.domain}</span>
                  </Td>
                  <Td>
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
                  </Td>
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {getFrequencyLabel(domain.frequency)}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {domain.last_scan_date
                        ? formatDateShort(domain.last_scan_date)
                        : '—'}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm font-medium text-text-primary">
                      {domain.scan_count ?? 0}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => rescanMutation.mutate(domain.id)}
                        disabled={rescanningId === domain.id}
                        className="p-1.5 rounded hover:bg-bg-page text-text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Rescan ${domain.domain}`}
                        title="Rescan"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${rescanningId === domain.id ? 'motion-safe:animate-spin' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(domain)}
                        className="p-1.5 rounded hover:bg-danger-bg text-text-secondary hover:text-danger focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
                        aria-label={`Remove ${domain.domain}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
          <Pagination
            meta={paginationMeta}
            onNext={() => goNext(domainsQuery.data?.next)}
            onPrevious={() => goPrevious(domainsQuery.data?.previous)}
          />
        </div>
      )}

      
      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetAddForm(); }} title="Add Domain" size="md">
        <div className="space-y-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-domain" className="text-sm font-medium text-text-primary">
              Domain
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                id="domain-protocol"
                value={domainProtocol}
                onChange={value => {
                  setDomainProtocol(value as DomainProtocol);
                  setAddError(null);
                }}
                options={PROTOCOL_SELECT_OPTIONS}
                className="w-28 shrink-0"
                triggerClassName="font-mono"
                aria-label="Protocol"
              />
              <input
                id="new-domain"
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={e => {
                  setNewDomain(e.target.value);
                  setAddError(null);
                }}
                className={`min-w-0 flex-1 border rounded-lg px-3 py-2 bg-bg-elevated text-text-primary placeholder-text-secondary font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page shadow-sm transition ${
                  addError ? 'border-danger' : 'border-border-dark'
                }`}
                aria-label="Domain to monitor"
                aria-describedby={addError ? 'new-domain-error' : 'new-domain-help'}
              />
            </div>
            {addError ? (
              <p id="new-domain-error" className="text-sm text-danger">
                {addError}
              </p>
            ) : (
              <p id="new-domain-help" className="text-sm text-text-secondary">
                Enter a domain or paste a full URL with http:// or https://
              </p>
            )}
          </div>
          <Select
            id="domain-frequency"
            label="Scan frequency"
            value={frequency}
            onChange={value => {
              setFrequency(value as DomainFrequencyKey);
              setAddError(null);
            }}
            options={DOMAIN_FREQUENCY_SELECT_OPTIONS}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="md" onClick={() => { setAddOpen(false); resetAddForm(); }}>
              Cancel
            </Button>
            <Button
              size="md"
              loading={addMutation.isPending}
              onClick={handleAddDomain}
              disabled={!newDomain.trim()}
            >
              Add Domain
            </Button>
          </div>
        </div>
      </Modal>

      
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Remove Domain"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-6">
          Remove{' '}
          <span className="font-mono font-semibold text-text-primary">{deleteTarget?.domain}</span>{' '}
          from monitoring? All scheduled scans will stop.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
