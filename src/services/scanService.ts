import apiClient from './apiClient';
import axios from 'axios';
import { parsePaginatedResponse, unwrapApiData, parseApiError } from '@/lib/apiUtils';
import { randomUUID } from '@/lib/uuid';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type {
  PublicScanCreated,
  ScanDetail,
  ScanListItem,
  ScanStatusPoll,
  PaginatedResponse,
  ScanStatus,
} from '@/types';

interface ListScansParams {
  q?: string;
  status?: string;
  rating?: string;
  page?: number;
  cursor?: string;
  page_size?: number;
  ordering?: string;
}

function filenameFromDisposition(disposition: string | undefined, fallback: string): string {
  if (!disposition) return fallback;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const match = disposition.match(/filename="?([^";\n]+)"?/i);
  return match?.[1]?.trim() ?? fallback;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function publicScanProgress(status: ScanStatus): number {
  switch (status) {
    case 'completed':
      return 100;
    case 'scanning':
      return 65;
    case 'queued':
      return 15;
    default:
      return 0;
  }
}

function readPublicScanId(body: Record<string, unknown>): string {
  const candidate = body.id ?? body.scan_id;
  if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  return '';
}

function normalizePublicScanCreated(data: unknown): PublicScanCreated {
  const body = unwrapApiData<Record<string, unknown>>(data);
  const id = readPublicScanId(body);

  if (!id) {
    throw new Error('Invalid public scan response: missing scan id');
  }

  return {
    scan_id: id,
    domain: String(body.domain ?? ''),
    status: (body.status as ScanStatus) ?? 'queued',
    created_at: String(body.created_at ?? new Date().toISOString()),
    estimated_duration_seconds: Number(
      body.estimated_duration_seconds ?? body.duration_seconds ?? 30
    ),
  };
}

function normalizePublicScanDetail(data: unknown): ScanDetail {
  const body = unwrapApiData<Record<string, unknown>>(data);
  const id = readPublicScanId(body);
  if (!id) {
    throw new Error('Invalid public scan response: missing scan id');
  }
  return { ...(body as unknown as ScanDetail), id };
}

async function parseBlobError(blob: Blob): Promise<string> {
  try {
    const text = await blob.text();
    const body = JSON.parse(text) as { error?: { message?: string } };
    return body?.error?.message ?? 'Failed to download PDF report.';
  } catch {
    return 'Failed to download PDF report.';
  }
}

export const scanService = {
  async publicScan(url: string): Promise<PublicScanCreated> {
    const res = await apiClient.post(API.scans.publicScan, { url });
    return normalizePublicScanCreated(res.data);
  },

  async createScan(data: {
    url: string;
    notify_email: boolean;
    schedule: string | null;
  }): Promise<ScanDetail> {
    const idempotencyKey = randomUUID();
    const res = await apiClient.post(API.scans.create, data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return unwrapApiData<ScanDetail>(res.data);
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
    const res = await apiClient.get(API.scans.detail(id));
    return unwrapApiData<ScanDetail>(res.data);
  },

  async getScanStatus(id: string): Promise<ScanStatusPoll> {
    const res = await apiClient.get(API.scans.status(id));
    return unwrapApiData<ScanStatusPoll>(res.data);
  },

  async deleteScan(id: string): Promise<void> {
    await apiClient.delete(API.scans.delete(id));
  },

  async rescan(
    id: string
  ): Promise<{ id: string; parent_scan_id: string; status: string; domain: string }> {
    const idempotencyKey = randomUUID();
    const res = await apiClient.post<{
      id: string;
      parent_scan_id: string;
      status: string;
      domain: string;
    }>(API.scans.rescan(id), {}, { headers: { 'Idempotency-Key': idempotencyKey } });
    return res.data;
  },

  async downloadPdfReport(id: string, domain?: string): Promise<void> {
    const fallback = domain
      ? `${domain.replace(/[^\w.-]+/g, '-')}-report.pdf`
      : `scan-${id}.pdf`;

    try {
      const res = await apiClient.get(API.scans.report(id), { responseType: 'blob' });
      const contentType = String(res.headers['content-type'] ?? '');

      if (contentType.includes('application/json')) {
        throw new Error(await parseBlobError(res.data as Blob));
      }

      const filename = filenameFromDisposition(
        res.headers['content-disposition'] as string | undefined,
        fallback
      );
      triggerBlobDownload(res.data as Blob, filename);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
        throw new Error(await parseBlobError(err.response.data));
      }
      throw new Error(parseApiError(err).message);
    }
  },

  async getPublicScanById(id: string): Promise<ScanDetail> {
    const res = await apiClient.get(API.scans.publicDetail(id));
    return normalizePublicScanDetail(res.data);
  },

  async pollPublicScan(scanId: string): Promise<ScanStatusPoll> {
    const detail = await this.getPublicScanById(scanId);
    return {
      id: detail.id,
      status: detail.status,
      progress_percent: publicScanProgress(detail.status),
      estimated_seconds_remaining: 0,
    };
  },
};
