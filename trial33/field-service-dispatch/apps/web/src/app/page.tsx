import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { formatDate } from '@field-service-dispatch/shared';

// TRACED: FD-REQ-MT-001 — Home page with shared formatDate
export default function HomePage() {
  const today = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Field Service Dispatch</h1>
      <p className="text-muted-foreground">Today is {today}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dispatch</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dispatch board and work order assignment.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage technician profiles and availability.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and track work orders.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
