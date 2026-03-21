import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Field Service Dispatch</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Manage work orders, technician schedules, and field service operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Track and manage service requests from creation through completion.</p>
            <Link href="/work-orders">
              <Button>View Work Orders</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage technician availability and schedule field assignments.</p>
            <Link href="/schedules">
              <Button variant="outline">View Schedules</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
