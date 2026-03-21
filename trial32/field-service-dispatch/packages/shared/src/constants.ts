/**
 * Shared constants for the Field Service Dispatch platform.
 */

import { WorkOrderStatus, Priority, Role } from './types';

/** Roles available for user registration (excludes ADMIN) */
export const REGISTERABLE_ROLES: Role[] = [Role.DISPATCHER, Role.TECHNICIAN, Role.MANAGER];

/** All valid work order status values */
export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.PENDING,
  WorkOrderStatus.ASSIGNED,
  WorkOrderStatus.IN_PROGRESS,
  WorkOrderStatus.COMPLETED,
  WorkOrderStatus.CANCELLED,
];

/** All valid priority values */
export const PRIORITIES: Priority[] = [
  Priority.LOW,
  Priority.MEDIUM,
  Priority.HIGH,
  Priority.URGENT,
];

/** Work order state machine: allowed transitions */
export const WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.COMPLETED]: [],
  [WorkOrderStatus.CANCELLED]: [],
};

/** Default page size for list endpoints */
export const DEFAULT_PAGE_SIZE = 20;
