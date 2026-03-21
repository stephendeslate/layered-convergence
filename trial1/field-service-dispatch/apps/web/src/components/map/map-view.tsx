'use client';

import dynamic from 'next/dynamic';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

const MapViewInner = dynamic(
  () => import('./map-view-inner').then((m) => m.MapViewInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading map...</div>
      </div>
    ),
  },
);

interface MapViewProps {
  center?: LatLngExpression;
  zoom?: number;
  bounds?: LatLngBoundsExpression;
  className?: string;
  children?: React.ReactNode;
}

export function MapView(props: MapViewProps) {
  return <MapViewInner {...props} />;
}
