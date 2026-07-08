import apiClient from './apiClient';
import { parsePaginatedResponse, unwrapApiData } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type {
  BillingPeriod,
  CashfreeOrder,
  Invoice,
  PaginatedResponse,
  Plan,
} from '@/types';

export interface CreateOrderRequest {
  plan_slug: string;
  billing_period?: BillingPeriod;
  return_url?: string;
}

export interface VerifyPaymentRequest {
  order_id: string;
}

export interface VerifyPaymentResponse {
  status: string;
}

export interface UpgradePlanRequest {
  plan_slug: string;
  billing_period?: BillingPeriod;
}

export interface CashfreeWebhookHealthResponse {
  statusCode: number;
  message: string;
}

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
  billing_period?: string | null;
  subscription_end_at?: string | null;
  current_period_end?: string | null;
  next_billing_at?: string | null;
}

export type SubscribeOutcome = 'checkout_started';

export const PENDING_CHECKOUT_ORDER_KEY = 'pending_checkout_order_id';

export function getSubscriptionCheckoutUrl(order: CashfreeOrder): string {
  const url =
    order.subscription_checkout_url ||
    order.cashfree_direct_checkout_url ||
    order.invoice_url;

  if (!url) {
    throw new Error('Checkout URL missing from server response.');
  }

  return url;
}

function readOrderId(order: CashfreeOrder): string | undefined {
  return order.order_id || order.subscription_id || undefined;
}

function readPaymentSessionId(order: CashfreeOrder): string | undefined {
  return order.payment_session_id || order.subscription_session_id || undefined;
}

function readCashfreeMode(order: CashfreeOrder): 'sandbox' | 'production' {
  return order.cashfree_environment?.toUpperCase() === 'PRODUCTION' ? 'production' : 'sandbox';
}

function isMockCashfreeSession(sessionId: string | undefined): boolean {
  return Boolean(sessionId?.startsWith('dev_session_'));
}

function isInvalidCashfreeCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('cashfree.com')) {
      return false;
    }
    const sessionId = parsed.searchParams.get('session_id');
    return isMockCashfreeSession(sessionId ?? undefined);
  } catch {
    return false;
  }
}

function resolveHostedCheckoutUrl(order: CashfreeOrder): string | null {
  for (const url of [
    order.subscription_checkout_url,
    order.cashfree_direct_checkout_url,
    order.invoice_url,
  ]) {
    if (typeof url === 'string' && url.length > 0 && !isInvalidCashfreeCheckoutUrl(url)) {
      return url;
    }
  }
  return null;
}

function shouldUseHostedSubscriptionCheckout(order: CashfreeOrder): boolean {
  return Boolean(resolveHostedCheckoutUrl(order) || order.subscription_session_id);
}

function assertRealCashfreeSession(order: CashfreeOrder): void {
  const sessionId = readPaymentSessionId(order);
  const hostedUrl = resolveHostedCheckoutUrl(order);

  if (isMockCashfreeSession(sessionId) || (order.dev_mode && !hostedUrl)) {
    throw new Error(
      'Cashfree is not configured on the backend. Add valid sandbox credentials to enable checkout.'
    );
  }
}

function buildReturnUrl(orderId?: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const base = `${window.location.origin}/dashboard/billing`;
  return orderId ? `${base}?order_id=${encodeURIComponent(orderId)}` : base;
}

function persistPendingOrderId(orderId: string | undefined): void {
  if (orderId && typeof window !== 'undefined') {
    sessionStorage.setItem(PENDING_CHECKOUT_ORDER_KEY, orderId);
  }
}

/** Open Cashfree checkout — hosted page for subscriptions, JS SDK for one-time payments. */
export async function startCashfreeCheckout(order: CashfreeOrder): Promise<void> {
  assertRealCashfreeSession(order);

  const orderId = readOrderId(order);
  persistPendingOrderId(orderId);

  const hostedUrl = resolveHostedCheckoutUrl(order);
  if (shouldUseHostedSubscriptionCheckout(order) && hostedUrl) {
    window.location.href = hostedUrl;
    return;
  }

  const paymentSessionId = readPaymentSessionId(order);
  if (!paymentSessionId || isMockCashfreeSession(paymentSessionId)) {
    throw new Error('Valid Cashfree payment session missing from server response.');
  }

  const { load } = await import('@cashfreepayments/cashfree-js');
  const cashfree = await load({ mode: readCashfreeMode(order) });

  const result = await cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_self',
  });

  if (result?.error) {
    throw new Error('Failed to open Cashfree checkout.');
  }
}

export const billingService = {
  async getPlans(country?: string): Promise<Plan[]> {
    const params = country ? { country } : undefined;
    const res = await apiClient.get(API.billing.plans, { params });
    const plans = unwrapApiData<Plan[]>(res.data);
    return Array.isArray(plans) ? plans : [];
  },

  async getOrgBilling(): Promise<BillingInfo> {
    const res = await apiClient.get(API.billing.currentPlan);
    return unwrapApiData<BillingInfo>(res.data);
  },

  async listInvoices(params?: {
    page?: number;
    cursor?: string;
    page_size?: number;
  }): Promise<PaginatedResponse<Invoice>> {
    const res = await apiClient.get(API.billing.invoices, { params });
    return parsePaginatedResponse<Invoice>(res);
  },

  /** POST /billing/create-order/ — creates subscription and returns Cashfree checkout URLs. */
  async createSubscription(
    planSlug: string,
    billingPeriod: BillingPeriod = 'monthly'
  ): Promise<CashfreeOrder> {
    const payload: CreateOrderRequest = {
      plan_slug: planSlug,
      billing_period: billingPeriod,
      return_url: buildReturnUrl(),
    };

    const res = await apiClient.post(API.billing.createOrder, payload);
    return unwrapApiData<CashfreeOrder>(res.data);
  },

  /** @deprecated Use createSubscription */
  createOrder(planSlug: string, billingPeriod: BillingPeriod = 'monthly') {
    return this.createSubscription(planSlug, billingPeriod);
  },

  async subscribeAndPay(
    planSlug: string,
    billingPeriod: BillingPeriod = 'monthly'
  ): Promise<SubscribeOutcome> {
    const order = await this.createSubscription(planSlug, billingPeriod);
    await startCashfreeCheckout(order);
    return 'checkout_started';
  },

  async verifyPayment(orderId: string): Promise<VerifyPaymentResponse> {
    const payload: VerifyPaymentRequest = { order_id: orderId };
    const res = await apiClient.post(API.billing.verifyPayment, payload);
    return unwrapApiData<VerifyPaymentResponse>(res.data);
  },

  async upgradePlan(
    planSlug: string,
    billingPeriod: BillingPeriod = 'monthly'
  ): Promise<Plan> {
    const payload: UpgradePlanRequest = {
      plan_slug: planSlug,
      billing_period: billingPeriod,
    };
    const res = await apiClient.post(API.billing.upgrade, payload);
    return unwrapApiData<Plan>(res.data);
  },

  async checkCashfreeWebhookHealth(): Promise<CashfreeWebhookHealthResponse> {
    const res = await apiClient.get<CashfreeWebhookHealthResponse>(
      API.billing.webhooks.cashfree
    );
    return res.data;
  },

  async cancelSubscription(): Promise<void> {
    await apiClient.post(API.billing.cancel, {});
  },
};
