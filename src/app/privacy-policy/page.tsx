import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/landing/MarketingShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SecureScan privacy policy — how we collect, use, and protect your data.',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <MarketingShell title="Privacy Policy">
      <p className="text-text-secondary">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <Section title="Introduction">
        <p>
          SecureScan (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides website security scanning
          and monitoring services. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our website and services.
        </p>
      </Section>

      <Section title="Information We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text-primary">Account information:</strong> name, email address,
            organization name, and authentication credentials when you register.
          </li>
          <li>
            <strong className="text-text-primary">Scan data:</strong> URLs and domains you submit for
            scanning, scan results, and monitoring configuration.
          </li>
          <li>
            <strong className="text-text-primary">Billing information:</strong> subscription plan,
            payment status, and invoices processed through our payment provider.
          </li>
          <li>
            <strong className="text-text-primary">Usage data:</strong> log data, device information,
            IP address, and how you interact with our platform.
          </li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide, operate, and maintain our security scanning services</li>
          <li>Process subscriptions and send billing-related communications</li>
          <li>Send security alerts and scan notifications you configure</li>
          <li>Improve our products, detect abuse, and protect platform integrity</li>
          <li>Comply with legal obligations and enforce our terms</li>
        </ul>
      </Section>

      <Section title="Data Sharing">
        <p>
          We do not sell your personal information. We may share data with trusted service providers
          (hosting, payment processing, email delivery) who assist in operating our service, and when
          required by law or to protect our rights and users.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain account and scan data for as long as your account is active or as needed to provide
          services. You may request deletion of your account by contacting us.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We implement industry-standard technical and organizational measures to protect your data.
          No method of transmission over the Internet is 100% secure, and we cannot guarantee absolute
          security.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export your
          personal data. Contact us to exercise these rights.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For privacy-related questions, email us at{' '}
          <a href="mailto:privacy@securescan.com" className="text-primary hover:underline">
            privacy@securescan.com
          </a>
          .
        </p>
      </Section>
    </MarketingShell>
  );
}
