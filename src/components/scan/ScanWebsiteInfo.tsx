import React from 'react';
import type { ScanDetail } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Globe } from 'lucide-react';

interface ScanWebsiteInfoProps {
  scan: ScanDetail;
}

export function ScanWebsiteInfo({ scan }: ScanWebsiteInfoProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
          Website Information
        </h2>
      </CardHeader>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border">
          <tr>
            <td className="py-2 pr-4 text-text-secondary w-36">Domain</td>
            <td className="py-2 font-mono text-text-primary">{scan.domain}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">IP Address</td>
            <td className="py-2 font-mono text-text-primary">{scan.site?.ip?.join(', ') || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Server</td>
            <td className="py-2 text-text-primary">
              {scan.software?.server?.map(s => s.name).join(', ') || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">CMS</td>
            <td className="py-2 text-text-primary">
              {scan.software?.cms?.map(c => c.name).join(', ') || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Registrar</td>
            <td className="py-2 text-text-primary">{scan.whois?.registrar || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Domain Age</td>
            <td className="py-2 text-text-primary">
              {scan.whois?.domain_age_days
                ? `${Math.floor(scan.whois.domain_age_days / 365)} years`
                : '—'}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
