'use client';

import React, { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const { user, org, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      
    } finally {
      logout();
      router.push('/login');
    }
  }

  return (
    <>
      <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-6">
      <div>
        {org && <p className="text-sm font-semibold text-text-primary">{org.name}</p>}
        {org && <p className="text-xs text-text-secondary capitalize">{org.plan ?? 'free'} plan</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-md text-text-secondary hover:bg-bg-page focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 rounded-md text-text-secondary hover:bg-bg-page focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
      <div className="flex gap-3 justify-end">
        <Button
          variant="ghost"
          size="md"
          disabled={isLoggingOut}
          onClick={() => setShowLogoutConfirm(false)}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="md"
          loading={isLoggingOut}
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </div>
    </Modal>
    </>
  );
}
