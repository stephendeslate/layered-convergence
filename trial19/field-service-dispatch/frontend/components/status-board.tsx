import type { WorkOrder, WorkOrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStatusBadgeVariant, formatStatus } from '@/lib/utils';

const STATUS_ORDER: WorkOrderStatus[] = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'INVOICED',
];

interface StatusBoardProps {
  workOrders: WorkOrder[];
}

export function StatusBoard({ workOrders }: StatusBoardProps) {
  const grouped = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = workOrders.filter((wo) => wo.status === status);
      return acc;
    },
    {} as Record<WorkOrderStatus, WorkOrder[]>,
  );

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6" aria-live="polite">
      {STATUS_ORDER.map((status) => (
        <div key={status} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(status)}>{formatStatus(status)}</Badge>
            <span className="text-sm text-muted-foreground">({grouped[status].length})</span>
          </div>
          <div className="space-y-2">
            {grouped[status].map((wo) => (
              <Card key={wo.id}>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">
                    <a href={`/work-orders/${wo.id}`} className="hover:underline">
                      {wo.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-xs text-muted-foreground truncate">{wo.description}</p>
                  {wo.customer && (
                    <p className="text-xs text-muted-foreground mt-1">{wo.customer.name}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
