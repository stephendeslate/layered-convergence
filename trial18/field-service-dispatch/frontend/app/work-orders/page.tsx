import { Suspense } from 'react';
import { fetchWorkOrders } from '@/lib/api';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import { StatusBoard } from '@/components/work-orders/status-board';

async function WorkOrdersList() {
  const workOrders = await fetchWorkOrders();

  return (
    <div className="space-y-8">
      <StatusBoard workOrders={workOrders} />
      <div className="grid gap-4">
        {workOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No work orders yet.</p>
        ) : (
          workOrders.map((wo) => <WorkOrderCard key={wo.id} workOrder={wo} />)
        )}
      </div>
    </div>
  );
}

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <a
          href="/work-orders/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Work Order
        </a>
      </div>
      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
        <WorkOrdersList />
      </Suspense>
    </div>
  );
}
