import Link from 'next/link';
import type { WorkOrder } from '@/lib/types';
import { formatDate, statusLabel } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' | 'outline'> = {
  CREATED: 'secondary',
  ASSIGNED: 'info',
  EN_ROUTE: 'info',
  IN_PROGRESS: 'warning',
  ON_HOLD: 'destructive',
  COMPLETED: 'success',
  INVOICED: 'outline',
  PAID: 'success',
  CLOSED: 'default',
};

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  return (
    <Link href={`/work-orders/${workOrder.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{workOrder.title}</CardTitle>
            <Badge variant={STATUS_VARIANT[workOrder.status] ?? 'default'}>
              {statusLabel(workOrder.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {workOrder.description}
          </p>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Customer: {workOrder.customer?.name ?? 'Unassigned'}</span>
            <span>{formatDate(workOrder.createdAt)}</span>
          </div>
          {workOrder.technician && (
            <p className="text-xs text-muted-foreground mt-1">
              Technician: {workOrder.technician.name}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
