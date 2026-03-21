import type { WorkOrder, WorkOrderStatus } from '@/lib/types';
import { statusLabel } from '@/lib/utils';
import { WorkOrderCard } from './work-order-card';

const BOARD_COLUMNS: WorkOrderStatus[] = [
  'CREATED',
  'ASSIGNED',
  'EN_ROUTE',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
];

interface StatusBoardProps {
  workOrders: WorkOrder[];
}

export function StatusBoard({ workOrders }: StatusBoardProps) {
  const grouped = BOARD_COLUMNS.reduce<Record<string, WorkOrder[]>>((acc, status) => {
    acc[status] = workOrders.filter((wo) => wo.status === status);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {BOARD_COLUMNS.map((status) => (
        <div key={status} className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 py-1">
            <h3 className="text-sm font-semibold">{statusLabel(status)}</h3>
            <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
              {grouped[status].length}
            </span>
          </div>
          <div className="flex flex-col gap-2 min-h-[100px]">
            {grouped[status].map((wo) => (
              <WorkOrderCard key={wo.id} workOrder={wo} />
            ))}
            {grouped[status].length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No work orders
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
