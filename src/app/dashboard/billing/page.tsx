'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Crown, Sparkles, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { billingService, PENDING_CHECKOUT_ORDER_KEY, type BillingInfo } from '@/services/billingService';
import { PLAN_FEATURES } from '@/lib/planFeatures';
import { useAuthStore } from '@/stores/authStore';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { formatDateShort, parseApiError } from '@/lib/apiUtils';
import toast from 'react-hot-toast';
import type { PlanSlug } from '@/types';

const PLAN_COLORS: Record<PlanSlug, string> = {
  free: 'border-border',
  pro: 'border-[#2B7DBC] ring-1 ring-[#2B7DBC]',
  enterprise: 'border-border',
};

const CURRENT_PLAN_THEMES: Record<
  PlanSlug,
  {
    card: string;
    badge: string;
    title: string;
    subtitle: string;
    icon: typeof Sparkles;
    infoBox: string;
    calendarIcon: string;
    statCard: string;
    progressBar: string;
  }
> = {
  free: {
    card: 'border-border/70 bg-bg-elevated/30',
    badge: 'bg-bg-page/80 text-text-secondary border-border/80',
    title: 'text-text-secondary',
    subtitle: 'text-text-secondary/80',
    icon: Sparkles,
    infoBox: 'border-border/50 bg-bg-page/40',
    calendarIcon: 'text-white',
    statCard: 'border-border/50 bg-bg-page/30',
    progressBar: 'bg-red-500',
  },
  pro: {
    card: 'border-primary/40 bg-gradient-to-br from-primary/15 via-bg-card to-bg-card shadow-glow',
    badge: 'bg-primary/15 text-primary border-primary/30',
    title: 'text-primary',
    subtitle: 'text-text-secondary',
    icon: Crown,
    infoBox: 'border-border/60 bg-bg-elevated/60',
    calendarIcon: 'text-primary',
    statCard: 'border-border/60 bg-bg-card/70',
    progressBar: 'bg-primary',
  },
  enterprise: {
    card: 'border-accent-purple/40 bg-gradient-to-br from-accent-purple/15 via-bg-card to-bg-card',
    badge: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
    title: 'text-accent-purple',
    subtitle: 'text-text-secondary',
    icon: Crown,
    infoBox: 'border-border/60 bg-bg-elevated/60',
    calendarIcon: 'text-accent-purple',
    statCard: 'border-border/60 bg-bg-card/70',
    progressBar: 'bg-accent-purple',
  },
};

function resolvePlanSlug(plan: string | undefined): PlanSlug {
  if (plan === 'pro' || plan === 'enterprise' || plan === 'free') {
    return plan;
  }
  return 'free';
}

function readActiveUntilDate(billing: BillingInfo): string | null {
  return (
    billing.subscription_end_at ??
    billing.current_period_end ??
    billing.next_billing_at ??
    billing.quota_reset_at ??
    null
  );
}

function formatSubscriptionStatus(status: string | null | undefined): string {
  if (!status) return 'Active';
  return status.replace(/_/g, ' ');
}

function getActiveUntilLabel(billing: BillingInfo, planSlug: PlanSlug): string {
  const activeUntil = readActiveUntilDate(billing);

  if (planSlug === 'free') {
    return activeUntil
      ? `Scan quota resets on ${formatDateShort(activeUntil)}`
      : 'Free plan — no subscription expiry';
  }

  if (activeUntil) {
    const normalizedStatus = billing.subscription_status?.toLowerCase();
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return `Access until ${formatDateShort(activeUntil)}`;
    }
    return `Active until ${formatDateShort(activeUntil)}`;
  }

  return 'Subscription active';
}

