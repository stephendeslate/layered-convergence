import type { WorkOrder, WorkOrderStatus } from '@/lib/types';
import { getStatusColor } from '@/lib/utils';

interface StatusBoardProps {
  workOrders: WorkOrder[];
}

const STATUSES: WorkOrderStatus[] = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'INVOICED',
  'CANCELLED',
];

export function StatusBoard({ workOrders }: StatusBoardProps) {
  const counts = STATUSES.reduce(
    (acc, status) => {
      acc[status] = workOrders.filter((wo) => wo.status === status).length;
      return acc;
    },
    {} as Record<WorkOrderStatus, number>,
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {STATUSES.map((status) => (
        <div
          key={status}
          className="bg-white rounded-lg shadow p-3 text-center"
        >
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
          >
            {status.replace('_', ' ')}
          </span>
          <p className="text-2xl font-bold mt-1">{counts[status]}</p>
        </div>
      ))}
    </div>
  );
}
