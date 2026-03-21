import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { createTestApp, truncateAll } from '../../test/integration-helpers.js';
import request from 'supertest';

describe('Auth / Tenant Context Middleware (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('x-tenant-id header validation', () => {
    it('should reject requests without x-tenant-id header on protected routes', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(400);
    });

    it('should reject requests with invalid UUID in x-tenant-id', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .set('x-tenant-id', 'not-a-uuid')
        .expect(400);
    });

    it('should reject requests with non-existent tenant id', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .set('x-tenant-id', '00000000-0000-0000-0000-000000000000')
        .expect(400);
    });

    it('should allow requests with valid tenant id', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Valid Tenant', apiKey: 'ak_auth_valid' },
      });

      await request(app.getHttpServer())
        .get('/dashboards')
        .set('x-tenant-id', tenant.id)
        .expect(200);
    });
  });

  describe('tenant route exclusions', () => {
    it('should allow access to /tenants without x-tenant-id', async () => {
      await request(app.getHttpServer())
        .get('/tenants')
        .expect(200);
    });

    it('should allow POST to /tenants without x-tenant-id', async () => {
      await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'New Tenant' })
        .expect(201);
    });

    it('should allow access to /query-cache without x-tenant-id', async () => {
      await request(app.getHttpServer())
        .get('/query-cache/somehash')
        .expect(200);
    });
  });

  describe('webhook ingest auth', () => {
    it('should allow access to /ingest/:apiKey without x-tenant-id', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Ingest Tenant', apiKey: 'ak_ingest_auth' },
      });

      await prisma.dataSource.create({
        data: { tenantId: tenant.id, name: 'Webhook DS', type: 'WEBHOOK' },
      });

      const res = await request(app.getHttpServer())
        .post('/ingest/ak_ingest_auth')
        .send({
          dimensions: { region: 'us' },
          metrics: { revenue: 100 },
        })
        .expect(201);

      expect(res.body.ingested).toBe(1);
    });

    it('should return 404 for invalid API key in ingest', async () => {
      await request(app.getHttpServer())
        .post('/ingest/ak_invalid_key')
        .send({ metrics: { revenue: 100 } })
        .expect(404);
    });
  });

  describe('embed route auth', () => {
    it('should allow access to /embed/render/:apiKey without x-tenant-id', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Embed Tenant', apiKey: 'ak_embed_auth' },
      });

      const res = await request(app.getHttpServer())
        .get('/embed/render/ak_embed_auth')
        .expect(200);

      expect(res.body.tenant.name).toBe('Embed Tenant');
      expect(res.body.dashboards).toEqual([]);
    });
  });

  describe('API key-based operations', () => {
    it('should generate apiKey starting with ak_ on tenant creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'Key Gen Tenant' })
        .expect(201);

      expect(res.body.apiKey).toMatch(/^ak_/);
    });

    it('should regenerate apiKey for a tenant', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Regen Tenant', apiKey: 'ak_regen_original' },
      });

      const res = await request(app.getHttpServer())
        .patch(`/tenants/${tenant.id}/regenerate-api-key`)
        .expect(200);

      expect(res.body.apiKey).toMatch(/^ak_/);
      expect(res.body.apiKey).not.toBe('ak_regen_original');
    });
  });
});
