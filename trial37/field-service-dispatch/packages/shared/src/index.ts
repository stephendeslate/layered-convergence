// TRACED: FD-SHARED-001 — Shared types, constants, and utilities

// --- Types ---

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'VIEWER';

export interface WorkOrder {
  id: string;
  title: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  tenantId: string;
}

export type WorkOrderStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Technician {
  id: string;
  name: string;
  status: TechnicianStatus;
  latitude: string;
  longitude: string;
  tenantId: string;
}

export type TechnicianStatus = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'INACTIVE';

export interface Schedule {
  id: string;
  workOrderId: string;
  technicianId: string;
  scheduledAt: Date;
}

export interface ServiceArea {
  id: string;
  name: string;
  tenantId: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Constants ---

// TRACED: FD-SHARED-002 — Registration role whitelist
export const ALLOWED_REGISTRATION_ROLES: UserRole[] = ['DISPATCHER', 'TECHNICIAN', 'VIEWER'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: FD-SHARED-003 — Work order status transitions
export const WORK_ORDER_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  OPEN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'FAILED', 'ASSIGNED'],
  COMPLETED: [],
  CANCELLED: ['OPEN'],
  FAILED: ['OPEN'],
};

// --- Utilities ---

// TRACED: FD-SHARED-004 — Pagination utility
export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// TRACED: FD-SHARED-005 — Role validation for registration
export function isAllowedRegistrationRole(role: string): boolean {
  return ALLOWED_REGISTRATION_ROLES.includes(role as UserRole);
}

// TRACED: FD-SHARED-006 — Format bytes to human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(1))} ${units[i]}`;
}

// TRACED: FD-SHARED-007 — Generate prefixed unique ID
export function generateId(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${random}`;
}

// TRACED: FD-SHARED-008 — Format GPS coordinates to display string
export function formatCoordinates(lat: string, lng: string): string {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';
  return `${Math.abs(latNum).toFixed(4)}\u00b0 ${latDir}, ${Math.abs(lngNum).toFixed(4)}\u00b0 ${lngDir}`;
}

// TRACED: FD-SEC-006 — HTML tag stripping to prevent XSS
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

// TRACED: FD-SHARED-009 — Sensitive data masking utility
export function maskSensitive(value: string, visibleChars?: number): string {
  const visible = visibleChars ?? 4;
  if (value.length <= visible) {
    return '*'.repeat(value.length);
  }
  return '*'.repeat(value.length - visible) + value.slice(-visible);
}

// TRACED: FD-SHARED-010 — URL-safe slug generation
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Display text truncation utility
export function truncateText(text: string, maxLength: number, suffix?: string): string {
  const ellipsis = suffix ?? '...';
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}
