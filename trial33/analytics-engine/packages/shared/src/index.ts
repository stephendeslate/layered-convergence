// Shared types, constants, and utilities for Analytics Engine

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
  role: 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';
}

export interface DashboardWidget {
  id: string;
  tenantId: string;
  name: string;
  type: WidgetType;
  config: Record<string, unknown>;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: PipelineStatus;
  startedAt: Date;
  completedAt: Date | null;
}

export type WidgetType = 'CHART' | 'TABLE' | 'METRIC' | 'MAP';

export type PipelineStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type Role = 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';

// ── Constants ──

export const ROLES: readonly Role[] = ['OWNER', 'ADMIN', 'ANALYST', 'VIEWER'] as const;

export const PIPELINE_STATUSES: readonly PipelineStatus[] = [
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;

export const WIDGET_TYPES: readonly WidgetType[] = [
  'CHART',
  'TABLE',
  'METRIC',
  'MAP',
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
 * TRACED: AE-REQ-DASH-001
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
 * TRACED: AE-REQ-DASH-002
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
  return role === 'OWNER' || role === 'ANALYST' || role === 'VIEWER';
}
