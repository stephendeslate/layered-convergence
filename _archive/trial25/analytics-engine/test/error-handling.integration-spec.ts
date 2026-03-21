import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';
import { PrismaService } from '../src/prisma/prisma.service';

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

  describe('P2002 Unique Constraint -> 409 Conflict', () => {
    it('should return 409 when creating duplicate unique pipeline for same data source', async () => {
      const ds = await createTestDataSource(app, tenantId);
      const prisma = app.get(PrismaService);

      await prisma.pipeline.create({
        data: { dataSourceId: ds.id, status: 'IDLE' },
      });

      await request(app.getHttpServer())
        .post('/pipelines')
        .set('x-api-key', apiKey)
        .send({ dataSourceId: ds.id })
        .expect(409);
    });

    it('should return 409 response with correct body shape', async () => {
      const ds = await createTestDataSource(app, tenantId);
      const prisma = app.get(PrismaService);

      await prisma.pipeline.create({
        data: { dataSourceId: ds.id, status: 'IDLE' },
      });

      const res = await request(app.getHttpServer())
        .post('/pipelines')
        .set('x-api-key', apiKey)
        .send({ dataSourceId: ds.id })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.error).toBe('P2002');
    });
  });

  describe('P2025 Record Not Found -> 404', () => {
    it('should return 404 when accessing non-existent data source', async () => {
      await request(app.getHttpServer())
        .get('/data-sources/non-existent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when accessing non-existent dashboard', async () => {
      await request(app.getHttpServer())
        .get('/dashboards/non-existent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when accessing non-existent pipeline', async () => {
      await request(app.getHttpServer())
        .get('/pipelines/non-existent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when deleting non-existent data source', async () => {
      await request(app.getHttpServer())
        .delete('/data-sources/non-existent-id')
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
  });

  describe('Validation Errors -> 400', () => {
    it('should return 400 for missing required fields on data source create', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({})
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should return 400 for invalid data source type', async () => {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', type: 'invalid_type' })
        .expect(400);
    });

    it('should return 400 for forbidden non-whitelisted properties', async () => {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', type: 'api', hackerField: 'evil' })
        .expect(400);
    });

    it('should return 400 for invalid pipeline transition status', async () => {
      const ds = await createTestDataSource(app, tenantId);

      const pipeline = await request(app.getHttpServer())
        .post('/pipelines')
        .set('x-api-key', apiKey)
        .send({ dataSourceId: ds.id })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/pipelines/${pipeline.body.id}/transition`)
        .set('x-api-key', apiKey)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should return 400 for missing name on dashboard create', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('x-api-key', apiKey)
        .send({})
        .expect(400);
    });

    it('should return 400 for forbidden properties on dashboard create', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', unknownField: 'x' })
        .expect(400);
    });
  });
});
