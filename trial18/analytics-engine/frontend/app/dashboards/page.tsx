import { Suspense } from 'react';
import Link from 'next/link';
import { fetchDashboards } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function DashboardList() {
  const dashboards = await fetchDashboards();

  if (dashboards.length === 0) {
    return <p className="text-muted-foreground">No dashboards yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dashboards.map((d) => (
        <Link key={d.id} href={`/dashboards/${d.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{d.name}</CardTitle>
                {d.isPublic && <Badge>Public</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
              <p className="text-xs text-muted-foreground mt-2">{d.widgets.length} widgets</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboards</h1>
      <Suspense fallback={<div aria-busy="true">Loading dashboards...</div>}>
        <DashboardList />
      </Suspense>
    </div>
  );
}
