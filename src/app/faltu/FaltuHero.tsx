'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Shield } from 'lucide-react';
import { stripLottieBackground } from '@/lib/lottieUtils';
import { ScanInput } from '@/components/scan/ScanInput';

export function FaltuHero() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/lottifile/lottie_transparent.json')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setAnimationData(stripLottieBackground(data));
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[center_40%] sm:bg-[60%_45%] lg:bg-[right_center]"
        style={{ backgroundImage: "url('/image/hero-background.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-page/85 via-bg-page/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-page/25 via-transparent to-bg-page pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12">
          <span className="inline-flex max-w-[min(100%,20rem)] sm:max-w-none items-center justify-center gap-2 rounded-full border border-accent-green/35 bg-accent-green/10 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-accent-green mb-5 sm:mb-6 leading-snug">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            100% Free • No Credit Card Required
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight tracking-tight text-text-primary mb-4 sm:mb-5 px-1">
            Free Website Security Scanner
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed px-1">
            Check for malware, blacklist status, and security vulnerabilities instantly, for free.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-8 lg:gap-6 xl:gap-10">
          <div className="w-full lg:flex-1 lg:max-w-xl xl:max-w-2xl flex justify-center lg:justify-start">
            <ScanInput variant="dark" />
          </div>

          <div className="flex justify-center lg:justify-end lg:flex-1 items-center">
            {animationData ? (
              <div
                className="w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px] xl:max-w-[380px] pointer-events-none select-none bg-transparent"
                aria-hidden="true"
              >
                <Lottie
                  animationData={animationData}
                  loop
                  className="w-full h-auto bg-transparent [&_svg]:!bg-transparent"
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid meet', clearCanvas: true }}
                />
              </div>
            ) : (
              <div className="w-full max-w-[300px] aspect-[750/476] bg-transparent" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
