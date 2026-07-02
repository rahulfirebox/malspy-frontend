'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyService } from '@/services/apiKeyService';
import { useAuthStore } from '@/stores/authStore';
import { parseApiError } from '@/lib/apiUtils';
import type { ApiKey, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export function useApiKeys() {
  const userId = useAuthStore(s => s.user?.id);

  return useQuery({
    queryKey: ['api-keys', userId],
    queryFn: () => apiKeyService.listKeys(),
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiKeyService.createKey,
    retry: false,
    onMutate: async () => {
      const currentUserId = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: ['api-keys', currentUserId] });
      const previous = qc.getQueryData<PaginatedResponse<ApiKey>>(['api-keys', currentUserId]);
      return { previous, userId: currentUserId };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['api-keys', context.userId], context.previous);
      }
      const parsed = parseApiError(error);
      toast.error(parsed.message, { id: 'api-key-mutation-error' });
    },
    onSettled: (_data, _error, _vars, context) => {
      qc.invalidateQueries({ queryKey: ['api-keys', context?.userId] });
    },
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiKeyService.revokeKey,
    retry: false,
    onMutate: async (keyId: string) => {
      const currentUserId = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: ['api-keys', currentUserId] });
      const previous = qc.getQueryData<PaginatedResponse<ApiKey>>(['api-keys', currentUserId]);
      qc.setQueryData<PaginatedResponse<ApiKey>>(['api-keys', currentUserId], old => {
        if (!old) return old;
        return { ...old, results: old.results.filter(k => k.id !== keyId), count: old.count - 1 };
      });
      return { previous, userId: currentUserId };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['api-keys', context.userId], context.previous);
      }
      const parsed = parseApiError(error);
      toast.error(parsed.message, { id: 'api-key-mutation-error' });
    },
    onSettled: (_data, _error, _vars, context) => {
      qc.invalidateQueries({ queryKey: ['api-keys', context?.userId] });
    },
  });
}
