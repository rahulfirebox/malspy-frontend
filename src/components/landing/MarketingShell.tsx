import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

interface MarketingShellProps {
  title: string;
  children: React.ReactNode;
}

export function MarketingShell({ title, children }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary landing-grid-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 sm:py-16 w-full">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-primary hover:text-primary-dark transition-colors mb-8"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-8">
          {title}
        </h1>
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-text-secondary">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export { footerLinks } from '@/components/landing/SiteFooter';
