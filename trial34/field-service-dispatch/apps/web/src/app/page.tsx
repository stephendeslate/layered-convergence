import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { WORK_ORDER_STATUSES, PRIORITIES } from '@field-service-dispatch/shared';

// TRACED: FD-FC-NEXT-001 — Next.js home page with shared imports
export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Field Service Dispatch</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage and track field service work orders.
            </p>
            <Button asChild>
              <a href="/workorders">View Work Orders</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statuses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {WORK_ORDER_STATUSES.join(', ')}
            </p>
            <Button asChild>
              <a href="/technicians">View Technicians</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {PRIORITIES.join(', ')}
            </p>
            <Button asChild>
              <a href="/schedule">View Schedule</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
