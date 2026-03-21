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

describe('Error Handling (Integration)', () => {
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

  describe('Validation errors', () => {
    it('should return 400 for missing required fields', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for extra fields (forbidNonWhitelisted)', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', type: 'pg', extraField: 'should not be here' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for invalid data types', async () => {
      await request(ctx.app.getHttpServer())
        .post('/data-points')
        .set('Authorization', `Bearer ${token}`)
        .send({
          metric: 'cpu',
          value: 'not-a-number',
          timestamp: 'not-a-date',
          dataSourceId,
        })
        .expect(400);
    });
  });

  describe('Not found errors', () => {
    it('should return 404 for non-existent data source', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get('/data-sources/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });

    it('should return 404 for non-existent dashboard', async () => {
      await request(ctx.app.getHttpServer())
        .get('/dashboards/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent widget', async () => {
      await request(ctx.app.getHttpServer())
        .get('/widgets/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent pipeline', async () => {
      await request(ctx.app.getHttpServer())
        .get('/pipelines/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent embed config', async () => {
      await request(ctx.app.getHttpServer())
        .get('/embeds/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent sync run', async () => {
      await request(ctx.app.getHttpServer())
        .get('/sync-runs/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Authentication errors', () => {
    it('should return 401 when no token is provided', async () => {
      await request(ctx.app.getHttpServer())
        .get('/data-sources')
        .expect(401);
    });

    it('should return 401 for invalid token', async () => {
      await request(ctx.app.getHttpServer())
        .get('/data-sources')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 for non-Bearer auth', async () => {
      await request(ctx.app.getHttpServer())
        .get('/data-sources')
        .set('Authorization', 'Basic abc123')
        .expect(401);
    });
  });

  describe('Pipeline state machine errors', () => {
    it('should return 400 for invalid state transition', async () => {
      const createRes = await request(ctx.app.getHttpServer())
        .post('/pipelines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', dataSourceId })
        .expect(201);

      // IDLE -> COMPLETED is invalid
      const res = await request(ctx.app.getHttpServer())
        .post(`/pipelines/${createRes.body.id}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.message).toContain('Invalid pipeline state transition');
      expect(res.body.message).toContain('IDLE');
      expect(res.body.message).toContain('COMPLETED');
    });
  });

  describe('Update and delete on non-existent resources', () => {
    it('should return 404 when updating non-existent data source', async () => {
      await request(ctx.app.getHttpServer())
        .put('/data-sources/fake-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 404 when deleting non-existent data source', async () => {
      await request(ctx.app.getHttpServer())
        .delete('/data-sources/fake-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 when updating non-existent dashboard', async () => {
      await request(ctx.app.getHttpServer())
        .put('/dashboards/fake-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });
});
