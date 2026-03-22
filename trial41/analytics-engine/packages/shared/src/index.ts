// TRACED:AE-SHARED-CORRELATION
import { randomUUID } from 'crypto';

export function createCorrelationId(): string {
  return randomUUID();
}

// TRACED:AE-SHARED-LOG-FORMAT
export function formatLogEntry(
  level: string,
  message: string,
  context?: Record<string, unknown>,
): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  if (context) {
    Object.assign(entry, context);
  }
  return JSON.stringify(entry);
}

// TRACED:AE-SHARED-CONSTANTS
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:AE-SHARED-ROLES
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER', 'EDITOR'] as const;
export type RegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];

// TRACED:AE-SHARED-PAGINATION
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export function normalizePageParams(page?: number, pageSize?: number): { skip: number; take: number } {
  const normalizedPage = Math.max(1, page ?? 1);
  const normalizedSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    skip: (normalizedPage - 1) * normalizedSize,
    take: normalizedSize,
  };
}

// TRACED:AE-SHARED-VALIDATION
export const UUID_MAX_LENGTH = 36;
export const NAME_MAX_LENGTH = 255;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const URL_MAX_LENGTH = 2048;
export const SHORT_STRING_MAX_LENGTH = 100;

// TRACED:AE-SHARED-STATUS
export const EVENT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const PIPELINE_STATUSES = ['ACTIVE', 'PAUSED', 'ERROR', 'DISABLED'] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export const DATA_SOURCE_TYPES = ['DATABASE', 'API', 'FILE', 'STREAM'] as const;
export type DataSourceType = (typeof DATA_SOURCE_TYPES)[number];

// TRACED:AE-SHARED-ERROR-CODES
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

// TRACED:AE-SHARED-CACHE
export const CACHE_CONTROL_LIST = 'public, max-age=60, s-maxage=120';

// TRACED:AE-SHARED-HEALTH
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ReadinessResponse {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

export interface MetricsResponse {
  requestCount: number;
  errorCount: number;
  avgResponseTimeMs: number;
  uptime: number;
}
