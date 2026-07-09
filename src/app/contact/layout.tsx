import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact SecureScan for support, sales, and general inquiries.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
