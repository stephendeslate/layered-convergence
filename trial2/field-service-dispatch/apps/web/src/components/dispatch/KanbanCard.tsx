'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkOrderSummary } from '@field-service/shared';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#66bb6a',
  NORMAL: '#42a5f5',
  HIGH: '#ffa726',
  URGENT: '#ef5350',
};

interface KanbanCardProps {
  workOrder: WorkOrderSummary;
}

export function KanbanCard({ workOrder }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workOrder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: '#fff',
    borderRadius: '6px',
    padding: '10px 12px',
    boxShadow: isDragging
      ? '0 4px 12px rgba(0,0,0,0.15)'
      : '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'grab',
    borderLeft: `3px solid ${PRIORITY_COLORS[workOrder.priority] || '#999'}`,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
        {workOrder.title}
      </div>
      <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
        {workOrder.customerName}
      </div>
      <div style={{ fontSize: '11px', color: '#888' }}>
        {workOrder.address}
      </div>
      {workOrder.technicianName && (
        <div style={{ fontSize: '11px', color: '#1976d2', marginTop: '4px' }}>
          {workOrder.technicianName}
        </div>
      )}
      {workOrder.scheduledAt && (
        <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
          {new Date(workOrder.scheduledAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
