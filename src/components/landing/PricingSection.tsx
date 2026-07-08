'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { billingService } from '@/services/billingService';
import { PLAN_FEATURES } from '@/lib/planFeatures';
import type { Plan, PlanSlug } from '@/types';

function formatPlanPrice(plan: Plan): string {
  return `$${plan.price_monthly}`;
}

export function PricingSection() {
  const plansQuery = useQuery({
    queryKey: ['plans', 'public'],
    queryFn: () => billingService.getPlans(),
    staleTime: 60_000,
  });

  const plans = (plansQuery.data ?? []).filter(plan => plan.is_active !== false);

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-3">Simple Pricing</h2>
        <p className="text-center text-text-secondary mb-12">Start free, upgrade when you need more.</p>

        {plansQuery.isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div
                key={`pricing-skel-${i}`}
                className="glass-card rounded-xl p-6 h-80 motion-safe:animate-pulse bg-bg-elevated/50"
              />
            ))}
          </div>
        ) : plansQuery.isError ? (
          <p className="text-center text-sm text-text-secondary" role="alert">
            Unable to load plans right now. Please refresh the page.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plans.map(plan => {
              const slug = plan.slug as PlanSlug;
              const features = PLAN_FEATURES[slug] ?? [];
              const isPro = slug === 'pro';
              const isEnterprise = slug === 'enterprise';
              const isFree = Number(plan.price_monthly) === 0;

              return (
                <div
                  key={plan.id}
                  className={`glass-card rounded-xl p-6 ${
                    isPro ? 'border-primary/50 ring-1 ring-primary/40 relative shadow-glow' : ''
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
                    <span className="text-base font-normal text-text-secondary">/mo</span>
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                    {features.map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle
                          className="h-4 w-4 text-accent-green shrink-0"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isEnterprise ? (
                    <a
                      href="mailto:sales@securescan.io"
                      className="mt-6 block w-full text-center py-2.5 border border-border-dark text-text-secondary font-semibold rounded-lg hover:bg-bg-elevated transition-colors text-sm"
                    >
                      Contact Sales
                    </a>
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
            })}
          </div>
        )}
      </div>
    </section>
  );
}
