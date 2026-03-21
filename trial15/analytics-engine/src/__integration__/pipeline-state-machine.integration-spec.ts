import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  TestContext,
  createTestApp,
  cleanDatabase,
  createTestTenant,
  createTestUser,
  createTestDataSource,
  generateAuthToken,
  teardownTestApp,
} from './helpers';
import * as request from 'supertest';

describe('Pipeline State Machine (Integration)', () => {
  let ctx: TestContext;
  let tenantId: string;
  let token: string;
  let dataSourceId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.prisma);

    const tenant = await createTestTenant(ctx.prisma);
    tenantId = tenant.id;

    const user = await createTestUser(ctx.prisma, tenantId);
    token = generateAuthToken(ctx.authService, user);

    const ds = await createTestDataSource(ctx.prisma, tenantId);
    dataSourceId = ds.id;
  });

  it('should create a pipeline in IDLE state', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ETL Pipeline', dataSourceId })
      .expect(201);

    expect(res.body.status).toBe('IDLE');
    expect(res.body.name).toBe('ETL Pipeline');
    expect(res.body.tenantId).toBe(tenantId);
  });

  it('should transition IDLE -> RUNNING -> COMPLETED -> IDLE', async () => {
    // Create pipeline
    const createRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Full Cycle', dataSourceId })
      .expect(201);

    const pipelineId = createRes.body.id;

    // Trigger: IDLE -> RUNNING
    const triggerRes = await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/trigger`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(triggerRes.body.status).toBe('RUNNING');
    expect(triggerRes.body.lastRunAt).toBeDefined();

    // Complete: RUNNING -> COMPLETED
    const completeRes = await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(completeRes.body.status).toBe('COMPLETED');

    // Reset: COMPLETED -> IDLE
    const resetRes = await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/reset`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(resetRes.body.status).toBe('IDLE');
  });

  it('should transition IDLE -> RUNNING -> FAILED -> IDLE', async () => {
    const createRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Fail Cycle', dataSourceId })
      .expect(201);

    const pipelineId = createRes.body.id;

    // Trigger: IDLE -> RUNNING
    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/trigger`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    // Fail: RUNNING -> FAILED
    const failRes = await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/fail`)
      .set('Authorization', `Bearer ${token}`)
      .send({ errorMessage: 'Connection timeout' })
      .expect(201);

    expect(failRes.body.status).toBe('FAILED');
    expect(failRes.body.errorMessage).toBe('Connection timeout');

    // Reset: FAILED -> IDLE
    const resetRes = await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/reset`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(resetRes.body.status).toBe('IDLE');
    expect(resetRes.body.errorMessage).toBeNull();
  });

  it('should reject invalid transition IDLE -> COMPLETED', async () => {
    const createRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Invalid', dataSourceId })
      .expect(201);

    const pipelineId = createRes.body.id;

    const res = await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.message).toContain('Invalid pipeline state transition');
  });

  it('should reject invalid transition IDLE -> FAILED', async () => {
    const createRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Invalid', dataSourceId })
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${createRes.body.id}/fail`)
      .set('Authorization', `Bearer ${token}`)
      .send({ errorMessage: 'test' })
      .expect(400);
  });

  it('should reject invalid transition COMPLETED -> RUNNING', async () => {
    const createRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', dataSourceId })
      .expect(201);

    const pipelineId = createRes.body.id;

    // IDLE -> RUNNING -> COMPLETED
    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/trigger`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    // COMPLETED -> RUNNING should fail
    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/trigger`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('should reject double trigger (RUNNING -> RUNNING)', async () => {
    const createRes = await request(ctx.app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Double', dataSourceId })
      .expect(201);

    const pipelineId = createRes.body.id;

    // First trigger
    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/trigger`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    // Second trigger should fail (RUNNING has no RUNNING transition)
    await request(ctx.app.getHttpServer())
      .post(`/pipelines/${pipelineId}/trigger`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('should return 404 for non-existent pipeline', async () => {
    await request(ctx.app.getHttpServer())
      .get('/pipelines/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
