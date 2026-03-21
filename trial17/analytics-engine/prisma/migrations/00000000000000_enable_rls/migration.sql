-- Enable Row-Level Security on all tenant-scoped tables
-- This provides database-level isolation in addition to application-level filtering

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pipeline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dashboard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Widget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Embed" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataPoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QueryCache" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using app.current_tenant_id session variable
CREATE POLICY tenant_isolation_user ON "User"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_datasource ON "DataSource"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_pipeline ON "Pipeline"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_dashboard ON "Dashboard"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_widget ON "Widget"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_embed ON "Embed"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_datapoint ON "DataPoint"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_syncrun ON "SyncRun"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_querycache ON "QueryCache"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));
