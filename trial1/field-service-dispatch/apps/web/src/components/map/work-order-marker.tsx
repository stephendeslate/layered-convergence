'use client';

import dynamic from 'next/dynamic';
import type { WorkOrderDto } from '@fsd/shared';

const WorkOrderMarkerInner = dynamic(
  () => import('./work-order-marker-inner').then((m) => m.WorkOrderMarkerInner),
  { ssr: false },
);

interface WorkOrderMarkerProps {
  workOrder: WorkOrderDto;
  onClick?: (workOrderId: string) => void;
}

export function WorkOrderMarker(props: WorkOrderMarkerProps) {
  return <WorkOrderMarkerInner {...props} />;
}
