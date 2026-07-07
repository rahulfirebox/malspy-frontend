'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface RecommendationItemProps {
  title: string;
  description?: string;
  severity: 'minor' | 'critical';
  affectedPages?: string[];
}

const REC_LABELS: Record<string, { title: string; description: string }> = {
  needs_waf: {
    title: 'Web Application Firewall Recommended',
    description:
      'Your website is not protected by a WAF. A WAF blocks malicious traffic before it reaches your server.',
  },
  csp: {
    title: 'Content Security Policy Missing or Weak',
    description:
      'CSP headers are missing or incomplete. Add script-src, object-src, base-uri and frame-src directives.',
  },
  no_csp: {
    title: 'Content Security Policy Not Configured',
    description: 'No Content-Security-Policy header was found.',
  },
  strict_transport_security: {
    title: 'HSTS Not Configured',
    description:
      'HTTP Strict Transport Security header is missing. Configure HSTS to enforce HTTPS connections.',
  },
  x_content_type_options: {
    title: 'X-Content-Type-Options Missing',
    description:
      'The X-Content-Type-Options header is not set. Add "nosniff" to prevent MIME-type sniffing.',
  },
  x_frame_options: {
    title: 'X-Frame-Options Missing',
    description: 'X-Frame-Options is not set, leaving the site vulnerable to clickjacking attacks.',
  },
  no_stapled_ocsp: {
    title: 'OCSP Stapling Not Enabled',
    description:
      'OCSP stapling is disabled. Enabling it improves SSL handshake performance and privacy.',
  },
};

export function RecommendationItem({
  title,
  description,
  severity,
  affectedPages = [],
}: RecommendationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isCritical = severity === 'critical';
  const pages = useMemo(() => affectedPages, [affectedPages]);

  return (
    <div
      className={`rounded-r-lg border-l-4 ${
        isCritical ? 'bg-danger-bg border-l-danger' : 'bg-warning-bg border-l-warning'
      } p-3`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex-shrink-0">{isCritical ? '❌' : '⚠️'}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {description && <p className="text-sm text-text-secondary mt-0.5">{description}</p>}
          {affectedPages.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              )}
              {affectedPages.length} affected page{affectedPages.length > 1 ? 's' : ''}
            </button>
          )}
          {expanded && (
            <ul className="mt-2 space-y-1">
              {pages.map(page => (
                <li key={page} className="font-mono text-xs text-text-secondary truncate">
                  {page}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


export function parseRecommendations(recs: unknown): Array<{
  key: string;
  title: string;
  description: string;
  severity: 'minor' | 'critical';
  affectedPages: string[];
}> {
  if (!recs || typeof recs !== 'object') return [];

  const items: Array<{
    key: string;
    title: string;
    description: string;
    severity: 'minor' | 'critical';
    affectedPages: string[];
  }> = [];

  for (const [section, entries] of Object.entries(recs as Record<string, unknown>)) {
    if (!entries || typeof entries !== 'object') continue;

    const severity = section.endsWith('_critical') ? 'critical' : 'minor';
    for (const [key, data] of Object.entries(entries as Record<string, unknown>)) {
      const label = REC_LABELS[key] || { title: key, description: '' };
      const pages =
        data && typeof data === 'object' && 'pages' in data && Array.isArray(data.pages)
          ? (data.pages as string[])
          : [];
      items.push({
        key,
        title: label.title,
        description: label.description,
        severity,
        affectedPages: pages,
      });
    }
  }
  return items;
}
