'use client';

import { useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import type { WorkOrderDto } from '@fsd/shared';
import { WorkOrderStatus, WORK_ORDER_TRANSITIONS } from '@fsd/shared';
import { KANBAN_COLUMNS } from '@/lib/constants';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { useDispatchStore } from '@/stores/dispatch-store';

export function KanbanBoard() {
  const { workOrders, updateWorkOrderStatus, moveWorkOrder } = useDispatchStore();
  const [activeWO, setActiveWO] = useState<WorkOrderDto | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const groupedWorkOrders = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = workOrders.filter((wo) => wo.status === status);
      return acc;
    },
    {} as Record<WorkOrderStatus, WorkOrderDto[]>,
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const wo = workOrders.find((w) => w.id === event.active.id);
      setActiveWO(wo || null);
    },
    [workOrders],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveWO(null);
      const { active, over } = event;
      if (!over) return;

      const workOrderId = active.id as string;
      const wo = workOrders.find((w) => w.id === workOrderId);
      if (!wo) return;

      // Check if dropped on a column (status)
      const newStatus = over.id as WorkOrderStatus;
      if (!KANBAN_COLUMNS.includes(newStatus)) return;
      if (newStatus === wo.status) return;

      // Validate transition
      const allowed = WORK_ORDER_TRANSITIONS[wo.status];
      if (!allowed.includes(newStatus)) {
        return; // Invalid transition
      }

      // Optimistic update
      moveWorkOrder(workOrderId, newStatus);

      try {
        await updateWorkOrderStatus(workOrderId, newStatus);
      } catch {
        // Revert on error
        moveWorkOrder(workOrderId, wo.status);
      }
    },
    [workOrders, moveWorkOrder, updateWorkOrderStatus],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 h-full">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            workOrders={groupedWorkOrders[status] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeWO ? (
          <div className="rotate-2 scale-105">
            <KanbanCard workOrder={activeWO} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
