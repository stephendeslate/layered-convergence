import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestTenant,
  createTestDataSource,
} from './helpers';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let apiKey: string;
  let tenantId: string;
  let dataSourceId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });

  async function setup() {
    const tenant = await createTestTenant(app);
    apiKey = tenant.apiKey;
    tenantId = tenant.id;
    const ds = await createTestDataSource(app, tenantId);
    dataSourceId = ds.id;
  }

  it('should create a pipeline in IDLE state', async () => {
    await setup();
    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    expect(res.body.status).toBe('IDLE');
    expect(res.body.id).toBeDefined();
  });

  it('should transition IDLE -> RUNNING', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    expect(res.body.status).toBe('RUNNING');
    expect(res.body.lastRunAt).toBeDefined();
  });

  it('should transition RUNNING -> COMPLETED', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
  });

  it('should transition RUNNING -> FAILED with error message', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'connection timeout' })
      .expect(200);

    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorMessage).toBe('connection timeout');
  });

  it('should reject invalid transition IDLE -> COMPLETED', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject invalid transition IDLE -> FAILED', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' })
      .expect(400);
  });

  it('should transition COMPLETED -> IDLE (reset)', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
  });

  it('should transition FAILED -> IDLE (reset)', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
  });

  it('should record state history on transitions', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' });

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}/history`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].fromStatus).toBe('IDLE');
    expect(res.body[0].toStatus).toBe('RUNNING');
    expect(res.body[1].fromStatus).toBe('RUNNING');
    expect(res.body[1].toStatus).toBe('COMPLETED');
  });

  it('should return valid transitions for a pipeline', async () => {
    await setup();
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const pipelineId = create.body.id;

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}/transitions`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(res.body).toEqual(['RUNNING']);
  });
});
