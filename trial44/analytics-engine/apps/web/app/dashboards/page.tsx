'use client';

import { useEffect, useState } from 'react';
import { fetchDashboards } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// TRACED:AE-UI-006
interface Dashboard {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token') ?? '';
      const tenantId = localStorage.getItem('tenantId') ?? '';
      const result = await fetchDashboards(token, tenantId);

      if ('error' in result) {
        setError(result.error);
      } else {
        setDashboards(result.data ?? result);
      }
      setLoading(false);
    }

    void load();
  }, []);

  if (loading) {
    return <p>Loading dashboards...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
        <p className="text-[var(--muted-foreground)]">Manage your analytics dashboards</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {dashboards.length === 0 && !error && (
        <p className="text-[var(--muted-foreground)]">No dashboards found. Create one to get started.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <CardTitle>{dashboard.name}</CardTitle>
              <CardDescription>
                Created {new Date(dashboard.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{dashboard.tenantId}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
