// TRACED:AE-FE-06 — Home page with dynamic import for DashboardStats
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const DashboardStats = dynamic(() => import('@/components/dashboard-stats'), {
  loading: () => (
    <div role="status" aria-busy="true" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-lg bg-[var(--muted)]" />
      ))}
    </div>
  ),
});

export default function HomePage(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Engine</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Multi-tenant analytics platform for data insights and monitoring
        </p>
      </div>

      <DashboardStats
        eventCount={1247}
        dashboardCount={23}
        pipelineCount={8}
        dataSize={1073741824}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/events">
              <Button variant="outline" className="w-full justify-start">
                View Events
              </Button>
            </Link>
            <Link href="/dashboards">
              <Button variant="outline" className="w-full justify-start">
                Manage Dashboards
              </Button>
            </Link>
            <Link href="/pipelines">
              <Button variant="outline" className="w-full justify-start">
                Monitor Pipelines
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">API Status</span>
                <span className="font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Database</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Pipelines</span>
                <span className="font-medium text-green-600">Running</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
