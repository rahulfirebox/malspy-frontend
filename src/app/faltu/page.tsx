import React from 'react';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { FaltuHero } from './FaltuHero';

export default function FaltuPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-page text-text-primary">
      <SiteHeader />
      <FaltuHero />
      <SiteFooter />
    </div>
  );
}
