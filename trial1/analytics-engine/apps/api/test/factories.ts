/**
 * Factory functions for creating test entities.
 * Each factory returns realistic defaults that can be overridden.
 */

let factoryCounter = 0;

export function resetFactoryCounter() {
  factoryCounter = 0;
}

function nextId(): number {
  return ++factoryCounter;
}

// ─── Tenant Factory ────────────────────────────────────────

export interface TenantFactoryInput {
  id?: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  tier?: 'FREE' | 'PRO' | 'ENTERPRISE';
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  cornerRadius?: number;
  logoUrl?: string | null;
}

export function buildTenant(overrides: TenantFactoryInput = {}) {
  const n = nextId();
  return {
    id: overrides.id ?? `tenant-${n}`,
    name: overrides.name ?? `Test Tenant ${n}`,
    email: overrides.email ?? `tenant${n}@test.example.com`,
    passwordHash:
      overrides.passwordHash ??
      '$2b$04$test.hash.placeholder.for.unit.tests',
    emailVerified: overrides.emailVerified ?? true,
    emailVerifyToken: null,
    region: 'us-east-1',
    tier: overrides.tier ?? 'FREE',
    stripeCustomerId: null,
    syncPausedGlobal: false,
    primaryColor: overrides.primaryColor ?? '#3B82F6',
    secondaryColor: overrides.secondaryColor ?? '#6366F1',
    backgroundColor: overrides.backgroundColor ?? '#FFFFFF',
    textColor: overrides.textColor ?? '#1F2937',
    fontFamily: overrides.fontFamily ?? 'Inter',
    cornerRadius: overrides.cornerRadius ?? 8,
    logoUrl: overrides.logoUrl ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

// ─── DataSource Factory ────────────────────────────────────

export interface DataSourceFactoryInput {
  id?: string;
  tenantId?: string;
  name?: string;
  connectorType?: 'REST_API' | 'POSTGRESQL' | 'CSV' | 'WEBHOOK';
  syncSchedule?: 'MANUAL' | 'EVERY_15_MIN' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

export function buildDataSource(overrides: DataSourceFactoryInput = {}) {
  const n = nextId();
  return {
    id: overrides.id ?? `datasource-${n}`,
    tenantId: overrides.tenantId ?? `tenant-1`,
    name: overrides.name ?? `Test DataSource ${n}`,
    connectorType: overrides.connectorType ?? 'REST_API',
    syncSchedule: overrides.syncSchedule ?? 'MANUAL',
    syncPaused: false,
    consecutiveFails: 0,
    lastSyncAt: null,
    nextSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ─── Dashboard Factory ─────────────────────────────────────

export interface DashboardFactoryInput {
  id?: string;
  tenantId?: string;
  name?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export function buildDashboard(overrides: DashboardFactoryInput = {}) {
  const n = nextId();
  return {
    id: overrides.id ?? `dashboard-${n}`,
    tenantId: overrides.tenantId ?? `tenant-1`,
    name: overrides.name ?? `Test Dashboard ${n}`,
    description: null,
    status: overrides.status ?? 'DRAFT',
    gridColumns: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ─── Widget Factory ────────────────────────────────────────

export interface WidgetFactoryInput {
  id?: string;
  dashboardId?: string;
  tenantId?: string;
  dataSourceId?: string;
  type?: 'LINE' | 'BAR' | 'PIE_DONUT' | 'AREA' | 'KPI_CARD' | 'TABLE' | 'FUNNEL';
  title?: string;
}

export function buildWidget(overrides: WidgetFactoryInput = {}) {
  const n = nextId();
  return {
    id: overrides.id ?? `widget-${n}`,
    dashboardId: overrides.dashboardId ?? `dashboard-1`,
    tenantId: overrides.tenantId ?? `tenant-1`,
    dataSourceId: overrides.dataSourceId ?? `datasource-1`,
    type: overrides.type ?? 'LINE',
    title: overrides.title ?? `Test Widget ${n}`,
    subtitle: null,
    gridColumnStart: 1,
    gridColumnSpan: 6,
    gridRowStart: 1,
    gridRowSpan: 1,
    dimensionField: 'date',
    metricFields: [{ field: 'value', aggregation: 'SUM' }],
    dateRangePreset: 'LAST_30_DAYS',
    dateRangeStart: null,
    dateRangeEnd: null,
    groupingPeriod: 'DAILY',
    typeConfig: {},
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ─── DataPoint Factory ─────────────────────────────────────

export interface DataPointFactoryInput {
  id?: string;
  tenantId?: string;
  dataSourceId?: string;
  dimensions?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  timestamp?: Date;
  sourceHash?: string;
}

export function buildDataPoint(overrides: DataPointFactoryInput = {}) {
  const n = nextId();
  return {
    id: overrides.id ?? `datapoint-${n}`,
    tenantId: overrides.tenantId ?? `tenant-1`,
    dataSourceId: overrides.dataSourceId ?? `datasource-1`,
    dimensions: overrides.dimensions ?? { date: '2026-03-01', region: 'US' },
    metrics: overrides.metrics ?? { pageViews: 1000, sessions: 300 },
    timestamp: overrides.timestamp ?? new Date('2026-03-01'),
    sourceHash: overrides.sourceHash ?? `hash-${n}`,
    createdAt: new Date(),
  };
}
