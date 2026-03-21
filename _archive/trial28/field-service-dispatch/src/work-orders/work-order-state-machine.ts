import { BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.UNASSIGNED]: [WorkOrderStatus.ASSIGNED],
  [WorkOrderStatus.ASSIGNED]: [
    WorkOrderStatus.EN_ROUTE,
    WorkOrderStatus.UNASSIGNED,
  ],
  [WorkOrderStatus.EN_ROUTE]: [
    WorkOrderStatus.ON_SITE,
    WorkOrderStatus.ASSIGNED,
  ],
  [WorkOrderStatus.ON_SITE]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.EN_ROUTE,
  ],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.ON_SITE,
  ],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.INVOICED],
  [WorkOrderStatus.INVOICED]: [WorkOrderStatus.PAID],
  [WorkOrderStatus.PAID]: [],
};

export function validateTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid status transition from ${from} to ${to}`,
    );
  }
}
