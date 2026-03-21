// TRACED: AE-UI-DASH-001 — Dashboards list page
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { formatBytes } from '@analytics-engine/shared';

export default function DashboardsPage() {
  const dashboards = [
    { id: '1', name: 'Revenue Overview', widgets: 6, dataSize: formatBytes(2097152) },
    { id: '2', name: 'User Analytics', widgets: 4, dataSize: formatBytes(1048576) },
    { id: '3', name: 'Performance Metrics', widgets: 8, dataSize: formatBytes(4194304) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <Button>Create Dashboard</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <CardTitle>{dashboard.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{dashboard.widgets} widgets</Badge>
                <Badge variant="outline">{dashboard.dataSize}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
