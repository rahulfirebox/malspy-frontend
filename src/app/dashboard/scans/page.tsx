'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Shield, Trash2, FileDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { RatingBadgeSmall } from '@/components/scan/RatingBadge';
import { ScanStatusChip, MalwareStatusChip } from '@/components/scan/StatusChip';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { NewScanModal } from '@/components/scan/NewScanModal';
import { scanService } from '@/services/scanService';
import { useAuthStore } from '@/stores/authStore';
import { useDebouncedUrlSearch } from '@/hooks/useDebouncedUrlSearch';
import { useScanFilters } from '@/hooks/useScanFilters';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { tableRowSerial } from '@/lib/pagination';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateShort } from '@/lib/apiUtils';
import {
  SCAN_MALWARE_FILTER_OPTIONS,
  SCAN_ORDERING_OPTIONS,
  SCAN_RATING_FILTER_OPTIONS,
  SCAN_STATUS_FILTER_OPTIONS,
} from '@/lib/constants/scanFilters';
import toast from 'react-hot-toast';
import type { ScanListItem } from '@/types';

export default function ScansPage() {
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [deleteTarget, setDeleteTarget] = useState<ScanListItem | null>(null);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [rescanningId, setRescanningId] = useState<string | null>(null);
  const { page, pageSize, cursor, apiParams, goNext, goPrevious, getMeta } = useUrlPagination(10);

  function openScanDetail(scanId: string) {
    router.push(`/dashboard/scans/${scanId}`);
  }

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewScanModal(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('new');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  function handleScanStarted(scanId: string) {
    void qc.invalidateQueries({ queryKey: ['scans', userId] });
    router.push(`/dashboard/scans/${scanId}`);
  }

  async function handlePdfDownload(scan: ScanListItem) {
    setDownloadingPdfId(scan.id);
    try {
      await scanService.downloadPdfReport(scan.id, scan.domain);
      toast.success('PDF report downloaded');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF report.';
      toast.error(message);
    } finally {
      setDownloadingPdfId(null);
    }
  }

  const { search, setSearch, debouncedSearch } = useDebouncedUrlSearch();
  const {
    status,
    rating,
    malware,
    ordering,
    setStatus,
    setRating,
    setMalware,
    setOrdering,
    clearFilters,
    hasSelectFilters,
  } = useScanFilters();

  const hasActiveFilters = Boolean(debouncedSearch || hasSelectFilters);

  const scansQuery = useQuery({
    queryKey: [
      'scans',
      userId,
      {
        q: debouncedSearch,
        status,
        rating,
        malware,
        ordering,
        page,
        cursor,
        pageSize,
      },
    ],
    queryFn: () =>
      scanService.listScans({
        q: debouncedSearch || undefined,
        status: status || undefined,
        rating: rating || undefined,
        malware: malware || undefined,
        ordering: ordering || undefined,
        ...apiParams,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const scans = useMemo(() => scansQuery.data?.results ?? [], [scansQuery.data]);
  const paginationMeta = getMeta(scansQuery.data);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scanService.deleteScan(id),
    retry: false,
    onSuccess: () => {
      setDeleteError('');
      toast.dismiss();
      toast.success('Scan deleted');
      setDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: ['scans', userId] });
    },
    onError: () => setDeleteError('Failed to delete scan. Please try again.'),
  });

  const rescanMutation = useMutation({
    mutationFn: (id: string) => scanService.rescan(id),
    retry: false,
    onMutate: id => {
      setRescanningId(id);
    },
    onSuccess: data => {
      toast.success('Rescan started!');
      void qc.invalidateQueries({ queryKey: ['scans', userId] });
      router.push(`/dashboard/scans/${data.id}`);
    },
    onError: () => toast.error('Failed to start rescan. Please try again.'),
    onSettled: () => setRescanningId(null),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scans"
        action={
          <Button size="md" className="w-full sm:w-auto" onClick={() => setShowNewScanModal(true)}>
            + New Scan
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm flex-1">
            <Input
              type="search"
              placeholder="Search domain or URL…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search scans"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="md" className="shrink-0" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            id="scan-status-filter"
            label="Status"
            value={status}
            onChange={setStatus}
            options={SCAN_STATUS_FILTER_OPTIONS}
          />
          <Select
            id="scan-rating-filter"
            label="Rating"
            value={rating}
            onChange={setRating}
            options={SCAN_RATING_FILTER_OPTIONS}
          />
          <Select
            id="scan-malware-filter"
            label="Malware"
            value={malware}
            onChange={setMalware}
            options={SCAN_MALWARE_FILTER_OPTIONS}
          />
          <Select
            id="scan-ordering-filter"
            label="Sort by"
            value={ordering}
            onChange={setOrdering}
            options={SCAN_ORDERING_OPTIONS}
          />
        </div>
      </div>

      {scansQuery.isFetching && !scansQuery.isLoading && (
        <div className="flex justify-end">
          <span className="text-xs text-text-secondary">Refreshing…</span>
        </div>
      )}

      {scansQuery.isPending ? (
        <SkeletonTable rows={8} />
      ) : scansQuery.isError ? (
        <ErrorState message="Failed to load scans." onRetry={() => scansQuery.refetch()} />
      ) : scans.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-12 w-12" />}
          title="No scans found"
          description={
            hasActiveFilters
              ? 'No scans match the current filters.'
              : 'Run your first website security scan.'
          }
          cta={
            !hasActiveFilters ? (
              <Button size="sm" onClick={() => setShowNewScanModal(true)}>
                Start Scan
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
                <Th scope="col">Rating</Th>
                <Th scope="col">Domain</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Malware</Th>
                <Th scope="col">Date</Th>
                <Th scope="col">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {scans.map((scan, index) => (
                <tr
                  key={scan.id}
                  className="hover:bg-bg-page transition-colors cursor-pointer"
                  onClick={() => openScanDetail(scan.id)}
                >
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {tableRowSerial(index, page, pageSize)}
                    </span>
                  </Td>
                  <Td>
                    <RatingBadgeSmall rating={scan.rating} />
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        openScanDetail(scan.id);
                      }}
                      className="font-mono text-sm text-[#2B7DBC] hover:underline text-left"
                    >
                      {scan.domain}
                    </button>
                  </Td>
                  <Td>
                    <ScanStatusChip status={scan.status} />
                  </Td>
                  <Td>
                    <MalwareStatusChip detected={scan.malware_detected} />
                  </Td>
                  <Td>
                    <span className="text-xs text-text-secondary">
                      {formatDateShort(scan.created_at)}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openScanDetail(scan.id)}
                        className="p-1.5 rounded hover:bg-bg-page text-text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#2B7DBC]"
                        aria-label={`View scan for ${scan.domain}`}
                      >
                        <Shield className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {(scan.status === 'completed' || scan.status === 'failed') && (
                        <button
                          type="button"
                          onClick={() => rescanMutation.mutate(scan.id)}
                          disabled={rescanningId === scan.id}
                          className="p-1.5 rounded hover:bg-bg-page text-text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Rescan ${scan.domain}`}
                          title="Rescan"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${rescanningId === scan.id ? 'animate-spin' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handlePdfDownload(scan)}
                        disabled={downloadingPdfId === scan.id}
                        className="p-1.5 rounded hover:bg-bg-page text-text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Download PDF for ${scan.domain}`}
                      >
                        <FileDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(scan)}
                        className="p-1.5 rounded hover:bg-danger-bg text-text-secondary hover:text-danger focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
                        aria-label={`Delete scan for ${scan.domain}`}
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
            onNext={() => goNext(scansQuery.data?.next)}
            onPrevious={() => goPrevious(scansQuery.data?.previous)}
          />
        </div>
      )}

      
      <NewScanModal
        open={showNewScanModal}
        onClose={() => setShowNewScanModal(false)}
        onScanStarted={handleScanStarted}
      />

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Scan"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-4">
          Are you sure you want to delete the scan for{' '}
          <span className="font-mono font-semibold text-text-primary">{deleteTarget?.domain}</span>?
          This action cannot be undone.
        </p>
        {deleteError && (
          <p className="text-sm text-[#dc2626] mb-4" role="alert">{deleteError}</p>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="md" onClick={() => { setDeleteTarget(null); setDeleteError(''); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
