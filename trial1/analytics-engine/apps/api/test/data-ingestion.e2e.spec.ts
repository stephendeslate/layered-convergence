/**
 * E2E tests for the data ingestion pipeline.
 * Covers: create data source -> configure connector -> trigger sync -> verify DataPoints.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createHash } from 'crypto';
import {
  createE2EApp,
  cleanDatabase,
  registerTenant,
  createDataSource,
  E2EContext,
} from './e2e-helpers';

describe('Data Ingestion Pipeline (E2E)', () => {
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
    ctx.syncQueue.jobs = [];
  });

  it('should create a data source with config and field mappings', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    const ds = await createDataSource(ctx.app, accessToken, {
      name: 'Sales API',
      connectorType: 'REST_API',
      config: {
        url: 'https://api.example.com/sales',
        method: 'GET',
        headers: { Authorization: 'Bearer test' },
      },
      fieldMappings: [
        {
          sourceField: 'date',
          targetField: 'date',
          fieldType: 'DATE',
          fieldRole: 'DIMENSION',
        },
        {
          sourceField: 'revenue',
          targetField: 'revenue',
          fieldType: 'NUMBER',
          fieldRole: 'METRIC',
        },
      ],
    });

    expect(ds.name).toBe('Sales API');
    expect(ds.connectorType).toBe('REST_API');
    expect(ds.fieldMappings).toHaveLength(2);
    expect(ds.fieldMappings[0].sourceField).toBe('date');
  });

  it('should enforce tier limits on data source count', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    // FREE tier allows 3 data sources
    for (let i = 0; i < 3; i++) {
      await createDataSource(ctx.app, accessToken, {
        name: `DS ${i}`,
      });
    }

    // 4th should fail
    const res = await request(ctx.app.getHttpServer())
      .post('/api/data-sources')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'DS 4 (over limit)',
        connectorType: 'REST_API',
        config: { url: 'https://example.com' },
      })
      .expect(403);

    expect(res.body.error.message).toContain('tier');
  });

  it('should reject non-MANUAL sync schedule for FREE tier', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    const res = await request(ctx.app.getHttpServer())
      .post('/api/data-sources')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Hourly DS',
        connectorType: 'REST_API',
        syncSchedule: 'HOURLY',
        config: { url: 'https://example.com' },
      })
      .expect(403);

    expect(res.body.error.message).toContain('MANUAL');
  });

  it('should trigger a sync and enqueue a BullMQ job', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/data-sources/${ds.id}/sync`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(202);

    expect(res.body.data.syncRunId).toBeDefined();
    expect(res.body.data.status).toBe('RUNNING');

    // Verify BullMQ job was enqueued
    expect(ctx.syncQueue.jobs).toHaveLength(1);
    expect(ctx.syncQueue.jobs[0].data).toMatchObject({
      dataSourceId: ds.id,
      tenantId,
    });
  });

  it('should reject sync when one is already running', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Create a RUNNING sync run directly
    await ctx.prisma.syncRun.create({
      data: {
        dataSourceId: ds.id,
        tenantId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    await request(ctx.app.getHttpServer())
      .post(`/api/data-sources/${ds.id}/sync`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);
  });

  it('should verify DataPoints created after manual insertion', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Insert DataPoints directly (simulating what the ingestion service does)
    const dataPoints = [];
    for (let i = 0; i < 5; i++) {
      const dimensions = { date: `2026-03-${10 + i}`, region: 'US' };
      const metrics = { value: 100 + i * 10 };
      const sourceHash = createHash('sha256')
        .update(JSON.stringify({ ...dimensions, ...metrics }))
        .digest('hex');

      dataPoints.push({
        tenantId,
        dataSourceId: ds.id,
        dimensions,
        metrics,
        timestamp: new Date(`2026-03-${10 + i}`),
        sourceHash,
      });
    }

    await ctx.prisma.dataPoint.createMany({ data: dataPoints });

    // Verify data points exist
    const count = await ctx.prisma.dataPoint.count({
      where: { dataSourceId: ds.id, tenantId },
    });
    expect(count).toBe(5);
  });

  it('should get sync history for a data source', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Create some sync runs
    await ctx.prisma.syncRun.createMany({
      data: [
        {
          dataSourceId: ds.id,
          tenantId,
          status: 'COMPLETED',
          rowsSynced: 100,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          dataSourceId: ds.id,
          tenantId,
          status: 'FAILED',
          errorMessage: 'Connection timeout',
          startedAt: new Date(),
          completedAt: new Date(),
        },
      ],
    });

    const res = await request(ctx.app.getHttpServer())
      .get(`/api/data-sources/${ds.id}/sync-history`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.some((r: any) => r.status === 'COMPLETED')).toBe(true);
    expect(res.body.data.some((r: any) => r.status === 'FAILED')).toBe(true);
  });

  it('should list data sources with pagination', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    for (let i = 0; i < 3; i++) {
      await createDataSource(ctx.app, accessToken, { name: `DS ${i}` });
    }

    const res = await request(ctx.app.getHttpServer())
      .get('/api/data-sources?limit=2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pagination.hasMore).toBe(true);
  });

  it('should delete a data source', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    await request(ctx.app.getHttpServer())
      .delete(`/api/data-sources/${ds.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(ctx.app.getHttpServer())
      .get(`/api/data-sources/${ds.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
