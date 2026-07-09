'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);
  const setUser = useAuthStore(s => s.setUser);

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    staleTime: 30_000,
    enabled: !!accessToken,
  });

  const profile = meQuery.data ?? user;

  const [name, setName] = useState(profile?.name ?? '');
  const [nameError, setNameError] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(profile?.notify_email ?? true);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setNotifyEmail(profile.notify_email ?? true);
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; notify_email: boolean }) => authService.updateMe(data),
    retry: false,
    onSuccess: updated => {
      setNameError('');
      setUser(updated);
      toast.success('Settings saved');
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setNameError(data?.name?.[0] ?? 'Failed to save settings');
    },
  });

  if (!profile && meQuery.isLoading) {
    return (
      <div className="space-y-6 max-w-xl">
        <PageHeader title="Settings" />
        <div className="h-48 bg-bg-elevated rounded-lg motion-safe:animate-pulse" />
      </div>
    );
  }

  if (meQuery.isError && !profile) {
    return (
      <div className="space-y-6 max-w-xl">
        <PageHeader title="Settings" />
        <p className="text-sm text-[#dc2626]" role="alert">
          Failed to load settings.{' '}
          <button
            onClick={() => meQuery.refetch()}
            className="underline hover:no-underline"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Settings" />

      {meQuery.isError && profile && (
        <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2" role="status">
          Could not refresh profile from server. Showing saved account info.
        </p>
      )}

      <Card>
        <h2 className="font-semibold text-text-primary mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <Input
              label="Full Name"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setNameError('');
              }}
              aria-label="Full name"
            />
            {nameError && (
              <p className="mt-1 text-xs text-[#dc2626]" role="alert">{nameError}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">Email</p>
            <p className="text-sm text-text-secondary font-mono">{profile?.email}</p>
          </div>
          {/* <div className="flex items-center gap-3">
            <input
              id="notify-email"
              type="checkbox"
              checked={notifyEmail}
              onChange={e => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-[#d1d5db] text-[#2B7DBC] focus:ring-[#2B7DBC]"
            />
            <label htmlFor="notify-email" className="text-sm text-text-primary">
              Receive email notifications for alerts
            </label>
          </div> */}
          <Button
            size="md"
            loading={updateMutation.isPending}
            onClick={() => updateMutation.mutate({ name, notify_email: notifyEmail })}
            disabled={!name.trim()}
          >
            Save Changes
          </Button>
        </div>
      </Card>
{/* 
      <Card>
        <h2 className="font-semibold text-text-primary mb-2">Account</h2>
        <p className="text-sm text-text-secondary mb-4">
          Role:{' '}
          <span className="font-medium text-text-primary capitalize">
            {profile?.role}
          </span>
        </p>
      </Card> */}
    </div>
  );
}
