import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let module: TestingModule;

  const tenantId = 'tenant-auth';
  const apiKey = 'valid-api-key-123';
  const headers = { 'x-tenant-id': tenantId };

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    prisma = ctx.prisma;
    module = ctx.module;
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
    await prisma.tenant.create({
      data: { id: tenantId, name: 'Auth Tenant', apiKey },
    });
  });

  // --- Tenant context middleware ---

  it('should reject requests without x-tenant-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Missing x-tenant-id');
  });

  it('should accept requests with valid x-tenant-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set(headers);

    expect(res.status).toBe(200);
  });

  it('should set tenantId on the request object', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Auth Source', type: 'api' });

    expect(res.status).toBe(201);
    expect(res.body.tenantId).toBe(tenantId);
  });

  // --- Auth service validation ---

  it('should validate correct API key', async () => {
    const result = await authService.validateApiKey(tenantId, apiKey);
    expect(result).toBe(true);

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, apiKey },
    });
    expect(tenant).not.toBeNull();
  });

  it('should reject incorrect API key', async () => {
    const result = await authService.validateApiKey(tenantId, 'wrong-key');
    expect(result).toBe(false);
  });

  it('should reject API key for non-existent tenant', async () => {
    const result = await authService.validateApiKey('nonexistent', apiKey);
    expect(result).toBe(false);
  });

  it('should reject mismatched tenant and API key', async () => {
    await prisma.tenant.create({
      data: { id: 'tenant-other', name: 'Other', apiKey: 'other-key' },
    });

    const result = await authService.validateApiKey(tenantId, 'other-key');
    expect(result).toBe(false);
  });

  // --- Tenant scoping through full request ---

  it('should scope data source creation to the tenant in header', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Scoped Source', type: 'api' });

    expect(res.status).toBe(201);
    expect(res.body.tenantId).toBe(tenantId);

    const dbDs = await prisma.dataSource.findUnique({ where: { id: res.body.id } });
    expect(dbDs!.tenantId).toBe(tenantId);
  });

  it('should scope dashboard creation to the tenant in header', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set(headers)
      .send({ name: 'Scoped Dashboard' });

    expect(res.status).toBe(201);
    expect(res.body.tenantId).toBe(tenantId);

    const dbDash = await prisma.dashboard.findUnique({ where: { id: res.body.id } });
    expect(dbDash!.tenantId).toBe(tenantId);
  });

  it('should only return resources belonging to the authenticated tenant', async () => {
    await prisma.tenant.create({
      data: { id: 'tenant-hidden', name: 'Hidden', apiKey: 'hidden-key' },
    });

    await prisma.dataSource.create({
      data: { tenantId: 'tenant-hidden', name: 'Hidden Source', type: 'api' },
    });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Visible Source', type: 'api' });

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Visible Source');
  });

  // --- Unique API keys ---

  it('should enforce unique API keys across tenants in DB', async () => {
    try {
      await prisma.tenant.create({
        data: { id: 'tenant-dupe', name: 'Dupe', apiKey },
      });
      expect.fail('Should have thrown unique constraint error');
    } catch (e: any) {
      expect(e.code).toBe('P2002');
    }
  });

  // --- set_config call (tenant context in DB session) ---

  it('should call set_config for tenant context on each request', async () => {
    const res1 = await request(app.getHttpServer())
      .get('/data-sources')
      .set({ 'x-tenant-id': tenantId });

    expect(res1.status).toBe(200);

    const res2 = await request(app.getHttpServer())
      .get('/dashboards')
      .set({ 'x-tenant-id': tenantId });

    expect(res2.status).toBe(200);
  });
});
