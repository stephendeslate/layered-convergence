import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should return 401 when no x-api-key header is provided', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);

    expect(res.body.message).toContain('x-api-key');
  });

  it('should return 401 for invalid API key', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key-that-does-not-exist')
      .expect(401);

    expect(res.body.message).toContain('Invalid API key');
  });

  it('should allow access with valid API key', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'valid-auth-key' });

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('should return 401 for empty API key', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', '')
      .expect(401);
  });

  it('should set tenantId from API key on request', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'tenant-id-key' });

    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .send({ name: 'Test Source', type: 'api' })
      .expect(201);

    expect(res.body.tenantId).toBe(tenant.id);
  });

  it('should authenticate across all protected endpoints - dashboards', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('should authenticate across all protected endpoints - pipelines', async () => {
    await request(app.getHttpServer())
      .get('/pipelines/some-id')
      .expect(401);
  });

  it('should authenticate across all protected endpoints - POST', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .send({ name: 'Test' })
      .expect(401);
  });

  it('should work with different tenants using different keys', async () => {
    const tenantA = await createTestTenant(prisma, {
      name: 'Auth Tenant A',
      apiKey: 'auth-key-a',
    });
    const tenantB = await createTestTenant(prisma, {
      name: 'Auth Tenant B',
      apiKey: 'auth-key-b',
    });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'csv' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Source A');
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Source B');
  });

  it('should reject requests after tenant API key is changed', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'old-key' });

    // Access works with old key
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'old-key')
      .expect(200);

    // Update the API key
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { apiKey: 'new-key' },
    });

    // Old key should fail
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'old-key')
      .expect(401);

    // New key should work
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'new-key')
      .expect(200);
  });
});
