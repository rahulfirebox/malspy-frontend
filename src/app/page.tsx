import React from 'react';
import Link from 'next/link';
import { Shield, Bug, Lock, Globe, CheckCircle, RefreshCw } from 'lucide-react';
import { ScanInput } from '@/components/scan/ScanInput';
import { formatCurrency } from '@/lib/apiUtils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      
      <header className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-[#2B7DBC]" aria-hidden="true" />
            <span className="font-bold text-lg text-[#1f2937]">SecureScan</span>
          </Link>
          <nav className="flex items-center gap-4" aria-label="Main navigation">
            <Link
              href="/login"
              className="text-sm font-medium text-[#6b7280] hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] rounded"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#2B7DBC] hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B7DBC] focus:ring-offset-2"
            >
              Sign Up Free
            </Link>
          </nav>
        </div>
      </header>

      
      <section
        className="py-20 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, #2B7DBC 0%, #1A5E8F 100%)',
        }}
      >
        <h1 className="text-4xl font-bold text-white mb-3">Free Website Security Scanner</h1>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
          Check for malware, blacklist status, and security vulnerabilities — instantly, for free.
        </p>
        <ScanInput />
      </section>

      
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1f2937] mb-10">What We Check</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Bug className="h-6 w-6" />,
                title: 'Malware Detection',
                desc: 'Scan for JavaScript injections, hidden iframes, phishing code, and more.',
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: 'Blacklist Status',
                desc: 'Check 7 major security databases including Google, McAfee, and Norton.',
              },
              {
                icon: <Lock className="h-6 w-6" />,
                title: 'SSL/TLS Analysis',
                desc: 'Verify certificate validity, expiry, HSTS, and cipher configuration.',
              },
            ].map(f => (
              <div
                key={f.title}
                className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-md text-center"
              >
                <div className="flex justify-center mb-3 text-[#2B7DBC]">{f.icon}</div>
                <h3 className="font-semibold text-[#1f2937] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7280]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-16 px-4 bg-white border-t border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1f2937] mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                step: '1',
                icon: <Globe className="h-8 w-8 mx-auto text-[#2B7DBC]" />,
                title: 'Enter Your URL',
                desc: 'Type your website address in the scanner above.',
              },
              {
                step: '2',
                icon: <RefreshCw className="h-8 w-8 mx-auto text-[#2B7DBC]" />,
                title: 'We Scan It',
                desc: 'Our engine checks for malware, blacklists, SSL, and security headers.',
              },
              {
                step: '3',
                icon: <CheckCircle className="h-8 w-8 mx-auto text-[#2B7DBC]" />,
                title: 'Get Your Report',
                desc: 'View a detailed security report with actionable recommendations.',
              },
            ].map(item => (
              <div key={item.step}>
                <div className="w-10 h-10 rounded-full bg-[#EBF4FD] text-[#2B7DBC] font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                {item.icon}
                <h3 className="font-semibold text-[#1f2937] mt-3 mb-1">{item.title}</h3>
                <p className="text-sm text-[#6b7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1f2937] mb-10">Simple Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#1f2937]">Free</h3>
              <p className="text-3xl font-bold text-[#1f2937] mt-2">
                {formatCurrency(0)}<span className="text-base font-normal text-[#6b7280]">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[#6b7280]">
                {[
                  '5 scans/month',
                  '1 domain',
                  'Basic security report',
                  'Blacklist check',
                  'SSL analysis',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle
                      className="h-4 w-4 text-[#22c55e] flex-shrink-0"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 border border-[#2B7DBC] text-[#2B7DBC] font-semibold rounded-md hover:bg-primary-light transition-colors text-sm"
              >
                Get Started Free
              </Link>
            </div>

            
            <div className="bg-white border-2 border-[#2B7DBC] rounded-lg p-6 shadow-md relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2B7DBC] text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
              <h3 className="text-xl font-bold text-[#1f2937]">Pro</h3>
              <p className="text-3xl font-bold text-[#1f2937] mt-2">
                {formatCurrency(19.99)}<span className="text-base font-normal text-[#6b7280]">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[#6b7280]">
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
                    <CheckCircle
                      className="h-4 w-4 text-[#22c55e] flex-shrink-0"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 bg-[#2B7DBC] hover:bg-primary-dark text-white font-semibold rounded-md transition-colors text-sm"
              >
                Start Pro Trial
              </Link>
            </div>

            
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#1f2937]">Enterprise</h3>
              <p className="text-3xl font-bold text-[#1f2937] mt-2">
                {formatCurrency(99)}<span className="text-base font-normal text-[#6b7280]">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[#6b7280]">
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
                    <CheckCircle
                      className="h-4 w-4 text-[#22c55e] flex-shrink-0"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:sales@securescan.io"
                className="mt-6 block w-full text-center py-2.5 border border-[#e5e7eb] text-[#6b7280] font-semibold rounded-md hover:bg-bg-page transition-colors text-sm"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      
      <footer className="bg-white border-t border-[#e5e7eb] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#2B7DBC]" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#1f2937]">SecureScan</span>
          </div>
          <nav className="flex gap-6" aria-label="Footer navigation">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
              <a
                key={link}
                href="#"
                className="text-xs text-[#6b7280] hover:text-text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="text-xs text-[#6b7280]">
            © {new Date().getFullYear()} SecureScan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
