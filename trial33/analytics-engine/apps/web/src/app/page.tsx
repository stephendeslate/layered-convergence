import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { formatDate } from '@analytics-engine/shared';

// TRACED: AE-REQ-MT-001 — Home page with shared formatDate
export default function HomePage() {
  const today = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Analytics Engine</h1>
      <p className="text-muted-foreground">Today is {today}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and manage analytics dashboards.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Monitor data pipeline runs and status.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Schedule and view analytical reports.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
