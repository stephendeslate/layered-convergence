import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { PIPELINE_STATUSES, WIDGET_TYPES } from '@analytics-engine/shared';

// TRACED: AE-FC-NEXT-001 — Next.js home page with shared imports
export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Engine</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create and manage your analytics dashboards.
            </p>
            <Button asChild>
              <a href="/dashboard">View Dashboards</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Statuses: {PIPELINE_STATUSES.join(', ')}
            </p>
            <Button asChild>
              <a href="/pipelines">View Pipelines</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Types: {WIDGET_TYPES.join(', ')}
            </p>
            <Button asChild>
              <a href="/reports">View Reports</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
