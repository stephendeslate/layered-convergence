import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  TestContext,
  createTestApp,
  cleanDatabase,
  createTestTenant,
  createTestUser,
  createTestDataSource,
  generateAuthToken,
  teardownTestApp,
} from './helpers';
import * as request from 'supertest';

describe('Tenant Isolation (Integration)', () => {
  let ctx: TestContext;

  let tenantA: { id: string };
  let tenantB: { id: string };
  let tokenA: string;
  let tokenB: string;
  let dsA: { id: string };
  let dsB: { id: string };

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.prisma);

    tenantA = await createTestTenant(ctx.prisma, { name: 'Tenant A', slug: `a-${Date.now()}` });
    tenantB = await createTestTenant(ctx.prisma, { name: 'Tenant B', slug: `b-${Date.now()}` });

    const userA = await createTestUser(ctx.prisma, tenantA.id, { email: `a-${Date.now()}@test.com` });
    const userB = await createTestUser(ctx.prisma, tenantB.id, { email: `b-${Date.now()}@test.com` });

    tokenA = generateAuthToken(ctx.authService, userA);
    tokenB = generateAuthToken(ctx.authService, userB);

    dsA = await createTestDataSource(ctx.prisma, tenantA.id, { name: 'DS for A' });
    dsB = await createTestDataSource(ctx.prisma, tenantB.id, { name: 'DS for B' });
  });

  it('tenant A cannot see tenant B data sources', async () => {
    const resA = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('DS for A');

    const resB = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('DS for B');
  });

  it('tenant A cannot access tenant B data source by ID', async () => {
    await request(ctx.app.getHttpServer())
      .get(`/data-sources/${dsB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });

  it('tenant A cannot update tenant B data source', async () => {
    await request(ctx.app.getHttpServer())
      .put(`/data-sources/${dsB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Hacked' })
      .expect(404);
  });

  it('tenant A cannot delete tenant B data source', async () => {
    await request(ctx.app.getHttpServer())
      .delete(`/data-sources/${dsB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);

    // Verify it still exists for tenant B
    await request(ctx.app.getHttpServer())
      .get(`/data-sources/${dsB.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
  });

  it('dashboards are isolated between tenants', async () => {
    // Create dashboard for tenant A
    const dashRes = await request(ctx.app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Dashboard A' })
      .expect(201);

    const dashId = dashRes.body.id;

    // Tenant B cannot see tenant A dashboard
    await request(ctx.app.getHttpServer())
      .get(`/dashboards/${dashId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    // Tenant B sees empty list
    const listRes = await request(ctx.app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    expect(listRes.body).toHaveLength(0);
  });

  it('pipelines are isolated between tenants', async () => {
    // Create pipeline for tenant A
    const pipeRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Pipeline A', dataSourceId: dsA.id })
      .expect(201);

    // Tenant B cannot see it
    await request(ctx.app.getHttpServer())
      .get(`/pipelines/${pipeRes.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('widgets are isolated between tenants', async () => {
    // Create dashboard and widget for tenant A
    const dashRes = await request(ctx.app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Dash A' })
      .expect(201);

    const widgetRes = await request(ctx.app.getHttpServer())
      .post('/widgets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Widget A', type: 'chart', dashboardId: dashRes.body.id })
      .expect(201);

    // Tenant B cannot see the widget
    await request(ctx.app.getHttpServer())
      .get(`/widgets/${widgetRes.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('each tenant only sees their own resources in list endpoints', async () => {
    // Create dashboards for both tenants
    await request(ctx.app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'A1' })
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'A2' })
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'B1' })
      .expect(201);

    // Tenant A sees only 2
    const resA = await request(ctx.app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(resA.body).toHaveLength(2);
    expect(resA.body.every((d: any) => d.tenantId === tenantA.id)).toBe(true);

    // Tenant B sees only 1
    const resB = await request(ctx.app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].tenantId).toBe(tenantB.id);
  });
});
