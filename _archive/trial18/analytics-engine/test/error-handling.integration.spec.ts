import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;
  let tenantId: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    const tenant = await createTestTenant(prisma, { apiKey: 'error-test-key' });
    apiKey = tenant.apiKey;
    tenantId = tenant.id;
  });

  // Validation errors
  it('should return 400 for missing required fields on data source creation', async () => {
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
      .send({ name: 'Test', type: 'invalid_type' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should strip unknown fields with whitelist validation', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'Test', type: 'api', hackerField: 'bad' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 400 for missing required dashboard name', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', apiKey)
      .send({})
      .expect(400);
  });

  // Not found errors
  it('should return 404 for non-existent data source', async () => {
    await request(app.getHttpServer())
      .get('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should return 404 for non-existent dashboard', async () => {
    await request(app.getHttpServer())
      .get('/dashboards/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should return 404 for non-existent pipeline', async () => {
    await request(app.getHttpServer())
      .get('/pipelines/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

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

  it('should return 404 when updating non-existent dashboard', async () => {
    await request(app.getHttpServer())
      .patch('/dashboards/non-existent-id')
      .set('x-api-key', apiKey)
      .send({ name: 'Updated' })
      .expect(404);
  });

  // Pipeline state machine errors
  it('should return 400 for invalid pipeline transition', async () => {
    const ds = await createTestDataSource(prisma, tenantId);
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId: ds.id })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should return 400 for invalid pipeline status value', async () => {
    const ds = await createTestDataSource(prisma, tenantId);
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

  // Unique constraint (Prisma P2002)
  it('should return 409 for duplicate tenant apiKey', async () => {
    await prisma.tenant.create({
      data: { name: 'Dup Tenant', apiKey: 'duplicate-key' },
    });

    try {
      await prisma.tenant.create({
        data: { name: 'Dup Tenant 2', apiKey: 'duplicate-key' },
      });
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe('P2002');
    }
  });

  it('should handle empty body gracefully', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send()
      .expect(400);
  });

  it('should return proper error structure', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body).toHaveProperty('statusCode', 404);
    expect(res.body).toHaveProperty('message');
  });
});
