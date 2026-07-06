'use client';

import React, { useMemo } from 'react';
import type { ScanDetail, OverallRating } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { RatingBadgeLarge } from './RatingBadge';
import { SecurityRatingCards } from './SecurityRatingCards';
import { BlacklistProviders } from './BlacklistProviders';
import { SiteDetailsTabs } from './SiteDetailsTabs';
import { RecommendationItem, parseRecommendations } from './RecommendationItem';
import { SslTlsCard } from './SslTlsCard';
import { WebsiteInfoCard } from './WebsiteInfoCard';
import { formatDate } from '@/lib/apiUtils';
import { Shield } from 'lucide-react';

const bannerConfig: Record<
  OverallRating,
  { bgClass: string; textClass: string; borderClass: string; label: string }
> = {
  A: {
    bgClass: 'bg-success-bg',
    textClass: 'text-rating-a-text',
    borderClass: 'border-success',
    label: 'Website appears clean',
  },
  B: {
    bgClass: 'bg-warning-bg',
    textClass: 'text-rating-b-text',
    borderClass: 'border-warning',
    label: 'Minor security issues found',
  },
  C: {
    bgClass: 'bg-orange-50',
    textClass: 'text-rating-c-text',
    borderClass: 'border-rating-c',
    label: 'Security vulnerabilities detected',
  },
  D: {
    bgClass: 'bg-danger-bg',
    textClass: 'text-rating-d-text',
    borderClass: 'border-danger',
    label: 'Critical security issues found',
  },
};

interface ScanResultLayoutProps {
  scan: ScanDetail;
  authActions?: React.ReactNode;
}

export function ScanResultLayout({ scan, authActions }: ScanResultLayoutProps) {
  const rating = scan.ratings?.total?.rating as OverallRating | undefined;
  const banner = rating ? bannerConfig[rating] : bannerConfig['B'];
  const recs = useMemo(
    () => parseRecommendations(
      scan.recommendations as Record<string, Record<string, Record<string, unknown>>>
    ),
    [scan.recommendations]
  );

  return (
    <div className="min-h-screen bg-bg-page">
      <div
        className={`w-full border-b py-4 px-6 ${banner.bgClass} ${banner.borderClass}`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className={`text-sm font-medium ${banner.textClass}`}>
              Results for <span className="font-mono font-bold">{scan.domain}</span>
            </p>
            <p className={`text-xs mt-0.5 ${banner.textClass}`}>
              {banner.label} · Scanned {scan.completed_at ? formatDate(scan.completed_at) : ''}
            </p>
          </div>
          {authActions}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                  Security Rating
                </h2>
              </CardHeader>
              <div className="flex flex-col items-center mb-6">
                {rating && <RatingBadgeLarge rating={rating} />}
              </div>
              {scan.ratings ? (
                <SecurityRatingCards ratings={scan.ratings} />
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">
                  Rating details are not available for this scan yet.
                </p>
              )}
            </Card>

            <WebsiteInfoCard
              domain={scan.domain}
              site={scan.site}
              software={scan.software}
              whois={scan.whois}
            />

            {scan.tls_direct && <SslTlsCard tls={scan.tls_direct} />}

            {recs.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Recommendations ({recs.length})
                  </h2>
                </CardHeader>
                <div className="space-y-3">
                  {recs.map(rec => (
                    <RecommendationItem
                      key={rec.key}
                      title={rec.title}
                      description={rec.description}
                      severity={rec.severity}
                      affectedPages={rec.affectedPages}
                    />
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text-primary">Site Details</h2>
              </CardHeader>
              {scan.links && <SiteDetailsTabs links={scan.links} />}
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text-primary">Blacklist Status</h2>
              </CardHeader>
              {scan.blacklists && <BlacklistProviders blacklists={scan.blacklists} />}
              {scan.our_scanner && (
                <div className="mt-4 p-3 bg-info-bg border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Our Scanner Result</p>
                  <div className="flex gap-4 text-xs text-text-primary">
                    <span>
                      Layer 1:{' '}
                      {scan.our_scanner.layer1_detected ? (
                        <span className="text-danger font-semibold">Detected</span>
                      ) : (
                        <span className="text-success font-semibold">Clean</span>
                      )}
                    </span>
                    <span>
                      Layer 2:{' '}
                      {scan.our_scanner.layer2_detected ? (
                        <span className="text-danger font-semibold">Detected</span>
                      ) : (
                        <span className="text-success font-semibold">Clean</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{scan.our_scanner.note}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-primary">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Protect Your Website</h3>
              <p className="text-xs text-text-secondary mb-3">
                Stop malware, DDoS, and hacking attempts with our WAF and CDN.
              </p>
              <a
                href="/register"
                className="block w-full text-center py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-md transition-colors"
              >
                Protect Now
              </a>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Monitor Continuously</h3>
              <p className="text-xs text-text-secondary mb-3">
                Get instant alerts when your site is compromised. Daily/weekly scans.
              </p>
              <a
                href="/register"
                className="block w-full text-center py-2 bg-bg-card border border-primary text-primary text-sm font-semibold rounded-md hover:bg-primary-light transition-colors"
              >
                Start Monitoring
              </a>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Download PDF Report</h3>
              <p className="text-xs text-text-secondary mb-3">
                Get a detailed PDF security report for compliance and sharing.
              </p>
              <a
                href="/register"
                className="block w-full text-center py-2 bg-bg-card border border-border-dark text-text-secondary text-sm font-semibold rounded-md hover:bg-bg-page transition-colors"
              >
                Upgrade for PDF
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
