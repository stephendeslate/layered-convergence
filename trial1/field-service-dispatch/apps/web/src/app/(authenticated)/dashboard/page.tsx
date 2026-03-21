'use client';

import { useEffect, useState } from 'react';
import { useDispatchStore } from '@/stores/dispatch-store';
import { useGpsTracking } from '@/hooks/use-gps';
import { KanbanBoard } from '@/components/dispatch/kanban-board';
import { TechnicianListPanel } from '@/components/dispatch/technician-list-panel';
import { MapView } from '@/components/map/map-view';
import { TechnicianMarker } from '@/components/map/technician-marker';
import { WorkOrderMarker } from '@/components/map/work-order-marker';
import { RoutePolyline } from '@/components/map/route-polyline';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WorkOrderStatus } from '@fsd/shared';

export default function DashboardPage() {
  const {
    date,
    setDate,
    workOrders,
    technicians,
    selectedTechnicianId,
    selectedWorkOrderId,
    selectWorkOrder,
    selectTechnician,
    loadDispatchData,
    updateTechnicianPosition,
  } = useDispatchStore();

  const [mobileTab, setMobileTab] = useState('map');

  useEffect(() => {
    loadDispatchData();
  }, [loadDispatchData]);

  // Listen for GPS updates
  useGpsTracking(updateTechnicianPosition);

  const navigateDate = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];

  const activeWorkOrders = workOrders.filter(
    (wo) => wo.status !== WorkOrderStatus.CANCELLED && wo.status !== WorkOrderStatus.PAID,
  );
  const unassignedCount = workOrders.filter((wo) => wo.status === WorkOrderStatus.UNASSIGNED).length;
  const inProgressCount = workOrders.filter(
    (wo) => wo.status === WorkOrderStatus.IN_PROGRESS || wo.status === WorkOrderStatus.ON_SITE,
  ).length;
  const completedCount = workOrders.filter((wo) => wo.status === WorkOrderStatus.COMPLETED).length;

  const selectedTech = selectedTechnicianId
    ? technicians.find((t) => t.id === selectedTechnicianId)
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Date bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Button>
          <span className="text-sm font-semibold text-gray-900 min-w-[160px] text-center">
            {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Button>
          {date !== today && (
            <Button variant="ghost" size="sm" onClick={() => setDate(today)}>
              Today
            </Button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
          <span>
            <strong className="text-gray-900">{workOrders.length}</strong> jobs
          </span>
          <span>
            <strong className="text-gray-900">{unassignedCount}</strong> unassigned
          </span>
          <span>
            <strong className="text-gray-900">{inProgressCount}</strong> in progress
          </span>
          <span>
            <strong className="text-gray-900">{completedCount}</strong> completed
          </span>
        </div>

        <Button variant="default" size="sm" className="hidden lg:flex">
          Optimize All Routes
        </Button>
      </div>

      {/* Desktop: Split view */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left sidebar: Technicians */}
        <div className="w-56 border-r border-gray-200 bg-white overflow-y-auto p-3">
          <TechnicianListPanel />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView>
            {technicians.map((tech) => (
              <TechnicianMarker
                key={tech.id}
                technician={tech}
                onClick={selectTechnician}
              />
            ))}
            {activeWorkOrders.map((wo) => (
              <WorkOrderMarker
                key={wo.id}
                workOrder={wo}
                onClick={selectWorkOrder}
              />
            ))}
            {selectedTech?.route?.stops && (
              <RoutePolyline
                stops={selectedTech.route.stops}
                color={selectedTech.color}
              />
            )}
          </MapView>
        </div>

        {/* Kanban board */}
        <div className="w-[50%] xl:w-[55%] border-l border-gray-200 bg-gray-50 overflow-hidden p-4">
          <KanbanBoard />
        </div>
      </div>

      {/* Tablet/Mobile: Tabbed view */}
      <div className="lg:hidden flex-1 overflow-hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="flex-1 overflow-hidden">
            <MapView>
              {technicians.map((tech) => (
                <TechnicianMarker
                  key={tech.id}
                  technician={tech}
                  onClick={selectTechnician}
                />
              ))}
              {activeWorkOrders.map((wo) => (
                <WorkOrderMarker key={wo.id} workOrder={wo} onClick={selectWorkOrder} />
              ))}
            </MapView>
          </TabsContent>
          <TabsContent value="board" className="flex-1 overflow-auto px-4">
            <KanbanBoard />
          </TabsContent>
          <TabsContent value="list" className="flex-1 overflow-auto px-4">
            <div className="space-y-2 py-4">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm">{wo.referenceNumber}</div>
                    <div className="text-xs text-gray-500">{wo.address}</div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{wo.status}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
