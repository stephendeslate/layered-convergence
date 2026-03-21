import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: any;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    prisma = ctx.prisma;
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
    tenant = await prisma.tenant.create({
      data: {
        name: 'Auth Test Tenant',
        apiKey: 'valid-api-key-123',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 when x-tenant-id header is missing', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);

    expect(res.body.message).toContain('x-tenant-id');
  });

  it('should return 200 when valid x-tenant-id is provided', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenant.id)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return empty array for tenant with no dashboards', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenant.id)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('should allow creating resources with valid tenant context', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenant.id)
      .send({ name: 'Test Dashboard' })
      .expect(201);

    expect(res.body.name).toBe('Test Dashboard');
    expect(res.body.tenantId).toBe(tenant.id);

    const dbDashboard = await prisma.dashboard.findUnique({ where: { id: res.body.id } });
    expect(dbDashboard).not.toBeNull();
    expect(dbDashboard!.tenantId).toBe(tenant.id);
  });

  it('should reject requests with empty x-tenant-id', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', '')
      .expect(401);
  });
});
