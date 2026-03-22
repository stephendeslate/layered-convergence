// TRACED: EM-ARCH-001 — Shared package in Turborepo monorepo
// TRACED: EM-ARCH-002 — Multi-tenant data isolation via tenantId on all entities
// TRACED: EM-ARCH-005 — Shared package types and utilities

// ─── Types ───

export interface Tenant {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  balance: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  status: ListingStatus;
  sellerId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export interface Transaction {
  id: string;
  amount: string;
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  listingId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscrowAccount {
  id: string;
  amount: string;
  transactionId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dispute {
  id: string;
  reason: string;
  transactionId: string;
  tenantId: string;
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

// ─── Constants ───

// TRACED: EM-AUTH-003 — Registration restricted to allowed roles
export const ALLOWED_REGISTRATION_ROLES: string[] = ['MANAGER', 'SELLER', 'BUYER'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const BCRYPT_SALT_ROUNDS = 12;

export const TRANSACTION_STATUS_TRANSITIONS: Record<string, string[]> = {
  [TransactionStatus.PENDING]: [
    TransactionStatus.COMPLETED,
    TransactionStatus.DISPUTED,
    TransactionStatus.FAILED,
  ],
  [TransactionStatus.DISPUTED]: [
    TransactionStatus.COMPLETED,
    TransactionStatus.REFUNDED,
  ],
  [TransactionStatus.COMPLETED]: [],
  [TransactionStatus.REFUNDED]: [],
  [TransactionStatus.FAILED]: [],
};

// ─── T39 Variation: withTimeout & normalizePageParams ───

// TRACED: EM-PERF-001 — withTimeout utility for async timeout guard
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(ms));
    }, ms);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// TRACED: EM-PERF-002 — normalizePageParams utility for pagination safety
export function normalizePageParams(
  page: number,
  pageSize: number,
): { page: number; pageSize: number } {
  const normalizedPage = Math.max(1, Math.floor(page) || 1);
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize) || DEFAULT_PAGE_SIZE),
  );
  return { page: normalizedPage, pageSize: normalizedPageSize };
}

// ─── Utilities ───

// TRACED: EM-API-002 — Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE
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

export function isAllowedRegistrationRole(role: string): boolean {
  return ALLOWED_REGISTRATION_ROLES.includes(role);
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

// TRACED: EM-SEC-006 — XSS prevention (sanitizeInput)
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

// TRACED: EM-SEC-005 — Sensitive data masking for audit logging
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

// TRACED: EM-API-009 — URL-safe slug generation for listings
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// TRACED: EM-FE-009 — Text truncation with configurable suffix
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (text.length <= maxLength) {
    return text;
  }
  const truncatedLength = maxLength - suffix.length;
  if (truncatedLength <= 0) {
    return suffix.slice(0, maxLength);
  }
  return text.slice(0, truncatedLength) + suffix;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function generateId(): string {
  return crypto.randomUUID();
}
