import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CsrfInitializer } from '@/components/providers/CsrfInitializer';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { VersionMismatchBanner } from '@/components/ui/VersionMismatchBanner';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'SecureScan — Free Website Security Scanner',
  description:
    'Check your website for malware, blacklist status, SSL issues, and security vulnerabilities. Free website security scanner.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
                  background: 'var(--color-text-primary)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
