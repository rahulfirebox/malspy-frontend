'use client';

export const dynamic = 'force-dynamic';

import React, { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Shield, CheckCircle, AlertTriangle, Bug } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentScansTable } from '@/components/dashboard/RecentScansTable';
import { DomainCard } from '@/components/dashboard/DomainCard';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { dashboardService } from '@/services/dashboardService';
import { scanService } from '@/services/scanService';
import { domainService } from '@/services/domainService';
import { alertService } from '@/services/alertService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateShort } from '@/lib/apiUtils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const userId = useAuthStore(s => s.user?.id);

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', userId],
    queryFn: () => dashboardService.getStats(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const scansQuery = useQuery({
    queryKey: ['dashboard-recent-scans', userId],
    queryFn: () => scanService.getRecentScans(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const domainsQuery = useQuery({
    queryKey: ['domains', userId, { page_size: 6 }],
    queryFn: () => domainService.listDomains({ page_size: 6 }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const alertsQuery = useQuery({
    queryKey: ['dashboard-recent-alerts', userId],
    queryFn: () => alertService.getRecentAlerts(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!userId,
  });

  const recentDomains = useMemo(() => domainsQuery.data?.results ?? [], [domainsQuery.data]);
  const recentAlerts = useMemo(() => alertsQuery.data?.results ?? [], [alertsQuery.data]);

  const sevColor: Record<string, string> = {
    critical: 'var(--color-danger)',
    high: 'var(--color-warning-orange)',
    medium: 'var(--color-warning)',
    low: 'var(--color-info)',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <Link href="/dashboard/scans/new">
          <Button size="md">+ New Scan</Button>
        </Link>
      </div>

      
      {statsQuery.isPending ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))}
        </div>
      ) : statsQuery.isError ? (
        <ErrorState message="Failed to load stats." onRetry={() => statsQuery.refetch()} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Scans"
            value={statsQuery.data.total_scans}
            icon={<Shield className="h-5 w-5" />}
            accent="var(--color-primary)"
          />
          <StatsCard
            label="Clean"
            value={statsQuery.data.clean_scans}
            icon={<CheckCircle className="h-5 w-5" />}
            accent="var(--color-success)"
          />
          <StatsCard
            label="Issues Found"
            value={statsQuery.data.issues_found}
            icon={<Bug className="h-5 w-5" />}
            accent="var(--color-warning-orange)"
          />
          <StatsCard
            label="Active Alerts"
            value={statsQuery.data.active_alerts}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent="var(--color-danger)"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white border border-border rounded-lg shadow-md">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Recent Scans</h2>
            <Link href="/dashboard/scans" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {scansQuery.isPending ? (
            <SkeletonTable rows={5} />
          ) : scansQuery.isError ? (
            <ErrorState message="Failed to load scans." onRetry={() => scansQuery.refetch()} />
          ) : (scansQuery.data?.results ?? []).length === 0 ? (
            <EmptyState
              title="No scans yet"
              description="Run your first website security scan."
              cta={
                <Link href="/dashboard/scans/new">
                  <Button size="sm">Start Scan</Button>
                </Link>
              }
            />
          ) : (
            <RecentScansTable scans={scansQuery.data!.results} />
          )}
        </div>

        
        <div className="bg-white border border-border rounded-lg shadow-md">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Active Alerts</h2>
            <Link href="/dashboard/alerts" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {alertsQuery.isPending ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`alert-skel-${i}`} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-border mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-border rounded w-1/2" />
                      <div className="h-3 bg-border rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : alertsQuery.isError ? (
              <ErrorState message="Failed to load alerts." onRetry={() => alertsQuery.refetch()} />
            ) : recentAlerts.length === 0 ? (
              <EmptyState title="No active alerts" description="Your websites are clean." />
            ) : (
              recentAlerts.map(alert => (
                <div key={alert.id} className="p-4 flex items-start gap-3">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: sevColor[alert.severity] ?? 'var(--color-text-secondary)' }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{alert.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {alert.severity} · {formatDateShort(alert.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Monitored Domains</h2>
          <Link href="/dashboard/domains" className="text-xs text-primary hover:underline">
            Manage domains
          </Link>
        </div>
        {domainsQuery.isPending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} />
            ))}
          </div>
        ) : domainsQuery.isError ? (
          <ErrorState message="Failed to load domains." onRetry={() => domainsQuery.refetch()} />
        ) : recentDomains.length === 0 ? (
          <EmptyState
            title="No monitored domains"
            description="Add a domain to start continuous monitoring."
            cta={
              <Link href="/dashboard/domains">
                <Button variant="outline" size="sm">
                  Add Domain
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentDomains.map(domain => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
