import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockDashboards = [
  { id: '1', title: 'Overview Dashboard', description: 'Main analytics overview', isPublic: true },
  { id: '2', title: 'Sales Dashboard', description: 'Revenue and conversion metrics', isPublic: false },
  { id: '3', title: 'User Engagement', description: 'User behavior analytics', isPublic: true },
];

export default function DashboardsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockDashboards.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                <Badge variant={dashboard.isPublic ? 'default' : 'secondary'}>
                  {dashboard.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
              {dashboard.description && (
                <CardDescription>{dashboard.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
