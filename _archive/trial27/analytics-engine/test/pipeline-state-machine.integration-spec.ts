import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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

  it('should create a pipeline with IDLE status', async () => {
    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);

    expect(res.body.status).toBe('IDLE');
  });

  it('should transition from IDLE to RUNNING', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    expect(res.body.status).toBe('RUNNING');
  });

  it('should transition from RUNNING to COMPLETED', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

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
      .send({ dataSourceId });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'Timeout' })
      .expect(200);

    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorMessage).toBe('Timeout');
  });

  it('should reject invalid transition IDLE -> COMPLETED', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject invalid transition RUNNING -> IDLE', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(400);
  });

  it('should transition FAILED -> IDLE for recovery', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'err' });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
  });

  it('should record state history for each transition', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' });

    await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' });

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${create.body.id}/history`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].fromStatus).toBe('IDLE');
    expect(res.body[0].toStatus).toBe('RUNNING');
    expect(res.body[1].fromStatus).toBe('RUNNING');
    expect(res.body[1].toStatus).toBe('COMPLETED');
  });

  it('should return valid transitions for current state', async () => {
    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId });

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${create.body.id}/valid-transitions`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(res.body).toEqual(['RUNNING']);
  });
});
