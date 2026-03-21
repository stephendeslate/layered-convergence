// TRACED: EM-FC-SHARED-001 — Shared package barrel export
// Shared types, constants, and utilities for Escrow Marketplace

// ── Types ──

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// TRACED: EM-DA-TENANT-001 — Tenant context type
export interface TenantContext {
  tenantId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'BUYER' | 'SELLER';
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: ListingStatus;
  sellerId: string;
}

export interface TransactionSummary {
  id: string;
  listingId: string;
  buyerId: string;
  status: TransactionStatus;
  amount: number;
  createdAt: Date;
}

// TRACED: EM-DA-STATE-001 — Transaction status enum
export type TransactionStatus =
  | 'INITIATED'
  | 'FUNDED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'ARCHIVED';

export type Role = 'OWNER' | 'ADMIN' | 'BUYER' | 'SELLER';

// ── Constants ──

// TRACED: EM-SEC-ROLES-001 — Role constants for validation
export const ROLES: readonly Role[] = ['OWNER', 'ADMIN', 'BUYER', 'SELLER'] as const;

export const TRANSACTION_STATUSES: readonly TransactionStatus[] = [
  'INITIATED', 'FUNDED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED',
] as const;

export const LISTING_STATUSES: readonly ListingStatus[] = [
  'DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED',
] as const;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const CURRENCY_FORMAT = {
  style: 'currency' as const,
  currency: 'USD',
};

// ── Utilities ──

/**
 * Paginate an array of items.
 * TRACED: EM-CQ-UTIL-001 — Paginate utility
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
 * Format currency amount for display.
 * TRACED: EM-CQ-UTIL-002 — Currency formatting utility
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', CURRENCY_FORMAT).format(amount);
}

/**
 * Validate that a role is not ADMIN (for registration).
 * TRACED: EM-SEC-ROLES-002 — Registration role validation
 */
export function isAllowedRegistrationRole(role: string): role is Role {
  return role === 'OWNER' || role === 'BUYER' || role === 'SELLER';
}

/**
 * Convert text to URL-safe slug: lowercase, hyphenated, no special chars.
 * TRACED: EM-CQ-SLUG-001 — Slugify utility (T34 variation)
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
 * TRACED: EM-CQ-TRUNC-001 — Truncate utility (T34 variation)
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
