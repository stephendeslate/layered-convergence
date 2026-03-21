import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Error Handling (Integration)', () => {
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
    const tenant = await createTestTenant(app, { name: 'Error Tenant', apiKey: 'err-key-1' });
    apiKey = tenant.apiKey;
    tenantId = tenant.id;
  });

  it('should return 404 for non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
    expect(res.body.message).toBeDefined();
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

  it('should return 400 for invalid pipeline transition', async () => {
    const ds = await createTestDataSource(app, tenantId, { name: 'DS', type: 'api' });
    const pipeRes = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId: ds.id })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipeRes.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);
    expect(res.body.message).toContain('Invalid transition');
  });

  it('should return 400 for request with extra fields', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'DS', type: 'api', extraField: 'not-allowed' })
      .expect(400);
  });

  it('should return 400 for missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({})
      .expect(400);
  });

  it('should return 400 for invalid data source type', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'DS', type: 'invalid-type' })
      .expect(400);
  });

  it('should return 401 when x-api-key header is missing', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);
  });

  it('should return 401 for invalid API key', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key')
      .expect(401);
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

  it('should return 404 when deleting non-existent dashboard', async () => {
    await request(app.getHttpServer())
      .delete('/dashboards/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should handle valid CRUD lifecycle', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'Lifecycle DS', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', apiKey)
      .send({ name: 'Updated DS' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', apiKey)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should return proper error shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('statusCode', 404);
  });
});
