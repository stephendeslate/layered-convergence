import { Suspense } from 'react';
import { fetchWorkOrder } from '@/lib/api';
import { TransitionButtons } from '@/components/work-orders/transition-buttons';
import { getStatusColor, formatDate } from '@/lib/utils';

async function WorkOrderDetail({ id }: { id: string }) {
  const workOrder = await fetchWorkOrder(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{workOrder.title}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workOrder.status)}`}>
          {workOrder.status}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Description</h2>
          <p className="mt-1">{workOrder.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Priority</h2>
            <p className="mt-1">{workOrder.priority}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Created</h2>
            <p className="mt-1">{formatDate(workOrder.createdAt)}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Customer</h2>
            <p className="mt-1">{workOrder.customer?.name ?? 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Technician</h2>
            <p className="mt-1">{workOrder.technician?.name ?? 'Unassigned'}</p>
          </div>
          {workOrder.completedAt && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Completed</h2>
              <p className="mt-1">{formatDate(workOrder.completedAt)}</p>
            </div>
          )}
        </div>
      </div>

      <TransitionButtons workOrderId={workOrder.id} currentStatus={workOrder.status} />

      <a href="/work-orders" className="inline-block text-blue-600 hover:underline">
        Back to Work Orders
      </a>
    </div>
  );
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
      <WorkOrderDetail id={id} />
    </Suspense>
  );
}
