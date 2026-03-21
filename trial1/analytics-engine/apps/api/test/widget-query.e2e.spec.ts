/**
 * E2E tests for widget query execution.
 * Covers: create data source with data -> create widget -> query returns correct aggregation.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createHash } from 'crypto';
import {
  createE2EApp,
  cleanDatabase,
  registerTenant,
  createDataSource,
  createDashboard,
  createWidget,
  E2EContext,
} from './e2e-helpers';

describe('Widget Query Execution (E2E)', () => {
  let ctx: E2EContext;

  beforeAll(async () => {
    ctx = await createE2EApp();
  }, 30000);

  afterAll(async () => {
    await cleanDatabase(ctx.prisma);
    await ctx.app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.prisma);
  });

  async function seedDataPoints(
    tenantId: string,
    dataSourceId: string,
    count: number = 10,
  ) {
    const dataPoints = [];
    for (let i = 0; i < count; i++) {
      const date = new Date('2026-03-01');
      date.setDate(date.getDate() + i);

      const dimensions = {
        date: date.toISOString().split('T')[0],
        region: i % 2 === 0 ? 'US' : 'EU',
      };
      const metrics = {
        value: (i + 1) * 100,
        sessions: (i + 1) * 10,
      };
      const sourceHash = createHash('sha256')
        .update(JSON.stringify({ ds: dataSourceId, ...dimensions, ...metrics }))
        .digest('hex');

      dataPoints.push({
        tenantId,
        dataSourceId,
        dimensions,
        metrics,
        timestamp: date,
        sourceHash,
      });
    }

    await ctx.prisma.dataPoint.createMany({ data: dataPoints });
    return dataPoints;
  }

  it('should query raw data from a widget (NONE grouping)', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken, {
      fieldMappings: [
        { sourceField: 'date', targetField: 'date', fieldType: 'DATE', fieldRole: 'DIMENSION' },
        { sourceField: 'region', targetField: 'region', fieldType: 'STRING', fieldRole: 'DIMENSION' },
        { sourceField: 'value', targetField: 'value', fieldType: 'NUMBER', fieldRole: 'METRIC' },
      ],
    });
    await seedDataPoints(tenantId, ds.id, 5);

    // Create dashboard + widget
    const dashboard = await createDashboard(ctx.app, accessToken);
    const widget = await createWidget(ctx.app, accessToken, dashboard.id, ds.id, {
      type: 'TABLE',
      dimensionField: 'date',
      metricFields: [{ field: 'value', aggregation: 'SUM' }],
      groupingPeriod: 'NONE',
    });

    // Query widget data
    const res = await request(ctx.app.getHttpServer())
      .get(`/api/widgets/${widget.id}/data`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveProperty('labels');
    expect(res.body.data).toHaveProperty('series');
    expect(res.body.data).toHaveProperty('meta');
    expect(res.body.data.meta.totalRows).toBeGreaterThan(0);
  });

  it('should execute a query via POST /api/query', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    await seedDataPoints(tenantId, ds.id, 10);

    const res = await request(ctx.app.getHttpServer())
      .post('/api/query')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dataSourceId: ds.id,
        dimensionField: 'date',
        metricFields: [{ field: 'value', aggregation: 'SUM' }],
        dateRangePreset: 'ALL_TIME',
        groupingPeriod: 'NONE',
      })
      .expect(200);

    expect(res.body.data.labels).toBeDefined();
    expect(res.body.data.series).toBeDefined();
    expect(res.body.data.series).toHaveLength(1);
    expect(res.body.data.series[0].name).toContain('value');
    // 10 data points, values are 100, 200, ..., 1000
    expect(res.body.data.meta.totalRows).toBe(10);
  });

  it('should query aggregated data with DAILY grouping', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Seed aggregated data points directly
    const aggPoints = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date('2026-03-01');
      date.setDate(date.getDate() + i);

      aggPoints.push({
        tenantId,
        dataSourceId: ds.id,
        period: 'DAILY' as const,
        periodStart: date,
        dimensionKey: 'all',
        metricName: 'value',
        sumValue: (i + 1) * 100,
        avgValue: (i + 1) * 100,
        countValue: 1,
        minValue: (i + 1) * 100,
        maxValue: (i + 1) * 100,
      });
    }

    await ctx.prisma.aggregatedDataPoint.createMany({ data: aggPoints });

    const res = await request(ctx.app.getHttpServer())
      .post('/api/query')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dataSourceId: ds.id,
        dimensionField: 'date',
        metricFields: [{ field: 'value', aggregation: 'SUM' }],
        dateRangePreset: 'ALL_TIME',
        groupingPeriod: 'DAILY',
      })
      .expect(200);

    expect(res.body.data.labels).toHaveLength(5);
    expect(res.body.data.series).toHaveLength(1);
    // Verify aggregated values: 100, 200, 300, 400, 500
    const sumSeries = res.body.data.series[0].data;
    expect(sumSeries).toHaveLength(5);
    expect(sumSeries[0]).toBe(100);
    expect(sumSeries[4]).toBe(500);
  });

  it('should enforce widget-per-dashboard limit (20)', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);

    // Create 20 widgets
    for (let i = 0; i < 20; i++) {
      await createWidget(ctx.app, accessToken, dashboard.id, ds.id, {
        title: `Widget ${i}`,
      });
    }

    // 21st should fail
    const res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/widgets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'LINE',
        title: 'Over Limit',
        dataSourceId: ds.id,
        dimensionField: 'date',
        metricFields: [{ field: 'value', aggregation: 'SUM' }],
      })
      .expect(422);

    expect(res.body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });

  it('should return query results with caching metadata', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    await seedDataPoints(tenantId, ds.id, 3);

    const res = await request(ctx.app.getHttpServer())
      .post('/api/query')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dataSourceId: ds.id,
        dimensionField: 'date',
        metricFields: [{ field: 'value', aggregation: 'SUM' }],
        dateRangePreset: 'ALL_TIME',
        groupingPeriod: 'NONE',
      })
      .expect(200);

    expect(res.body.data.meta).toHaveProperty('queryTime');
    expect(res.body.data.meta).toHaveProperty('fromCache');
    expect(typeof res.body.data.meta.queryTime).toBe('number');
  });
});
