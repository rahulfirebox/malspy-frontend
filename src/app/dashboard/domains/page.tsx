'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Globe, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { domainService } from '@/services/domainService';
import { useAuthStore } from '@/stores/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateShort, parseApiError } from '@/lib/apiUtils';
import { ERROR_CODES } from '@/lib/constants/errorCodes';
import toast from 'react-hot-toast';
import type { Domain } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  clean: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
  infected: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  blacklisted: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  unknown: 'bg-[#f4f6f8] text-[#6b7280] border-[#e5e7eb]',
};

export default function DomainsPage() {
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [deleteTarget, setDeleteTarget] = useState<Domain | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const search = searchParams.get('q') ?? '';
  const setSearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('q', val);
    else params.delete('q');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const debouncedSearch = useDebounce(search, 300);

  const domainsQuery = useQuery({
    queryKey: ['domains', userId, { q: debouncedSearch }],
    queryFn: () => domainService.listDomains({ q: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      domainService.addDomain({
        domain: newDomain,
        frequency: 'weekly',
        notify_email: true,
        slack_webhook_url: null,
      }),
    retry: false,
    onSuccess: () => {
      toast.success('Domain added to monitoring');
      setAddOpen(false);
      setNewDomain('');
      setAddError(null);
      void qc.invalidateQueries({ queryKey: ['domains', userId] });
    },
    onError: (err: unknown) => {
      const apiErr = parseApiError(err);
      if (apiErr.code === ERROR_CODES.CONFLICT) {
        setAddError('This domain is already being monitored.');
      } else if (apiErr.code === ERROR_CODES.VALIDATION_ERROR || apiErr.code === ERROR_CODES.INVALID_INPUT) {
        setAddError(apiErr.message);
      } else {
        toast.error('Failed to add domain');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => domainService.deleteDomain(id),
    retry: false,
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: ['domains', userId] });
      const previous = qc.getQueryData(['domains', userId, { q: debouncedSearch }]);
      qc.setQueryData(
        ['domains', userId, { q: debouncedSearch }],
        (old: { results?: Domain[]; count?: number } | undefined) => ({
          ...old,
          results: old?.results?.filter((d: Domain) => d.id !== id) ?? [],
        })
      );
      return { previous };
    },
    onSuccess: (_data) => {
      toast.dismiss();
      setDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: ['domains', userId] });
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(['domains', userId, { q: debouncedSearch }], ctx?.previous);
      toast.error('Failed to remove domain');
    },
  });

  const domains = useMemo(() => domainsQuery.data?.results ?? [], [domainsQuery.data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1f2937]">Monitored Domains</h1>
        <Button size="md" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Add Domain
        </Button>
      </div>

      <div className="max-w-sm">
        <Input
          type="search"
          placeholder="Search domains…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search domains"
        />
      </div>

      {domainsQuery.isFetching && !domainsQuery.isLoading && (
        <div className="flex justify-end">
          <span className="text-xs text-[#6b7280]">Refreshing…</span>
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
            debouncedSearch
              ? `No domains match "${debouncedSearch}"`
              : 'Add a domain to start continuous security monitoring.'
          }
          cta={
            !debouncedSearch ? (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add Domain
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col">Domain</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Schedule</Th>
                <Th scope="col">Last Scan</Th>
                <Th scope="col">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {domains.map(domain => (
                <tr key={domain.id} className="hover:bg-bg-page transition-colors">
                  <Td>
                    <span className="font-mono text-sm text-[#1f2937]">{domain.domain}</span>
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
                    <span className="text-xs text-[#6b7280] capitalize">{domain.frequency}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[#6b7280]">
                      {domain.last_scan_id ? '✓' : '—'}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDeleteTarget(domain)}
                        className="p-1.5 rounded hover:bg-danger-bg text-[#6b7280] hover:text-danger focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
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
          <div className="px-4 py-3 border-t border-[#e5e7eb] text-xs text-[#6b7280]">
            {domainsQuery.data.count} domain{domainsQuery.data.count !== 1 ? 's' : ''} monitored
          </div>
        </div>
      )}

      
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddError(null); }} title="Add Domain" size="sm">
        <div className="space-y-4">
          <Input
            label="Domain"
            placeholder="www.example.com"
            value={newDomain}
            onChange={e => { setNewDomain(e.target.value); setAddError(null); }}
            aria-label="Domain to monitor"
          />
          {addError && (
            <p className="text-sm text-red-600" role="alert">{addError}</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="md" onClick={() => { setAddOpen(false); setAddError(null); }}>
              Cancel
            </Button>
            <Button
              size="md"
              loading={addMutation.isPending}
              onClick={() => addMutation.mutate()}
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
        <p className="text-sm text-[#6b7280] mb-6">
          Remove{' '}
          <span className="font-mono font-semibold text-[#1f2937]">{deleteTarget?.domain}</span>{' '}
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
