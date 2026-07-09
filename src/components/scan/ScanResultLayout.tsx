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
import { MalwareFindingsList, collectMalwareFindings } from './MalwareFindingsList';
import { formatDate } from '@/lib/apiUtils';
import { useAuthStore } from '@/stores/authStore';
import { Shield, AlertTriangle } from 'lucide-react';

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
  embedded?: boolean;
}

export function ScanResultLayout({ scan, authActions, embedded = false }: ScanResultLayoutProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const showPromoSidebar = !embedded && !isAuthenticated;
  const rating = scan.ratings?.total?.rating as OverallRating | undefined;
  const banner = rating ? bannerConfig[rating] : bannerConfig['B'];
  const malwareFindings = useMemo(() => collectMalwareFindings(scan), [scan]);
  const recs = useMemo(() => parseRecommendations(scan.recommendations ?? null), [scan.recommendations]);

  return (
    <div className={embedded ? '' : 'min-h-screen bg-bg-page'}>
      <div
        className={`w-full border-b py-3 sm:py-4 px-4 sm:px-6 ${embedded ? 'mb-4 sm:mb-6' : ''} ${banner.bgClass} ${banner.borderClass}`}
      >
        <div
          className={`${embedded ? '' : 'max-w-6xl mx-auto'} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="min-w-0">
            <p className={`text-sm font-medium ${banner.textClass} break-words`}>
              Results for{' '}
              <span className="font-mono font-bold break-all">{scan.domain}</span>
            </p>
            <p className={`text-xs mt-0.5 ${banner.textClass}`}>
              {banner.label} · Scanned {scan.completed_at ? formatDate(scan.completed_at) : ''}
            </p>
          </div>
          {authActions && <div className="w-full sm:w-auto shrink-0">{authActions}</div>}
        </div>
      </div>

      <div className={`${embedded ? '' : 'max-w-6xl mx-auto px-0 sm:px-4 py-4 sm:py-8'}`}>
        <div
          className={`grid grid-cols-1 ${showPromoSidebar ? 'lg:grid-cols-[1fr_320px]' : ''} gap-6`}
        >
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                  Security Rating
                </h2>
              </CardHeader>
              <div className="flex flex-col items-center mb-6">
                {rating && <RatingBadgeLarge rating={rating} />}
              </div>

              {(scan.malware_detected || malwareFindings.length > 0) && (
                <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-danger-bg px-4 py-3">
                  <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-rating-d-text">Malware detected</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {malwareFindings.length > 0
                        ? `${malwareFindings.length} finding${malwareFindings.length !== 1 ? 's' : ''} reported by the scanner.`
                        : 'The scanner flagged potential malware on this site.'}
                    </p>
                  </div>
                </div>
              )}

              {/* {scan.ratings ? (
                <SecurityRatingCards ratings={scan.ratings} />
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">
                  Rating details are not available for this scan yet.
                </p>
              )} */}

              <MalwareFindingsList findings={malwareFindings} />
            </Card>

            <WebsiteInfoCard domain={scan.domain} site={scan.site} />

            {scan.tls_direct && <SslTlsCard tls={scan.tls_direct} />}

            {recs.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary">
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
                <h2 className="text-base sm:text-lg font-semibold text-text-primary">Site Details</h2>
              </CardHeader>
              {scan.links && <SiteDetailsTabs links={scan.links} />}
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-semibold text-text-primary">Blacklist Status</h2>
              </CardHeader>
              {scan.blacklists && <BlacklistProviders blacklists={scan.blacklists} />}
              {scan.our_scanner && (
                <div className="mt-4 p-3 bg-info-bg border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Our Scanner Result</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-primary">
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

          {showPromoSidebar && (
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
                className="block w-full text-center py-2 bg-white border border-primary text-primary text-sm font-semibold rounded-md hover:bg-primary-light transition-colors"
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
                className="block w-full text-center py-2 bg-white border border-border-dark text-text-secondary text-sm font-semibold rounded-md hover:bg-bg-page transition-colors"
              >
                Upgrade for PDF
              </a>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
