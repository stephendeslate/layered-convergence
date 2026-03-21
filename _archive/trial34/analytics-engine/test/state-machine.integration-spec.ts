import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestOrg,
  createTestUser,
  getAuthToken,
} from './helpers';

describe('Pipeline State Machine (Integration)', () => {
  let app: INestApplication;
  let token: string;
  let pipelineId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const org = await createTestOrg(app);
    await createTestUser(app, org.id);
    token = await getAuthToken(app);

    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Pipeline' })
      .expect(201);

    pipelineId = res.body.id;
  });

  it('should create pipeline in DRAFT status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe('DRAFT');
  });

  it('should transition DRAFT -> ACTIVE', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    expect(res.body.status).toBe('ACTIVE');
  });

  it('should transition ACTIVE -> PAUSED', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PAUSED' })
      .expect(200);

    expect(res.body.status).toBe('PAUSED');
  });

  it('should reject DRAFT -> PAUSED', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PAUSED' })
      .expect(400);
  });

  it('should reject ARCHIVED -> ACTIVE', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ARCHIVED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' })
      .expect(400);
  });

  it('should record status history on transition', async () => {
    await request(app.getHttpServer())
      .patch(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${pipelineId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.statusHistory).toHaveLength(1);
    expect(res.body.statusHistory[0].fromStatus).toBe('DRAFT');
    expect(res.body.statusHistory[0].toStatus).toBe('ACTIVE');
  });
});
