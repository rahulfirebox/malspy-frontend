import React from 'react';
import type { ScanDetail } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { InfoTable } from '@/components/ui/InfoTable';
import { Globe } from 'lucide-react';

interface ScanWebsiteInfoProps {
  scan: ScanDetail;
}

export function ScanWebsiteInfo({ scan }: ScanWebsiteInfoProps) {
  const rows = [
    { label: 'Domain', value: scan.domain, valueClassName: 'font-mono text-text-primary' },
    {
      label: 'IP Address',
      value: scan.site?.ip?.join(', ') || '—',
      valueClassName: 'font-mono text-text-primary break-all',
    },
    {
      label: 'Final URL',
      value: scan.site?.final_url || '—',
      valueClassName: 'font-mono text-text-primary break-all',
    },
    {
      label: 'Running On',
      value: scan.site?.running_on?.join(', ') || '—',
    },
    {
      label: 'CDN',
      value: scan.site?.cdn?.join(', ') || '—',
    },
    {
      label: 'Redirects',
      value: scan.site?.redirects_to?.length ? scan.site.redirects_to.join(' → ') : '—',
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
