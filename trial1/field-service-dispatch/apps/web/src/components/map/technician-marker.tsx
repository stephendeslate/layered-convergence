'use client';

import dynamic from 'next/dynamic';
import type { TechnicianDto } from '@fsd/shared';

const TechnicianMarkerInner = dynamic(
  () => import('./technician-marker-inner').then((m) => m.TechnicianMarkerInner),
  { ssr: false },
);

interface TechnicianMarkerProps {
  technician: TechnicianDto;
  onClick?: (technicianId: string) => void;
}

export function TechnicianMarker(props: TechnicianMarkerProps) {
  return <TechnicianMarkerInner {...props} />;
}
