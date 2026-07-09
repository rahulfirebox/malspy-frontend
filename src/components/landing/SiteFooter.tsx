import React from 'react';
import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';

export const footerLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/contact', label: 'Contact' },
] as const;

const productLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-bg-elevated/40 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <span className="font-bold text-lg text-text-primary tracking-tight">SecureScan</span>
            </Link>
            <p className="text-sm leading-relaxed text-text-secondary max-w-xs">
              Free website security scanner. Detect malware, blacklist status, SSL issues, and
              vulnerabilities in seconds.
            </p>
            <Link
              href="/register"
              className="inline-flex text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Get started free →
            </Link>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Get in touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@securescan.com"
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors break-all"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  support@securescan.com
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign in to your account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-center sm:text-left">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} SecureScan. All rights reserved.
          </p>
          <p className="text-xs text-text-secondary/80">
            Built for developers, agencies, and security teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
