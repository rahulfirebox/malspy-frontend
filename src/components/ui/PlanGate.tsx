'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Lock } from 'lucide-react';

const PLAN_ORDER = ['free', 'pro', 'enterprise'];

interface PlanGateProps {
  plan: 'pro' | 'enterprise';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ plan, children, fallback }: PlanGateProps) {
  const org = useAuthStore(s => s.org);
  const orgPlan = org?.plan ?? 'free';
  const requiredIndex = PLAN_ORDER.indexOf(plan);
  const currentIndex = PLAN_ORDER.indexOf(orgPlan);

  if (currentIndex >= requiredIndex) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className="bg-bg-card border border-border-dark rounded-lg p-6 flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-lg bg-bg-page border border-border-dark flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-text-secondary" aria-hidden="true" />
      </div>
      <h3 className="font-display font-medium text-text-primary text-base mb-1">
        {plan === 'enterprise' ? 'Enterprise' : 'Pro'} Plan Required
      </h3>
      <p className="text-sm text-text-secondary mb-4">
        Upgrade to{' '}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-indigo-50 text-indigo-600">
          {plan === 'enterprise' ? 'Enterprise' : 'Pro'}
        </span>{' '}
        to access this feature.
      </p>
      
      <a
        href="/dashboard/billing"
        className="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 bg-amber-400 text-gray-900 hover:bg-amber-500 text-sm px-4 py-2"
      >
        Upgrade to SecureScan
      </a>
    </div>
  );
}
