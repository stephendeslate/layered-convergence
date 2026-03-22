// TRACED:AE-FE-03 — Home page with dynamic DashboardStats import

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateText } from '@analytics-engine/shared';

const DashboardStats = dynamic(() => import('@/components/dashboard-stats'), {
  loading: () => <div role="status" aria-busy="true">Loading statistics...</div>,
});

export default function HomePage() {
  const welcomeMessage = truncateText(
    'Welcome to the Analytics Engine platform for data-driven insights',
    60,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage dashboards, pipelines, and reports across your organization.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create and manage analytics dashboards with real-time data visualizations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure automated data processing pipelines with scheduling.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate and export detailed analytical reports in multiple formats.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
