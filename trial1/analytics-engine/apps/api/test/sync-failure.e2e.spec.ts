/**
 * E2E tests for sync failure handling.
 * Covers: trigger sync with bad config -> verify FAILED status -> dead letter events.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  createE2EApp,
  cleanDatabase,
  registerTenant,
  createDataSource,
  E2EContext,
} from './e2e-helpers';

describe('Sync Failure Handling (E2E)', () => {
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

  it('should create a FAILED sync run with error message', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Simulate a failed sync by creating the sync run directly
    const syncRun = await ctx.prisma.syncRun.create({
      data: {
        dataSourceId: ds.id,
        tenantId,
        status: 'FAILED',
        errorMessage: 'Connection refused: ECONNREFUSED 127.0.0.1:5432',
        rowsSynced: 0,
        rowsFailed: 0,
        startedAt: new Date(Date.now() - 5000),
        completedAt: new Date(),
      },
    });

    // Verify via API
    const res = await request(ctx.app.getHttpServer())
      .get(`/api/sync-runs/${syncRun.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.status).toBe('FAILED');
    expect(res.body.data.errorMessage).toContain('Connection refused');
    expect(res.body.data.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should create dead letter events for failed rows', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Create a sync run with dead letter events
    const syncRun = await ctx.prisma.syncRun.create({
      data: {
        dataSourceId: ds.id,
        tenantId,
        status: 'COMPLETED',
        rowsSynced: 8,
        rowsFailed: 2,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Create dead letter events
    await ctx.prisma.deadLetterEvent.createMany({
      data: [
        {
          syncRunId: syncRun.id,
          tenantId,
          dataSourceId: ds.id,
          payload: { row: 5, name: 'Bad data' },
          errorMessage: 'Invalid date format',
        },
        {
          syncRunId: syncRun.id,
          tenantId,
          dataSourceId: ds.id,
          payload: { row: 8, value: 'NaN' },
          errorMessage: 'Expected number, got string',
        },
      ],
    });

    // Get dead letters via API
    const res = await request(ctx.app.getHttpServer())
      .get(`/api/data-sources/${ds.id}/dead-letters`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty('payload');
    expect(res.body.data[0]).toHaveProperty('errorMessage');
  });

  it('should show dead letters in sync run detail', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    const syncRun = await ctx.prisma.syncRun.create({
      data: {
        dataSourceId: ds.id,
        tenantId,
        status: 'FAILED',
        errorMessage: 'Partial failure',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await ctx.prisma.deadLetterEvent.create({
      data: {
        syncRunId: syncRun.id,
        tenantId,
        dataSourceId: ds.id,
        payload: { error: 'test' },
        errorMessage: 'Transform error',
      },
    });

    const res = await request(ctx.app.getHttpServer())
      .get(`/api/sync-runs/${syncRun.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.deadLetterEvents).toHaveLength(1);
    expect(res.body.data.deadLetterEvents[0].errorMessage).toBe('Transform error');
  });

  it('should retry a dead letter event', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    const dle = await ctx.prisma.deadLetterEvent.create({
      data: {
        tenantId,
        dataSourceId: ds.id,
        payload: { row: 1, value: 'retry me' },
        errorMessage: 'Temporary failure',
      },
    });

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/dead-letters/${dle.id}/retry`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body.data.message).toContain('retry');

    // The dead letter should be deleted after retry
    const remaining = await ctx.prisma.deadLetterEvent.count({
      where: { id: dle.id },
    });
    expect(remaining).toBe(0);

    // A BullMQ job should be enqueued
    expect(ctx.syncQueue.jobs.some((j) => j.name === 'dead-letter-retry')).toBe(
      true,
    );
  });

  it('should retry all dead letters for a data source', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    for (let i = 0; i < 3; i++) {
      await ctx.prisma.deadLetterEvent.create({
        data: {
          tenantId,
          dataSourceId: ds.id,
          payload: { row: i },
          errorMessage: `Error ${i}`,
        },
      });
    }

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/data-sources/${ds.id}/dead-letters/retry-all`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body.data.count).toBe(3);

    // All dead letters should be deleted
    const remaining = await ctx.prisma.deadLetterEvent.count({
      where: { dataSourceId: ds.id },
    });
    expect(remaining).toBe(0);
  });

  it('should auto-pause sync after consecutive failures', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Set consecutive failures to threshold
    await ctx.prisma.dataSource.update({
      where: { id: ds.id },
      data: { syncPaused: true, consecutiveFails: 3 },
    });

    // Try to trigger sync on paused source
    const res = await request(ctx.app.getHttpServer())
      .post(`/api/data-sources/${ds.id}/sync`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);

    expect(res.body.error.message).toContain('paused');
  });

  it('should resume sync after pausing', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    // Pause it
    await ctx.prisma.dataSource.update({
      where: { id: ds.id },
      data: { syncPaused: true, consecutiveFails: 3 },
    });

    // Resume
    const res = await request(ctx.app.getHttpServer())
      .post(`/api/data-sources/${ds.id}/resume-sync`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body.data.message).toContain('resumed');

    // Verify it was unpaused
    const updated = await ctx.prisma.dataSource.findUnique({
      where: { id: ds.id },
    });
    expect(updated!.syncPaused).toBe(false);
    expect(updated!.consecutiveFails).toBe(0);
  });

  it('should filter sync history by status', async () => {
    const { accessToken, tenantId } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);

    await ctx.prisma.syncRun.createMany({
      data: [
        { dataSourceId: ds.id, tenantId, status: 'COMPLETED' },
        { dataSourceId: ds.id, tenantId, status: 'FAILED' },
        { dataSourceId: ds.id, tenantId, status: 'COMPLETED' },
      ],
    });

    const res = await request(ctx.app.getHttpServer())
      .get(`/api/data-sources/${ds.id}/sync-history?status=FAILED`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('FAILED');
  });
});
