'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '@/services/agentService';
import { useAuthStore } from '@/stores/authStore';
import { parseApiError } from '@/lib/apiUtils';
import type { ServerAgent, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export function useAgents() {
  const userId = useAuthStore(s => s.user?.id);

  return useQuery({
    queryKey: ['agents', userId],
    queryFn: () => agentService.listAgents(),
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agentService.createAgent,
    retry: false,
    onMutate: async newAgent => {
      const currentUserId = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: ['agents', currentUserId] });
      const previous = qc.getQueryData<PaginatedResponse<ServerAgent>>(['agents', currentUserId]);
      qc.setQueryData<PaginatedResponse<ServerAgent>>(['agents', currentUserId], old => {
        if (!old) return old;
        const optimistic: ServerAgent = {
          id: 'temp-agent',
          name: newAgent.name,
          type: newAgent.agent_type as ServerAgent['type'],
          token_prefix: '',
          domain: newAgent.domain ? { id: newAgent.domain, domain: newAgent.domain } : null,
          status: 'active',
          version: '',
          last_seen_at: null,
          last_scan_at: null,
          revoked: false,
          created_at: new Date().toISOString(),
        };
        return { ...old, results: [optimistic, ...old.results], count: old.count + 1 };
      });
      return { previous, userId: currentUserId };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['agents', context.userId], context.previous);
      }
      const parsed = parseApiError(error);
      toast.error(parsed.message, { id: 'agent-mutation-error' });
    },
    onSettled: (_data, _error, _vars, context) => {
      qc.invalidateQueries({ queryKey: ['agents', context?.userId] });
    },
  });
}

export function useRevokeAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agentService.revokeAgent,
    retry: false,
    onMutate: async (agentId: string) => {
      const currentUserId = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: ['agents', currentUserId] });
      const previous = qc.getQueryData<PaginatedResponse<ServerAgent>>(['agents', currentUserId]);
      qc.setQueryData<PaginatedResponse<ServerAgent>>(['agents', currentUserId], old => {
        if (!old) return old;
        return { ...old, results: old.results.filter(a => a.id !== agentId), count: old.count - 1 };
      });
      return { previous, userId: currentUserId };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['agents', context.userId], context.previous);
      }
      const parsed = parseApiError(error);
      toast.error(parsed.message, { id: 'agent-mutation-error' });
    },
    onSettled: (_data, _error, _vars, context) => {
      qc.invalidateQueries({ queryKey: ['agents', context?.userId] });
    },
  });
}

export function useAgentScans(agentId: string | undefined) {
  const userId = useAuthStore(s => s.user?.id);
  return useQuery({
    queryKey: ['agent-scans', agentId, userId],
    queryFn: () => agentService.listScans(agentId!),
    staleTime: 30_000,
    enabled: !!userId && !!agentId,
    select: data => data.results,
  });
}
