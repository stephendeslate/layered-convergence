import Link from 'next/link';
import { fetchDashboards } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function DashboardsPage() {
  let dashboards;
  try {
    dashboards = await fetchDashboards();
  } catch {
    dashboards = [];
  }

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <Button asChild>
          <Link href="/dashboards/create">Create Dashboard</Link>
        </Button>
      </div>
      {dashboards.length === 0 ? (
        <p className="text-muted-foreground">No dashboards yet. Create your first one.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/dashboards/${dashboard.id}`} className="hover:underline">
                    {dashboard.name}
                  </Link>
                </CardTitle>
                <CardDescription>{dashboard.description ?? 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={dashboard.isPublic ? 'default' : 'secondary'}>
                    {dashboard.isPublic ? 'Public' : 'Private'}
                  </Badge>
                  <Badge variant="outline">{dashboard.widgets.length} widgets</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
