-- [TRACED:SEC-002] Row Level Security policies for multi-tenant isolation
-- All tables enforce tenant-based RLS using current_setting('app.tenant_id')

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

-- [TRACED:SEC-003] FORCE ROW LEVEL SECURITY on all tables
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE data_sources FORCE ROW LEVEL SECURITY;
ALTER TABLE data_points FORCE ROW LEVEL SECURITY;
ALTER TABLE pipelines FORCE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;
ALTER TABLE widgets FORCE ROW LEVEL SECURITY;
ALTER TABLE embeds FORCE ROW LEVEL SECURITY;
ALTER TABLE sync_runs FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_tenants ON tenants
  USING (id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_data_sources ON data_sources
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_data_points ON data_points
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.tenant_id', true)
  ));

CREATE POLICY tenant_isolation_pipelines ON pipelines
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_dashboards ON dashboards
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_widgets ON widgets
  USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id = current_setting('app.tenant_id', true)
  ));

CREATE POLICY tenant_isolation_embeds ON embeds
  USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id = current_setting('app.tenant_id', true)
  ));

CREATE POLICY tenant_isolation_sync_runs ON sync_runs
  USING (pipeline_id IN (
    SELECT id FROM pipelines WHERE tenant_id = current_setting('app.tenant_id', true)
  ));
