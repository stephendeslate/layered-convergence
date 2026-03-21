// Shared types, constants, and utilities for Escrow Marketplace

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
  role: 'ADMIN' | 'BUYER' | 'SELLER' | 'ARBITER';
}

export interface EscrowTransaction {
  id: string;
  tenantId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: EscrowStatus;
  createdAt: Date;
}

export interface DisputeRecord {
  id: string;
  transactionId: string;
  status: DisputeStatus;
  reason: string;
  filedAt: Date;
  resolvedAt: Date | null;
}

export type EscrowStatus =
  | 'CREATED'
  | 'FUNDED'
  | 'DELIVERED'
  | 'RELEASED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_BUYER'
  | 'RESOLVED_SELLER'
  | 'ESCALATED'
  | 'CLOSED';

export type Role = 'ADMIN' | 'BUYER' | 'SELLER' | 'ARBITER';

// ── Constants ──

export const ROLES: readonly Role[] = ['ADMIN', 'BUYER', 'SELLER', 'ARBITER'] as const;

export const ESCROW_STATUSES: readonly EscrowStatus[] = [
  'CREATED',
  'FUNDED',
  'DELIVERED',
  'RELEASED',
  'DISPUTED',
  'REFUNDED',
  'CANCELLED',
] as const;

export const DISPUTE_STATUSES: readonly DisputeStatus[] = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED_BUYER',
  'RESOLVED_SELLER',
  'ESCALATED',
  'CLOSED',
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
 * TRACED: EM-REQ-DISP-001
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
 * TRACED: EM-REQ-DISP-002
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
  return role === 'BUYER' || role === 'SELLER' || role === 'ARBITER';
}
