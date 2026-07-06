'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Trash2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { RatingBadgeSmall } from '@/components/scan/RatingBadge';
import { ScanStatusChip, MalwareStatusChip } from '@/components/scan/StatusChip';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { scanService } from '@/services/scanService';
import { useAuthStore } from '@/stores/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateShort } from '@/lib/apiUtils';
import toast from 'react-hot-toast';
import type { ScanListItem } from '@/types';

export default function ScansPage() {
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [deleteTarget, setDeleteTarget] = useState<ScanListItem | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

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

  const search = searchParams.get('q') ?? '';
  const setSearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('q', val);
    else params.delete('q');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const debouncedSearch = useDebounce(search, 300);

  const scansQuery = useQuery({
    queryKey: ['scans', userId, { q: debouncedSearch }],
    queryFn: () => scanService.listScans({ q: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const scans = useMemo(() => scansQuery.data?.results ?? [], [scansQuery.data]);

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1f2937]">Scans</h1>
        <Link href="/dashboard/scans/new">
          <Button size="md">+ New Scan</Button>
        </Link>
      </div>

      <div className="max-w-sm">
        <Input
          type="search"
          placeholder="Search by domain…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search scans"
        />
      </div>

      {scansQuery.isFetching && !scansQuery.isLoading && (
        <div className="flex justify-end">
          <span className="text-xs text-[#6b7280]">Refreshing…</span>
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
            debouncedSearch
              ? `No scans match "${debouncedSearch}"`
              : 'Run your first website security scan.'
          }
          cta={
            !debouncedSearch ? (
              <Link href="/dashboard/scans/new">
                <Button size="sm">Start Scan</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-bg-card border border-[#e5e7eb] rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col">Rating</Th>
                <Th scope="col">Domain</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Malware</Th>
                <Th scope="col">Date</Th>
                <Th scope="col">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {scans.map(scan => (
                <tr key={scan.id} className="hover:bg-bg-page transition-colors">
                  <Td>
                    <RatingBadgeSmall rating={scan.rating} />
                  </Td>
                  <Td>
                    <Link
                      href={`/dashboard/scans/${scan.id}`}
                      className="font-mono text-sm text-[#2B7DBC] hover:underline"
                    >
                      {scan.domain}
                    </Link>
                  </Td>
                  <Td>
                    <ScanStatusChip status={scan.status} />
                  </Td>
                  <Td>
                    <MalwareStatusChip detected={scan.malware_detected} />
                  </Td>
                  <Td>
                    <span className="text-xs text-[#6b7280]">
                      {formatDateShort(scan.created_at)}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/scans/${scan.id}`}>
                        <button
                          className="p-1.5 rounded hover:bg-bg-page text-[#6b7280] hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#2B7DBC]"
                          aria-label={`View scan for ${scan.domain}`}
                        >
                          <Shield className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handlePdfDownload(scan)}
                        disabled={downloadingPdfId === scan.id}
                        className="p-1.5 rounded hover:bg-bg-page text-[#6b7280] hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Download PDF for ${scan.domain}`}
                      >
                        <FileDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(scan)}
                        className="p-1.5 rounded hover:bg-danger-bg text-[#6b7280] hover:text-danger focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
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
          <div className="px-4 py-3 border-t border-[#e5e7eb] text-xs text-[#6b7280]">
            Showing {scans.length} of {scansQuery.data?.count ?? 0} scans
          </div>
        </div>
      )}

      
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Scan"
        size="sm"
      >
        <p className="text-sm text-[#6b7280] mb-4">
          Are you sure you want to delete the scan for{' '}
          <span className="font-mono font-semibold text-[#1f2937]">{deleteTarget?.domain}</span>?
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
