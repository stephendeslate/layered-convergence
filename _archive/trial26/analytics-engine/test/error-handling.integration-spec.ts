import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let apiKey: string;
  let tenantId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const tenant = await createTestTenant(app);
    apiKey = tenant.apiKey;
    tenantId = tenant.id;
  });

  describe('Prisma P2025 - Record not found', () => {
    it('should return 404 when updating non-existent data source', async () => {
      await request(app.getHttpServer())
        .patch('/data-sources/non-existent-id')
        .set('x-api-key', apiKey)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 404 when deleting non-existent data source', async () => {
      await request(app.getHttpServer())
        .delete('/data-sources/non-existent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when getting non-existent dashboard', async () => {
      await request(app.getHttpServer())
        .get('/dashboards/non-existent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when updating non-existent dashboard', async () => {
      await request(app.getHttpServer())
        .patch('/dashboards/non-existent-id')
        .set('x-api-key', apiKey)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 404 when getting non-existent pipeline', async () => {
      await request(app.getHttpServer())
        .get('/pipelines/non-existent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });
  });

  describe('Prisma P2002 - Unique constraint violation', () => {
    it('should return 409 when creating tenant with duplicate API key', async () => {
      const { PrismaService } = await import('../src/prisma/prisma.service');
      const prisma = app.get(PrismaService);

      await prisma.tenant.create({
        data: { name: 'Tenant A', apiKey: 'duplicate-key' },
      });

      try {
        await prisma.tenant.create({
          data: { name: 'Tenant B', apiKey: 'duplicate-key' },
        });
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        const prismaError = error as { code?: string };
        expect(prismaError.code).toBe('P2002');
      }
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for missing required fields on data source create', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({})
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for invalid data source type', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', type: 'invalid-type' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for extra/forbidden fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', type: 'api', forbiddenField: 'value' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for missing dashboard name', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('x-api-key', apiKey)
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid pipeline status in transition', async () => {
      const ds = await createTestDataSource(app, tenantId);

      const create = await request(app.getHttpServer())
        .post('/pipelines')
        .set('x-api-key', apiKey)
        .send({ dataSourceId: ds.id })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/pipelines/${create.body.id}/transition`)
        .set('x-api-key', apiKey)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should return 400 for missing pipeline dataSourceId on create', async () => {
      await request(app.getHttpServer())
        .post('/pipelines')
        .set('x-api-key', apiKey)
        .send({})
        .expect(400);
    });
  });
});
