// TRACED: AE-ARCH-001
// TRACED: AE-ARCH-003
// ============================================================
// Types
// ============================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  config: Record<string, unknown>;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PipelineStatus = 'ACTIVE' | 'PAUSED' | 'FAILED' | 'COMPLETED';

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: PipelineStatus;
  schedule: string | null;
  config: Record<string, unknown>;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: PipelineStatus;
  startedAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
  recordsProcessed: number;
  createdAt: Date;
}

export type ReportStatus = 'DRAFT' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED';

export interface Report {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: ReportStatus;
  config: Record<string, unknown>;
  generatedAt: Date | null;
  errorMessage: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// Constants
// ============================================================

export const ALLOWED_REGISTRATION_ROLES: UserRole[] = ['MANAGER', 'ANALYST', 'VIEWER'];

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

export const BCRYPT_SALT_ROUNDS = 12;

export const PIPELINE_STATUS_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  ACTIVE: ['PAUSED', 'FAILED', 'COMPLETED'],
  PAUSED: ['ACTIVE', 'FAILED'],
  FAILED: ['ACTIVE'],
  COMPLETED: ['ACTIVE'],
};

// ============================================================
// Utilities
// ============================================================

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function isAllowedRegistrationRole(role: string): role is UserRole {
  return ALLOWED_REGISTRATION_ROLES.includes(role as UserRole);
}

/**
 * Strips HTML tags from input and trims whitespace.
 * Used for sanitizing user-provided text before storage.
 */
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Masks all characters except the last N visible characters.
 * Useful for audit logging of sensitive values like tokens or IDs.
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

/**
 * Formats a byte count into a human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(2))} ${units[i]}`;
}

/**
 * Generates a random ID string suitable for use as a unique identifier.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}
