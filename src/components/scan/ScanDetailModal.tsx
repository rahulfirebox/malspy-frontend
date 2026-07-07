'use client';

import React, { useEffect, useRef, useState } from 'react';
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

interface ScanDetailModalProps {
  scanId: string | null;
  onClose: () => void;
  onRescanned?: (newScanId: string) => void;
}

export function ScanDetailModal({ scanId, onClose, onRescanned }: ScanDetailModalProps) {
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const scanQuery = useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => scanService.getScan(scanId!),
    staleTime: 30_000,
    enabled: !!scanId && !!userId,
  });

  const scan = scanQuery.data;

  useEffect(() => {
    if (!scanId || !scan) return;
    if (scan.status === 'completed' || scan.status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current >= 120) {
        if (pollRef.current) clearInterval(pollRef.current);
        void qc.invalidateQueries({ queryKey: ['scan', scanId] });
        return;
      }
      try {
        const status = await scanService.getScanStatus(scanId);
        if (status.status === 'completed' || status.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          void qc.invalidateQueries({ queryKey: ['scan', scanId] });
          void qc.invalidateQueries({ queryKey: ['scans'] });
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);

    const ref = pollRef;
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [scan?.status, scanId, qc, scan]);

  useEffect(() => {
    if (!scanId) {
      setShowDeleteConfirm(false);
      setActionError('');
    }
  }, [scanId]);

  async function handlePdfDownload() {
    if (!scanId) return;
    setPdfLoading(true);
    setActionError('');
    try {
      await scanService.downloadPdfReport(scanId, scan?.domain);
      toast.success('PDF report downloaded');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF report.';
      setActionError(message);
      toast.error(message);
    } finally {
      setPdfLoading(false);
    }
  }

  const rescanMutation = useMutation({
    mutationFn: () => scanService.rescan(scanId!),
    retry: false,
    onSuccess: data => {
      setActionError('');
      toast.success('Rescan started!');
      void qc.invalidateQueries({ queryKey: ['scans'] });
      onRescanned?.(data.id);
    },
    onError: () => setActionError('Failed to start rescan. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => scanService.deleteScan(scanId!),
    retry: false,
    onSuccess: () => {
      toast.dismiss();
      toast.success('Scan deleted');
      void qc.invalidateQueries({ queryKey: ['scans', userId] });
      setShowDeleteConfirm(false);
      onClose();
    },
    onError: () => setActionError('Failed to delete scan. Please try again.'),
  });

  const isProcessing = scan?.status === 'queued' || scan?.status === 'scanning';

  const authActions = scan ? (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
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
          onClick={() => {
            setActionError('');
            setShowDeleteConfirm(true);
          }}
          loading={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
      {actionError && (
        <p className="text-sm text-[#dc2626]" role="alert">
          {actionError}
        </p>
      )}
    </div>
  ) : null;

  return (
    <>
      <Modal
        open={scanId !== null}
        onClose={onClose}
        title={scan?.domain ? `Scan: ${scan.domain}` : 'Scan Details'}
        size="xl"
      >
        {scanQuery.isPending ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} />
            ))}
          </div>
        ) : scanQuery.isError ? (
          <ErrorState
            title="Scan not found"
            message="This scan does not exist or you don't have access to it."
            onRetry={() => void scanQuery.refetch()}
          />
        ) : scan && isProcessing ? (
          <div className="bg-bg-card border border-border rounded-lg">
            <ScanProgress domain={scan.domain} />
          </div>
        ) : scan ? (
          <ScanResultLayout scan={scan} authActions={authActions} embedded />
        ) : null}
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete this scan?"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-4">This action cannot be undone.</p>
        {actionError && (
          <p className="text-sm text-[#dc2626] mb-4" role="alert">
            {actionError}
          </p>
        )}
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setShowDeleteConfirm(false);
              setActionError('');
            }}
          >
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
