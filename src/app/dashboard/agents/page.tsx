'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useAgents, useCreateAgent, useRevokeAgent } from '@/hooks/useAgents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PlanGate } from '@/components/ui/PlanGate';
import { Server, Trash2, Plus, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateShort, parseApiError } from '@/lib/apiUtils';
import { AGENT_TYPE_OPTIONS, VALID_AGENT_TYPES } from '@/lib/constants/agentTypes';
import { ERROR_CODES } from '@/lib/constants/errorCodes';
import type { AgentTypeValue } from '@/lib/constants/agentTypes';
import type { ServerAgent } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
  inactive: 'bg-[#FAFAF7] text-[#5B5B6B] border-[#E0E0DA]',
  revoked: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
  error: 'bg-[#fef2f2] text-[#7f1d1d] border-[#fecaca]',
};

export default function AgentsPage() {
  const { data, isPending, isError, refetch } = useAgents();
  const createMutation = useCreateAgent();
  const revokeMutation = useRevokeAgent();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AgentTypeValue>(AGENT_TYPE_OPTIONS[0].value);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServerAgent | null>(null);
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const agents = useMemo(() => data?.results ?? [], [data]);

  const handleCreate = async () => {
    setCreateError(null);
    if (!VALID_AGENT_TYPES.has(newType)) {
      setCreateError('Invalid agent type selected.');
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ name: newName, agent_type: newType });
      setCreatedToken(result.token);
      setAddOpen(false);
      setNewName('');
    } catch (err: unknown) {
      const apiErr = parseApiError(err);
      if (apiErr.code === ERROR_CODES.CONFLICT) {
        setCreateError('An agent with this name already exists.');
      } else if (apiErr.code === ERROR_CODES.VALIDATION_ERROR || apiErr.code === ERROR_CODES.INVALID_INPUT) {
        setCreateError(apiErr.message);
      } else {
        toast.error('Failed to create agent');
      }
    }
  };

  useEffect(() => {
    if (!createdToken) return;
    const timer = setTimeout(() => setCreatedToken(null), 30000);
    return () => clearTimeout(timer);
  }, [createdToken]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
    } catch {
      toast.error('Failed to copy token. Please copy it manually.');
    }
  };

  return (
    <PlanGate plan="pro">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0E0E14]">Server Agents</h1>
          <Button size="md" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Register Agent
          </Button>
        </div>

        {isPending ? (
          <SkeletonTable rows={4} />
        ) : isError ? (
          <ErrorState message="Failed to load agents." onRetry={refetch} />
        ) : !agents.length ? (
          <EmptyState
            icon={<Server className="h-12 w-12" />}
            title="No agents registered"
            description="Register a server agent to scan files on your web server."
            cta={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Register Agent
              </Button>
            }
          />
        ) : (
          <div className="bg-white border border-[#E0E0DA] rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHead>
                <tr>
                  <Th scope="col">Name</Th>
                  <Th scope="col">Type</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Last Seen</Th>
                  <Th scope="col">Token</Th>
                  <Th scope="col">Actions</Th>
                </tr>
              </TableHead>
              <TableBody>
                {agents.map(agent => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <span className="font-medium text-[#0E0E14]">{agent.name}</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">
                        {agent.type.replace(/_/g, ' ')}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${STATUS_COLORS[agent.status] ?? STATUS_COLORS.inactive}`}
                      >
                        {agent.status}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-[#5B5B6B]">
                        {agent.last_seen_at ? formatDateShort(agent.last_seen_at) : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-[#5B5B6B]">
                        {agent.token_prefix}…
                      </span>
                    </Td>
                    <Td>
                      <button
                        onClick={() => setDeleteTarget(agent)}
                        className="p-1.5 rounded hover:bg-danger-bg text-[#5B5B6B] hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600"
                        aria-label={`Revoke ${agent.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
            <div className="px-4 py-3 border-t border-[#E0E0DA] text-xs text-[#5B5B6B]">
              {data!.count} agent{data!.count !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        
        <Modal open={addOpen} onClose={() => { setAddOpen(false); setCreateError(null); }} title="Register Agent" size="sm">
          <div className="space-y-4">
            <Input
              label="Agent Name"
              placeholder="Production Server"
              value={newName}
              onChange={e => { setNewName(e.target.value); setCreateError(null); }}
            />
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as AgentTypeValue)}
                className="w-full border border-[#E0E0DA] rounded-lg px-3 py-2 text-sm text-[#0E0E14] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                {AGENT_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
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
                Register
              </Button>
            </div>
          </div>
        </Modal>

        
        <Modal
          open={!!createdToken}
          onClose={() => setCreatedToken(null)}
          title="Agent Token"
          size="sm"
        >
          <p className="text-sm text-[#5B5B6B] mb-3">
            Copy this token now — it will never be shown again.
          </p>
          <div className="bg-[#FAFAF7] border border-[#E0E0DA] rounded-lg p-3 font-mono text-xs text-[#0E0E14] break-all mb-4">
            {createdToken}
          </div>
          <div className="flex gap-3 justify-end">
            <Button size="md" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />
              )}
              {copied ? 'Copied!' : 'Copy Token'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setCreatedToken(null)}>
              Done
            </Button>
          </div>
        </Modal>

        
        <Modal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="Revoke Agent"
          size="sm"
        >
          <p className="text-sm text-[#5B5B6B] mb-6">
            Revoke agent <span className="font-semibold text-[#0E0E14]">{deleteTarget?.name}</span>?
            The agent will stop being able to report findings.
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
                    toast.success('Agent revoked');
                  },
                  onError: () => toast.error('Failed to revoke agent'),
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
