'use client';

import dynamic from 'next/dynamic';
import type { MapMarker, MapRoute } from './LeafletMap';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
      Loading map...
    </div>
  ),
});

interface DynamicMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  height?: string;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <LeafletMap {...props} />;
}

export type { MapMarker, MapRoute };
