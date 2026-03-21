// TRACED: EM-SHARED-001 — Shared types, constants, and utilities

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

export type UserRole = 'ADMIN' | 'MANAGER' | 'SELLER' | 'BUYER';

export interface Listing {
  id: string;
  title: string;
  price: string;
  status: ListingStatus;
  tenantId: string;
  sellerId: string;
}

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'CANCELLED';

export interface Transaction {
  id: string;
  amount: string;
  status: TransactionStatus;
  listingId: string;
  buyerId: string;
  tenantId: string;
}

export type TransactionStatus = 'PENDING' | 'ESCROWED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

export interface EscrowAccount {
  id: string;
  balance: string;
  tenantId: string;
}

export interface Dispute {
  id: string;
  reason: string;
  status: DisputeStatus;
  transactionId: string;
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Constants ---

// TRACED: EM-SHARED-002 — Registration role whitelist
export const ALLOWED_REGISTRATION_ROLES: UserRole[] = ['MANAGER', 'SELLER', 'BUYER'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: EM-SHARED-003 — Transaction status transitions
export const TRANSACTION_STATUS_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ['ESCROWED', 'REFUNDED'],
  ESCROWED: ['RELEASED', 'REFUNDED', 'DISPUTED'],
  RELEASED: [],
  REFUNDED: [],
  DISPUTED: ['RELEASED', 'REFUNDED'],
};

// --- Utilities ---

// TRACED: EM-SHARED-004 — Pagination utility
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

// TRACED: EM-SHARED-005 — Role validation for registration
export function isAllowedRegistrationRole(role: string): boolean {
  return ALLOWED_REGISTRATION_ROLES.includes(role as UserRole);
}

// TRACED: EM-SHARED-006 — Format bytes to human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(1))} ${units[i]}`;
}

// TRACED: EM-SHARED-007 — Generate prefixed unique ID
export function generateId(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${random}`;
}

// TRACED: EM-SHARED-008 — Currency formatting utility
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}
