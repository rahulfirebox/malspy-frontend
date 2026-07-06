import React from 'react';
import { Card } from '@/components/ui/Card';

export function ScanSidebar() {
  return (
    <div className="space-y-4">
      <Card className="border-primary">
        <h3 className="text-sm font-semibold text-text-primary mb-2">🛡️ Protect Your Website</h3>
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
        <h3 className="text-sm font-semibold text-text-primary mb-2">📡 Monitor Continuously</h3>
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
        <h3 className="text-sm font-semibold text-text-primary mb-2">📄 Download PDF Report</h3>
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
  );
}
