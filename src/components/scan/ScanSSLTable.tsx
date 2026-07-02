import React from 'react';
import type { TlsDirectInfo } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { formatDateShort } from '@/lib/apiUtils';

interface ScanSSLTableProps {
  tls: TlsDirectInfo;
}

export function ScanSSLTable({ tls }: ScanSSLTableProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
          SSL/TLS Details
        </h2>
      </CardHeader>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border">
          <tr>
            <td className="py-2 pr-4 text-text-secondary w-40">TLS Version</td>
            <td className="py-2 font-mono text-text-primary">{tls.tls_version || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Cipher Suite</td>
            <td className="py-2 font-mono text-text-primary text-xs">{tls.cipher_suite || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Issuer</td>
            <td className="py-2 text-text-primary">{tls.cert_issuer || '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">Expires</td>
            <td className="py-2 text-text-primary">
              {tls.cert_not_after ? formatDateShort(tls.cert_not_after) : '—'}
              {tls.cert_expiring_soon && (
                <span className="ml-2 text-xs text-rating-b-text bg-warning-bg border border-yellow-200 px-1.5 py-0.5 rounded">
                  Expiring soon
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">HSTS</td>
            <td className="py-2">
              {tls.hsts ? (
                <CheckCircle className="h-4 w-4 text-success" aria-label="Enabled" />
              ) : (
                <XCircle className="h-4 w-4 text-danger" aria-label="Disabled" />
              )}
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-text-secondary">OCSP Stapling</td>
            <td className="py-2">
              {tls.ocsp_stapling ? (
                <CheckCircle className="h-4 w-4 text-success" aria-label="Enabled" />
              ) : (
                <XCircle className="h-4 w-4 text-danger" aria-label="Disabled" />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
