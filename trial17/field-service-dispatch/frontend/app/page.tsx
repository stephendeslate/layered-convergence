import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWorkOrders, getTechnicians } from '@/lib/api';
import { StatusBoard } from '@/components/work-orders/status-board';

async function DashboardStats() {
  const [workOrders, technicians] = await Promise.all([
    getWorkOrders(),
    getTechnicians(),
  ]);

  const activeOrders = workOrders.filter(
    (wo) => !['CLOSED', 'CANCELLED'].includes(wo.status),
  );
  const availableTechs = technicians.filter(
    (t) => t.availability === 'AVAILABLE',
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{technicians.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{availableTechs.length}</p>
          </CardContent>
        </Card>
      </div>
      <StatusBoard workOrders={activeOrders} />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-slate-200 rounded-lg" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/work-orders/create">New Work Order</Link>
        </Button>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
