import { Suspense } from 'react';
import Link from 'next/link';
import { getWorkOrders } from '@/lib/api';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import { Button } from '@/components/ui/button';
import type { WorkOrderStatus } from '@/lib/types';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const STATUSES: WorkOrderStatus[] = [
  'CREATED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS',
  'ON_HOLD', 'COMPLETED', 'INVOICED', 'CLOSED', 'CANCELLED',
];

async function WorkOrderList({ status }: { status?: string }) {
  const workOrders = await getWorkOrders(status);

  if (workOrders.length === 0) {
    return <p className="text-slate-500">No work orders found.</p>;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Work orders">
      {workOrders.map((wo) => (
        <div key={wo.id} role="listitem">
          <WorkOrderCard workOrder={wo} />
        </div>
      ))}
    </div>
  );
}

export default async function WorkOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button asChild>
          <Link href="/work-orders/create">New Work Order</Link>
        </Button>
      </div>

      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Filter by status">
        <Link
          href="/work-orders"
          className={`px-3 py-1 rounded-md text-sm ${!status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/work-orders?status=${s}`}
            className={`px-3 py-1 rounded-md text-sm ${status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </nav>

      <Suspense fallback={<div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-lg" />)}</div>}>
        <WorkOrderList status={status} />
      </Suspense>
    </div>
  );
}
