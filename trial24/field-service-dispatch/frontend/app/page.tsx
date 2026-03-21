// [TRACED:UI-010] Dashboard page as root route with entity summary cards

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Manage service requests and track job status through the work order lifecycle.
            </p>
            <Link href="/work-orders">
              <Button>View Work Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Manage your field technicians and their assignments.
            </p>
            <Link href="/technicians">
              <Button>View Technicians</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Manage customer records and service history.
            </p>
            <Link href="/customers">
              <Button>View Customers</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Track billing and payment status for completed work.
            </p>
            <Link href="/invoices">
              <Button>View Invoices</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Plan and monitor technician routes for efficient dispatching.
            </p>
            <Link href="/routes">
              <Button>View Routes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GPS Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Real-time location tracking for field technicians.
            </p>
            <Link href="/gps-events">
              <Button>View GPS Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
