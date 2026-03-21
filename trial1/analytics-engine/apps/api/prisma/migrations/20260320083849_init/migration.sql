-- CreateEnum
CREATE TYPE "ConnectorType" AS ENUM ('REST_API', 'POSTGRESQL', 'CSV', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SyncSchedule" AS ENUM ('MANUAL', 'EVERY_15_MIN', 'HOURLY', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "DashboardStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('LINE', 'BAR', 'PIE_DONUT', 'AREA', 'KPI_CARD', 'TABLE', 'FUNNEL');

-- CreateEnum
CREATE TYPE "AggregationFunction" AS ENUM ('SUM', 'AVG', 'COUNT', 'MIN', 'MAX');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('STRING', 'NUMBER', 'DATE', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "FieldRole" AS ENUM ('DIMENSION', 'METRIC');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('TENANT_CREATED', 'TENANT_UPDATED', 'TENANT_DELETED', 'DATASOURCE_CREATED', 'DATASOURCE_UPDATED', 'DATASOURCE_DELETED', 'DATASOURCE_TEST_CONNECTION', 'DASHBOARD_CREATED', 'DASHBOARD_UPDATED', 'DASHBOARD_PUBLISHED', 'DASHBOARD_ARCHIVED', 'DASHBOARD_REVERTED_TO_DRAFT', 'DASHBOARD_DELETED', 'WIDGET_CREATED', 'WIDGET_UPDATED', 'WIDGET_DELETED', 'SYNC_STARTED', 'SYNC_COMPLETED', 'SYNC_FAILED', 'SYNC_PAUSED', 'SYNC_RESUMED', 'EMBED_CONFIG_UPDATED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'THEME_UPDATED', 'TIER_UPGRADED', 'TIER_DOWNGRADED', 'DATA_EXPORTED', 'ACCOUNT_DELETION_REQUESTED');

-- CreateEnum
CREATE TYPE "GroupingPeriod" AS ENUM ('NONE', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "DateRangePreset" AS ENUM ('LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'CUSTOM', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('ADMIN', 'EMBED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "region" TEXT NOT NULL DEFAULT 'us-east-1',
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "syncPausedGlobal" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#6366F1',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#1F2937',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "cornerRadius" INTEGER NOT NULL DEFAULT 8,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "ApiKeyType" NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "connectorType" "ConnectorType" NOT NULL,
    "syncSchedule" "SyncSchedule" NOT NULL DEFAULT 'MANUAL',
    "syncPaused" BOOLEAN NOT NULL DEFAULT false,
    "consecutiveFails" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "nextSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_source_configs" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "configEncrypted" BYTEA NOT NULL,
    "configIv" BYTEA NOT NULL,
    "configTag" BYTEA NOT NULL,
    "transforms" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_source_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_mappings" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "fieldRole" "FieldRole" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPii" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_runs" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "rowsSynced" INTEGER NOT NULL DEFAULT 0,
    "rowsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dead_letter_events" (
    "id" TEXT NOT NULL,
    "syncRunId" TEXT,
    "tenantId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dead_letter_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_points" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregated_data_points" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "period" "GroupingPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "dimensionKey" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "sumValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "countValue" INTEGER NOT NULL DEFAULT 0,
    "minValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aggregated_data_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "DashboardStatus" NOT NULL DEFAULT 'DRAFT',
    "gridColumns" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "type" "WidgetType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "gridColumnStart" INTEGER NOT NULL DEFAULT 1,
    "gridColumnSpan" INTEGER NOT NULL DEFAULT 6,
    "gridRowStart" INTEGER NOT NULL DEFAULT 1,
    "gridRowSpan" INTEGER NOT NULL DEFAULT 1,
    "dimensionField" TEXT NOT NULL,
    "metricFields" JSONB NOT NULL,
    "dateRangePreset" "DateRangePreset" NOT NULL DEFAULT 'LAST_30_DAYS',
    "dateRangeStart" TIMESTAMP(3),
    "dateRangeEnd" TIMESTAMP(3),
    "groupingPeriod" "GroupingPeriod" NOT NULL DEFAULT 'DAILY',
    "typeConfig" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embed_configs" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "allowedOrigins" TEXT[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "embed_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_cache" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "resultData" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_stripeCustomerId_key" ON "tenants"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_tenantId_idx" ON "api_keys"("tenantId");

-- CreateIndex
CREATE INDEX "api_keys_keyHash_idx" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "data_sources_tenantId_idx" ON "data_sources"("tenantId");

-- CreateIndex
CREATE INDEX "data_sources_nextSyncAt_idx" ON "data_sources"("nextSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "data_source_configs_dataSourceId_key" ON "data_source_configs"("dataSourceId");

-- CreateIndex
CREATE INDEX "field_mappings_dataSourceId_idx" ON "field_mappings"("dataSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "field_mappings_dataSourceId_targetField_key" ON "field_mappings"("dataSourceId", "targetField");

-- CreateIndex
CREATE INDEX "sync_runs_dataSourceId_idx" ON "sync_runs"("dataSourceId");

-- CreateIndex
CREATE INDEX "sync_runs_tenantId_idx" ON "sync_runs"("tenantId");

-- CreateIndex
CREATE INDEX "sync_runs_status_idx" ON "sync_runs"("status");

-- CreateIndex
CREATE INDEX "sync_runs_createdAt_idx" ON "sync_runs"("createdAt");

-- CreateIndex
CREATE INDEX "dead_letter_events_tenantId_idx" ON "dead_letter_events"("tenantId");

-- CreateIndex
CREATE INDEX "dead_letter_events_syncRunId_idx" ON "dead_letter_events"("syncRunId");

-- CreateIndex
CREATE INDEX "dead_letter_events_createdAt_idx" ON "dead_letter_events"("createdAt");

-- CreateIndex
CREATE INDEX "data_points_tenantId_idx" ON "data_points"("tenantId");

-- CreateIndex
CREATE INDEX "data_points_dataSourceId_idx" ON "data_points"("dataSourceId");

-- CreateIndex
CREATE INDEX "data_points_timestamp_idx" ON "data_points"("timestamp");

-- CreateIndex
CREATE INDEX "data_points_tenantId_dataSourceId_timestamp_idx" ON "data_points"("tenantId", "dataSourceId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "data_points_dataSourceId_sourceHash_key" ON "data_points"("dataSourceId", "sourceHash");

-- CreateIndex
CREATE INDEX "aggregated_data_points_tenantId_dataSourceId_idx" ON "aggregated_data_points"("tenantId", "dataSourceId");

-- CreateIndex
CREATE INDEX "aggregated_data_points_periodStart_idx" ON "aggregated_data_points"("periodStart");

-- CreateIndex
CREATE INDEX "aggregated_data_points_tenantId_dataSourceId_period_periodS_idx" ON "aggregated_data_points"("tenantId", "dataSourceId", "period", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "aggregated_data_points_tenantId_dataSourceId_period_periodS_key" ON "aggregated_data_points"("tenantId", "dataSourceId", "period", "periodStart", "dimensionKey", "metricName");

-- CreateIndex
CREATE INDEX "dashboards_tenantId_idx" ON "dashboards"("tenantId");

-- CreateIndex
CREATE INDEX "dashboards_status_idx" ON "dashboards"("status");

-- CreateIndex
CREATE INDEX "widgets_dashboardId_idx" ON "widgets"("dashboardId");

-- CreateIndex
CREATE INDEX "widgets_tenantId_idx" ON "widgets"("tenantId");

-- CreateIndex
CREATE INDEX "widgets_dataSourceId_idx" ON "widgets"("dataSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "embed_configs_dashboardId_key" ON "embed_configs"("dashboardId");

-- CreateIndex
CREATE INDEX "embed_configs_tenantId_idx" ON "embed_configs"("tenantId");

-- CreateIndex
CREATE INDEX "query_cache_tenantId_idx" ON "query_cache"("tenantId");

-- CreateIndex
CREATE INDEX "query_cache_expiresAt_idx" ON "query_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "query_cache_widgetId_queryHash_key" ON "query_cache"("widgetId", "queryHash");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "audit_logs"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_source_configs" ADD CONSTRAINT "data_source_configs_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_mappings" ADD CONSTRAINT "field_mappings_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dead_letter_events" ADD CONSTRAINT "dead_letter_events_syncRunId_fkey" FOREIGN KEY ("syncRunId") REFERENCES "sync_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_points" ADD CONSTRAINT "data_points_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embed_configs" ADD CONSTRAINT "embed_configs_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embed_configs" ADD CONSTRAINT "embed_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
