import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should reject requests without x-api-key header (401)', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);

    expect(res.body.message).toContain('x-api-key');
  });

  it('should reject requests with invalid API key (401)', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key-that-does-not-exist')
      .expect(401);

    expect(res.body.message).toContain('Invalid');
  });

  it('should accept requests with valid API key', async () => {
    await createTestTenant(prisma, { apiKey: 'valid-auth-key' });

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'valid-auth-key')
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
  });

  it('should set tenantId from API key on all protected routes', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'tenant-id-key' });

    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'tenant-id-key')
      .send({ name: 'Test', type: 'api' })
      .expect(201);

    expect(res.body.tenantId).toBe(tenant.id);
  });

  it('should reject POST to dashboards without auth', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .send({ name: 'Test' })
      .expect(401);
  });

  it('should reject GET to data-points without auth', async () => {
    await request(app.getHttpServer())
      .get('/data-points?dataSourceId=ds-1')
      .expect(401);
  });

  it('should reject POST to pipelines without auth', async () => {
    await request(app.getHttpServer())
      .post('/pipelines')
      .send({ dataSourceId: 'ds-1' })
      .expect(401);
  });

  it('should reject POST to widgets without auth', async () => {
    await request(app.getHttpServer())
      .post('/widgets')
      .send({ dashboardId: 'dash-1', type: 'line' })
      .expect(401);
  });

  it('should reject POST to embeds without auth', async () => {
    await request(app.getHttpServer())
      .post('/embeds')
      .send({ dashboardId: 'dash-1' })
      .expect(401);
  });

  it('should reject POST to sync-runs without auth', async () => {
    await request(app.getHttpServer())
      .post('/sync-runs')
      .send({ dataSourceId: 'ds-1' })
      .expect(401);
  });

  it('should work with different tenants using different API keys', async () => {
    const tenantA = await createTestTenant(prisma, {
      apiKey: 'auth-a-key',
      name: 'Auth A',
    });
    const tenantB = await createTestTenant(prisma, {
      apiKey: 'auth-b-key',
      name: 'Auth B',
    });

    const resA = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'auth-a-key')
      .send({ name: 'A Source', type: 'api' })
      .expect(201);

    expect(resA.body.tenantId).toBe(tenantA.id);

    const resB = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'auth-b-key')
      .send({ name: 'B Source', type: 'webhook' })
      .expect(201);

    expect(resB.body.tenantId).toBe(tenantB.id);
  });

  it('should protect query-cache endpoints', async () => {
    await request(app.getHttpServer())
      .get('/query-cache/some-hash')
      .expect(401);
  });

  it('should protect data-source-config endpoints', async () => {
    await request(app.getHttpServer())
      .get('/data-source-configs/some-id')
      .expect(401);
  });
});
