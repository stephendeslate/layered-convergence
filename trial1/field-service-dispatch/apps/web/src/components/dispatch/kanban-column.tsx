'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { WorkOrderDto } from '@fsd/shared';
import type { WorkOrderStatus } from '@fsd/shared';
import { STATUS_COLORS } from '@/lib/constants';
import { KanbanCard } from './kanban-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  status: WorkOrderStatus;
  workOrders: WorkOrderDto[];
}

const STATUS_LABELS: Record<string, string> = {
  UNASSIGNED: 'Unassigned',
  ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route',
  ON_SITE: 'On Site',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  INVOICED: 'Invoiced',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

export function KanbanColumn({ status, workOrders }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = STATUS_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] max-w-[280px] rounded-lg border ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
      } transition-colors`}
    >
      <div className={`px-3 py-2.5 border-b border-gray-200 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors.bg.replace('100', '500')}`} />
            <span className="text-sm font-semibold text-gray-700">
              {STATUS_LABELS[status] || status}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
            {workOrders.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
        <SortableContext items={workOrders.map((wo) => wo.id)} strategy={verticalListSortingStrategy}>
          {workOrders.map((wo) => (
            <div key={wo.id} className="mb-2">
              <KanbanCard workOrder={wo} />
            </div>
          ))}
          {workOrders.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-8">
              No work orders
            </div>
          )}
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
