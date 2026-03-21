-- [TRACED:SEC-002] Row Level Security policies for all tenant-scoped tables
-- [TRACED:SEC-003] FORCE ROW LEVEL SECURITY ensures table owners are also subject to RLS
-- [TRACED:DM-006] RLS policies filter on current_setting('app.tenant_id')

-- Enable and FORCE RLS on all tenant-scoped tables

-- tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON tenants
  USING (id = current_setting('app.tenant_id', true));

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY user_tenant_isolation_policy ON users
  USING (tenant_id = current_setting('app.tenant_id', true));

-- data_sources
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources FORCE ROW LEVEL SECURITY;
CREATE POLICY data_source_tenant_isolation_policy ON data_sources
  USING (tenant_id = current_setting('app.tenant_id', true));

-- data_points
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points FORCE ROW LEVEL SECURITY;
CREATE POLICY data_point_tenant_isolation_policy ON data_points
  USING (tenant_id = current_setting('app.tenant_id', true));

-- pipelines
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines FORCE ROW LEVEL SECURITY;
CREATE POLICY pipeline_tenant_isolation_policy ON pipelines
  USING (tenant_id = current_setting('app.tenant_id', true));

-- dashboards
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;
CREATE POLICY dashboard_tenant_isolation_policy ON dashboards
  USING (tenant_id = current_setting('app.tenant_id', true));

-- widgets
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets FORCE ROW LEVEL SECURITY;
CREATE POLICY widget_tenant_isolation_policy ON widgets
  USING (tenant_id = current_setting('app.tenant_id', true));

-- embeds
ALTER TABLE embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeds FORCE ROW LEVEL SECURITY;
CREATE POLICY embed_tenant_isolation_policy ON embeds
  USING (tenant_id = current_setting('app.tenant_id', true));

-- sync_runs
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs FORCE ROW LEVEL SECURITY;
CREATE POLICY sync_run_tenant_isolation_policy ON sync_runs
  USING (tenant_id = current_setting('app.tenant_id', true));
