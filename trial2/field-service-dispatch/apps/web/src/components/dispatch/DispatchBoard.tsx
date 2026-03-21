'use client';

import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import DynamicMap from '../map/DynamicMap';
import type { MapMarker } from '../map/DynamicMap';
import { apiFetch } from '@/lib/api';
import type { DispatchBoard as DispatchBoardType, WorkOrderSummary, TechnicianSummary } from '@field-service/shared';

const STATUS_COLUMNS = [
  { status: 'UNASSIGNED', title: 'Unassigned', color: '#9e9e9e' },
  { status: 'ASSIGNED', title: 'Assigned', color: '#42a5f5' },
  { status: 'EN_ROUTE', title: 'En Route', color: '#ffa726' },
  { status: 'ON_SITE', title: 'On Site', color: '#ab47bc' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: '#26a69a' },
  { status: 'COMPLETED', title: 'Completed', color: '#66bb6a' },
];

const SKILL_COLORS: Record<string, string> = {
  plumbing: 'blue',
  hvac: 'red',
  electrical: 'gold',
  default: 'green',
};

const PRIORITY_MARKER_COLORS: Record<string, string> = {
  URGENT: 'red',
  HIGH: 'orange',
  NORMAL: 'blue',
  LOW: 'green',
};

export default function DispatchBoard() {
  const [board, setBoard] = useState<DispatchBoardType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    try {
      const data = await apiFetch<DispatchBoardType>('/dispatch/board');
      setBoard(data);
    } catch (err) {
      console.error('Failed to fetch dispatch board:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 15000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const workOrderId = active.id as string;
    const newStatus = over.id as string;
    const workOrder = board.workOrders.find(wo => wo.id === workOrderId);
    if (!workOrder || workOrder.status === newStatus) return;

    try {
      await apiFetch(`/work-orders/${workOrderId}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus: newStatus }),
      });
      await fetchBoard();
    } catch (err) {
      console.error('Transition failed:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dispatch board...</div>;
  }

  if (!board) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Failed to load dispatch board</div>;
  }

  const techMarkers: MapMarker[] = board.technicians
    .filter(t => t.currentLat && t.currentLng)
    .map(t => ({
      id: `tech-${t.id}`,
      lat: t.currentLat!,
      lng: t.currentLng!,
      label: t.name,
      color: SKILL_COLORS[t.skills[0] || 'default'] || SKILL_COLORS.default,
      popupContent: `${t.name} - ${t.status} (${t.skills.join(', ')})`,
    }));

  const woMarkers: MapMarker[] = board.workOrders
    .filter(wo => wo.status !== 'COMPLETED' && wo.status !== 'INVOICED' && wo.status !== 'PAID')
    .map(wo => ({
      id: `wo-${wo.id}`,
      lat: wo.lat,
      lng: wo.lng,
      label: wo.title,
      color: PRIORITY_MARKER_COLORS[wo.priority] || 'blue',
      popupContent: `${wo.title} - ${wo.status}\n${wo.customerName}`,
    }));

  const allMarkers = [...techMarkers, ...woMarkers];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '12px 16px', background: '#1976d2', color: '#fff', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Dispatch Board</h2>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
          <span>Total: {board.stats.total}</span>
          <span>Unassigned: {board.stats.unassigned}</span>
          <span>Active: {board.stats.enRoute + board.stats.onSite + board.stats.inProgress}</span>
          <span>Completed: {board.stats.completed}</span>
        </div>
      </div>

      <div style={{ flex: '0 0 40%', position: 'relative' }}>
        <DynamicMap markers={allMarkers} height="100%" />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '12px', minHeight: '300px' }}>
            {STATUS_COLUMNS.map(col => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                color={col.color}
                workOrders={board.workOrders.filter(wo => wo.status === col.status)}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
