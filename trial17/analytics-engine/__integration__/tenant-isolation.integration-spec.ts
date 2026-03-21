import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { DataSourceService } from '../src/data-source/data-source.service';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { WidgetService } from '../src/widget/widget.service';
import { PipelineService } from '../src/pipeline/pipeline.service';
import { EmbedService } from '../src/embed/embed.service';
import { DataPointService } from '../src/data-point/data-point.service';
import { SyncRunService } from '../src/sync-run/sync-run.service';

/**
 * Integration test: Tenant Isolation
 *
 * Verifies that data created by one tenant is not accessible by another tenant.
 * Uses real database (no mocks) — requires running PostgreSQL.
 */
describe('Tenant Isolation Integration', () => {
  let prisma: PrismaService;
  let dataSourceService: DataSourceService;
  let dashboardService: DashboardService;
  let widgetService: WidgetService;
  let pipelineService: PipelineService;
  let embedService: EmbedService;
  let dataPointService: DataPointService;
  let syncRunService: SyncRunService;

  const tenantA = 'tenant-a-' + Date.now();
  const tenantB = 'tenant-b-' + Date.now();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        DataSourceService,
        DashboardService,
        WidgetService,
        PipelineService,
        EmbedService,
        DataPointService,
        SyncRunService,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    dataSourceService = module.get<DataSourceService>(DataSourceService);
    dashboardService = module.get<DashboardService>(DashboardService);
    widgetService = module.get<WidgetService>(WidgetService);
    pipelineService = module.get<PipelineService>(PipelineService);
    embedService = module.get<EmbedService>(EmbedService);
    dataPointService = module.get<DataPointService>(DataPointService);
    syncRunService = module.get<SyncRunService>(SyncRunService);

    await prisma.onModuleInit();
  });

  afterAll(async () => {
    await prisma.dataPoint.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.syncRun.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.widget.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.embed.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.pipeline.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.dashboard.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.dataSource.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.queryCache.deleteMany({
      where: { tenantId: { in: [tenantA, tenantB] } },
    });
    await prisma.onModuleDestroy();
  });

  describe('DataSource isolation', () => {
    it('should not return data sources from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'Tenant A Source',
        type: 'POSTGRESQL',
        config: { host: 'localhost' },
      });

      const dsB = await dataSourceService.create(tenantB, {
        name: 'Tenant B Source',
        type: 'MYSQL',
        config: { host: 'remote' },
      });

      const tenantASources = await dataSourceService.findAll(tenantA);
      const tenantBSources = await dataSourceService.findAll(tenantB);

      expect(tenantASources.map((s) => s.id)).toContain(dsA.id);
      expect(tenantASources.map((s) => s.id)).not.toContain(dsB.id);
      expect(tenantBSources.map((s) => s.id)).toContain(dsB.id);
      expect(tenantBSources.map((s) => s.id)).not.toContain(dsA.id);
    });

    it('should not allow accessing data source by ID from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'Private Source',
        type: 'API',
        config: { url: 'https://api.internal.com' },
      });

      await expect(
        dataSourceService.findOne(tenantB, dsA.id),
      ).rejects.toThrow();
    });

    it('should not allow updating data source from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'Protected Source',
        type: 'CSV',
        config: {},
      });

      await expect(
        dataSourceService.update(tenantB, dsA.id, { name: 'Hijacked' }),
      ).rejects.toThrow();
    });

    it('should not allow deleting data source from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'Undeleteable by B',
        type: 'POSTGRESQL',
        config: {},
      });

      await expect(
        dataSourceService.remove(tenantB, dsA.id),
      ).rejects.toThrow();

      const found = await dataSourceService.findOne(tenantA, dsA.id);
      expect(found.id).toBe(dsA.id);
    });
  });

  describe('Dashboard isolation', () => {
    it('should not return dashboards from another tenant', async () => {
      await dashboardService.create(tenantA, { name: 'A Dashboard' });
      await dashboardService.create(tenantB, { name: 'B Dashboard' });

      const tenantADashboards = await dashboardService.findAll(tenantA);
      const tenantBDashboards = await dashboardService.findAll(tenantB);

      const aNames = tenantADashboards.map((d) => d.name);
      const bNames = tenantBDashboards.map((d) => d.name);

      expect(aNames).toContain('A Dashboard');
      expect(aNames).not.toContain('B Dashboard');
      expect(bNames).toContain('B Dashboard');
      expect(bNames).not.toContain('A Dashboard');
    });

    it('should not allow accessing dashboard by ID from another tenant', async () => {
      const dbA = await dashboardService.create(tenantA, { name: 'Secret Dashboard' });

      await expect(
        dashboardService.findOne(tenantB, dbA.id),
      ).rejects.toThrow();
    });
  });

  describe('Pipeline isolation', () => {
    it('should not return pipelines from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'Pipeline Source A',
        type: 'POSTGRESQL',
        config: {},
      });

      await pipelineService.create(tenantA, {
        name: 'A Pipeline',
        config: {},
        dataSourceId: dsA.id,
      });

      const tenantBPipelines = await pipelineService.findAll(tenantB);
      const pipelineNames = tenantBPipelines.map((p) => p.name);

      expect(pipelineNames).not.toContain('A Pipeline');
    });
  });

  describe('Widget isolation', () => {
    it('should not allow creating widget on another tenants dashboard', async () => {
      const dbA = await dashboardService.create(tenantA, {
        name: 'A Widget Dashboard',
      });

      await expect(
        widgetService.create(tenantB, {
          dashboardId: dbA.id,
          type: 'LINE',
          title: 'Malicious Widget',
          config: {},
          position: { x: 0, y: 0 },
        }),
      ).rejects.toThrow();
    });
  });

  describe('SyncRun isolation', () => {
    it('should not return sync runs from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'Sync Source A',
        type: 'POSTGRESQL',
        config: {},
      });

      await syncRunService.create(tenantA, { dataSourceId: dsA.id });

      const tenantBRuns = await syncRunService.findAll(tenantB);
      expect(tenantBRuns).toHaveLength(0);
    });
  });

  describe('DataPoint isolation', () => {
    it('should not return data points from another tenant', async () => {
      const dsA = await dataSourceService.create(tenantA, {
        name: 'DataPoint Source A',
        type: 'POSTGRESQL',
        config: {},
      });

      await dataPointService.create(tenantA, {
        dataSourceId: dsA.id,
        metric: 'secret_metric',
        value: 42,
        timestamp: new Date().toISOString(),
      });

      const tenantBPoints = await dataPointService.query(tenantB, {
        metric: 'secret_metric',
      });

      expect(tenantBPoints.data).toHaveLength(0);
    });
  });
});
