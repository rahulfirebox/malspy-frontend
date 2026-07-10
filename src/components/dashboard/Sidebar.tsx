'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, Globe, AlertTriangle, CreditCard, Settings, X } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/scans', icon: Shield, label: 'Scans' },
  { href: '/dashboard/domains', icon: Globe, label: 'Domains' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (mobileOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
    return undefined;
  }, [mobileOpen]);

  const mobileBackdrop =
    mobileOpen && mounted
      ? createPortal(
          <button
            type="button"
            className="fixed inset-0 z-[90] bg-black/70 lg:hidden"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {mobileBackdrop}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] flex h-full w-64 max-w-[85vw] flex-col bg-bg-sidebar transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:w-60 lg:max-w-none lg:flex-shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Main navigation"
        aria-hidden={!mobileOpen ? undefined : false}
      >
        <div className="flex h-14 sm:h-16 items-center justify-between border-b border-white/10 px-4 lg:justify-start">
          <Link
            href="/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded min-w-0"
          >
            <Shield className="h-7 w-7 text-primary shrink-0" aria-hidden="true" />
            <span className="text-white font-bold text-lg truncate">SecureScan</span>
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-sidebar hover:bg-white/10 transition-colors"
            aria-label="Close menu"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul role="list" className="space-y-0.5 px-2">
            {navItems.map(item => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 h-11 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-primary text-white border-l-4 border-l-white pl-2'
                        : 'text-text-sidebar hover:bg-bg-card/[0.08]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
