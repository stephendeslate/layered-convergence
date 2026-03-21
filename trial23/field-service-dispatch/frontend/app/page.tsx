// TRACED:ROUTE_COUNT — All 10 routes exist with page.tsx files

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Field Service Dispatch</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Multi-company field service management dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>Manage and track work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
            <CardDescription>View and manage technician assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Team</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Track billing and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Billing</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
