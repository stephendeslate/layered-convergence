// TRACED: FD-HOME-PAGE
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { APP_VERSION } from '@field-service-dispatch/shared';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Field Service Dispatch</h1>
      <p className="text-[var(--muted-foreground)]">
        Manage work orders, technicians, schedules, and service areas.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and manage service requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and assign field technicians</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Plan and track appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Define coverage zones</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        Version {APP_VERSION}
      </p>
    </div>
  );
}
