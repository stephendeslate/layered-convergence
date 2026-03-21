import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
  });

  it('should reject requests without x-api-key header', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });

  it('should reject requests with invalid API key', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key-that-does-not-exist')
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });

  it('should reject requests with empty API key', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', '')
      .expect(401);
  });

  it('should accept requests with valid API key', async () => {
    const tenant = await createTestTenant(app, { apiKey: 'valid-test-key' });

    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .expect(200);
  });

  it('should scope data to the authenticated tenant', async () => {
    const tenantA = await createTestTenant(app, { name: 'A', apiKey: 'key-a-auth' });
    const tenantB = await createTestTenant(app, { name: 'B', apiKey: 'key-b-auth' });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A', type: 'api' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resB.body).toHaveLength(0);
  });

  it('should reject POST with no auth', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .send({ name: 'Test', type: 'api' })
      .expect(401);
  });

  it('should reject PATCH with no auth', async () => {
    await request(app.getHttpServer())
      .patch('/data-sources/some-id')
      .send({ name: 'Updated' })
      .expect(401);
  });

  it('should reject DELETE with no auth', async () => {
    await request(app.getHttpServer())
      .delete('/data-sources/some-id')
      .expect(401);
  });

  it('should reject dashboard endpoints without auth', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);

    await request(app.getHttpServer())
      .post('/dashboards')
      .send({ name: 'Test' })
      .expect(401);
  });

  it('should reject pipeline endpoints without auth', async () => {
    await request(app.getHttpServer())
      .post('/pipelines')
      .send({ dataSourceId: 'some-id' })
      .expect(401);

    await request(app.getHttpServer())
      .get('/pipelines/some-id')
      .expect(401);
  });

  it('should allow tenant to CRUD their own data source lifecycle', async () => {
    const tenant = await createTestTenant(app);

    const create = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .send({ name: 'My Source', type: 'postgresql' })
      .expect(201);

    expect(create.body.name).toBe('My Source');
    expect(create.body.type).toBe('postgresql');

    const get = await request(app.getHttpServer())
      .get(`/data-sources/${create.body.id}`)
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    expect(get.body.id).toBe(create.body.id);

    const update = await request(app.getHttpServer())
      .patch(`/data-sources/${create.body.id}`)
      .set('x-api-key', tenant.apiKey)
      .send({ name: 'Renamed' })
      .expect(200);

    expect(update.body.name).toBe('Renamed');

    await request(app.getHttpServer())
      .delete(`/data-sources/${create.body.id}`)
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/data-sources/${create.body.id}`)
      .set('x-api-key', tenant.apiKey)
      .expect(404);
  });
});
