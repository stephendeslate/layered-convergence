'use client';

import { useSortable } from '@dnd-kit/sortable';
// CSS transform helper inline to avoid @dnd-kit/utilities dependency
const cssTransform = {
  toString(transform: { x: number; y: number; scaleX: number; scaleY: number } | null) {
    if (!transform) return undefined;
    return `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`;
  },
};
import type { WorkOrderDto } from '@fsd/shared';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants';
import { serviceTypeLabel, formatTime } from '@/lib/utils';
import Link from 'next/link';

interface KanbanCardProps {
  workOrder: WorkOrderDto;
}

export function KanbanCard({ workOrder }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workOrder.id, data: { workOrder } });

  const style = {
    transform: cssTransform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = PRIORITY_COLORS[workOrder.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between mb-2">
        <Link
          href={`/work-orders/${workOrder.id}`}
          className="text-sm font-semibold text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {workOrder.referenceNumber}
        </Link>
        <Badge className={`${priorityColor.bg} ${priorityColor.text} text-[10px]`}>
          {workOrder.priority}
        </Badge>
      </div>

      <div className="text-sm font-medium text-gray-900 mb-1">
        {serviceTypeLabel(workOrder.serviceType)}
      </div>

      <div className="text-xs text-gray-500 mb-2 truncate">{workOrder.address}</div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatTime(workOrder.scheduledStart)} - {formatTime(workOrder.scheduledEnd)}
        </span>
        {workOrder.technician && (
          <span className="text-gray-700 font-medium">
            {workOrder.technician.user.firstName} {workOrder.technician.user.lastName.charAt(0)}.
          </span>
        )}
      </div>

      {workOrder.customer && (
        <div className="text-xs text-gray-400 mt-1.5 truncate">
          {workOrder.customer.firstName} {workOrder.customer.lastName}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-1">
        Est: {workOrder.estimatedMinutes} min
      </div>
    </div>
  );
}
