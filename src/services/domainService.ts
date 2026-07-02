import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type { Domain, PaginatedResponse, ScanListItem } from '@/types';
import type { AddDomainInput } from '@/lib/schemas/domain';

export const domainService = {
  async listDomains(params?: {
    q?: string;
    status?: string;
    cursor?: string;
    page_size?: number;
  }): Promise<PaginatedResponse<Domain>> {
    const res = await apiClient.get(API.domains.list, { params });
    return parsePaginatedResponse<Domain>(res);
  },

  async addDomain(data: AddDomainInput): Promise<Domain> {
    const res = await apiClient.post<Domain>(API.domains.list, data);
    return res.data;
  },

  async updateDomain(id: string, data: Partial<AddDomainInput>): Promise<Domain> {
    const res = await apiClient.patch<Domain>(API.domains.detail(id), data);
    return res.data;
  },

  async deleteDomain(id: string): Promise<void> {
    await apiClient.delete(API.domains.detail(id));
  },

  async getDomain(id: string): Promise<Domain> {
    const res = await apiClient.get<Domain>(API.domains.detail(id));
    return res.data;
  },

  async listDomainScans(
    id: string,
    params?: { page_size?: number }
  ): Promise<PaginatedResponse<ScanListItem>> {
    const res = await apiClient.get(API.scans.list, { params: { domain: id, ...params } });
    return parsePaginatedResponse<ScanListItem>(res);
  },

  async triggerScan(id: string): Promise<void> {
    await apiClient.post(API.domains.scan(id), {});
  },
};
