import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { MalwareSignature, PaginatedResponse } from '@/types';

export const signatureService = {
  async listSignatures(params?: {
    q?: string;
    layer?: string;
    severity?: string;
    page_size?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<MalwareSignature>> {
    const res = await apiClient.get(API.superadmin.signatures, { params });
    return parsePaginatedResponse<MalwareSignature>(res);
  },

  async createSignature(
    data: Omit<MalwareSignature, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MalwareSignature> {
    const res = await apiClient.post<MalwareSignature>(API.superadmin.signatures, data);
    return res.data;
  },

  async updateSignature(
    id: string,
    data: Partial<Pick<MalwareSignature, 'is_active' | 'name' | 'severity'>>
  ): Promise<MalwareSignature> {
    const res = await apiClient.patch<MalwareSignature>(API.superadmin.signatureDetail(id), data);
    return res.data;
  },

  async deleteSignature(id: string): Promise<void> {
    await apiClient.delete(API.superadmin.signatureDetail(id));
  },
};
