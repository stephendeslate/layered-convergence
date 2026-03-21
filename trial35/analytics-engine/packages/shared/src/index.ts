// TRACED: AE-SHARED-001 — Shared types, constants, and utilities

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

export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER';

export interface Dashboard {
  id: string;
  name: string;
  tenantId: string;
  createdById: string;
}

export interface Pipeline {
  id: string;
  name: string;
  status: PipelineStatus;
  tenantId: string;
}

export type PipelineStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FAILED' | 'COMPLETED';

export interface Widget {
  id: string;
  type: WidgetType;
  dashboardId: string;
  config: Record<string, unknown>;
}

export type WidgetType = 'CHART' | 'TABLE' | 'METRIC' | 'MAP';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Constants ---

// TRACED: AE-SHARED-002 — Registration role whitelist
export const ALLOWED_REGISTRATION_ROLES: UserRole[] = ['MANAGER', 'ANALYST', 'VIEWER'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: AE-SHARED-003 — Pipeline status transitions
export const PIPELINE_STATUS_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'FAILED', 'COMPLETED'],
  PAUSED: ['ACTIVE', 'FAILED'],
  FAILED: ['DRAFT'],
  COMPLETED: [],
};

// --- Utilities ---

// TRACED: AE-SHARED-004 — Pagination utility
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

// TRACED: AE-SHARED-005 — Role validation for registration
export function isAllowedRegistrationRole(role: string): boolean {
  return ALLOWED_REGISTRATION_ROLES.includes(role as UserRole);
}

// TRACED: AE-SHARED-006 — Format bytes to human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(1))} ${units[i]}`;
}

// TRACED: AE-SHARED-007 — Generate prefixed unique ID
export function generateId(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${random}`;
}

// TRACED: AE-SHARED-008 — Slug generation utility
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
