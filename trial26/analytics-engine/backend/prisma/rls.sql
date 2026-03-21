-- [TRACED:AE-001] Multi-tenant data isolation via RLS
-- [TRACED:AE-028] FORCE ROW LEVEL SECURITY on ALL tables
-- [TRACED:SEC-001] Row Level Security for all Analytics Engine tables
-- FORCE ROW LEVEL SECURITY on ALL tables

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources FORCE ROW LEVEL SECURITY;

ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points FORCE ROW LEVEL SECURITY;

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines FORCE ROW LEVEL SECURITY;

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets FORCE ROW LEVEL SECURITY;

ALTER TABLE embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeds FORCE ROW LEVEL SECURITY;

ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_data_sources ON data_sources
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_pipelines ON pipelines
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_dashboards ON dashboards
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_embeds ON embeds
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_data_points ON data_points
  USING (data_source_id IN (
    SELECT id FROM data_sources
    WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_widgets ON widgets
  USING (dashboard_id IN (
    SELECT id FROM dashboards
    WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_sync_runs ON sync_runs
  USING (data_source_id IN (
    SELECT id FROM data_sources
    WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));
