import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CsrfInitializer } from '@/components/providers/CsrfInitializer';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { VersionMismatchBanner } from '@/components/ui/VersionMismatchBanner';
import { Toaster } from 'react-hot-toast';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

// 1. Initialize Inter
const jetBrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-inter', // Creates a CSS variable
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans', // Creates a CSS variable
});

export const metadata: Metadata = {
  title: 'SecureScan — Free Website Security Scanner',
  description:
    'Check your website for malware, blacklist status, SSL issues, and security vulnerabilities. Free website security scanner.',
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.className} ${plusJakartaSans.className}`}>
        <QueryProvider>
          <AuthProvider>
            <CsrfInitializer />
            <OfflineBanner />
            <VersionMismatchBanner />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                },
                success: {
                  style: {
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                  },
                  iconTheme: {
                    primary: 'var(--color-success)',
                    secondary: 'var(--color-bg-card)',
                  },
                },
                error: {
                  style: {
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                  },
                  iconTheme: {
                    primary: 'var(--color-danger)',
                    secondary: 'var(--color-bg-card)',
                  },
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
