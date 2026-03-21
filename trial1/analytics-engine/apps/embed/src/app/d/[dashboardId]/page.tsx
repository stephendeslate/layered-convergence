'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { EmbedDashboard } from '@/components/dashboard/embed-dashboard';
import { fetchDashboard } from '@/lib/api-client';
import type { Dashboard } from '@analytics-engine/shared';

interface DashboardResponse {
  dashboard: Dashboard;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    cornerRadius: number;
    logoUrl: string | null;
  };
}

export default function EmbedPageWrapper() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6b7280', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}>
      <EmbedPage />
    </Suspense>
  );
}

function EmbedPage() {
  const params = useParams<{ dashboardId: string }>();
  const searchParams = useSearchParams();
  const apiKey = searchParams.get('key') ?? undefined;

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard(params.dashboardId, apiKey)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setLoading(false);
      });
  }, [params.dashboardId, apiKey]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid #e5e7eb',
            borderTopColor: '#6b7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 32,
            textAlign: 'center',
            maxWidth: 400,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
            Dashboard Unavailable
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            {error || 'This dashboard could not be loaded. It may not be published or the embed may be disabled.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <EmbedDashboard
      dashboard={data.dashboard}
      theme={data.theme}
      apiKey={apiKey}
    />
  );
}
