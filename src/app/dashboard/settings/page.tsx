'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const userId = user?.id;

  const meQuery = useQuery({
    queryKey: ['me', userId],
    queryFn: () => authService.getMe(),
    staleTime: 30_000,
    enabled: !!userId,
  });

  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);

  useEffect(() => {
    if (meQuery.data) {
      setName(meQuery.data.name ?? '');
      setNotifyEmail(meQuery.data.notify_email ?? true);
    }
  }, [meQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; notify_email: boolean }) => authService.updateMe(data),
    retry: false,
    onSuccess: () => {
      setNameError('');
      toast.success('Settings saved');
      void qc.invalidateQueries({ queryKey: ['me', userId] });
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setNameError(data?.name?.[0] ?? 'Failed to save settings');
    },
  });

  if (meQuery.isPending && !meQuery.data) {
    return (
      <div className="space-y-6 max-w-xl">
        <h1 className="text-xl font-bold text-[#1f2937]">Settings</h1>
        <div className="h-48 bg-[#f4f6f8] rounded-lg motion-safe:animate-pulse" />
      </div>
    );
  }

  if (meQuery.isError) {
    return (
      <div className="space-y-6 max-w-xl">
        <h1 className="text-xl font-bold text-[#1f2937]">Settings</h1>
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
      <h1 className="text-xl font-bold text-[#1f2937]">Settings</h1>

      <Card>
        <h2 className="font-semibold text-[#1f2937] mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <Input
              label="Full Name"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(''); }}
              aria-label="Full name"
            />
            {nameError && (
              <p className="mt-1 text-xs text-[#dc2626]" role="alert">{nameError}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1f2937] mb-1">Email</p>
            <p className="text-sm text-[#6b7280] font-mono">{meQuery.data?.email ?? user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="notify-email"
              type="checkbox"
              checked={notifyEmail}
              onChange={e => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-[#d1d5db] text-[#2B7DBC] focus:ring-[#2B7DBC]"
            />
            <label htmlFor="notify-email" className="text-sm text-[#1f2937]">
              Receive email notifications for alerts
            </label>
          </div>
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

      <Card>
        <h2 className="font-semibold text-[#1f2937] mb-2">Account</h2>
        <p className="text-sm text-[#6b7280] mb-4">
          Role:{' '}
          <span className="font-medium text-[#1f2937] capitalize">
            {meQuery.data?.role ?? user?.role}
          </span>
        </p>
      </Card>
    </div>
  );
}
