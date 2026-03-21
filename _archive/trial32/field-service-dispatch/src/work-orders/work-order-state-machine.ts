import { BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  UNASSIGNED: ['ASSIGNED'],
  ASSIGNED: ['UNASSIGNED', 'EN_ROUTE'],
  EN_ROUTE: ['ASSIGNED', 'ON_SITE'],
  ON_SITE: ['EN_ROUTE', 'IN_PROGRESS'],
  IN_PROGRESS: ['ON_SITE', 'COMPLETED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
  PAID: [],
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
