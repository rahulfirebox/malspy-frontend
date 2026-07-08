'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2, FileDown } from 'lucide-react';
import { ScanResultLayout } from '@/components/scan/ScanResultLayout';
import { ScanProgress } from '@/components/scan/ScanProgress';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { scanService } from '@/services/scanService';
import toast from 'react-hot-toast';

export default function ScanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const scanQuery = useQuery({
    queryKey: ['scan', id],
    queryFn: () => scanService.getScan(id),
    staleTime: 30_000,
    enabled: !!id && !!userId,
  });

  const scan = scanQuery.data;

  async function handlePdfDownload() {
    setPdfLoading(true);
    setActionError('');
    try {
      await scanService.downloadPdfReport(id, scan?.domain);
      toast.success('PDF report downloaded');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF report.';
      setActionError(message);
      toast.error(message);
    } finally {
      setPdfLoading(false);
    }
  }

  
  useEffect(() => {
    if (!scan) return;
    if (scan.status === 'completed' || scan.status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current >= 120) {
        if (pollRef.current) clearInterval(pollRef.current);
        qc.invalidateQueries({ queryKey: ['scan', id] });
        return;
      }
      try {
        const status = await scanService.getScanStatus(id);
        if (status.status === 'completed' || status.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          qc.invalidateQueries({ queryKey: ['scan', id] });
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);

    const ref = pollRef;
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [scan?.status, id, qc]);

  const rescanMutation = useMutation({
    mutationFn: () => scanService.rescan(id),
    retry: false,
    onSuccess: data => {
      setActionError('');
      toast.success('Rescan started!');
      void qc.invalidateQueries({ queryKey: ['scans'] });
      router.push(`/dashboard/scans/${data.id}`);
    },
    onError: () => setActionError('Failed to start rescan. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => scanService.deleteScan(id),
    retry: false,
    onSuccess: () => {
      toast.dismiss();
      toast.success('Scan deleted');
      void qc.invalidateQueries({ queryKey: ['scans'] });
      router.push('/dashboard/scans');
    },
    onError: () => setActionError('Failed to delete scan. Please try again.'),
  });

  if (scanQuery.isPending) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`skel-${i}`} />
        ))}
      </div>
    );
  }

  if (scanQuery.isError) {
    return (
      <ErrorState
        title="Scan not found"
        message="This scan does not exist or you don't have access to it."
        onRetry={() => router.push('/dashboard/scans')}
      />
    );
  }

  if (!scan) return null;

  const isProcessing = scan.status === 'queued' || scan.status === 'scanning';

  if (isProcessing) {
    return (
      <div className="bg-bg-card border border-border rounded-lg shadow-md">
        <ScanProgress domain={scan.domain} />
      </div>
    );
  }

  const authActions = (
    <div className="space-y-2">
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
        size="sm"
        onClick={() => rescanMutation.mutate()}
        loading={rescanMutation.isPending}
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Rescan
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
        onClick={() => void handlePdfDownload()}
        loading={pdfLoading}
        aria-label="Download PDF report"
      >
        <FileDown className="h-4 w-4" aria-hidden="true" />
        PDF
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => { setActionError(''); setShowDeleteConfirm(true); }}
        loading={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </Button>
    </div>
    {actionError && (
      <p className="text-sm text-[#dc2626]" role="alert">{actionError}</p>
    )}
    </div>
  );

  return (
    <>
      <ScanResultLayout scan={scan} authActions={authActions} />
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete this scan?"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-4">This action cannot be undone.</p>
        {actionError && (
          <p className="text-sm text-[#dc2626] mb-4" role="alert">{actionError}</p>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="md" onClick={() => { setShowDeleteConfirm(false); setActionError(''); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
