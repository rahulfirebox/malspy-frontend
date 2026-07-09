'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { billingService } from '@/services/billingService';
import { PLAN_FEATURES } from '@/lib/planFeatures';
import type { Plan, PlanSlug } from '@/types';

const LANDING_FALLBACK_PLANS: Plan[] = [
  {
    id: 'landing-free',
    slug: 'free',
    name: 'Free',
    price_monthly: '0',
    scan_quota: 5,
    domain_quota: 1,
    agent_quota: 0,
    browser_scan_enabled: true,
    server_side_scan: false,
    pdf_report: false,
    api_access: false,
    scheduled_scans: false,
    slack_notifications: false,
    waf_enabled: false,
    db_scan_enabled: false,
    is_active: true,
  },
  {
    id: 'landing-pro',
    slug: 'pro',
    name: 'Pro',
    price_monthly: '49',
    scan_quota: 100,
    domain_quota: 10,
    agent_quota: 0,
    browser_scan_enabled: true,
    server_side_scan: true,
    pdf_report: true,
    api_access: false,
    scheduled_scans: true,
    slack_notifications: true,
    waf_enabled: false,
    db_scan_enabled: false,
    is_active: true,
  },
  {
    id: 'landing-enterprise',
    slug: 'enterprise',
    name: 'Enterprise',
    price_monthly: '0',
    scan_quota: -1,
    domain_quota: -1,
    agent_quota: -1,
    browser_scan_enabled: true,
    server_side_scan: true,
    pdf_report: true,
    api_access: true,
    scheduled_scans: true,
    slack_notifications: true,
    waf_enabled: true,
    db_scan_enabled: true,
    is_active: true,
  },
];

function formatPlanPrice(plan: Plan): string {
  if (plan.slug === 'enterprise') return 'Custom';
  return `$${plan.price_monthly}`;
}

function PlanCard({ plan }: { plan: Plan }) {
  const slug = plan.slug as PlanSlug;
  const features = PLAN_FEATURES[slug] ?? [];
  const isPro = slug === 'pro';
  const isEnterprise = slug === 'enterprise';
  const isFree = Number(plan.price_monthly) === 0 && !isEnterprise;

  return (
    <div
      className={`glass-card rounded-xl p-5 sm:p-6 ${
        isPro ? 'border-primary/50 ring-1 ring-primary/40 relative shadow-glow mt-4 sm:mt-0' : ''
      }`}
    >
      {isPro && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
      <p className="text-3xl font-bold text-text-primary mt-2">
        {formatPlanPrice(plan)}
        {!isEnterprise && (
          <span className="text-base font-normal text-text-secondary">/mo</span>
        )}
      </p>
      <ul className="mt-5 space-y-2 text-sm text-text-secondary">
        {features.map(feature => (
          <li key={feature} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent-green shrink-0" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      {isEnterprise ? (
        <Link
          href="/contact"
          className="mt-6 block w-full text-center py-2.5 border border-border-dark text-text-secondary font-semibold rounded-lg hover:bg-bg-elevated transition-colors text-sm"
        >
          Contact Sales
        </Link>
      ) : (
        <Link
          href="/register"
          className={`mt-6 block w-full text-center py-2.5 font-semibold rounded-lg transition-colors text-sm ${
            isFree || !isPro
              ? 'border border-primary text-primary hover:bg-primary/10'
              : 'bg-primary hover:bg-primary-dark text-white shadow-glow'
          }`}
        >
          {isFree ? 'Get Started Free' : 'Start Pro Trial'}
        </Link>
      )}
    </div>
  );
}

export function PricingSection() {
  const plansQuery = useQuery({
    queryKey: ['plans', 'public'],
    queryFn: () => billingService.getPlans(),
    staleTime: 60_000,
    retry: 1,
  });

  const displayPlans = useMemo(() => {
    const apiPlans = (plansQuery.data ?? []).filter(plan => plan.is_active !== false);
    return apiPlans.length > 0 ? apiPlans : LANDING_FALLBACK_PLANS;
  }, [plansQuery.data]);

  const showSkeleton = plansQuery.isPending && (plansQuery.data ?? []).length === 0;

  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-2 sm:mb-3">
          Simple Pricing
        </h2>
        <p className="text-center text-sm sm:text-base text-text-secondary mb-8 sm:mb-12 px-2">
          Start free, upgrade when you need more.
        </p>

        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto">
            {[0, 1, 2].map(i => (
              <div
                key={`pricing-skel-${i}`}
                className="glass-card rounded-xl p-6 h-80 motion-safe:animate-pulse bg-bg-elevated/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto">
            {displayPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
