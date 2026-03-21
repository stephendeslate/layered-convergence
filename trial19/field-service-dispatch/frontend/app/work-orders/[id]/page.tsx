import { fetchWorkOrder } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStatusBadgeVariant, formatStatus, formatDate } from '@/lib/utils';
import { TransitionForm } from './transition-form';

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workOrder = await fetchWorkOrder(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{workOrder.title}</h1>
        <Badge variant={getStatusBadgeVariant(workOrder.status)}>
          {formatStatus(workOrder.status)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Description</span>
              <p>{workOrder.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Priority</span>
              <p>{workOrder.priority}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Created</span>
              <p>{formatDate(workOrder.createdAt)}</p>
            </div>
            {workOrder.completedAt && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <p>{formatDate(workOrder.completedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & Technician</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workOrder.customer && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Customer</span>
                <p>{workOrder.customer.name}</p>
                <p className="text-sm text-muted-foreground">{workOrder.customer.address}</p>
              </div>
            )}
            {workOrder.technician && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Technician</span>
                <p>{workOrder.technician.name}</p>
                <p className="text-sm text-muted-foreground">{workOrder.technician.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <TransitionForm workOrderId={workOrder.id} currentStatus={workOrder.status} />
        </CardContent>
      </Card>
    </div>
  );
}
