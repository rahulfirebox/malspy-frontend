'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ShieldAlert, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { signatureService } from '@/services/signatureService';
import { formatDateShort } from '@/lib/apiUtils';
import toast from 'react-hot-toast';
import type { MalwareSignature } from '@/types';

const ROLES = {
  SUPERADMIN: 'superadmin',
} as const;

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  high: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  medium: 'bg-[#fefce8] text-[#713f12] border-[#fde68a]',
  low: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
};

const LAYER_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'browser', label: 'Browser' },
  { value: 'server', label: 'Server' },
] as const;

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

const LAYER_LABELS: Record<string, string> = Object.fromEntries(
  LAYER_OPTIONS.map(o => [o.value, o.label])
);

const EMPTY_FORM = {
  signature_id: '',
  name: '',
  pattern: '',
  description: '',
  layer: 'static' as MalwareSignature['layer'],
  type: '',
  severity: 'medium' as MalwareSignature['severity'],
  is_active: true,
  auto_updated: false,
};

export default function SuperAdminPage() {
  const user = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.user?.id);
  const router = useRouter();
  const qc = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState('');
  const [layerFilter, setLayerFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

  const signaturesQuery = useQuery({
    queryKey: ['signatures', layerFilter, severityFilter],
    queryFn: () =>
      signatureService.listSignatures({
        layer: layerFilter !== 'all' ? layerFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        page_size: 50,
      }),
    enabled: !!userId && isSuperAdmin,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: signatureService.createSignature,
    retry: false,
    onSuccess: () => {
      setCreateError('');
      toast.success('Signature created');
      setAddOpen(false);
      setForm(EMPTY_FORM);
      void qc.invalidateQueries({ queryKey: ['signatures', layerFilter, severityFilter] });
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const first = data ? Object.values(data)[0]?.[0] : undefined;
      setCreateError(first ?? 'Failed to create signature');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      signatureService.updateSignature(id, { is_active }),
    retry: false,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['signatures', layerFilter, severityFilter] });
    },
    onError: () => toast.error('Failed to update signature'),
  });

  const signatures = useMemo(() => signaturesQuery.data?.results ?? [], [signaturesQuery.data]);

  if (!isSuperAdmin) {
    if (typeof window !== 'undefined') {
      router.replace('/dashboard');
    }
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#4F46E5]" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#0E0E14]">Malware Signatures</h1>
        </div>
        <Button size="md" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Add Signature
        </Button>
      </div>

      
      <div className="flex gap-3">
        <select
          value={layerFilter}
          onChange={e => setLayerFilter(e.target.value)}
          className="border border-[#E0E0DA] rounded-lg px-3 py-2 text-sm text-[#0E0E14] bg-bg-card focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          aria-label="Filter by layer"
        >
          <option value="all">All Layers</option>
          {LAYER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="border border-[#E0E0DA] rounded-lg px-3 py-2 text-sm text-[#0E0E14] bg-bg-card focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          aria-label="Filter by severity"
        >
          <option value="all">All Severities</option>
          {SEVERITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {signaturesQuery.isPending ? (
        <SkeletonTable rows={6} />
      ) : signaturesQuery.isError ? (
        <ErrorState
          message="Failed to load signatures."
          onRetry={() => signaturesQuery.refetch()}
        />
      ) : !signatures.length ? (
        <EmptyState
          icon={<ShieldAlert className="h-12 w-12" />}
          title="No signatures"
          description="Add a malware signature to start detecting threats."
          cta={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              Add Signature
            </Button>
          }
        />
      ) : (
        <div className="bg-bg-card border border-[#E0E0DA] rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th scope="col">ID</Th>
                <Th scope="col">Name</Th>
                <Th scope="col">Layer</Th>
                <Th scope="col">Type</Th>
                <Th scope="col">Severity</Th>
                <Th scope="col">Active</Th>
                <Th scope="col">Added</Th>
              </tr>
            </TableHead>
            <TableBody>
              {signatures.map((sig: MalwareSignature) => (
                <tr key={sig.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <span className="font-mono text-xs text-[#5B5B6B]">{sig.signature_id}</span>
                  </Td>
                  <Td>
                    <span className="text-sm font-medium text-[#0E0E14]">{sig.name}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[#5B5B6B]">
                      {LAYER_LABELS[sig.layer] ?? sig.layer}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[#5B5B6B]">{sig.type}</span>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${SEVERITY_COLORS[sig.severity] ?? ''}`}
                    >
                      {sig.severity}
                    </span>
                  </Td>
                  <Td>
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: sig.id, is_active: !sig.is_active })
                      }
                      disabled={toggleMutation.isPending && toggleMutation.variables?.id === sig.id}
                      className="p-1 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                      aria-label={sig.is_active ? 'Deactivate signature' : 'Activate signature'}
                    >
                      {sig.is_active ? (
                        <ToggleRight className="h-5 w-5 text-[#4F46E5]" aria-hidden="true" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-[#5B5B6B]" aria-hidden="true" />
                      )}
                    </button>
                  </Td>
                  <Td>
                    <span className="text-xs text-[#5B5B6B]">
                      {formatDateShort(sig.created_at)}
                    </span>
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-[#E0E0DA] text-xs text-[#5B5B6B]">
            {signaturesQuery.data.count} signature{signaturesQuery.data.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Malware Signature"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Signature ID"
              placeholder="e.g. MW-001"
              value={form.signature_id}
              onChange={e => setForm(f => ({ ...f, signature_id: e.target.value }))}
            />
            <Input
              label="Name"
              placeholder="e.g. Base64 Shell"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <Input
            label="Pattern (regex)"
            placeholder="e.g. eval\(base64_decode\("
            value={form.pattern}
            onChange={e => setForm(f => ({ ...f, pattern: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Layer</label>
              <select
                value={form.layer}
                onChange={e =>
                  setForm(f => ({ ...f, layer: e.target.value as MalwareSignature['layer'] }))
                }
                className="w-full border border-[#E0E0DA] rounded-lg px-3 py-2 text-sm text-[#0E0E14] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                {LAYER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={e =>
                  setForm(f => ({ ...f, severity: e.target.value as MalwareSignature['severity'] }))
                }
                className="w-full border border-[#E0E0DA] rounded-lg px-3 py-2 text-sm text-[#0E0E14] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                {SEVERITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Type</label>
              <Input
                placeholder="e.g. webshell"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              />
            </div>
          </div>
          {createError && (
            <p className="text-sm text-[#dc2626]" role="alert">{createError}</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="md" onClick={() => { setAddOpen(false); setCreateError(''); }}>
              Cancel
            </Button>
            <Button
              size="md"
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
              disabled={!form.signature_id.trim() || !form.name.trim() || !form.pattern.trim()}
            >
              Add Signature
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
