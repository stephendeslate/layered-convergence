import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

describe('Full Pipeline E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Tenant A
  let tenantAId: string;
  let tokenA: string;
  let apiKeyA: string;

  // Tenant B
  let tenantBId: string;
  let tokenB: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Create Tenant A
    apiKeyA = `ak_live_${randomBytes(32).toString('hex')}`;
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A',
        slug: `tenant-a-${Date.now()}`,
        apiKey: apiKeyA,
        apiKeyHash: createHash('sha256').update(apiKeyA).digest('hex'),
        branding: { primaryColor: '#ff0000' },
      },
    });
    tenantAId = tenantA.id;
    tokenA = jwtService.sign({ sub: tenantAId, tenantSlug: tenantA.slug });

    // Create Tenant B
    const apiKeyB = `ak_live_${randomBytes(32).toString('hex')}`;
    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B',
        slug: `tenant-b-${Date.now()}`,
        apiKey: apiKeyB,
        apiKeyHash: createHash('sha256').update(apiKeyB).digest('hex'),
        branding: {},
      },
    });
    tenantBId = tenantB.id;
    tokenB = jwtService.sign({ sub: tenantBId, tenantSlug: tenantB.slug });
  });

  afterAll(async () => {
    // Clean up in order (widgets -> dashboards -> data_sources -> tenants)
    await prisma.widget.deleteMany({ where: { dashboard: { tenantId: { in: [tenantAId, tenantBId] } } } }).catch(() => {});
    await prisma.embedConfig.deleteMany({ where: { dashboard: { tenantId: { in: [tenantAId, tenantBId] } } } }).catch(() => {});
    await prisma.dashboard.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } }).catch(() => {});
    await prisma.dataPoint.deleteMany({ where: { dataSource: { tenantId: { in: [tenantAId, tenantBId] } } } }).catch(() => {});
    await prisma.syncRun.deleteMany({ where: { dataSource: { tenantId: { in: [tenantAId, tenantBId] } } } }).catch(() => {});
    await prisma.dataSourceConfig.deleteMany({ where: { dataSource: { tenantId: { in: [tenantAId, tenantBId] } } } }).catch(() => {});
    await prisma.dataSource.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } }).catch(() => {});
    await app.close();
  });

  // ─── Auth Flows ─────────────────────────────────────────────

  describe('Auth', () => {
    it('should login with valid credentials and receive JWT', async () => {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantAId } });
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ slug: tenant!.slug, apiKey: apiKeyA })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body).toHaveProperty('expiresIn');
    });

    it('should reject login with wrong API key', async () => {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantAId } });
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ slug: tenant!.slug, apiKey: 'wrong-key' })
        .expect(401);
    });

    it('should reject login with non-existent slug', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ slug: 'nonexistent-slug', apiKey: 'anything' })
        .expect(401);
    });

    it('should reject requests without auth header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dashboards')
        .expect(401);
    });

    it('should reject requests with invalid JWT', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dashboards')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });
  });

  // ─── Dashboard CRUD ─────────────────────────────────────────

  describe('Dashboard CRUD', () => {
    let dashboardId: string;

    it('should create a dashboard', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Revenue Dashboard', description: 'Track revenue' })
        .expect(201);

      expect(res.body.name).toBe('Revenue Dashboard');
      expect(res.body.tenantId).toBe(tenantAId);
      dashboardId = res.body.id;
    });

    it('should list dashboards for tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.some((d: { id: string }) => d.id === dashboardId)).toBe(true);
    });

    it('should get a single dashboard with widgets', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/dashboards/${dashboardId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.id).toBe(dashboardId);
      expect(res.body).toHaveProperty('widgets');
      expect(Array.isArray(res.body.widgets)).toBe(true);
    });

    it('should update a dashboard', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/dashboards/${dashboardId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Updated Dashboard' })
        .expect(200);

      expect(res.body.name).toBe('Updated Dashboard');
    });

    it('should reject invalid create body (missing name)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({})
        .expect(400);
    });

    it('should reject unknown fields (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Test', unknownField: 'bad' })
        .expect(400);
    });

    it('should delete a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'To Delete' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });
  });

  // ─── Tenant Isolation ───────────────────────────────────────

  describe('Tenant Isolation', () => {
    let tenantADashboardId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Tenant A Private Dashboard' })
        .expect(201);
      tenantADashboardId = res.body.id;
    });

    it('should not list Tenant A dashboards when using Tenant B token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      const ids = res.body.data.map((d: { id: string }) => d.id);
      expect(ids).not.toContain(tenantADashboardId);
    });

    it('should return 404 when Tenant B tries to access Tenant A dashboard', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/dashboards/${tenantADashboardId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });

    it('should return 404 when Tenant B tries to update Tenant A dashboard', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/dashboards/${tenantADashboardId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hijacked' })
        .expect(404);
    });

    it('should return 404 when Tenant B tries to delete Tenant A dashboard', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/dashboards/${tenantADashboardId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  // ─── Widget CRUD ────────────────────────────────────────────

  describe('Widget CRUD', () => {
    let dashboardId: string;
    let widgetId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Widget Test Dashboard' })
        .expect(201);
      dashboardId = res.body.id;
    });

    it('should create a widget on a dashboard', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/dashboards/${dashboardId}/widgets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'line',
          title: 'Revenue Over Time',
          config: { metric: 'revenue', dimension: 'date' },
          position: { col: 0, row: 0 },
          size: { colSpan: 6, rowSpan: 4 },
        })
        .expect(201);

      expect(res.body.type).toBe('line');
      expect(res.body.title).toBe('Revenue Over Time');
      expect(res.body.dashboardId).toBe(dashboardId);
      widgetId = res.body.id;
    });

    it('should update a widget', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('should reject widget creation with invalid type', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/dashboards/${dashboardId}/widgets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'invalid_type',
          config: {},
          position: { col: 0, row: 0 },
          size: { colSpan: 6, rowSpan: 4 },
        })
        .expect(400);
    });

    it('should delete a widget', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(204);
    });

    it('should prevent Tenant B from creating widgets on Tenant A dashboard', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/dashboards/${dashboardId}/widgets`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          type: 'kpi',
          config: { metric: 'count' },
          position: { col: 0, row: 0 },
          size: { colSpan: 3, rowSpan: 2 },
        })
        .expect(404);
    });
  });

  // ─── Data Source CRUD ───────────────────────────────────────

  describe('Data Source CRUD', () => {
    let dataSourceId: string;

    it('should create a data source', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/data-sources')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Test REST API',
          type: 'rest_api',
          config: {
            connectionConfig: {
              url: 'https://api.example.com/data',
              method: 'GET',
            },
            fieldMapping: [
              { sourceField: 'amount', targetField: 'revenue', type: 'metric', dataType: 'number' },
              { sourceField: 'date', targetField: 'timestamp', type: 'dimension', dataType: 'date' },
            ],
          },
        })
        .expect(201);

      expect(res.body.name).toBe('Test REST API');
      expect(res.body.type).toBe('rest_api');
      dataSourceId = res.body.id;
    });

    it('should list data sources for tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/data-sources')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should get a single data source', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/data-sources/${dataSourceId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.id).toBe(dataSourceId);
    });

    it('should reject creating data source with invalid type', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/data-sources')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Bad',
          type: 'invalid_connector',
          config: { connectionConfig: {} },
        })
        .expect(400);
    });

    it('should isolate data sources between tenants', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/data-sources/${dataSourceId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  // ─── Embed Config ──────────────────────────────────────────

  describe('Embed Config', () => {
    let dashboardId: string;
    let embedId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Embeddable Dashboard' })
        .expect(201);
      dashboardId = res.body.id;
    });

    it('should create an embed config', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/embeds')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          dashboardId,
          allowedOrigins: ['https://app.example.com'],
          themeOverrides: { primaryColor: '#00ff00' },
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.allowedOrigins).toContain('https://app.example.com');
      embedId = res.body.id;
    });

    it('should get embed render data without auth (public endpoint)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/embeds/${embedId}/render`)
        .expect(200);

      expect(res.body.embedId).toBe(embedId);
      expect(res.body.dashboard).toHaveProperty('id', dashboardId);
      expect(res.body).toHaveProperty('branding');
      expect(res.body).toHaveProperty('themeOverrides');
    });

    it('should update embed config', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/embeds/${embedId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ allowedOrigins: ['https://new.example.com'] })
        .expect(200);

      expect(res.body.allowedOrigins).toContain('https://new.example.com');
    });

    it('should prevent Tenant B from updating Tenant A embed', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/embeds/${embedId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ allowedOrigins: ['https://evil.com'] })
        .expect(404);
    });

    it('should delete embed config', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/embeds/${embedId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(204);
    });
  });

  // ─── Input Validation ──────────────────────────────────────

  describe('Input Validation', () => {
    it('should reject dashboard with extra properties', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Test', malicious: '<script>alert(1)</script>' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject data source with invalid cron schedule', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/data-sources')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Bad Cron',
          type: 'rest_api',
          config: {
            connectionConfig: { url: 'https://example.com' },
            syncSchedule: 'not a cron',
          },
        })
        .expect(400);
    });

    it('should reject embed config with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/embeds')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({})
        .expect(400);
    });
  });
});
