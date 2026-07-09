'use client';

import React, { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, org, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // still clear local session
    } finally {
      logout();
      router.push('/login');
    }
  }

  return (
    <>
      <header className="h-14 sm:h-16 bg-bg-card border-b border-border flex items-center justify-between gap-3 px-4 sm:px-6 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-page transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            {org && (
              <p className="text-sm font-semibold text-text-primary truncate">{org.name}</p>
            )}
            {org && (
              <p className="text-xs text-text-secondary capitalize truncate">
                {org.plan ?? 'free'} plan
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden md:block min-w-0 max-w-[12rem]">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-md text-text-secondary hover:bg-bg-page focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <Modal
        open={showLogoutConfirm}
        onClose={() => !isLoggingOut && setShowLogoutConfirm(false)}
        title="Sign Out"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to sign out of your account?
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            size="md"
            disabled={isLoggingOut}
            onClick={() => setShowLogoutConfirm(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={isLoggingOut}
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </div>
      </Modal>
    </>
  );
}
