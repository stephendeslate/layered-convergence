/**
 * E2E tests for tenant isolation.
 * Covers: tenant A cannot access tenant B's dashboards, data sources, or data.
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

describe('Tenant Isolation (E2E)', () => {
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

  it('should prevent tenant A from reading tenant B dashboards', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
      name: 'Tenant A',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
      name: 'Tenant B',
    });

    // Create dashboard as B
    const dashboard = await createDashboard(ctx.app, tenantB.accessToken, {
      name: 'B Secret Dashboard',
    });

    // Try to read it as A
    await request(ctx.app.getHttpServer())
      .get(`/api/dashboards/${dashboard.id}`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);
  });

  it('should prevent tenant A from listing tenant B dashboards', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    await createDashboard(ctx.app, tenantB.accessToken, {
      name: 'B Dashboard',
    });

    const res = await request(ctx.app.getHttpServer())
      .get('/api/dashboards')
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(200);

    // A should see zero dashboards
    expect(res.body.data).toHaveLength(0);
  });

  it('should prevent tenant A from reading tenant B data sources', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const ds = await createDataSource(ctx.app, tenantB.accessToken, {
      name: 'B Secret Source',
    });

    await request(ctx.app.getHttpServer())
      .get(`/api/data-sources/${ds.id}`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);
  });

  it('should prevent tenant A from deleting tenant B resources', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const dashboard = await createDashboard(ctx.app, tenantB.accessToken);

    // A cannot delete B's dashboard
    await request(ctx.app.getHttpServer())
      .delete(`/api/dashboards/${dashboard.id}`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);

    // Verify B can still see it
    const res = await request(ctx.app.getHttpServer())
      .get(`/api/dashboards/${dashboard.id}`)
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(dashboard.id);
  });

  it('should prevent tenant A from triggering sync on tenant B data source', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const ds = await createDataSource(ctx.app, tenantB.accessToken);

    await request(ctx.app.getHttpServer())
      .post(`/api/data-sources/${ds.id}/sync`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);
  });

  it('should prevent tenant A from accessing tenant B sync history', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const ds = await createDataSource(ctx.app, tenantB.accessToken);

    await request(ctx.app.getHttpServer())
      .get(`/api/data-sources/${ds.id}/sync-history`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);
  });

  it('should prevent tenant A from revoking tenant B API keys', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const keyRes = await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .send({ name: 'B Key', type: 'EMBED' })
      .expect(201);

    // A tries to revoke B's key
    await request(ctx.app.getHttpServer())
      .delete(`/api/api-keys/${keyRes.body.data.id}`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);
  });

  it('should prevent cross-tenant embed config access', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const ds = await createDataSource(ctx.app, tenantB.accessToken);
    const dashboard = await createDashboard(ctx.app, tenantB.accessToken);
    await createWidget(ctx.app, tenantB.accessToken, dashboard.id, ds.id);

    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .expect(200);

    const embedRes = await request(ctx.app.getHttpServer())
      .post('/api/embeds')
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://b-site.com'],
        isEnabled: true,
      })
      .expect(201);

    // A cannot read B's embed config
    await request(ctx.app.getHttpServer())
      .get(`/api/embeds/${embedRes.body.data.id}`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(404);
  });

  it('should isolate API key lists between tenants', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    // Create keys for both
    await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .send({ name: 'A Key', type: 'ADMIN' })
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .send({ name: 'B Key 1', type: 'EMBED' })
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .send({ name: 'B Key 2', type: 'EMBED' })
      .expect(201);

    // A should only see 1 key
    const resA = await request(ctx.app.getHttpServer())
      .get('/api/api-keys')
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .expect(200);
    expect(resA.body.data).toHaveLength(1);
    expect(resA.body.data[0].name).toBe('A Key');

    // B should see 2 keys
    const resB = await request(ctx.app.getHttpServer())
      .get('/api/api-keys')
      .set('Authorization', `Bearer ${tenantB.accessToken}`)
      .expect(200);
    expect(resB.body.data).toHaveLength(2);
  });

  it('should prevent tenant A from adding widgets to tenant B dashboard', async () => {
    const tenantA = await registerTenant(ctx.app, {
      email: 'a@example.com',
    });
    const tenantB = await registerTenant(ctx.app, {
      email: 'b@example.com',
    });

    const dsA = await createDataSource(ctx.app, tenantA.accessToken);
    const dashB = await createDashboard(ctx.app, tenantB.accessToken);

    // A tries to add a widget to B's dashboard
    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashB.id}/widgets`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .send({
        type: 'LINE',
        title: 'Injection Attempt',
        dataSourceId: dsA.id,
        dimensionField: 'date',
        metricFields: [{ field: 'value', aggregation: 'SUM' }],
      })
      .expect(404);
  });
});
