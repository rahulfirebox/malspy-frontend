import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Bug,
  Lock,
  Globe,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Zap,
  Users,
} from 'lucide-react';
import { ScanInput } from '@/components/scan/ScanInput';
import { formatCurrency } from '@/lib/apiUtils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary landing-grid-bg">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-bg-page/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Shield className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="font-bold text-lg text-text-primary">SecureScan</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary border border-border-dark px-4 py-2 rounded-lg transition-colors hidden sm:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-glow"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden min-h-[520px] lg:min-h-[620px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image/hero-background.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-page via-bg-page/92 to-bg-page/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-page/20 via-transparent to-bg-page pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-semibold text-accent-green mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-hidden="true" />
              100% Free
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-tight tracking-tight text-text-primary mb-5">
              Free Website
              <br />
              <span className="text-primary">Security Scanner</span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-lg leading-relaxed">
              Check for malware, blacklist status, and security vulnerabilities — instantly,
              for free.
            </p>
            <ScanInput variant="dark" />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-3">What We Check</h2>
          <p className="text-center text-text-secondary mb-12 max-w-xl mx-auto">
            Comprehensive security analysis powered by industry-leading detection engines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-colors group"
              >
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${f.bg} ${f.glow}`}
                >
                  <f.icon className={`h-6 w-6 ${f.color}`} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Globe, color: 'text-primary', stat: '10M+', label: 'Websites Scanned' },
              { icon: Zap, color: 'text-accent-green', stat: 'Instant', label: 'Scan Results' },
              { icon: Users, color: 'text-accent-purple', stat: 'Trusted by', label: 'Developers & Agencies' },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-bg-elevated/50 px-6 py-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-card border border-border">
                  <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">{item.stat}</p>
                  <p className="text-sm text-text-secondary">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-20 px-4 bg-bg-elevated/40 border-y border-border/50"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
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
                <item.icon className="h-8 w-8 mx-auto text-primary mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-3">Simple Pricing</h2>
          <p className="text-center text-text-secondary mb-12">Start free, upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-text-primary">Free</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {formatCurrency(0)}
                <span className="text-base font-normal text-text-secondary">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                {['5 scans/month', '1 domain', 'Basic security report', 'Blacklist check', 'SSL analysis'].map(
                  f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent-green shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors text-sm"
              >
                Get Started Free
              </Link>
            </div>

            <div className="glass-card rounded-xl p-6 border-primary/50 ring-1 ring-primary/40 relative shadow-glow">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
              <h3 className="text-xl font-bold text-text-primary">Pro</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {formatCurrency(19.99)}
                <span className="text-base font-normal text-text-secondary">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                {[
                  '100 scans/month',
                  '10 domains',
                  'Continuous monitoring',
                  'PDF reports',
                  'Browser scan (Layer 2)',
                  'Slack notifications',
                  'Scheduled scans',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-green shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors text-sm shadow-glow"
              >
                Start Pro Trial
              </Link>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-text-primary">Enterprise</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {formatCurrency(99)}
                <span className="text-base font-normal text-text-secondary">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                {[
                  'Unlimited scans',
                  'Unlimited domains',
                  'API access',
                  'WAF protection',
                  'Database scan',
                  'Priority support',
                  'Custom integrations',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-green shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:sales@securescan.io"
                className="mt-6 block w-full text-center py-2.5 border border-border-dark text-text-secondary font-semibold rounded-lg hover:bg-bg-elevated transition-colors text-sm"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer id="about" className="border-t border-border/60 py-10 px-4 bg-bg-elevated/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-primary">SecureScan</span>
          </div>
          <nav className="flex gap-6" aria-label="Footer navigation">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
              <a
                key={link}
                href="#"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} SecureScan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
