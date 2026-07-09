import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Bug,
  Lock,
  Globe,
  CheckCircle,
  RefreshCw,
  Zap,
  Users,
} from 'lucide-react';
import { ScanInput } from '@/components/scan/ScanInput';
import { PricingSection } from '@/components/landing/PricingSection';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteHeader } from '@/components/landing/SiteHeader';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-page text-text-primary">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_45%] bg-no-repeat"
          style={{ backgroundImage: "url('/image/hero-background.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-bg-page/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-page/30 via-transparent to-bg-page pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20 text-center">
          <span className="inline-flex max-w-[min(100%,20rem)] sm:max-w-none items-center justify-center gap-2 rounded-full border border-accent-green/35 bg-accent-green/10 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-accent-green mb-5 sm:mb-6 leading-snug">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            100% Free • No Credit Card Required
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight tracking-tight text-text-primary mb-4 sm:mb-5 px-1">
            Free Website Security Scanner
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-text-secondary mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-1">
            Check for malware, blacklist status, and security vulnerabilities instantly, for free.
          </p>
          <ScanInput variant="dark" />
        </div>
      </section>

      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-2 sm:mb-3">
            What We Check
          </h2>
          <p className="text-center text-sm sm:text-base text-text-secondary mb-8 sm:mb-12 max-w-xl mx-auto px-2">
            Comprehensive security analysis powered by industry-leading detection engines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Bug,
                color: 'text-accent-green',
                glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
                bg: 'bg-accent-green/10 border-accent-green/20',
                title: 'Malware Detection',
                desc: 'Scan for JavaScript injections, hidden iframes, phishing code, and more.',
              },
              {
                icon: Globe,
                color: 'text-accent-orange',
                glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
                bg: 'bg-accent-orange/10 border-accent-orange/20',
                title: 'Blacklist Status',
                desc: 'Check 7 major security databases including Google, McAfee, and Norton.',
              },
              {
                icon: Lock,
                color: 'text-accent-purple',
                glow: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
                bg: 'bg-accent-purple/10 border-accent-purple/20',
                title: 'SSL/TLS Analysis',
                desc: 'Verify certificate validity, expiry, HSTS, and cipher configuration.',
              },
            ].map(f => (
              <div
                key={f.title}
                className="glass-card rounded-xl p-5 sm:p-6 text-center hover:border-primary/30 transition-colors group"
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border ${f.bg} ${f.glow}`}
                >
                  <f.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${f.color}`} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Globe, color: 'text-primary', stat: '10M+', label: 'Websites Scanned' },
              { icon: Zap, color: 'text-accent-green', stat: 'Instant', label: 'Scan Results' },
              { icon: Users, color: 'text-accent-purple', stat: 'Trusted by', label: 'Developers & Agencies' },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border/60 bg-bg-elevated/50 px-4 py-4 sm:px-6 sm:py-5"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-bg-card border border-border">
                  <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-text-primary">{item.stat}</p>
                  <p className="text-xs sm:text-sm text-text-secondary">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-bg-elevated/40 border-y border-border/50"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 text-center">
            {[
              {
                step: '1',
                icon: Globe,
                title: 'Enter Your URL',
                desc: 'Type your website address in the scanner above.',
              },
              {
                step: '2',
                icon: RefreshCw,
                title: 'We Scan It',
                desc: 'Our engine checks for malware, blacklists, SSL, and security headers.',
              },
              {
                step: '3',
                icon: CheckCircle,
                title: 'Get Your Report',
                desc: 'View a detailed security report with actionable recommendations.',
              },
            ].map(item => (
              <div key={item.step}>
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-primary/30">
                  {item.step}
                </div>
                <item.icon className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-primary mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <SiteFooter />
    </div>
  );
}
