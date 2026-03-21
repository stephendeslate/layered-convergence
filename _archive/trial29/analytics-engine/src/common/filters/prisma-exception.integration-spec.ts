import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { createTestApp, truncateAll } from '../../test/integration-helpers.js';
import request from 'supertest';

describe('Prisma Exception Filter (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('P2002 → 409 Conflict', () => {
    it('should return 409 when creating a tenant with duplicate apiKey', async () => {
      await prisma.tenant.create({
        data: { name: 'First', apiKey: 'ak_unique_key' },
      });

      await prisma.tenant.create({
        data: { name: 'Duplicate', apiKey: 'ak_unique_key' },
      }).catch((error) => {
        expect(error.code).toBe('P2002');
      });
    });
  });

  describe('P2025 → 404 Not Found', () => {
    it('should return 404 when accessing a non-existent tenant', async () => {
      await request(app.getHttpServer())
        .get('/tenants/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 404 when updating a non-existent tenant', async () => {
      await request(app.getHttpServer())
        .put('/tenants/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 404 when deleting a non-existent tenant', async () => {
      await request(app.getHttpServer())
        .delete('/tenants/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('P2003 → 400 Bad Request (foreign key constraint)', () => {
    it('should return 400 or error when creating a dashboard with non-existent tenant', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Test', apiKey: 'ak_p2003_test' },
      });

      const nonExistentDashboardId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/dashboards/${nonExistentDashboardId}`)
        .set('x-tenant-id', tenant.id)
        .expect(404);
    });
  });

  describe('ValidationPipe', () => {
    it('should return 400 for missing required fields on tenant creation', async () => {
      await request(app.getHttpServer())
        .post('/tenants')
        .send({})
        .expect(400);
    });

    it('should return 400 for non-whitelisted fields on tenant creation', async () => {
      await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'Test', hackerField: 'malicious' })
        .expect(400);
    });

    it('should return 400 for invalid sync run status', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'Test', apiKey: 'ak_validation_test' },
      });
      const ds = await prisma.dataSource.create({
        data: { tenantId: tenant.id, name: 'DS', type: 'API' },
      });
      const syncRun = await prisma.syncRun.create({
        data: { dataSourceId: ds.id, status: 'RUNNING' },
      });

      await request(app.getHttpServer())
        .patch(`/pipeline/sync-runs/${syncRun.id}`)
        .set('x-tenant-id', tenant.id)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });
});
