import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { truncate } from '@analytics-engine/shared';
import { fetchDashboards } from '../../../../actions/dashboard-actions';

// TRACED: AE-CQ-TRUNC-003 — truncate used in dashboard page
export default async function DashboardPage() {
  const dashboards = await fetchDashboards();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((d: { id: string; name: string; description: string; status: string }) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle>{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                {truncate(d.description, 80)}
              </p>
              <Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {d.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
