import { Suspense } from 'react';
import Link from 'next/link';
import { getWorkOrder } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransitionButtons } from '@/components/work-orders/transition-buttons';
import { formatDate, statusLabel, priorityLabel } from '@/lib/utils';

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function WorkOrderDetail({ id }: { id: string }) {
  const workOrder = await getWorkOrder(id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/work-orders" className="text-sm text-muted-foreground hover:text-foreground">
          Work Orders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{workOrder.title}</span>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{workOrder.title}</CardTitle>
            <Badge>{statusLabel(workOrder.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="mt-1">{workOrder.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
              <p className="mt-1">{priorityLabel(workOrder.priority)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1">{formatDate(workOrder.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
              <p className="mt-1">{workOrder.customer?.name ?? 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Technician</h3>
              <p className="mt-1">{workOrder.technician?.name ?? 'Unassigned'}</p>
            </div>
            {workOrder.scheduledAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Scheduled</h3>
                <p className="mt-1">{formatDate(workOrder.scheduledAt)}</p>
              </div>
            )}
            {workOrder.completedAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                <p className="mt-1">{formatDate(workOrder.completedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transitions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransitionButtons
            workOrderId={workOrder.id}
            currentStatus={workOrder.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function WorkOrderDetailPage({ params }: WorkOrderDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<WorkOrderDetailSkeleton />}>
      <WorkOrderDetail id={id} />
    </Suspense>
  );
}

function WorkOrderDetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-4 border rounded-lg p-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
