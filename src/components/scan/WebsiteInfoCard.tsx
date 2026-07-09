import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { InfoTable } from '@/components/ui/InfoTable';
import { Globe } from 'lucide-react';
import type { ScanSite } from '@/types';

interface WebsiteInfoCardProps {
  domain: string;
  site: ScanSite;
}

export function WebsiteInfoCard({ domain, site }: WebsiteInfoCardProps) {
  const rows = [
    { label: 'Domain', value: domain, valueClassName: 'font-mono text-text-primary' },
    {
      label: 'IP Address',
      value: site?.ip?.join(', ') || '—',
      valueClassName: 'font-mono text-text-primary break-all',
    },
    {
      label: 'Final URL',
      value: site?.final_url || '—',
      valueClassName: 'font-mono text-text-primary break-all',
    },
    {
      label: 'Running On',
      value: site?.running_on?.join(', ') || '—',
    },
    {
      label: 'CDN',
      value: site?.cdn?.join(', ') || '—',
    },
    {
      label: 'Redirects',
      value: site?.redirects_to?.length ? site.redirects_to.join(' → ') : '—',
      valueClassName: 'font-mono text-text-primary break-all',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          Website Information
        </h2>
      </CardHeader>
      <InfoTable rows={rows} />
    </Card>
  );
}
