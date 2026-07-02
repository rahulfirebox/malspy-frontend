'use client';

import React, { useState } from 'react';
import type { ScanLinks } from '@/types';

interface SiteDetailsTabsProps {
  links: ScanLinks;
}

type TabKey = 'urls' | 'js' | 'iframes';

export function SiteDetailsTabs({ links }: SiteDetailsTabsProps) {
  const [active, setActive] = useState<TabKey>('urls');

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'urls', label: 'URLs', count: links.urls.length },
    {
      key: 'js',
      label: 'JavaScript',
      count: links.js_external.length + links.js_local.length,
    },
    { key: 'iframes', label: 'iFrames', count: links.iframes.length },
  ];

  const content: Record<TabKey, string[]> = {
    urls: links.urls,
    js: [...links.js_external, ...links.js_local],
    iframes: links.iframes,
  };

  return (
    <div>
      <div
        className="flex border-b border-border mb-4"
        role="tablist"
        aria-label="Site details tabs"
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`tab-panel-${tab.key}`}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              active === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs bg-bg-page px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div id={`tab-panel-${active}`} role="tabpanel" className="max-h-64 overflow-y-auto">
        {content[active].length === 0 ? (
          <p className="text-sm text-text-secondary">None found.</p>
        ) : (
          <ul className="space-y-1">
            {content[active].map(item => (
              <li key={item}>
                <a
                  href={item.startsWith('http') ? item : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline break-all"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
