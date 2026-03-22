// TRACED: FD-MON-010 — Dashboard page displaying health and metrics
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Field Service Dispatch overview and system health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <CardDescription>Active and pending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <CardDescription>Available workforce</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Schedules</CardTitle>
            <CardDescription>Today&apos;s assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CardDescription>API status</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Checking...</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
