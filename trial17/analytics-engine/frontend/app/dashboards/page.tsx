import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createDashboard } from '@/app/actions';

async function DashboardList() {
  const dashboards = await ApiClient.getDashboards();

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No dashboards yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first dashboard to start visualizing data
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <a key={dashboard.id} href={`/dashboards/${dashboard.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                {dashboard.isPublic && (
                  <Badge variant="secondary">Public</Badge>
                )}
              </div>
              {dashboard.description && (
                <CardDescription>{dashboard.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dashboard._count?.widgets ?? 0} widgets
              </p>
              <p className="text-xs text-muted-foreground">
                Created {new Date(dashboard.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}

function DashboardListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`db-skeleton-${i}`}
          className="h-40 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}

export default function DashboardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
          <p className="text-muted-foreground">
            Create and manage analytics dashboards
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Create Dashboard</h2>
        <form action={createDashboard} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dash-name">Name</Label>
              <Input id="dash-name" name="name" required placeholder="Sales Dashboard" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dash-description">Description</Label>
              <Input
                id="dash-description"
                name="description"
                placeholder="Overview of sales metrics"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dash-public"
              name="isPublic"
              value="true"
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="dash-public">Make public</Label>
          </div>
          <Button type="submit">Create Dashboard</Button>
        </form>
      </div>

      <Suspense fallback={<DashboardListSkeleton />}>
        <DashboardList />
      </Suspense>
    </div>
  );
}
