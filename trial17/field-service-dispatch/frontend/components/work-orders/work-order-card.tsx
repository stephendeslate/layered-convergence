import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusLabel, priorityLabel, formatDate } from '@/lib/utils';
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '@/lib/types';

function statusVariant(status: WorkOrderStatus) {
  const map: Record<WorkOrderStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'> = {
    CREATED: 'secondary',
    ASSIGNED: 'default',
    EN_ROUTE: 'warning',
    IN_PROGRESS: 'warning',
    ON_HOLD: 'outline',
    COMPLETED: 'success',
    INVOICED: 'success',
    CLOSED: 'secondary',
    CANCELLED: 'destructive',
  };
  return map[status];
}

function priorityVariant(priority: WorkOrderPriority) {
  const map: Record<WorkOrderPriority, 'default' | 'secondary' | 'destructive' | 'warning'> = {
    LOW: 'secondary',
    MEDIUM: 'default',
    HIGH: 'warning',
    URGENT: 'destructive',
  };
  return map[priority];
}

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            <Link href={`/work-orders/${workOrder.id}`} className="hover:underline">
              {workOrder.title}
            </Link>
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={priorityVariant(workOrder.priority)} aria-label={`Priority: ${priorityLabel(workOrder.priority)}`}>
              {priorityLabel(workOrder.priority)}
            </Badge>
            <Badge variant={statusVariant(workOrder.status)} aria-label={`Status: ${statusLabel(workOrder.status)}`}>
              {statusLabel(workOrder.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {workOrder.description && (
          <p className="text-sm text-slate-600 mb-2">{workOrder.description}</p>
        )}
        <div className="flex gap-4 text-sm text-slate-500">
          {workOrder.technician && (
            <span>Technician: {workOrder.technician.name}</span>
          )}
          {workOrder.customer && (
            <span>Customer: {workOrder.customer.name}</span>
          )}
          {workOrder.scheduledAt && (
            <span>Scheduled: {formatDate(workOrder.scheduledAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
