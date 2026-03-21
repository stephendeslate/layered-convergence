import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Pipeline State Machine (Integration)', () => {
  let app: INestApplication;
  let apiKey: string;
  let dataSourceId: string;
  let pipelineId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const tenant = await createTestTenant(app, { name: 'Pipeline Tenant', apiKey: 'pipe-key-1' });
    apiKey = tenant.apiKey;
    const ds = await createTestDataSource(app, tenant.id, { name: 'Pipeline DS', type: 'api' });
    dataSourceId = ds.id;

    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId })
      .expect(201);
    pipelineId = res.body.id;
  });

  it('should create a pipeline in IDLE state', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}`)
      .set('x-api-key', apiKey)
      .expect(200);
    expect(res.body.status).toBe('IDLE');
  });

  it('should transition from IDLE to RUNNING', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);
    expect(res.body.status).toBe('RUNNING');
    expect(res.body.lastRunAt).toBeTruthy();
  });

  it('should transition from RUNNING to COMPLETED', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('should transition from RUNNING to FAILED with error message', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'connection timeout' })
      .expect(200);
    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorMessage).toBe('connection timeout');
  });

  it('should transition from COMPLETED to IDLE', async () => {
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

  it('should transition from FAILED to IDLE', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);
    expect(res.body.status).toBe('IDLE');
  });

  it('should reject IDLE to COMPLETED', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject IDLE to FAILED', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' })
      .expect(400);
  });

  it('should reject RUNNING to IDLE', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(400);
  });

  it('should return valid transitions', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}/valid-transitions`)
      .set('x-api-key', apiKey)
      .expect(200);
    expect(res.body).toEqual(['RUNNING']);
  });

  it('should return valid transitions for RUNNING state', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}/valid-transitions`)
      .set('x-api-key', apiKey)
      .expect(200);
    expect(res.body).toEqual(['COMPLETED', 'FAILED']);
  });

  it('should find pipeline by data source id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pipelines/data-source/${dataSourceId}`)
      .set('x-api-key', apiKey)
      .expect(200);
    expect(res.body.id).toBe(pipelineId);
  });
});
