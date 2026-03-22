// TRACED:AE-FE-04 — Dashboards page with server action data fetching

import { fetchDashboards } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes } from '@analytics-engine/shared';

export default async function DashboardsPage() {
  const dashboards = await fetchDashboards();
  const estimatedDataSize = formatBytes(dashboards.length * 512);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
        <Badge variant="secondary">{estimatedDataSize} loaded</Badge>
      </div>

      {dashboards.length === 0 ? (
        <p className="text-muted-foreground">No dashboards found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((dashboard: { id: string; title: string; description?: string; isPublic: boolean }) => (
            <Card key={dashboard.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                  <Badge variant={dashboard.isPublic ? 'default' : 'secondary'}>
                    {dashboard.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {dashboard.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
