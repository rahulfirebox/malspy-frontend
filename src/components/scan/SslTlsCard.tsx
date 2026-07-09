import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { InfoTable } from '@/components/ui/InfoTable';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import type { TlsDirectInfo } from '@/types';
import { formatDateShort } from '@/lib/apiUtils';

interface SslTlsCardProps {
  tls: TlsDirectInfo;
}

function StatusIcon({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <CheckCircle className="h-4 w-4 text-success" aria-label="Enabled" />
  ) : (
    <XCircle className="h-4 w-4 text-danger" aria-label="Disabled" />
  );
}

export function SslTlsCard({ tls }: SslTlsCardProps) {
  const rows = [
    {
      label: 'TLS Version',
      value: tls.tls_version || '—',
      valueClassName: 'font-mono text-text-primary',
    },
    {
      label: 'Cipher Suite',
      value: tls.cipher_suite || '—',
      valueClassName: 'font-mono text-text-primary text-xs break-all',
    },
    {
      label: 'Issuer',
      value: tls.cert_issuer || '—',
    },
    {
      label: 'Expires',
      value: (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          {tls.cert_not_after ? formatDateShort(tls.cert_not_after) : '—'}
          {tls.cert_expiring_soon && (
            <span className="text-xs text-rating-b-text bg-warning-bg border border-yellow-200 px-1.5 py-0.5 rounded">
              Expiring soon
            </span>
          )}
        </span>
      ),
    },
    {
      label: 'HSTS',
      value: <StatusIcon enabled={tls.hsts} />,
    },
    {
      label: 'OCSP Stapling',
      value: <StatusIcon enabled={tls.ocsp_stapling} />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          SSL/TLS Details
        </h2>
      </CardHeader>
      <InfoTable rows={rows} />
    </Card>
  );
}
