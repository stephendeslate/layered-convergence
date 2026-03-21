'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getStoredToken } from '../../../../lib/api';

export default function OnboardingReturnPage() {
  const [status, setStatus] = useState<string>('Checking account status...');

  useEffect(() => {
    async function check() {
      try {
        const token = getStoredToken();
        const res = await apiFetch<{ onboardingStatus: string }>('/stripe/connect/status', { token: token ?? undefined });
        if (res.onboardingStatus === 'ACTIVE') {
          setStatus('Your Stripe Connect account is now active! You can receive payments.');
        } else {
          setStatus(`Account status: ${res.onboardingStatus}. You may need to complete additional verification steps.`);
        }
      } catch {
        setStatus('Could not verify account status. Please check back later.');
      }
    }
    check();
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Stripe Connect Onboarding</h1>
      <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '2rem' }}>{status}</p>
      <a href="/provider" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>
        Back to Dashboard
      </a>
    </main>
  );
}
