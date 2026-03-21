import type { WorkOrder } from '@/lib/types';
import { getStatusColor, formatDate } from '@/lib/utils';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  return (
    <a
      href={`/work-orders/${workOrder.id}`}
      className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="font-semibold text-lg">{workOrder.title}</h2>
          <p className="text-sm text-gray-600 line-clamp-2">{workOrder.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Customer: {workOrder.customer?.name ?? 'N/A'}</span>
            <span>Tech: {workOrder.technician?.name ?? 'Unassigned'}</span>
            <span>Priority: {workOrder.priority}</span>
          </div>
          <p className="text-xs text-gray-400">{formatDate(workOrder.createdAt)}</p>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}
        >
          {workOrder.status}
        </span>
      </div>
    </a>
  );
}
