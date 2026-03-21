import { WorkOrderCard } from './work-order-card';
import type { WorkOrder, WorkOrderStatus } from '@/lib/types';
import { statusLabel } from '@/lib/utils';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" role="region" aria-label="Work order status board">
      {BOARD_COLUMNS.map((status) => {
        const filtered = workOrders.filter((wo) => wo.status === status);
        return (
          <div key={status} className="space-y-2">
            <h3 className="font-semibold text-sm text-slate-700 uppercase tracking-wide">
              {statusLabel(status)} ({filtered.length})
            </h3>
            <div className="space-y-2" role="list" aria-label={`${statusLabel(status)} work orders`}>
              {filtered.map((wo) => (
                <div key={wo.id} role="listitem">
                  <WorkOrderCard workOrder={wo} />
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-slate-400 italic">No work orders</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
