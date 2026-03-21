/**
 * E2E tests for the dashboard lifecycle.
 * Covers: create (DRAFT) -> add widgets -> publish -> verify embed accessible.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  createE2EApp,
  cleanDatabase,
  registerTenant,
  createDataSource,
  createDashboard,
  createWidget,
  E2EContext,
} from './e2e-helpers';

describe('Dashboard Lifecycle (E2E)', () => {
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

  it('should create a dashboard in DRAFT status', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    const dashboard = await createDashboard(ctx.app, accessToken, {
      name: 'My Dashboard',
      description: 'Test description',
    });

    expect(dashboard.name).toBe('My Dashboard');
    expect(dashboard.status).toBe('DRAFT');
    expect(dashboard.gridColumns).toBe(12);
  });

  it('should add widgets to a DRAFT dashboard', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);

    const widget = await createWidget(ctx.app, accessToken, dashboard.id, ds.id, {
      type: 'BAR',
      title: 'Revenue Chart',
    });

    expect(widget.type).toBe('BAR');
    expect(widget.title).toBe('Revenue Chart');
    expect(widget.dashboardId).toBe(dashboard.id);
  });

  it('should reject adding widgets to a PUBLISHED dashboard', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id);

    // Publish
    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Try to add another widget
    const res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/widgets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'LINE',
        title: 'Should Fail',
        dataSourceId: ds.id,
        dimensionField: 'date',
        metricFields: [{ field: 'value', aggregation: 'SUM' }],
      })
      .expect(409);

    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should require at least 1 widget to publish', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const dashboard = await createDashboard(ctx.app, accessToken);

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(422);

    expect(res.body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });

  it('should transition DRAFT -> PUBLISHED -> ARCHIVED -> DRAFT', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id);

    // DRAFT -> PUBLISHED
    let res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.data.status).toBe('PUBLISHED');

    // PUBLISHED -> ARCHIVED
    res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/archive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.data.status).toBe('ARCHIVED');

    // ARCHIVED -> DRAFT
    res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/revert-to-draft`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('should reject invalid state transitions', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const dashboard = await createDashboard(ctx.app, accessToken);

    // DRAFT -> ARCHIVED is not allowed
    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/archive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);
  });

  it('should publish and create embed config with allowed origins', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id);

    // Publish
    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Create embed config
    const embedRes = await request(ctx.app.getHttpServer())
      .post('/api/embeds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://mysite.com'],
        isEnabled: true,
      })
      .expect(201);

    expect(embedRes.body.data.allowedOrigins).toEqual(['https://mysite.com']);
    expect(embedRes.body.data.isEnabled).toBe(true);
  });

  it('should list dashboards with pagination', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    // Create 3 dashboards
    for (let i = 0; i < 3; i++) {
      await createDashboard(ctx.app, accessToken, { name: `Dashboard ${i}` });
    }

    const res = await request(ctx.app.getHttpServer())
      .get('/api/dashboards?limit=2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pagination.hasMore).toBe(true);
    expect(res.body.meta.pagination.cursor).toBeDefined();

    // Fetch next page
    const res2 = await request(ctx.app.getHttpServer())
      .get(`/api/dashboards?limit=2&cursor=${res.body.meta.pagination.cursor}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res2.body.data).toHaveLength(1);
    expect(res2.body.meta.pagination.hasMore).toBe(false);
  });

  it('should duplicate a dashboard', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken, {
      name: 'Original',
    });
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id, {
      title: 'Original Widget',
    });

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/duplicate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body.data.name).toBe('Original (Copy)');
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.widgets).toHaveLength(1);
    expect(res.body.data.id).not.toBe(dashboard.id);
  });

  it('should delete a dashboard', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const dashboard = await createDashboard(ctx.app, accessToken);

    await request(ctx.app.getHttpServer())
      .delete(`/api/dashboards/${dashboard.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // Verify it's gone
    await request(ctx.app.getHttpServer())
      .get(`/api/dashboards/${dashboard.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
