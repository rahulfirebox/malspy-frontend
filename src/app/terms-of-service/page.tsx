import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/landing/MarketingShell';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SecureScan terms of service — rules and conditions for using our platform.',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <MarketingShell title="Terms of Service">
      <p className="text-text-secondary">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <Section title="Agreement">
        <p>
          By accessing or using SecureScan, you agree to these Terms of Service. If you do not agree,
          do not use our services.
        </p>
      </Section>

      <Section title="Service Description">
        <p>
          SecureScan provides automated website security scanning, malware detection, blacklist
          monitoring, SSL analysis, and related security tools. Features vary by subscription plan.
        </p>
      </Section>

      <Section title="Account Responsibilities">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate registration information and keep credentials secure.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>You must only scan websites and domains you own or have explicit permission to test.</li>
          <li>You must not use the service for unlawful, abusive, or unauthorized scanning.</li>
        </ul>
      </Section>

      <Section title="Subscriptions & Billing">
        <p>
          Paid plans are billed according to the pricing shown at checkout. Subscriptions renew
          automatically unless cancelled before the renewal date. Refunds are handled according to
          our billing policy and applicable law.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <p>
          You may not attempt to disrupt the platform, reverse engineer our systems, resell access
          without authorization, or use scan results to harm third parties. We may suspend or
          terminate accounts that violate these terms.
        </p>
      </Section>

      <Section title="Disclaimer">
        <p>
          SecureScan is provided &quot;as is&quot;. Scan results are informational and do not
          guarantee that a website is free from all security issues. We are not liable for damages
          arising from your use of or reliance on the service, to the maximum extent permitted by law.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, SecureScan shall not be liable for any
          indirect, incidental, special, or consequential damages, or loss of profits, data, or
          business opportunities.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms from time to time. Continued use of the service after changes
          constitutes acceptance of the updated terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email{' '}
          <a href="mailto:legal@securescan.com" className="text-primary hover:underline">
            legal@securescan.com
          </a>
          .
        </p>
      </Section>
    </MarketingShell>
  );
}
