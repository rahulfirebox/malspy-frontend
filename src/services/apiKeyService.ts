import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { ApiKey, PaginatedResponse } from '@/types';

export const apiKeyService = {
  async listKeys(): Promise<PaginatedResponse<ApiKey>> {
    const res = await apiClient.get(API.apiKeys.list);
    return parsePaginatedResponse<ApiKey>(res);
  },

  async createKey(data: { name: string }): Promise<ApiKey & { raw_key: string }> {
    const res = await apiClient.post<{ success: boolean; data: ApiKey & { raw_key: string } }>(
      API.apiKeys.list,
      data
    );
    return res.data.data;
  },

  async revokeKey(id: string): Promise<void> {
    await apiClient.delete(API.apiKeys.revoke(id));
  },
};
