'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, Globe, AlertTriangle, CreditCard, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/scans', icon: Shield, label: 'Scans' },
  { href: '/dashboard/domains', icon: Globe, label: 'Domains' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 flex-shrink-0 bg-bg-sidebar flex flex-col h-full"
      aria-label="Main navigation"
    >
      
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded"
        >
          <Shield className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="text-white font-bold text-lg">SecureScan</span>
        </Link>
      </div>

      
      <nav className="flex-1 py-4 overflow-y-auto">
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
                  className={`flex items-center gap-3 h-11 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-primary text-white border-l-4 border-l-white pl-2'
                      : 'text-text-sidebar hover:bg-white/[0.08]'
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
  );
}
