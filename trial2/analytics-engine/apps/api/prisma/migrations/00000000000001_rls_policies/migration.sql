-- Row Level Security policies for all tenant-scoped tables.
-- The application sets `app.current_tenant_id` via:
--   SELECT set_config('app.current_tenant_id', $1, true);
-- before every request (see PrismaService.setTenantContext).

-- ============================================================
-- dashboards (tenantId column)
-- ============================================================
ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboards_tenant_isolation" ON "dashboards"
    USING ("tenantId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- data_sources (tenantId column)
-- ============================================================
ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_sources_tenant_isolation" ON "data_sources"
    USING ("tenantId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- widgets (no direct tenantId — scoped via dashboardId FK)
-- Joined policy: widget belongs to a dashboard that belongs to the current tenant.
-- ============================================================
ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "widgets_tenant_isolation" ON "widgets"
    USING (
        EXISTS (
            SELECT 1 FROM "dashboards"
            WHERE "dashboards"."id" = "widgets"."dashboardId"
              AND "dashboards"."tenantId" = current_setting('app.current_tenant_id', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "dashboards"
            WHERE "dashboards"."id" = "widgets"."dashboardId"
              AND "dashboards"."tenantId" = current_setting('app.current_tenant_id', true)
        )
    );

-- ============================================================
-- data_points (tenantId column)
-- ============================================================
ALTER TABLE "data_points" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_points_tenant_isolation" ON "data_points"
    USING ("tenantId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- sync_runs (no direct tenantId — scoped via dataSourceId FK)
-- Joined policy: sync_run belongs to a data_source that belongs to the current tenant.
-- ============================================================
ALTER TABLE "sync_runs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_runs_tenant_isolation" ON "sync_runs"
    USING (
        EXISTS (
            SELECT 1 FROM "data_sources"
            WHERE "data_sources"."id" = "sync_runs"."dataSourceId"
              AND "data_sources"."tenantId" = current_setting('app.current_tenant_id', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "data_sources"
            WHERE "data_sources"."id" = "sync_runs"."dataSourceId"
              AND "data_sources"."tenantId" = current_setting('app.current_tenant_id', true)
        )
    );

-- ============================================================
-- embed_configs (no direct tenantId — scoped via dashboardId FK)
-- Joined policy: embed_config belongs to a dashboard that belongs to the current tenant.
-- ============================================================
ALTER TABLE "embed_configs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "embed_configs_tenant_isolation" ON "embed_configs"
    USING (
        EXISTS (
            SELECT 1 FROM "dashboards"
            WHERE "dashboards"."id" = "embed_configs"."dashboardId"
              AND "dashboards"."tenantId" = current_setting('app.current_tenant_id', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "dashboards"
            WHERE "dashboards"."id" = "embed_configs"."dashboardId"
              AND "dashboards"."tenantId" = current_setting('app.current_tenant_id', true)
        )
    );

-- ============================================================
-- query_cache (tenantId column)
-- ============================================================
ALTER TABLE "query_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "query_cache_tenant_isolation" ON "query_cache"
    USING ("tenantId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- dead_letter_events (tenantId column)
-- ============================================================
ALTER TABLE "dead_letter_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dead_letter_events_tenant_isolation" ON "dead_letter_events"
    USING ("tenantId" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));
