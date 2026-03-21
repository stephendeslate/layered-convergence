// TRACED: FD-FC-SHARED-001 — Shared package barrel export
// Shared types, constants, and utilities for Field Service Dispatch

// ── Types ──

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// TRACED: FD-DA-TENANT-001 — Tenant context type
export interface TenantContext {
  tenantId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN';
}

export interface WorkOrderSummary {
  id: string;
  tenantId: string;
  title: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedToId: string | null;
}

export interface TechnicianProfile {
  id: string;
  tenantId: string;
  name: string;
  specialization: string;
  available: boolean;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// TRACED: FD-DA-STATE-001 — Work order status enum
export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ESCALATED'
  | 'ON_HOLD';

export type Role = 'OWNER' | 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN';

// ── Constants ──

// TRACED: FD-SEC-ROLES-001 — Role constants for validation
export const ROLES: readonly Role[] = ['OWNER', 'ADMIN', 'DISPATCHER', 'TECHNICIAN'] as const;

export const WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = [
  'CREATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ESCALATED',
  'ON_HOLD',
] as const;

export const PRIORITIES: readonly Priority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
] as const;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

// ── Utilities ──

/**
 * Paginate an array of items. Returns a page slice with metadata.
 * TRACED: FD-CQ-UTIL-001 — Paginate utility
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
 * Format a duration in minutes for display (e.g., "2h 30m").
 * TRACED: FD-CQ-UTIL-002 — Duration formatting utility
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

/**
 * Validate that a role is not ADMIN (for registration endpoints).
 * TRACED: FD-SEC-ROLES-002 — Registration role validation
 */
export function isAllowedRegistrationRole(role: string): role is Role {
  return role === 'OWNER' || role === 'DISPATCHER' || role === 'TECHNICIAN';
}

/**
 * Convert text to a URL-safe slug: lowercase, hyphenated, no special chars.
 * TRACED: FD-CQ-SLUG-001 — Slugify utility (T34 variation)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to maxLength, appending suffix if truncated.
 * TRACED: FD-CQ-TRUNC-001 — Truncate utility (T34 variation)
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
}
