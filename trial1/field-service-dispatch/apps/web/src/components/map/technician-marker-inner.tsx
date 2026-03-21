'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { TechnicianDto } from '@fsd/shared';
import { TECH_STATUS_COLORS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

interface TechnicianMarkerInnerProps {
  technician: TechnicianDto;
  onClick?: (technicianId: string) => void;
}

function createTechnicianIcon(color: string, initials: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-tech-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 700;
      ">${initials}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export function TechnicianMarkerInner({ technician, onClick }: TechnicianMarkerInnerProps) {
  if (!technician.currentLatitude || !technician.currentLongitude) return null;

  const statusConfig = TECH_STATUS_COLORS[technician.status];
  const initials = getInitials(technician.user.firstName, technician.user.lastName);
  const icon = createTechnicianIcon(statusConfig.mapColor, initials);

  return (
    <Marker
      position={[technician.currentLatitude, technician.currentLongitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(technician.id),
      }}
    >
      <Popup>
        <div className="text-sm min-w-[180px]">
          <div className="font-semibold">
            {technician.user.firstName} {technician.user.lastName}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusConfig.mapColor }}
            />
            <span className="text-gray-600">{statusConfig.label}</span>
          </div>
          {technician.user.phone && (
            <div className="text-gray-500 mt-1">{technician.user.phone}</div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
