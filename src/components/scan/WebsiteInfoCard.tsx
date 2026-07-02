import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Globe } from 'lucide-react';
import type { ScanSite, ScanSoftware, WhoisInfo } from '@/types';

interface WebsiteInfoCardProps {
  domain: string;
  site: ScanSite;
  software: ScanSoftware;
  whois: WhoisInfo;
}

export function WebsiteInfoCard({ domain, site, software, whois }: WebsiteInfoCardProps) {
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
            <td className="py-2 font-mono text-text-primary">{domain}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">IP Address</td>
            <td className="py-2 font-mono text-text-primary">{site?.ip?.join(', ') || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Server</td>
            <td className="py-2 text-text-primary">
              {software?.server?.map(s => s.name).join(', ') || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">CMS</td>
            <td className="py-2 text-text-primary">
              {software?.cms?.map(c => c.name).join(', ') || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Registrar</td>
            <td className="py-2 text-text-primary">{whois?.registrar || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Domain Age</td>
            <td className="py-2 text-text-primary">
              {whois?.domain_age_days ? `${Math.floor(whois.domain_age_days / 365)} years` : '—'}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
