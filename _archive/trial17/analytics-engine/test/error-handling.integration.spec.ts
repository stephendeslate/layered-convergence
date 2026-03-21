import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    const tenant = await createTestTenant(prisma, { apiKey: 'error-test-key' });
    apiKey = tenant.apiKey;
  });

  it('should return 404 for non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should return 404 for non-existent dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should return 404 for non-existent pipeline', async () => {
    const res = await request(app.getHttpServer())
      .get('/pipelines/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should return 400 for invalid data source type', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'Test', type: 'invalid-type' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 400 for missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({})
      .expect(400);
  });

  it('should return 400 for forbidden non-whitelisted properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', apiKey)
      .send({ name: 'Test', type: 'api', hackerField: 'injected' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 409 for duplicate unique constraint (tenant apiKey)', async () => {
    await createTestTenant(prisma, { apiKey: 'duplicate-key' });

    try {
      await createTestTenant(prisma, { apiKey: 'duplicate-key' });
    } catch (e: any) {
      expect(e.code).toBe('P2002');
    }
  });

  it('should return 400 for invalid pipeline transition', async () => {
    const tenant = await prisma.tenant.findFirst({
      where: { apiKey },
    });
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant!.id, name: 'DS', type: 'api' },
    });
    const pipeline = await prisma.pipeline.create({
      data: { dataSourceId: ds.id, status: 'IDLE' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${pipeline.id}/transition`)
      .set('x-api-key', apiKey)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should return 400 for invalid widget type', async () => {
    const res = await request(app.getHttpServer())
      .post('/widgets')
      .set('x-api-key', apiKey)
      .send({ dashboardId: 'dash-1', type: 'invalid-widget' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 404 for non-existent widget', async () => {
    const res = await request(app.getHttpServer())
      .get('/widgets/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should return 404 for non-existent embed config', async () => {
    const res = await request(app.getHttpServer())
      .get('/embeds/dashboard/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should return 404 for non-existent sync run', async () => {
    const res = await request(app.getHttpServer())
      .get('/sync-runs/non-existent-id')
      .set('x-api-key', apiKey)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });
});
