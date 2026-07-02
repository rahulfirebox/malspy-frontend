import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { CashfreeOrder, Invoice, PaginatedResponse, Plan } from '@/types';

export interface BillingInfo {
  plan: string;
  plan_name: string;
  price_monthly: string;
  scan_quota_used: number;
  scan_quota_limit: number;
  domain_quota_used: number;
  domain_quota_limit: number;
  subscription_status: string | null;
  quota_reset_at: string | null;
}

export const billingService = {
  async getPlans(country?: string): Promise<Plan[]> {
    const params = country ? { country } : undefined;
    const res = await apiClient.get<Plan[]>(API.billing.plans, { params });
    return res.data;
  },

  async getOrgBilling(): Promise<BillingInfo> {
    const res = await apiClient.get<BillingInfo>(API.billing.currentPlan);
    return res.data;
  },

  async listInvoices(): Promise<PaginatedResponse<Invoice>> {
    const res = await apiClient.get(API.billing.invoices);
    return parsePaginatedResponse<Invoice>(res);
  },

  async createOrder(planSlug: string): Promise<CashfreeOrder> {
    const res = await apiClient.post<CashfreeOrder>(
      API.billing.createOrder,
      { plan_slug: planSlug },
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
    return res.data;
  },

  async verifyPayment(orderId: string): Promise<{ status: string }> {
    const res = await apiClient.post<{ status: string }>(API.billing.verifyPayment, {
      order_id: orderId,
    });
    return res.data;
  },

  async upgradePlan(planSlug: string): Promise<Plan> {
    const res = await apiClient.post<Plan>(
      API.billing.upgrade,
      { plan_slug: planSlug, billing_period: 'monthly' },
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
    return res.data;
  },

  async cancelSubscription(): Promise<void> {
    await apiClient.post(
      API.billing.cancel,
      {},
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
  },
};
