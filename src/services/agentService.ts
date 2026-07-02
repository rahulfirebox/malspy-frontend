import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { ServerAgent, ServerScanResult, PaginatedResponse } from '@/types';

export const agentService = {
  async listAgents(): Promise<PaginatedResponse<ServerAgent>> {
    const res = await apiClient.get(API.agents.list);
    return parsePaginatedResponse<ServerAgent>(res);
  },

  async createAgent(data: {
    name: string;
    agent_type: string;
    domain?: string | null;
  }): Promise<ServerAgent & { token: string }> {
    const res = await apiClient.post<ServerAgent & { token: string }>(API.agents.list, data);
    return res.data;
  },

  async revokeAgent(id: string): Promise<void> {
    await apiClient.delete(API.agents.detail(id));
  },

  async listScans(agentId: string): Promise<PaginatedResponse<ServerScanResult>> {
    const res = await apiClient.get(API.agents.scans(agentId));
    return parsePaginatedResponse<ServerScanResult>(res);
  },
};
