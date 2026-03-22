// TRACED:AE-ARCH-01 — Shared package exports for monorepo consumption
// TRACED:AE-PERF-01 — MAX_PAGE_SIZE constant for pagination clamping
// TRACED:AE-ARCH-05 — Shared package consumed by both apps via workspace:* protocol
// TRACED:AE-API-08 — Paginated response format with data and meta envelope

import { randomBytes } from 'crypto';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const BCRYPT_SALT_ROUNDS = 12;
export const ALLOWED_REGISTRATION_ROLES = ['EDITOR', 'VIEWER'] as const;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PageParams {
  page: number;
  pageSize: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum PipelineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  TIMED_OUT = 'TIMED_OUT',
}

// ──────────────────────────────────────────────
// TimeoutError class
// ──────────────────────────────────────────────
// TRACED:AE-PERF-02 — TimeoutError custom class for async timeout handling

export class TimeoutError extends Error {
  public readonly timeoutMs: number;

  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = ms;
  }
}

// ──────────────────────────────────────────────
// withTimeout
// ──────────────────────────────────────────────
// TRACED:AE-PERF-03 — withTimeout wraps async with timeout guard

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

// ──────────────────────────────────────────────
// normalizePageParams
// ──────────────────────────────────────────────
// TRACED:AE-PERF-04 — normalizePageParams clamps page and pageSize

export function normalizePageParams(
  page: number,
  pageSize: number,
): PageParams {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safePageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize) || DEFAULT_PAGE_SIZE),
  );

  return { page: safePage, pageSize: safePageSize };
}

// ──────────────────────────────────────────────
// sanitizeInput — strips HTML tags
// ──────────────────────────────────────────────
// TRACED:AE-SEC-01 — sanitizeInput strips HTML for XSS prevention

export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

// ──────────────────────────────────────────────
// maskSensitive — masks emails/tokens for logging
// ──────────────────────────────────────────────
// TRACED:AE-SEC-02 — maskSensitive hides PII in logs

export function maskSensitive(value: string): string {
  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : '*'.repeat(local.length);
    return `${maskedLocal}@${domain}`;
  }

  if (value.length > 8) {
    return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
  }

  return '*'.repeat(value.length);
}

// ──────────────────────────────────────────────
// slugify — converts string to URL-safe slug
// ──────────────────────────────────────────────
// TRACED:AE-ARCH-02 — slugify for URL-safe identifiers

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ──────────────────────────────────────────────
// truncateText — truncates with ellipsis
// ──────────────────────────────────────────────

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ──────────────────────────────────────────────
// formatBytes — human-readable byte sizes
// ──────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

// ──────────────────────────────────────────────
// generateId — crypto-random hex identifier
// ──────────────────────────────────────────────
// TRACED:AE-SEC-03 — generateId uses crypto.randomBytes

export function generateId(length = 16): string {
  return randomBytes(length).toString('hex');
}

// ──────────────────────────────────────────────
// paginate — converts page params to Prisma skip/take
// ──────────────────────────────────────────────
// TRACED:AE-PERF-05 — paginate builds Prisma skip/take

export function paginate(params: PageParams): { skip: number; take: number } {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

// ──────────────────────────────────────────────
// isAllowedRegistrationRole
// ──────────────────────────────────────────────
// TRACED:AE-AUTH-01 — isAllowedRegistrationRole validates against allowed list

export function isAllowedRegistrationRole(role: string): boolean {
  return (ALLOWED_REGISTRATION_ROLES as readonly string[]).includes(role);
}
