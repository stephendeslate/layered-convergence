import { SubscriptionTier, SyncSchedule } from './enums';

// ─── Rate Limits ─────────────────────────────────────────

export const RATE_LIMIT_DEFAULT = 100; // requests per window
export const RATE_LIMIT_WINDOW_SECONDS = 60;

// ─── Pagination ──────────────────────────────────────────

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

// ─── Widget Constraints ──────────────────────────────────

export const MAX_WIDGETS_PER_DASHBOARD = 20;
export const MAX_GRID_COLUMNS = 24;

// ─── Sync ────────────────────────────────────────────────

export const MAX_CONSECUTIVE_FAILURES_BEFORE_PAUSE = 5;
export const SYNC_RUN_RETENTION_DAYS = 90;

// ─── API Key ─────────────────────────────────────────────

export const MAX_EMBED_KEYS_PER_TENANT = 2;

// ─── Cache TTL (seconds) ─────────────────────────────────

export const CACHE_TTL: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 300,    // 5 minutes
  [SubscriptionTier.PRO]: 60,      // 1 minute
  [SubscriptionTier.ENTERPRISE]: 30, // 30 seconds
};

// ─── Widget Type Configs ─────────────────────────────────

export const WIDGET_TYPE_DEFAULTS: Record<string, Record<string, unknown>> = {
  LINE: { showPoints: true, curveType: 'monotone' },
  BAR: { mode: 'grouped', orientation: 'vertical' },
  PIE_DONUT: { innerRadius: 0, maxSegments: 10 },
  AREA: { stacked: false, fillOpacity: 0.3 },
  KPI_CARD: { prefix: '', suffix: '', comparisonPeriod: 'week', showSparkline: true },
  TABLE: { pageSize: 10, sortColumn: null, sortDirection: 'asc' },
  FUNNEL: { showPercentages: true },
};

// ─── Tier Limits ─────────────────────────────────────────

export interface TierLimitsConfig {
  maxDataSources: number;
  maxDashboards: number;
  maxWidgetsPerDashboard: number;
  maxDataPointRetentionDays: number;
  maxSseConnectionsPerDashboard: number;
  maxSseConnectionsPerTenant: number;
  allowedSyncSchedules: SyncSchedule[];
  cacheTtlSeconds: number;
  showPoweredByBadge: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimitsConfig> = {
  [SubscriptionTier.FREE]: {
    maxDataSources: 3,
    maxDashboards: 2,
    maxWidgetsPerDashboard: 20,
    maxDataPointRetentionDays: 90,
    maxSseConnectionsPerDashboard: 10,
    maxSseConnectionsPerTenant: 20,
    allowedSyncSchedules: [SyncSchedule.MANUAL],
    cacheTtlSeconds: 300,
    showPoweredByBadge: true,
  },
  [SubscriptionTier.PRO]: {
    maxDataSources: 20,
    maxDashboards: 50,
    maxWidgetsPerDashboard: 20,
    maxDataPointRetentionDays: 365,
    maxSseConnectionsPerDashboard: 100,
    maxSseConnectionsPerTenant: 500,
    allowedSyncSchedules: [
      SyncSchedule.MANUAL,
      SyncSchedule.EVERY_15_MIN,
      SyncSchedule.HOURLY,
      SyncSchedule.DAILY,
      SyncSchedule.WEEKLY,
    ],
    cacheTtlSeconds: 60,
    showPoweredByBadge: false,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxDataSources: Infinity,
    maxDashboards: Infinity,
    maxWidgetsPerDashboard: 20,
    maxDataPointRetentionDays: Infinity,
    maxSseConnectionsPerDashboard: 1000,
    maxSseConnectionsPerTenant: 5000,
    allowedSyncSchedules: [
      SyncSchedule.MANUAL,
      SyncSchedule.EVERY_15_MIN,
      SyncSchedule.HOURLY,
      SyncSchedule.DAILY,
      SyncSchedule.WEEKLY,
    ],
    cacheTtlSeconds: 30,
    showPoweredByBadge: false,
  },
};

// ─── Data Retention ──────────────────────────────────────

export const DATA_POINT_RETENTION_DAYS: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 90,
  [SubscriptionTier.PRO]: 365,
  [SubscriptionTier.ENTERPRISE]: Infinity,
};

export const AUDIT_LOG_RETENTION_DAYS = 365; // 1 year per BR-046

// ─── Embed ───────────────────────────────────────────────

export const MAX_ALLOWED_ORIGINS = 20;
