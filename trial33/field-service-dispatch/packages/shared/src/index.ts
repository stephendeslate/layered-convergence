// Shared types, constants, and utilities for Field Service Dispatch

// ── Types ──

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';
}

export interface WorkOrder {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  assignedTo: string | null;
  createdAt: Date;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  skills: string[];
  availability: AvailabilityStatus;
  location: string | null;
}

export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_BREAK';

export type Role = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';

// ── Constants ──

export const ROLES: readonly Role[] = [
  'ADMIN',
  'DISPATCHER',
  'TECHNICIAN',
  'CUSTOMER',
] as const;

export const WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = [
  'CREATED',
  'ASSIGNED',
  'EN_ROUTE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD',
] as const;

export const PRIORITIES: readonly Priority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
] as const;

export const AVAILABILITY_STATUSES: readonly AvailabilityStatus[] = [
  'AVAILABLE',
  'BUSY',
  'OFF_DUTY',
  'ON_BREAK',
] as const;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const DATE_FORMATS = {
  short: { year: 'numeric', month: '2-digit', day: '2-digit' } as const,
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  } as const,
};

// ── Utilities ──

/**
 * Paginate an array of items. Returns a page slice with metadata.
 * TRACED: FD-REQ-TECH-002
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const total = items.length;
  const totalPages = Math.ceil(total / safePageSize);
  const start = (safePage - 1) * safePageSize;
  const data = items.slice(start, start + safePageSize);

  return { data, total, page: safePage, pageSize: safePageSize, totalPages };
}

/**
 * Format a date for display. Supports 'short' and 'long' formats.
 * TRACED: FD-REQ-TECH-003
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' = 'short',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', DATE_FORMATS[format]);
}

/**
 * Validate that a role is not ADMIN (for registration endpoints).
 */
export function isAllowedRegistrationRole(role: string): role is Role {
  return role === 'DISPATCHER' || role === 'TECHNICIAN' || role === 'CUSTOMER';
}
