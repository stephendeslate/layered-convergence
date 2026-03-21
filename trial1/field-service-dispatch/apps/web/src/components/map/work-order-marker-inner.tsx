'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { WorkOrderDto } from '@fsd/shared';
import { PRIORITY_MAP_COLORS } from '@/lib/constants';
import { serviceTypeLabel, formatTime } from '@/lib/utils';

interface WorkOrderMarkerInnerProps {
  workOrder: WorkOrderDto;
  onClick?: (workOrderId: string) => void;
}

function createWorkOrderIcon(color: string, isAssigned: boolean): L.DivIcon {
  const shape = isAssigned ? '◇' : '◆';
  return L.divIcon({
    className: 'custom-wo-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color};
        font-size: 22px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
      ">${shape}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export function WorkOrderMarkerInner({ workOrder, onClick }: WorkOrderMarkerInnerProps) {
  const color = PRIORITY_MAP_COLORS[workOrder.priority];
  const isAssigned = !!workOrder.technicianId;
  const icon = createWorkOrderIcon(color, isAssigned);

  return (
    <Marker
      position={[workOrder.latitude, workOrder.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(workOrder.id),
      }}
    >
      <Popup>
        <div className="text-sm min-w-[200px]">
          <div className="font-semibold">{workOrder.referenceNumber}</div>
          <div className="text-gray-600">{serviceTypeLabel(workOrder.serviceType)}</div>
          <div className="text-gray-500 mt-1">{workOrder.address}</div>
          <div className="text-gray-500">
            {formatTime(workOrder.scheduledStart)} - {formatTime(workOrder.scheduledEnd)}
          </div>
          <div className="mt-2">
            <span
              className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ backgroundColor: color + '20', color }}
            >
              {workOrder.priority}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
