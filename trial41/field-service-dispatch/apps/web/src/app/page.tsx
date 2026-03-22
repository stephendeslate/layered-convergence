import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Field Service Dispatch</h1>
      <p className="text-[var(--muted-foreground)]">
        Manage your field service operations efficiently.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>Create and manage work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/work-orders">
              <Button>View Work Orders</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
            <CardDescription>Manage your field technicians</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/technicians">
              <Button>View Technicians</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
            <CardDescription>View and manage schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/schedules">
              <Button>View Schedules</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Areas</CardTitle>
            <CardDescription>Define coverage zones</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/service-areas">
              <Button>View Areas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
