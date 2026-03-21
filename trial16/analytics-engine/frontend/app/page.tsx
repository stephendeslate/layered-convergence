import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

async function DashboardOverview() {
  let dataSources = 0;
  let dashboards = 0;
  let pipelines = 0;

  try {
    const [ds, db, pl] = await Promise.all([
      ApiClient.getDataSources(),
      ApiClient.getDashboards(),
      ApiClient.getPipelines(),
    ]);
    dataSources = ds.length;
    dashboards = db.length;
    pipelines = pl.length;
  } catch {
    // Not authenticated or API unavailable — show zeros
  }

  const stats = [
    { label: 'Data Sources', value: dataSources, href: '/data-sources' },
    { label: 'Dashboards', value: dashboards, href: '/dashboards' },
    { label: 'Pipelines', value: pipelines, href: '/pipelines' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <a key={stat.label} href={stat.href}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`dash-skeleton-${i}`}
          className="h-32 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your analytics platform
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  );
}
