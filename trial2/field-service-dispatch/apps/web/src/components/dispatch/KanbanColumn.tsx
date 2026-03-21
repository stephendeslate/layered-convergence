'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { WorkOrderSummary } from '@field-service/shared';

interface KanbanColumnProps {
  status: string;
  title: string;
  workOrders: WorkOrderSummary[];
  color: string;
}

export function KanbanColumn({ status, title, workOrders, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: '280px',
        maxWidth: '320px',
        background: isOver ? '#e8f5e9' : '#f5f5f5',
        borderRadius: '8px',
        padding: '12px',
        borderTop: `4px solid ${color}`,
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{title}</h3>
        <span style={{
          background: color,
          color: '#fff',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {workOrders.length}
        </span>
      </div>
      <SortableContext items={workOrders.map(wo => wo.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '60px' }}>
          {workOrders.map((wo) => (
            <KanbanCard key={wo.id} workOrder={wo} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
