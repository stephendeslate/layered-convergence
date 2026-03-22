// TRACED: AE-ARCH-01
// TRACED: AE-ARCH-02
// TRACED: AE-ARCH-03
// TRACED: AE-PERF-03

// ── Types ──

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum PipelineStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
}

// ── Constants ──

export const ALLOWED_REGISTRATION_ROLES: string[] = [
  UserRole.EDITOR,
  UserRole.VIEWER,
];

export const BCRYPT_SALT_ROUNDS = 12;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ── Utilities ──

/**
 * Paginates an array of items and returns a PaginatedResponse.
 */
export function paginate<T>(
  items: T[],
  total: number,
  params: PaginationParams = {},
): PaginatedResponse<T> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = clampPageSize(params.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Checks if a role string is in the allowed registration roles list.
 */
export function isAllowedRegistrationRole(role: string): boolean {
  return ALLOWED_REGISTRATION_ROLES.includes(role);
}

/**
 * Sanitizes user input by stripping HTML tags and trimming whitespace.
 */
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Masks sensitive data, showing only the last N characters.
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

/**
 * Converts a string to a URL-safe slug.
 * Lowercases, replaces spaces/separators with hyphens, strips non-alphanumeric.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Truncates text to a maximum length, appending a suffix if truncated.
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats bytes into a human-readable string.
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
  return `${value} ${sizes[i]}`;
}

/**
 * Generates a random ID string suitable for non-cryptographic identifiers.
 */
export function generateId(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * T38 Variation: Measures the duration of an async operation.
 * Returns both the result and the elapsed time in milliseconds.
 */
export async function measureDuration<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round((performance.now() - start) * 100) / 100;
  return { result, durationMs };
}

/**
 * T38 Variation: Clamps a requested page size to be between 1 and max.
 * Never rejects — always returns a valid page size.
 */
export function clampPageSize(requested: number, max: number): number {
  return Math.min(max, Math.max(1, requested));
}
