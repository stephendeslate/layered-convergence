'use client';

import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { RouteStopDto } from '@fsd/shared';

interface RoutePolylineInnerProps {
  stops: RouteStopDto[];
  color?: string;
  dashed?: boolean;
  showStopNumbers?: boolean;
}

function createNumberIcon(num: number, color: string): L.DivIcon {
  return L.divIcon({
    className: 'route-stop-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 700;
      ">${num}</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function RoutePolylineInner({
  stops,
  color = '#3B82F6',
  dashed = false,
  showStopNumbers = true,
}: RoutePolylineInnerProps) {
  const positions = stops
    .filter((s) => s.workOrder?.latitude && s.workOrder?.longitude)
    .map((s) => [s.workOrder!.latitude, s.workOrder!.longitude] as [number, number]);

  if (positions.length < 2) return null;

  return (
    <>
      <Polyline
        positions={positions}
        color={color}
        weight={3}
        opacity={0.8}
        dashArray={dashed ? '10, 10' : undefined}
      />
      {showStopNumbers &&
        stops.map((stop, i) => {
          if (!stop.workOrder?.latitude || !stop.workOrder?.longitude) return null;
          return (
            <Marker
              key={stop.id}
              position={[stop.workOrder.latitude, stop.workOrder.longitude]}
              icon={createNumberIcon(i + 1, color)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">Stop #{i + 1}</div>
                  {stop.workOrder && (
                    <>
                      <div>{stop.workOrder.referenceNumber}</div>
                      <div className="text-gray-500">{stop.workOrder.address}</div>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </>
  );
}
