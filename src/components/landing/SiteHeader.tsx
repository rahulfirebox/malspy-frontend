'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, Shield, X } from 'lucide-react';

export const siteNavLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  const mobileMenu =
    menuOpen && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[90] bg-black/70 lg:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <nav
              id="mobile-nav"
              className="fixed left-0 right-0 top-14 sm:top-16 z-[100] lg:hidden border-b border-border bg-bg-page shadow-2xl shadow-black/40"
              aria-label="Mobile navigation"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                {siteNavLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-3 text-base font-medium text-text-primary hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border/50" />
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-base font-medium text-text-primary border border-white/15 hover:bg-white/5 transition-colors text-center sm:hidden"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-base font-semibold bg-primary hover:bg-primary-dark text-white text-center transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            </nav>
          </>,
          document.body,
        )
      : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-bg-page/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 relative flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 shrink-0">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
          </span>
          <span className="font-bold text-base sm:text-lg text-text-primary tracking-tight truncate">
            SecureScan
          </span>
        </Link>

        <nav
          className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8"
          aria-label="Main navigation"
        >
          {siteNavLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/login"
            className="text-sm font-medium text-text-primary border border-white/20 bg-transparent hover:bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors hidden sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors shadow-glow whitespace-nowrap"
          >
            <span className="sm:hidden">Sign Up</span>
            <span className="hidden sm:inline">Sign Up Free</span>
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-text-primary hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenu}
    </header>
  );
}
