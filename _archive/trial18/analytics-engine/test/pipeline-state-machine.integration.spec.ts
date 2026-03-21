import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;
  let tenantId: string;
  let dataSourceId: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    const tenant = await createTestTenant(prisma, { apiKey: 'pipeline-test-key' });
    apiKey = tenant.apiKey;
    tenantId = tenant.id;
    const ds = await createTestDataSource(prisma, tenantId);
    dataSourceId = ds.id;
  });

  it('should create a pipeline in IDLE state', async () => {
    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    expect(res.body.status).toBe('IDLE');
    expect(res.body.dataSourceId).toBe(dataSourceId);
  });

  it('should transition from IDLE to RUNNING', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    expect(res.body.status).toBe('RUNNING');
    expect(res.body.lastRunAt).toBeTruthy();
  });

  it('should transition from RUNNING to COMPLETED', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
  });

  it('should transition from RUNNING to FAILED with error message', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'Connection timeout' })
      .expect(200);

    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorMessage).toBe('Connection timeout');
  });

  it('should transition from COMPLETED to IDLE', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
  });

  it('should transition from FAILED to IDLE', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'Error' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
    expect(res.body.errorMessage).toBeNull();
  });

  it('should reject invalid transition IDLE to COMPLETED', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject invalid transition IDLE to FAILED', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject invalid transition COMPLETED to RUNNING', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should return valid transitions for a pipeline', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${create.body.id}/valid-transitions`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(res.body).toEqual(['RUNNING']);
  });

  it('should complete full lifecycle IDLE -> RUNNING -> COMPLETED -> IDLE', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
  });

  it('should return 404 for non-existent pipeline', async () => {
    await request(app.getHttpServer())
      .get('/pipelines/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });
});
