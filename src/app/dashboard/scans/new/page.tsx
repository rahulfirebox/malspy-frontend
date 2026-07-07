'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewScanRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/scans?new=1');
  }, [router]);

  return null;
}
