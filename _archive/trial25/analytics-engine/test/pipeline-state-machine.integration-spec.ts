import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

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

  beforeEach(async () => {
    await cleanDatabase(app);
    const tenant = await createTestTenant(app);
    apiKey = tenant.apiKey;
    tenantId = tenant.id;
    const ds = await createTestDataSource(app, tenantId);
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

  it('should transition IDLE -> RUNNING', async () => {
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
    expect(res.body.lastRunAt).toBeDefined();
  });

  it('should transition RUNNING -> COMPLETED', async () => {
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

  it('should transition RUNNING -> FAILED with error message', async () => {
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

  it('should transition COMPLETED -> IDLE', async () => {
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

  it('should transition FAILED -> IDLE', async () => {
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

  it('should reject invalid transition IDLE -> COMPLETED', async () => {
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

  it('should reject invalid transition IDLE -> FAILED', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' })
      .expect(400);
  });

  it('should reject invalid transition COMPLETED -> RUNNING', async () => {
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

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(400);
  });

  it('should record state history on each transition', async () => {
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

    const history = await request(app.getHttpServer())
      .get(`/pipelines/${create.body.id}/history`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(history.body).toHaveLength(2);
    expect(history.body[0].fromStatus).toBe('IDLE');
    expect(history.body[0].toStatus).toBe('RUNNING');
    expect(history.body[1].fromStatus).toBe('RUNNING');
    expect(history.body[1].toStatus).toBe('COMPLETED');
  });

  it('should return valid transitions for current state', async () => {
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

  it('should return 404 for non-existent pipeline', async () => {
    await request(app.getHttpServer())
      .get('/pipelines/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should complete a full lifecycle: IDLE -> RUNNING -> FAILED -> IDLE -> RUNNING -> COMPLETED -> IDLE', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    const id = create.body.id;
    const transition = async (status: string, errorMessage?: string) => {
      const body: Record<string, string> = { status };
      if (errorMessage) body.errorMessage = errorMessage;
      return request(app.getHttpServer())
        .patch(`/pipelines/${id}/transition`)
        .set('x-api-key', apiKey)
        .send(body);
    };

    await transition('RUNNING').then((r) => expect(r.status).toBe(200));
    await transition('FAILED', 'db down').then((r) => expect(r.status).toBe(200));
    await transition('IDLE').then((r) => expect(r.status).toBe(200));
    await transition('RUNNING').then((r) => expect(r.status).toBe(200));
    await transition('COMPLETED').then((r) => expect(r.status).toBe(200));
    await transition('IDLE').then((r) => expect(r.status).toBe(200));

    const history = await request(app.getHttpServer())
      .get(`/pipelines/${id}/history`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(history.body).toHaveLength(6);
  });
});
