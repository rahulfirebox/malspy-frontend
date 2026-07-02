import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | SecureScan',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12"
    >
      {children}
    </main>
  );
}
