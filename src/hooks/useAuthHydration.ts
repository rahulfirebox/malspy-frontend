'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuthHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
