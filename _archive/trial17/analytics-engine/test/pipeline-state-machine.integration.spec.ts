import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;
  let tenantId: string;
  let dataSourceId: string;
  let pipelineId: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    const tenant = await createTestTenant(prisma, { apiKey: 'pipe-test-key' });
    apiKey = tenant.apiKey;
    tenantId = tenant.id;

    const ds = await prisma.dataSource.create({
      data: { tenantId, name: 'Test DS', type: 'api' },
    });
    dataSourceId = ds.id;

    const pipeline = await prisma.pipeline.create({
      data: { dataSourceId, status: 'IDLE' },
    });
    pipelineId = pipeline.id;
  });

  it('should transition IDLE -> RUNNING', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'RUNNING' })
      .expect(200);

    expect(res.body.status).toBe('RUNNING');
    expect(res.body.lastRunAt).toBeDefined();

    const db = await prisma.pipeline.findFirst({ where: { id: pipelineId } });
    expect(db?.status).toBe('RUNNING');
  });

  it('should transition RUNNING -> COMPLETED', async () => {
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: 'RUNNING' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.errorMessage).toBeNull();
  });

  it('should transition RUNNING -> FAILED with error message', async () => {
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: 'RUNNING' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED', errorMessage: 'Connection timeout' })
      .expect(200);

    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorMessage).toBe('Connection timeout');
  });

  it('should transition FAILED -> IDLE', async () => {
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: 'FAILED', errorMessage: 'Error' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
    expect(res.body.errorMessage).toBeNull();
  });

  it('should transition COMPLETED -> IDLE', async () => {
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: 'COMPLETED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(200);

    expect(res.body.status).toBe('IDLE');
  });

  it('should reject invalid transition IDLE -> COMPLETED (400)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject invalid transition IDLE -> FAILED (400)', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'FAILED' })
      .expect(400);
  });

  it('should reject invalid transition RUNNING -> IDLE (400)', async () => {
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: 'RUNNING' },
    });

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'IDLE' })
      .expect(400);
  });

  it('should complete full lifecycle IDLE -> RUNNING -> COMPLETED -> IDLE', async () => {
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

  it('should return valid transitions for a pipeline', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}/valid-transitions`)
      .set('x-api-key', apiKey)
      .expect(200);

    expect(res.body).toEqual(['RUNNING']);
  });
});
