import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Bug,
  Lock,
  Globe,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Zap,
  Clock,
  Users,
} from 'lucide-react';
import { ScanInput } from '@/components/scan/ScanInput';
import { formatCurrency } from '@/lib/apiUtils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
];

const features = [
  {
    icon: Bug,
    title: 'Malware Detection',
    desc: 'Scan for JavaScript injections, hidden iframes, phishing code, and more.',
    color: 'text-accent-green',
    bg: 'bg-accent-green/10 glow-green',
  },
  {
    icon: Globe,
    title: 'Blacklist Status',
    desc: 'Check 7 major security databases including Google, McAfee, and Norton.',
    color: 'text-accent-amber',
    bg: 'bg-accent-amber/10 glow-amber',
  },
  {
    icon: Lock,
    title: 'SSL/TLS Analysis',
    desc: 'Verify certificate validity, expiry, HSTS, and cipher configuration.',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10 glow-purple',
  },
];

const stats = [
  { icon: Globe, label: '10M+ Websites Scanned', color: 'text-primary' },
  { icon: Clock, label: 'Instant Scan Results', color: 'text-accent-green' },
  { icon: Users, label: 'Trusted by Web Developers', color: 'text-accent-purple' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-bg-page/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="font-bold text-lg text-text-primary">SecureScan</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
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

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:inline"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors glow-blue"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <section id="hero" className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
        <Image
          src="/image/heroBackgroundImage.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-bg-page/50" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid opacity-30"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-green/40 bg-accent-green/10 text-accent-green text-sm font-medium mb-8">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            100% Free · No Credit Card Required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-tight">
            Free Website
            <br />
            <span className="text-primary">Security Scanner</span>
          </h1>

          <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Check for malware, blacklist status, and security vulnerabilities — instantly, for free.
          </p>

          <ScanInput variant="hero" />
        </div>

        <div className="relative z-10 border-t border-border/50 bg-bg-page/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center justify-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                <span className="text-sm font-medium text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-bg-page">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-3">What We Check</h2>
          <p className="text-center text-text-secondary mb-12 max-w-xl mx-auto">
            Comprehensive security analysis powered by multi-layer scanning technology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors group"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${bg}`}
                >
                  <Icon className={`h-7 w-7 ${color}`} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary mb-4">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 bg-bg-elevated/30 border-y border-border">
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
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-primary/30">
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

      <section id="pricing" className="py-20 px-4 bg-bg-page">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-3">Simple Pricing</h2>
          <p className="text-center text-text-secondary mb-12">Start free, upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-text-primary">Free</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {formatCurrency(0)}
                <span className="text-base font-normal text-text-secondary">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                {['5 scans/month', '1 domain', 'Basic security report', 'Blacklist check', 'SSL analysis'].map(
                  f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent-green flex-shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 border border-primary text-primary font-semibold rounded-lg hover:bg-primary-light transition-colors text-sm"
              >
                Get Started Free
              </Link>
            </div>

            <div className="bg-bg-card border-2 border-primary rounded-xl p-6 relative glow-blue">
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
                    <CheckCircle className="h-4 w-4 text-accent-green flex-shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Start Pro Trial
              </Link>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-6">
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
                    <CheckCircle className="h-4 w-4 text-accent-green flex-shrink-0" aria-hidden="true" />
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

      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-bg-elevated to-accent-purple/10 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <Zap className="h-10 w-10 text-primary mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to secure your website?</h2>
          <p className="text-text-secondary mb-6">Run your first free scan in under 60 seconds.</p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors glow-blue"
          >
            Scan Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4 bg-bg-page">
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
