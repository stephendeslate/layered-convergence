import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestTenant,
  createTestDataSource,
} from './helpers';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let apiKey: string;
  let tenantId: string;

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
  }

  it('should return 404 for non-existent data source', async () => {
    await setup();
    await request(app.getHttpServer())
      .get('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should return 404 for non-existent dashboard', async () => {
    await setup();
    await request(app.getHttpServer())
      .get('/dashboards/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should return 404 for non-existent pipeline', async () => {
    await setup();
    await request(app.getHttpServer())
      .get('/pipelines/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });

  it('should return 409 for duplicate unique constraint (P2002)', async () => {
    await setup();
    const ds = await createTestDataSource(app, tenantId);

    // Create a pipeline for this data source (dataSourceId is unique)
    await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId: ds.id })
      .expect(201);

    // Creating another pipeline for the same data source should trigger P2002
    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId: ds.id })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
    expect(res.body.error).toBe('P2002');
  });

  it('should return 400 for invalid pipeline transition', async () => {
    await setup();
    const ds = await createTestDataSource(app, tenantId);

    const create = await request(app.getHttpServer())
      .post('/pipelines')
      .set('x-api-key', apiKey)
      .send({ dataSourceId: ds.id });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${create.body.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject request body with unexpected fields (forbidNonWhitelisted)', async () => {
    await setup();
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'Test', type: 'api', hackedField: true })
      .expect(400);
  });

  it('should strip unknown fields via whitelist', async () => {
    await setup();
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', apiKey)
      .send({ name: 'Test', unknownProp: 'should-fail' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 404 when updating non-existent data source', async () => {
    await setup();
    await request(app.getHttpServer())
      .patch('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .send({ name: 'Updated' })
      .expect(404);
  });

  it('should return 404 when deleting non-existent dashboard', async () => {
    await setup();
    await request(app.getHttpServer())
      .delete('/dashboards/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);
  });
});
