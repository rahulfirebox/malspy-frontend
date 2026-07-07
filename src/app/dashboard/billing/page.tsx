'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Table, TableHead, TableBody, Th, Td } from '@/components/ui/Table';
import { billingService } from '@/services/billingService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateShort } from '@/lib/apiUtils';
import toast from 'react-hot-toast';
import type { PlanSlug } from '@/types';

const PLAN_COLORS: Record<PlanSlug, string> = {
  free: 'border-border',
  pro: 'border-[#2B7DBC] ring-1 ring-[#2B7DBC]',
  enterprise: 'border-border',
};

const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  free: ['5 scans / month', '1 monitored domain', 'Basic report', 'Layer 1 scanner'],
  pro: [
    '100 scans / month',
    '10 monitored domains',
    'PDF reports',
    'Layer 1 + Layer 2 scanner',
    'Scheduled scans',
    'Slack notifications',
  ],
  enterprise: [
    'Unlimited scans',
    'Unlimited domains',
    'API access',
    'WAF enabled',
    'DB scan',
    'Priority support',
  ],
};

export default function BillingPage() {
  const qc = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const [upgradeTarget, setUpgradeTarget] = useState<PlanSlug | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [planError, setPlanError] = useState('');

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
    queryKey: ['invoices', userId],
    queryFn: () => billingService.listInvoices(),
    staleTime: 30_000,
    enabled: !!userId,
  });

  const handleUpgrade = useCallback(async (slug: PlanSlug) => {
    if (slug === 'free') {
      return;
    }

    setUpgradeTarget(slug);
    setPaymentProcessing(true);

    try {
      const order = await billingService.createOrder(slug);

      const cashfreeModule = await import('@cashfreepayments/cashfree-js');
      const cashfree = await cashfreeModule.load({ mode: 'sandbox' });

      const checkoutOptions = {
        paymentSessionId: order.payment_session_id,
        redirectTarget: '_self' as const,
      };

      await cashfree.checkout(checkoutOptions);
    } catch {
      toast.error('Failed to initiate payment. Please try again.');
      setUpgradeTarget(null);
      setPaymentProcessing(false);
    }
  }, []);

  const handleFreeDowngrade = useMutation({
    mutationFn: (slug: PlanSlug) => billingService.upgradePlan(slug),
    retry: false,
    onSuccess: () => {
      setPlanError('');
      toast.success('Plan updated successfully');
      qc.invalidateQueries({ queryKey: ['billing', userId] });
      qc.invalidateQueries({ queryKey: ['auth', 'me', userId] });
    },
    onError: () => setPlanError('Failed to update plan. Please try again.'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    retry: false,
    onSuccess: () => {
      setPlanError('');
      toast.success('Subscription cancelled. You have been moved to the free plan.');
      qc.invalidateQueries({ queryKey: ['billing', userId] });
      qc.invalidateQueries({ queryKey: ['auth', 'me', userId] });
    },
    onError: () => setPlanError('Failed to cancel subscription. Please try again.'),
  });

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const invoices = useMemo(() => invoicesQuery.data?.results ?? [], [invoicesQuery.data]);

  const currentPlan = billingQuery.data?.plan as PlanSlug | undefined;
  const hasPaidPlan = currentPlan !== undefined && currentPlan !== 'free';

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-text-primary">Billing & Plan</h1>
      {planError && (
        <p className="text-sm text-[#dc2626]" role="alert">{planError}</p>
      )}

      
      {billingQuery.data && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Current Plan</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#EBF4FD] text-[#2B7DBC] capitalize">
                {billingQuery.data.plan ?? 'free'}
              </span>
              {hasPaidPlan && (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                  className="text-[#dc2626] border-[#dc2626] hover:bg-danger-bg"
                >
                  <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
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
                    className="bg-[#2B7DBC] h-2 rounded-full"
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
            <div>
              <p className="text-xs text-text-secondary mb-1">Quota Resets</p>
              <p className="text-sm text-text-primary">
                {billingQuery.data.quota_reset_at
                  ? formatDateShort(billingQuery.data.quota_reset_at)
                  : '\u2014'}
              </p>
            </div>
          </div>
        </Card>
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
                    loading={handleFreeDowngrade.isPending}
                    onClick={() => handleFreeDowngrade.mutate(plan.slug as PlanSlug)}
                  >
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    size="md"
                    variant="primary"
                    className="w-full"
                    disabled={paymentProcessing && upgradeTarget === plan.slug}
                    onClick={() => handleUpgrade(plan.slug as PlanSlug)}
                  >
                    {paymentProcessing && upgradeTarget === plan.slug ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                        Processing...
                      </span>
                    ) : (
                      'Upgrade'
                    )}
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
          </div>
        )}
      </div>
    </div>
  );
}
