import type {
  ConnectorType,
  SyncStatus,
  SyncSchedule,
  DashboardStatus,
  WidgetType,
  AggregationFunction,
  FieldType,
  FieldRole,
  GroupingPeriod,
  DateRangePreset,
  ApiKeyType,
  AuditAction,
} from './enums';
import { SubscriptionTier } from './enums';

// ─── Base ─────────────────────────────────────────────────

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { pagination?: PaginationMeta };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: unknown[];
    requestId: string;
  };
}

// ─── Tenant ───────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  region: string;
  tier: SubscriptionTier;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  cornerRadius: number;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Data Source ──────────────────────────────────────────

export interface DataSource {
  id: string;
  tenantId: string;
  name: string;
  connectorType: ConnectorType;
  syncSchedule: SyncSchedule;
  syncPaused: boolean;
  consecutiveFails: number;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldMapping {
  id: string;
  dataSourceId: string;
  sourceField: string;
  targetField: string;
  fieldType: FieldType;
  fieldRole: FieldRole;
  isRequired: boolean;
  isPii: boolean;
  sortOrder: number;
}

// ─── Sync ─────────────────────────────────────────────────

export interface SyncRun {
  id: string;
  dataSourceId: string;
  tenantId: string;
  status: SyncStatus;
  rowsSynced: number;
  rowsFailed: number;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface DeadLetterEvent {
  id: string;
  syncRunId: string | null;
  tenantId: string;
  dataSourceId: string;
  payload: unknown;
  errorMessage: string;
  errorStack: string | null;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: DashboardStatus;
  gridColumns: number;
  createdAt: string;
  updatedAt: string;
  widgets?: Widget[];
  embedConfig?: EmbedConfig | null;
}

// ─── Widget ───────────────────────────────────────────────

export interface MetricField {
  field: string;
  aggregation: AggregationFunction;
}

export interface Widget {
  id: string;
  dashboardId: string;
  tenantId: string;
  dataSourceId: string;
  type: WidgetType;
  title: string;
  subtitle: string | null;
  gridColumnStart: number;
  gridColumnSpan: number;
  gridRowStart: number;
  gridRowSpan: number;
  dimensionField: string;
  metricFields: MetricField[];
  dateRangePreset: DateRangePreset;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  groupingPeriod: GroupingPeriod;
  typeConfig: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Embed ────────────────────────────────────────────────

export interface EmbedConfig {
  id: string;
  dashboardId: string;
  tenantId: string;
  allowedOrigins: string[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API Key ──────────────────────────────────────────────

export interface ApiKey {
  id: string;
  tenantId: string;
  type: ApiKeyType;
  keyPrefix: string;
  name: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

// ─── Audit ────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  tenantId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ─── SSE Events ───────────────────────────────────────────

export interface SSEEvent {
  id: string;
  type: string;
  data: string;
  retry?: number;
}

export interface WidgetUpdatePayload {
  widgetId: string;
  data: unknown[];
}

export interface SyncStatusPayload {
  dataSourceId: string;
  status: SyncStatus;
  rowsSynced: number;
}

export interface SyncErrorPayload {
  dataSourceId: string;
  error: string;
}

// ─── Tier Limits ──────────────────────────────────────────
// TierLimits interface and TIER_LIMITS constant are in constants.ts
// Re-export for backward compatibility
export type { TierLimitsConfig as TierLimits } from './constants';
export { TIER_LIMITS } from './constants';
