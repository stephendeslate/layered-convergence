-- RLS Policies for Analytics Engine [VERIFY:RLS]
-- Defense-in-depth: Prisma connects as DB owner, bypasses RLS.
-- Primary isolation is application-level WHERE tenantId clauses.

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dashboards ON dashboards
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_data_sources ON data_sources
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_data_points ON data_points
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_widgets ON widgets
  USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
  ));

CREATE POLICY tenant_isolation_sync_runs ON sync_runs
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
  ));

CREATE POLICY tenant_isolation_dead_letters ON dead_letter_events
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
  ));

CREATE POLICY tenant_isolation_embed ON embed_configs
  USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
  ));

CREATE POLICY tenant_isolation_ds_configs ON data_source_configs
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
  ));
