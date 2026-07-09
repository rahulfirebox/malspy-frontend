'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/hooks/useApiKeys';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PlanGate } from '@/components/ui/PlanGate';
import { Key, Trash2, Plus, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateShort, parseApiError } from '@/lib/apiUtils';
import { tableRowSerial } from '@/lib/pagination';
import { ERROR_CODES } from '@/lib/constants/errorCodes';
import type { ApiKey } from '@/types';

export default function ApiKeysPage() {
  const { data, isPending, isError, refetch } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreateError(null);
    try {
      const result = await createMutation.mutateAsync({ name: newName });
      setRawKey(result.raw_key);
      setAddOpen(false);
      setNewName('');
    } catch (err: unknown) {
      const apiErr = parseApiError(err);
      if (apiErr.code === ERROR_CODES.CONFLICT) {
        setCreateError('An API key with this name already exists.');
      } else if (apiErr.code === ERROR_CODES.VALIDATION_ERROR || apiErr.code === ERROR_CODES.INVALID_INPUT) {
        setCreateError(apiErr.message);
      } else {
        toast.error('Failed to create API key');
      }
    }
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const apiKeys = useMemo(() => data?.results ?? [], [data]);

  const handleCopy = async () => {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
    } catch {
      toast.error('Failed to copy key. Please copy it manually.');
    }
  };

  return (
    <PlanGate plan="enterprise">
      <div className="space-y-5">
        <PageHeader
          title="API Keys"
          action={
            <Button size="md" className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Create Key
            </Button>
          }
        />

        {isPending ? (
          <SkeletonTable rows={4} />
        ) : isError ? (
          <ErrorState message="Failed to load API keys." onRetry={refetch} />
        ) : !apiKeys.length ? (
          <EmptyState
            icon={<Key className="h-12 w-12" />}
            title="No API keys"
            description="Create an API key to access the SecureScan API programmatically."
            cta={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Create Key
              </Button>
            }
          />
        ) : (
          <div className="bg-bg-card border border-[#E0E0DA] rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHead>
                <tr>
                  <Th scope="col" className="w-12">#</Th>
                  <Th scope="col">Name</Th>
                  <Th scope="col">Key Prefix</Th>
                  <Th scope="col">Created</Th>
                  <Th scope="col">Last Used</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Actions</Th>
                </tr>
              </TableHead>
              <TableBody>
                {apiKeys.map((key, index) => (
                  <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">{tableRowSerial(index)}</span>
                    </Td>
                    <Td>
                      <span className="font-medium text-[#0E0E14]">{key.name}</span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-[#5B5B6B]">{key.key_prefix}…</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">
                        {formatDateShort(key.created_at)}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">
                        {key.last_used_at ? formatDateShort(key.last_used_at) : '—'}
                      </span>
                    </Td>
                    <Td>
                      {key.revoked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]">
                          Active
                        </span>
                      )}
                    </Td>
                    <Td>
                      {!key.revoked && (
                        <button
                          onClick={() => setDeleteTarget(key)}
                          className="p-1.5 rounded hover:bg-danger-bg text-[#5B5B6B] hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600"
                          aria-label={`Revoke ${key.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
            <div className="px-4 py-3 border-t border-[#E0E0DA] text-xs text-[#5B5B6B]">
              {data!.count} key{data!.count !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        
        <Modal open={addOpen} onClose={() => { setAddOpen(false); setCreateError(null); }} title="Create API Key" size="sm">
          <div className="space-y-4">
            <Input
              label="Key Name"
              placeholder="e.g. CI/CD Pipeline"
              value={newName}
              onChange={e => { setNewName(e.target.value); setCreateError(null); }}
            />
            {createError && (
              <p className="text-sm text-red-600" role="alert">{createError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="md" onClick={() => { setAddOpen(false); setCreateError(null); }}>
                Cancel
              </Button>
              <Button
                size="md"
                loading={createMutation.isPending}
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </Modal>

        
        <Modal open={!!rawKey} onClose={() => setRawKey(null)} title="Your API Key" size="sm">
          <p className="text-sm text-[#5B5B6B] mb-3">
            Copy this key now — it will never be shown again.
          </p>
          <div className="bg-[#FAFAF7] border border-[#E0E0DA] rounded-lg p-3 font-mono text-xs text-[#0E0E14] break-all mb-4">
            {rawKey}
          </div>
          <div className="flex gap-3 justify-end">
            <Button size="md" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />
              )}
              {copied ? 'Copied!' : 'Copy Key'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setRawKey(null)}>
              Done
            </Button>
          </div>
        </Modal>

        
        <Modal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="Revoke API Key"
          size="sm"
        >
          <p className="text-sm text-[#5B5B6B] mb-6">
            Revoke key <span className="font-semibold text-[#0E0E14]">{deleteTarget?.name}</span>?
            Any integrations using this key will stop working immediately.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={revokeMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                revokeMutation.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    setDeleteTarget(null);
                    toast.success('API key revoked');
                  },
                  onError: () => toast.error('Failed to revoke key'),
                });
              }}
            >
              Revoke
            </Button>
          </div>
        </Modal>
      </div>
    </PlanGate>
  );
}
