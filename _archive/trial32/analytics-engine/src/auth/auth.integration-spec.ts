import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import request from 'supertest';

describe('Auth / Tenant Context Middleware (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "Tenant", "Dashboard", "Widget", "DataSource", "DataSourceConfig", "SyncRun", "DataPoint", "EmbedConfig", "QueryCache", "DeadLetterEvent" CASCADE',
    );

    const tenant = await prisma.tenant.create({
      data: { name: 'Auth Test Tenant', apiKey: 'ak_auth_test' },
    });
    tenantId = tenant.id;
  });

  it('should reject requests without x-tenant-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .expect(400);

    expect(res.body.message).toBe('x-tenant-id header is required');
  });

  it('should reject requests with invalid UUID', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', 'not-a-uuid')
      .expect(400);

    expect(res.body.message).toBe('x-tenant-id must be a valid UUID');
  });

  it('should reject requests with non-existent tenant', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000099';
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', fakeUuid)
      .expect(400);

    expect(res.body.message).toBe('Tenant not found');
  });

  it('should allow requests with valid tenant id', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantId)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not require x-tenant-id for tenant routes', async () => {
    const res = await request(app.getHttpServer())
      .get('/tenants')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not require x-tenant-id for ingest routes', async () => {
    const res = await request(app.getHttpServer())
      .post('/ingest/ak_auth_test')
      .send({ metrics: { views: 1 } });

    // May return 404 (no webhook DS) or 400 but should NOT return 400 for missing x-tenant-id
    expect(res.body.message).not.toBe('x-tenant-id header is required');
  });

  it('should not require x-tenant-id for embed routes', async () => {
    const res = await request(app.getHttpServer())
      .get('/embed/render/ak_auth_test');

    // Should return tenant data, not 400 for missing x-tenant-id
    expect(res.body.message).not.toBe('x-tenant-id header is required');
  });

  it('should set tenantId on request for downstream use', async () => {
    // Create a dashboard to verify tenantId is being used
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantId)
      .send({ name: 'Auth Dashboard', layout: {} })
      .expect(201);

    expect(res.body.tenantId).toBe(tenantId);
  });
});
