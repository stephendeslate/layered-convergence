import { UserRole, WorkOrderStatus } from '../enums/index.js';

export interface StateTransition {
  from: WorkOrderStatus;
  to: WorkOrderStatus;
  requiredRoles: UserRole[];
  sideEffects: string[];
}

export const VALID_TRANSITIONS: StateTransition[] = [
  // Forward flow
  {
    from: WorkOrderStatus.UNASSIGNED,
    to: WorkOrderStatus.ASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['notify-technician'],
  },
  {
    from: WorkOrderStatus.ASSIGNED,
    to: WorkOrderStatus.EN_ROUTE,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: ['start-gps-tracking', 'notify-customer-en-route'],
  },
  {
    from: WorkOrderStatus.EN_ROUTE,
    to: WorkOrderStatus.ON_SITE,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: ['notify-customer-arrived'],
  },
  {
    from: WorkOrderStatus.ON_SITE,
    to: WorkOrderStatus.IN_PROGRESS,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: [],
  },
  {
    from: WorkOrderStatus.IN_PROGRESS,
    to: WorkOrderStatus.COMPLETED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: ['generate-invoice', 'stop-gps-tracking'],
  },
  {
    from: WorkOrderStatus.COMPLETED,
    to: WorkOrderStatus.INVOICED,
    requiredRoles: [UserRole.ADMIN],
    sideEffects: ['send-invoice-to-customer'],
  },
  {
    from: WorkOrderStatus.INVOICED,
    to: WorkOrderStatus.PAID,
    requiredRoles: [UserRole.ADMIN],
    sideEffects: ['send-payment-receipt'],
  },

  // Cancel/reassign flow (back to UNASSIGNED)
  {
    from: WorkOrderStatus.ASSIGNED,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment'],
  },
  {
    from: WorkOrderStatus.EN_ROUTE,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment', 'stop-gps-tracking'],
  },
  {
    from: WorkOrderStatus.ON_SITE,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment'],
  },
  {
    from: WorkOrderStatus.IN_PROGRESS,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment'],
  },
];

export function isValidTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): boolean {
  return VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

export function getTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): StateTransition | undefined {
  return VALID_TRANSITIONS.find((t) => t.from === from && t.to === to);
}

export function getValidNextStatuses(
  from: WorkOrderStatus,
): WorkOrderStatus[] {
  return VALID_TRANSITIONS
    .filter((t) => t.from === from)
    .map((t) => t.to);
}

export function canUserTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
  userRole: UserRole,
): boolean {
  const transition = getTransition(from, to);
  if (!transition) return false;
  if (transition.requiredRoles.length === 0) return true;
  return transition.requiredRoles.includes(userRole);
}
