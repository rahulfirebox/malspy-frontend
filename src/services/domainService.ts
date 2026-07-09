import apiClient from './apiClient';
import { parsePaginatedResponse, unwrapApiData } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type { Domain, PaginatedResponse, ScanListItem } from '@/types';
import type { AddDomainInput } from '@/lib/schemas/domain';

export const domainService = {
  async listDomains(params?: {
    q?: string;
    status?: string;
    schedule?: string;
    page?: number;
    cursor?: string;
    page_size?: number;
  }): Promise<PaginatedResponse<Domain>> {
    const res = await apiClient.get(API.domains.list, { params });
    return parsePaginatedResponse<Domain>(res);
  },

  async addDomain(data: AddDomainInput): Promise<Domain> {
    const res = await apiClient.post(API.domains.list, data);
    return unwrapApiData<Domain>(res.data);
  },

  async updateDomain(id: string, data: Partial<AddDomainInput>): Promise<Domain> {
    const res = await apiClient.patch(API.domains.detail(id), data);
    return unwrapApiData<Domain>(res.data);
  },

  async deleteDomain(id: string): Promise<void> {
    await apiClient.delete(API.domains.detail(id));
  },

  async getDomain(id: string): Promise<Domain> {
    const res = await apiClient.get(API.domains.detail(id));
    return unwrapApiData<Domain>(res.data);
  },

  async listDomainScans(
    id: string,
    params?: { page_size?: number }
  ): Promise<PaginatedResponse<ScanListItem>> {
    const res = await apiClient.get(API.scans.list, { params: { domain: id, ...params } });
    return parsePaginatedResponse<ScanListItem>(res);
  },

  async triggerScan(id: string): Promise<{ id: string; status?: string; domain?: string }> {
    const res = await apiClient.post(API.domains.scan(id), {});
    const data = unwrapApiData<Record<string, unknown>>(res.data);
    const scanId =
      (typeof data.id === 'string' && data.id) ||
      (typeof data.scan_id === 'string' && data.scan_id) ||
      null;

    if (!scanId) {
      throw new Error('Invalid scan response: missing scan id');
    }

    return {
      id: scanId,
      status: typeof data.status === 'string' ? data.status : undefined,
      domain: typeof data.domain === 'string' ? data.domain : undefined,
    };
  },
};
