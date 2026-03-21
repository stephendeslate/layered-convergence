-- Analytics Engine — Row Level Security Policies
-- Tenant isolation: all data scoped to tenant_id via RLS

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Dashboard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Widget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataSourceConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataPoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmbedConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeadLetterEvent" ENABLE ROW LEVEL SECURITY;

-- Dashboard: scoped to tenantId
CREATE POLICY "tenant_isolation_dashboard" ON "Dashboard"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- Widget: scoped via dashboard -> tenant
CREATE POLICY "tenant_isolation_widget" ON "Widget"
  USING ("dashboardId" IN (
    SELECT id FROM "Dashboard" WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- DataSource: scoped to tenantId
CREATE POLICY "tenant_isolation_datasource" ON "DataSource"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- DataSourceConfig: scoped via data source -> tenant
CREATE POLICY "tenant_isolation_datasource_config" ON "DataSourceConfig"
  USING ("dataSourceId" IN (
    SELECT id FROM "DataSource" WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- SyncRun: scoped via data source -> tenant
CREATE POLICY "tenant_isolation_syncrun" ON "SyncRun"
  USING ("dataSourceId" IN (
    SELECT id FROM "DataSource" WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- DataPoint: scoped to tenantId directly
CREATE POLICY "tenant_isolation_datapoint" ON "DataPoint"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- EmbedConfig: scoped via dashboard -> tenant
CREATE POLICY "tenant_isolation_embedconfig" ON "EmbedConfig"
  USING ("dashboardId" IN (
    SELECT id FROM "Dashboard" WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- DeadLetterEvent: scoped via data source -> tenant
CREATE POLICY "tenant_isolation_deadletter" ON "DeadLetterEvent"
  USING ("dataSourceId" IN (
    SELECT id FROM "DataSource" WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));
