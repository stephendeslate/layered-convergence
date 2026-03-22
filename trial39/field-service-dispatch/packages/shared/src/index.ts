// TRACED: FD-SHARED-001 — Shared types, enums, constants, and utility functions

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
  description?: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  latitude?: string;
  longitude?: string;
  tenantId: string;
  createdById: string;
}

export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Technician {
  id: string;
  name: string;
  specialty?: string;
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

// TRACED: FD-SHARED-002 — Registration role whitelist excluding ADMIN
export const ALLOWED_REGISTRATION_ROLES: UserRole[] = ['DISPATCHER', 'TECHNICIAN', 'VIEWER'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: FD-SHARED-003 — Work order state machine transitions
export const WORK_ORDER_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'FAILED', 'OPEN'],
  COMPLETED: [],
  CANCELLED: ['OPEN'],
  FAILED: ['OPEN'],
};

// --- T39 Variation: withTimeout ---

// TRACED: FD-PERF-001 — Async timeout wrapper utility (T39 variation)
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(ms));
    }, ms);

    fn().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// --- T39 Variation: normalizePageParams ---

// TRACED: FD-PERF-002 — Pagination parameter sanitization (T39 variation)
export function normalizePageParams(
  page: number,
  pageSize: number,
): { page: number; pageSize: number } {
  const normalizedPage = Math.max(1, Math.floor(page) || 1);
  const normalizedPageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize) || 1));
  return { page: normalizedPage, pageSize: normalizedPageSize };
}

// --- Utilities ---

// TRACED: FD-SHARED-004 — Generic pagination result builder
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

// TRACED: FD-SHARED-005 — Role validation guard for self-registration
export function isAllowedRegistrationRole(role: string): boolean {
  return ALLOWED_REGISTRATION_ROLES.includes(role as UserRole);
}

// TRACED: FD-SEC-006 — Strip HTML tags from user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

// TRACED: FD-SHARED-006 — Mask sensitive strings preserving trailing chars
export function maskSensitive(value: string, visibleChars?: number): string {
  const visible = visibleChars ?? 4;
  if (value.length <= visible) {
    return '*'.repeat(value.length);
  }
  return '*'.repeat(value.length - visible) + value.slice(-visible);
}

// TRACED: FD-SHARED-007 — Convert text to URL-safe slug
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// TRACED: FD-SHARED-008 — Truncate text with configurable suffix
export function truncateText(text: string, maxLength: number, suffix?: string): string {
  const ellipsis = suffix ?? '...';
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

// TRACED: FD-SHARED-009 — Format byte counts to human-readable strings
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${parseFloat(val.toFixed(1))} ${units[i]}`;
}

// TRACED: FD-SHARED-010 — Generate prefixed unique identifiers
export function generateId(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${suffix}`;
}

// TRACED: FD-SHARED-011 — Format GPS decimal coordinates for display
export function formatCoordinates(lat: string, lng: string): string {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';
  return `${Math.abs(latNum).toFixed(4)}\u00b0 ${latDir}, ${Math.abs(lngNum).toFixed(4)}\u00b0 ${lngDir}`;
}
