'use client';

import dynamic from 'next/dynamic';
import type { RouteStopDto } from '@fsd/shared';

const RoutePolylineInner = dynamic(
  () => import('./route-polyline-inner').then((m) => m.RoutePolylineInner),
  { ssr: false },
);

interface RoutePolylineProps {
  stops: RouteStopDto[];
  color?: string;
  dashed?: boolean;
  showStopNumbers?: boolean;
}

export function RoutePolyline(props: RoutePolylineProps) {
  return <RoutePolylineInner {...props} />;
}
