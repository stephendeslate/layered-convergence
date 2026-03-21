import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkOrder } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransitionButtons } from '@/components/work-orders/transition-buttons';
import { statusLabel, priorityLabel, formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

async function WorkOrderDetail({ id }: { id: string }) {
  let workOrder;
  try {
    workOrder = await getWorkOrder(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{workOrder.title}</h1>
        <div className="flex gap-2">
          <Badge aria-label={`Priority: ${priorityLabel(workOrder.priority)}`}>
            {priorityLabel(workOrder.priority)}
          </Badge>
          <Badge aria-label={`Status: ${statusLabel(workOrder.status)}`}>
            {statusLabel(workOrder.status)}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workOrder.description && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1">{workOrder.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500">Technician</dt>
              <dd className="mt-1">
                {workOrder.technician ? (
                  <Link href={`/technicians/${workOrder.technician.id}`} className="text-blue-600 hover:underline">
                    {workOrder.technician.name}
                  </Link>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Customer</dt>
              <dd className="mt-1">{workOrder.customer?.name || <span className="text-slate-400">None</span>}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Scheduled</dt>
              <dd className="mt-1">{formatDate(workOrder.scheduledAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Completed</dt>
              <dd className="mt-1">{formatDate(workOrder.completedAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="mt-1">{formatDate(workOrder.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransitionButtons workOrderId={workOrder.id} currentStatus={workOrder.status} />
        </CardContent>
      </Card>

      {workOrder.invoices && workOrder.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {workOrder.invoices.map((inv) => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <span>{inv.number}</span>
                  <span>${inv.total}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function WorkOrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 w-64 bg-slate-200 rounded" /><div className="h-48 bg-slate-200 rounded-lg" /></div>}>
      <WorkOrderDetail id={id} />
    </Suspense>
  );
}
