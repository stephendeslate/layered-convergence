import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Error Handling (integration)', () => {
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
      data: { name: 'Error Test Tenant', apiKey: 'error-key' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('P2002 -> 409 Conflict (duplicate unique constraint)', () => {
    it('should return 409 when creating data source with duplicate name for same tenant', async () => {
      // Create first data source
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-tenant-id', tenant.id)
        .send({ name: 'Duplicate Source', type: 'api' })
        .expect(201);

      // Try to create duplicate
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-tenant-id', tenant.id)
        .send({ name: 'Duplicate Source', type: 'webhook' })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.error).toBe('P2002');
    });
  });

  describe('P2025 -> 404 Not Found', () => {
    it('should return 404 when accessing non-existent data source', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources/00000000-0000-0000-0000-000000000000')
        .set('x-tenant-id', tenant.id)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
    });

    it('should return 404 when accessing non-existent dashboard', async () => {
      await request(app.getHttpServer())
        .get('/dashboards/00000000-0000-0000-0000-000000000000')
        .set('x-tenant-id', tenant.id)
        .expect(404);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for invalid data source type', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-tenant-id', tenant.id)
        .send({ name: 'Bad Source', type: 'invalid_type' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-tenant-id', tenant.id)
        .send({})
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should return 400 for non-whitelisted properties', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-tenant-id', tenant.id)
        .send({ name: 'Source', type: 'api', malicious: 'injection' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should return 400 for empty name', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-tenant-id', tenant.id)
        .send({ name: '', type: 'api' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('Embed config uniqueness', () => {
    it('should return 409 when creating duplicate embed config for same dashboard', async () => {
      const dashboard = await prisma.dashboard.create({
        data: { tenantId: tenant.id, name: 'Embed Dashboard' },
      });

      await request(app.getHttpServer())
        .post('/embeds')
        .set('x-tenant-id', tenant.id)
        .send({ dashboardId: dashboard.id })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/embeds')
        .set('x-tenant-id', tenant.id)
        .send({ dashboardId: dashboard.id })
        .expect(409);

      expect(res.body.error).toBe('P2002');
    });
  });
});