export default function BillingPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useAuthStore(s => s.user?.id);
  const [planError, setPlanError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { page, pageSize, cursor, apiParams, goNext, goPrevious, getMeta } = useUrlPagination(10);

  const subscribeMutation = useMutation({
    mutationFn: (slug: PlanSlug) => billingService.subscribeAndPay(slug, 'monthly'),
    retry: false,
    onError: (err: unknown) => {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message || 'Failed to open Cashfree checkout. Please try again.');
    },
  });

  useEffect(() => {
    const orderIdFromQuery =
      searchParams.get('order_id') ||
      searchParams.get('subscription_id') ||
      searchParams.get('orderId');

    const orderIdFromStorage =
      typeof window !== 'undefined'
        ? sessionStorage.getItem(PENDING_CHECKOUT_ORDER_KEY)
        : null;

    const orderId = orderIdFromQuery || orderIdFromStorage;

    if (!orderId) {
      return;
    }

    let cancelled = false;

    billingService
      .verifyPayment(orderId)
      .then(() => {
        if (cancelled) return;
        sessionStorage.removeItem(PENDING_CHECKOUT_ORDER_KEY);
        toast.success('Payment verified. Your plan is now active.');
        qc.invalidateQueries({ queryKey: ['billing', userId] });
        qc.invalidateQueries({ queryKey: ['auth', 'me', userId] });
        qc.invalidateQueries({ queryKey: ['plans', userId] });
        qc.invalidateQueries({ queryKey: ['invoices', userId] });
        router.replace('/dashboard/billing');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        sessionStorage.removeItem(PENDING_CHECKOUT_ORDER_KEY);
        const apiErr = parseApiError(err);
        toast.error(apiErr.message || 'Payment verification failed.');
        router.replace('/dashboard/billing');
      });

    return () => {
      cancelled = true;
    };
  }, [qc, router, searchParams, userId]);

  const billingQuery = useQuery({
    queryKey: ['billing', userId],
    queryFn: () => billingService.getOrgBilling(),
    staleTime: 30_000,
    enabled: !!userId,
  });

  const plansQuery = useQuery({
    queryKey: ['plans', userId],
    queryFn: () => billingService.getPlans(),
    staleTime: 30_000,
    enabled: !!userId,
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices', userId, { page, cursor, pageSize }],
    queryFn: () => billingService.listInvoices(apiParams),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    retry: false,
    onSuccess: () => {
      setPlanError('');
      setShowCancelConfirm(false);
      toast.success('Subscription cancelled. You have been moved to the free plan.');
      qc.invalidateQueries({ queryKey: ['billing', userId] });
      qc.invalidateQueries({ queryKey: ['auth', 'me', userId] });
    },
    onError: () => setPlanError('Failed to cancel subscription. Please try again.'),
  });

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const invoices = useMemo(() => invoicesQuery.data?.results ?? [], [invoicesQuery.data]);
  const paginationMeta = getMeta(invoicesQuery.data);

  const currentPlan = billingQuery.data?.plan as PlanSlug | undefined;
  const currentPlanSlug = resolvePlanSlug(billingQuery.data?.plan);
  const currentPlanTheme = CURRENT_PLAN_THEMES[currentPlanSlug];
  const CurrentPlanIcon = currentPlanTheme.icon;
  const hasPaidPlan = currentPlan !== undefined && currentPlan !== 'free';

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-text-primary">Billing & Plan</h1>
      {planError && (
        <p className="text-sm text-[#dc2626]" role="alert">{planError}</p>
      )}

      
      {billingQuery.data && (
        <div className={`rounded-xl border-2 p-6 ${currentPlanTheme.card}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">
                Your Current Plan
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${currentPlanTheme.badge}`}
                >
                  <CurrentPlanIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className={`text-2xl font-bold capitalize ${currentPlanTheme.title}`}>
                    {billingQuery.data.plan_name || billingQuery.data.plan || 'Free'}
                  </h2>
                  {Number(billingQuery.data.price_monthly) > 0 && (
                    <p className={`text-sm ${currentPlanTheme.subtitle}`}>
                      ${billingQuery.data.price_monthly}
                      <span className="text-text-secondary">
                        /{billingQuery.data.billing_period === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${currentPlanTheme.badge}`}
                >
                  {billingQuery.data.plan ?? 'free'} plan
                </span>
                {billingQuery.data.subscription_status && (
                  <span className="inline-flex items-center rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs font-medium capitalize text-text-secondary">
                    {formatSubscriptionStatus(billingQuery.data.subscription_status)}
                  </span>
                )}
              </div>

              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${currentPlanTheme.infoBox}`}>
                <CalendarDays
                  className={`mt-0.5 h-4 w-4 shrink-0 ${currentPlanTheme.calendarIcon} b`}
                  aria-hidden="true"
                />
                <p className={`text-sm ${currentPlanSlug === 'free' ? 'text-white' : 'text-text-primary'}`}>
                  {getActiveUntilLabel(billingQuery.data, currentPlanSlug)}
                </p>
              </div>
            </div>

            {hasPaidPlan && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowCancelConfirm(true)}
                className="shrink-0"
              >
                <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                Cancel Plan
              </Button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-lg border p-4 ${currentPlanTheme.statCard}`}>
              <p className="text-xs text-text-secondary mb-1">Scans Used</p>
              <p className="text-lg font-semibold text-text-primary">
                {billingQuery.data.scan_quota_used}
                {billingQuery.data.scan_quota_limit !== -1
                  ? ` / ${billingQuery.data.scan_quota_limit}`
                  : ' / \u221E'}
              </p>
              {billingQuery.data.scan_quota_limit !== -1 && (
                <div className="w-full bg-[#e5e7eb] rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${currentPlanTheme.progressBar}`}
                    style={{
                      width: `${billingQuery.data.scan_quota_limit > 0 ? Math.min(100, (billingQuery.data.scan_quota_used / billingQuery.data.scan_quota_limit) * 100) : 0}%`,
                    }}
                  />
                </div>
              )}
              {billingQuery.data.scan_quota_limit !== -1 &&
                billingQuery.data.scan_quota_used >= billingQuery.data.scan_quota_limit && (
                  <p className="text-xs text-[#dc2626] mt-1">
                    Quota exceeded. Upgrade your plan to run more scans.
                  </p>
                )}
            </div>
            <div className={`rounded-lg border p-4 ${currentPlanTheme.statCard}`}>
              <p className="text-xs text-text-secondary mb-1">Domains Used</p>
              <p className="text-lg font-semibold text-text-primary">
                {billingQuery.data.domain_quota_used}
                {billingQuery.data.domain_quota_limit !== -1
                  ? ` / ${billingQuery.data.domain_quota_limit}`
                  : ' / \u221E'}
              </p>
            </div>
            <div className={`rounded-lg border p-4 ${currentPlanTheme.statCard}`}>
              <p className="text-xs text-text-secondary mb-1">Quota Resets</p>
              <p className="text-sm font-semibold text-text-primary">
                {billingQuery.data.quota_reset_at
                  ? formatDateShort(billingQuery.data.quota_reset_at)
                  : '\u2014'}
              </p>
            </div>
            <div className={`rounded-lg border p-4 ${currentPlanTheme.statCard}`}>
              <p className="text-xs text-text-secondary mb-1">Billing Cycle</p>
              <p className="text-sm font-semibold capitalize text-text-primary">
                {billingQuery.data.billing_period ?? (hasPaidPlan ? 'monthly' : 'free')}
              </p>
            </div>
          </div>
        </div>
      )}

      
      <div>
        <h2 className="font-semibold text-text-primary mb-4">Available Plans</h2>
        {plansQuery.isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <div
                key={`plan-skel-${i}`}
                className="h-64 bg-bg-elevated rounded-lg motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : plansQuery.isError ? (
          <ErrorState message="Failed to load plans." onRetry={() => plansQuery.refetch()} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.slug}
                className={`relative bg-bg-card rounded-xl border-2 p-6 ${PLAN_COLORS[plan.slug as PlanSlug]}`}
              >
                {plan.slug === 'pro' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2B7DBC] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-bold text-lg text-text-primary mb-1">{plan.name}</h3>
                <p className="text-2xl font-bold text-[#2B7DBC] mb-4">
                  ${plan.price_monthly}
                  <span className="text-sm font-normal text-text-secondary">/mo</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {PLAN_FEATURES[plan.slug as PlanSlug]?.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-primary">
                      <CheckCircle
                        className="h-4 w-4 text-[#22c55e] flex-shrink-0"
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {currentPlan === plan.slug ? (
                  <Button variant="ghost" size="md" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : plan.slug === 'enterprise' ? (
                  <Button size="md" variant="ghost" className="w-full">
                    Contact Sales
                  </Button>
                ) : Number(plan.price_monthly) === 0 ? (
                  <Button
                    size="md"
                    variant="ghost"
                    className="w-full"
                    disabled
                  >
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    size="md"
                    variant="primary"
                    className="w-full"
                    disabled={subscribeMutation.isPending}
                    loading={subscribeMutation.isPending && subscribeMutation.variables === plan.slug}
                    onClick={() => subscribeMutation.mutate(plan.slug as PlanSlug)}
                  >
                    {subscribeMutation.isPending && subscribeMutation.variables === plan.slug
                      ? 'Loading...'
                      : 'Upgrade'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      
      <div>
        <h2 className="font-semibold text-text-primary mb-4">Invoices</h2>
        {invoicesQuery.isPending ? (
          <SkeletonTable rows={4} />
        ) : invoicesQuery.isError ? (
          <ErrorState message="Failed to load invoices." onRetry={() => invoicesQuery.refetch()} />
        ) : invoices.length === 0 ? (
          <div className="text-sm text-text-secondary bg-bg-card border border-border rounded-lg p-6 text-center">
            No invoices yet.
          </div>
        ) : (
          <div className="bg-bg-card border border-border rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHead>
                <tr>
                  <Th scope="col">Invoice</Th>
                  <Th scope="col">Amount</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Date</Th>
                </tr>
              </TableHead>
              <TableBody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-bg-page transition-colors">
                    <Td>
                      <span className="font-mono text-sm text-text-primary">
                        {inv.id.slice(0, 8).toUpperCase()}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-sm text-text-primary">${inv.amount}</span>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          inv.status === 'paid'
                            ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                            : 'bg-[#fefce8] text-[#713f12] border-[#fde68a]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-text-secondary">
                        {formatDateShort(inv.created_at)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
            <Pagination
              meta={paginationMeta}
              onNext={() => goNext(invoicesQuery.data?.next)}
              onPrevious={() => goPrevious(invoicesQuery.data?.previous)}
            />
          </div>
        )}
      </div>

      <Modal
        open={showCancelConfirm}
        onClose={() => !cancelMutation.isPending && setShowCancelConfirm(false)}
        title="Cancel Subscription"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to cancel your{' '}
          <span className="font-semibold text-text-primary capitalize">
            {billingQuery.data?.plan_name || billingQuery.data?.plan || 'current'}
          </span>{' '}
          subscription? You will be moved to the free plan and lose access to paid features at the
          end of your billing period.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="md"
            disabled={cancelMutation.isPending}
            onClick={() => setShowCancelConfirm(false)}
          >
            Keep Plan
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel Subscription
          </Button>
        </div>
      </Modal>
    </div>
  );
}
