'use client';

import { useEffect } from 'react';
import { apiFetch, getStoredToken } from '../../../../lib/api';

export default function OnboardingRefreshPage() {
  useEffect(() => {
    async function refresh() {
      try {
        const token = getStoredToken();
        const res = await apiFetch<{ url: string }>('/stripe/connect/refresh', { method: 'POST', token: token ?? undefined });
        window.location.href = res.url;
      } catch {
        window.location.href = '/provider';
      }
    }
    refresh();
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <p style={{ color: '#6b7280' }}>Refreshing onboarding link...</p>
    </main>
  );
}
