import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { env } from '@/lib/env';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type {
  PublicScanCreated,
  ScanDetail,
  ScanListItem,
  ScanStatusPoll,
  PaginatedResponse,
} from '@/types';

interface ListScansParams {
  q?: string;
  status?: string;
  rating?: string;
  cursor?: string;
  page_size?: number;
  ordering?: string;
}

export const scanService = {
  async publicScan(url: string): Promise<PublicScanCreated> {
    const res = await apiClient.post<PublicScanCreated>(API.scans.publicScan, { url });
    return res.data;
  },

  async createScan(data: {
    url: string;
    notify_email: boolean;
    schedule: string | null;
  }): Promise<ScanDetail> {
    const idempotencyKey = crypto.randomUUID();
    const res = await apiClient.post<ScanDetail>(API.scans.create, data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return res.data;
  },

  async listScans(params?: ListScansParams): Promise<PaginatedResponse<ScanListItem>> {
    const res = await apiClient.get(API.scans.list, { params });
    return parsePaginatedResponse<ScanListItem>(res);
  },

  async getRecentScans(): Promise<PaginatedResponse<ScanListItem>> {
    const res = await apiClient.get(API.scans.list, { params: { page_size: 5 } });
    return parsePaginatedResponse<ScanListItem>(res);
  },

  async getScan(id: string): Promise<ScanDetail> {
    const res = await apiClient.get<ScanDetail>(API.scans.detail(id));
    return res.data;
  },

  async getScanStatus(id: string): Promise<ScanStatusPoll> {
    const res = await apiClient.get<ScanStatusPoll>(API.scans.status(id));
    return res.data;
  },

  async deleteScan(id: string): Promise<void> {
    await apiClient.delete(API.scans.delete(id));
  },

  async rescan(
    id: string
  ): Promise<{ id: string; parent_scan_id: string; status: string; domain: string }> {
    const idempotencyKey = crypto.randomUUID();
    const res = await apiClient.post<{
      id: string;
      parent_scan_id: string;
      status: string;
      domain: string;
    }>(API.scans.rescan(id), {}, { headers: { 'Idempotency-Key': idempotencyKey } });
    return res.data;
  },

  getPdfReportUrl(id: string): string {
    return `${env.NEXT_PUBLIC_API_URL}/api/v1${API.scans.report(id)}`;
  },

  async getPublicScanById(id: string): Promise<ScanDetail> {
    const res = await apiClient.get<ScanDetail>(API.scans.publicDetail(id));
    return res.data;
  },

  async pollPublicScan(scanId: string): Promise<ScanStatusPoll> {
    const res = await apiClient.get<ScanStatusPoll>(API.scans.status(scanId));
    return res.data;
  },
};
