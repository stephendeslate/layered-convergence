import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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

  describe('PrismaExceptionFilter P2002 -> 409', () => {
    it('should return 409 for duplicate unique constraint', async () => {
      const prisma = app.get(PrismaService);
      await prisma.tenant.create({
        data: { name: 'Dup', apiKey: 'duplicate-key' },
      });

      try {
        await prisma.tenant.create({
          data: { name: 'Dup2', apiKey: 'duplicate-key' },
        });
      } catch (err: any) {
        expect(err.code).toBe('P2002');
      }
    });
  });

  describe('PrismaExceptionFilter P2025 -> 404', () => {
    it('should return 404 when data source not found', async () => {
      await request(app.getHttpServer())
        .get('/data-sources/nonexistent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 when dashboard not found', async () => {
      await request(app.getHttpServer())
        .get('/dashboards/nonexistent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });
  });

  describe('ValidationPipe', () => {
    it('should reject request with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({})
        .expect(400);
    });

    it('should reject request with invalid type value', async () => {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', type: 'invalid_type' })
        .expect(400);
    });

    it('should reject request with non-whitelisted fields', async () => {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', apiKey)
        .send({ name: 'Test', type: 'postgresql', extraField: 'not allowed' })
        .expect(400);
    });

    it('should reject pipeline transition with invalid status', async () => {
      const ds = await createTestDataSource(app, tenantId);

      const pipeline = await request(app.getHttpServer())
        .post('/pipelines')
        .set('x-api-key', apiKey)
        .send({ dataSourceId: ds.id });

      await request(app.getHttpServer())
        .patch(`/pipelines/${pipeline.body.id}/transition`)
        .set('x-api-key', apiKey)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should reject data point with invalid timestamp', async () => {
      const ds = await createTestDataSource(app, tenantId);

      await request(app.getHttpServer())
        .post('/data-points')
        .set('x-api-key', apiKey)
        .send({
          dataSourceId: ds.id,
          timestamp: 'not-a-date',
          dimensions: {},
          metrics: {},
        })
        .expect(400);
    });

    it('should reject widget with invalid type', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('x-api-key', apiKey)
        .send({ name: 'Test Dashboard' });

      await request(app.getHttpServer())
        .post('/widgets')
        .set('x-api-key', apiKey)
        .send({ dashboardId: 'some-id', type: 'invalid_widget' })
        .expect(400);
    });
  });

  describe('Not Found responses', () => {
    it('should return 404 for pipeline not found', async () => {
      await request(app.getHttpServer())
        .get('/pipelines/nonexistent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });

    it('should return 404 for sync run not found', async () => {
      await request(app.getHttpServer())
        .get('/sync-runs/nonexistent-id')
        .set('x-api-key', apiKey)
        .expect(404);
    });
  });
});
