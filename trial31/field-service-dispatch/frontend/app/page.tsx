import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Field Service Dispatch</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Manage work orders, technician routes, and invoicing for field service operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create, assign, and track field service work orders.</p>
            <Link href="/work-orders">
              <Button>View Work Orders</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage billing and track payment status.</p>
            <Link href="/invoices">
              <Button variant="outline">View Invoices</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Plan and monitor technician dispatch routes.</p>
            <Link href="/routes">
              <Button variant="outline">View Routes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
