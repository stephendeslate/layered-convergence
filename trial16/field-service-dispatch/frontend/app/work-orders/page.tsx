import { Suspense } from 'react';
import Link from 'next/link';
import { getWorkOrders } from '@/lib/api';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import { Button } from '@/components/ui/button';
import type { WorkOrderStatus } from '@/lib/types';

interface WorkOrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

const ALL_STATUSES: WorkOrderStatus[] = [
  'CREATED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS',
  'ON_HOLD', 'COMPLETED', 'INVOICED', 'PAID', 'CLOSED',
];

async function WorkOrderList({ status }: { status?: WorkOrderStatus }) {
  const workOrders = await getWorkOrders(status);

  if (workOrders.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No work orders found{status ? ` with status "${status}"` : ''}.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workOrders.map((wo) => (
        <WorkOrderCard key={wo.id} workOrder={wo} />
      ))}
    </div>
  );
}

export default async function WorkOrdersPage({ searchParams }: WorkOrdersPageProps) {
  const params = await searchParams;
  const statusFilter = ALL_STATUSES.includes(params.status as WorkOrderStatus)
    ? (params.status as WorkOrderStatus)
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Link href="/work-orders/new">
          <Button>New Work Order</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Status filter">
        <Link href="/work-orders">
          <Button variant={!statusFilter ? 'default' : 'outline'} size="sm">
            All
          </Button>
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link key={s} href={`/work-orders?status=${encodeURIComponent(s)}`}>
            <Button variant={statusFilter === s ? 'default' : 'outline'} size="sm">
              {s.replace('_', ' ')}
            </Button>
          </Link>
        ))}
      </div>

      <Suspense fallback={<WorkOrderListSkeleton />}>
        <WorkOrderList status={statusFilter} />
      </Suspense>
    </div>
  );
}

function WorkOrderListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );
}
