'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { WorkOrderDto, TrackingPosition } from '@fsd/shared';

interface TrackingMapProps {
  workOrder: WorkOrderDto;
  technicianPosition: TrackingPosition | null;
}

// Fix Leaflet default marker icons
const destinationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:32px;height:32px;background:#EF4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);color:white;font-size:14px;font-weight:bold;">&#x2691;</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const technicianIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:36px;height:36px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <span style="color:white;font-size:16px;">&#x1F698;</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function FitBounds({
  workOrder,
  technicianPosition,
}: {
  workOrder: WorkOrderDto;
  technicianPosition: TrackingPosition | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [[workOrder.latitude, workOrder.longitude]];
    if (technicianPosition) {
      points.push([technicianPosition.latitude, technicianPosition.longitude]);
    }
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, workOrder.latitude, workOrder.longitude, technicianPosition?.latitude, technicianPosition?.longitude]);

  return null;
}

export function TrackingMap({ workOrder, technicianPosition }: TrackingMapProps) {
  return (
    <div className="h-64 w-full">
      <MapContainer
        center={[workOrder.latitude, workOrder.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds workOrder={workOrder} technicianPosition={technicianPosition} />

        {/* Destination marker */}
        <Marker
          position={[workOrder.latitude, workOrder.longitude]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">Service Location</div>
              <div>{workOrder.address}</div>
            </div>
          </Popup>
        </Marker>

        {/* Technician marker */}
        {technicianPosition && (
          <>
            <Marker
              position={[technicianPosition.latitude, technicianPosition.longitude]}
              icon={technicianIcon}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">Your Technician</div>
                  <div>ETA: {technicianPosition.eta} min</div>
                </div>
              </Popup>
            </Marker>

            {/* Line between technician and destination */}
            <Polyline
              positions={[
                [technicianPosition.latitude, technicianPosition.longitude],
                [workOrder.latitude, workOrder.longitude],
              ]}
              pathOptions={{
                color: '#3B82F6',
                weight: 3,
                dashArray: '10, 10',
                opacity: 0.7,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
