import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: any;
  let tenantB: any;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    prisma = ctx.prisma;
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);

    tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'key-a' },
    });
    tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'key-b' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Dashboard isolation', () => {
    it('should not return Tenant B dashboards when queried as Tenant A', async () => {
      await prisma.dashboard.create({
        data: { tenantId: tenantA.id, name: 'Dashboard A' },
      });
      await prisma.dashboard.create({
        data: { tenantId: tenantB.id, name: 'Dashboard B' },
      });

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('x-tenant-id', tenantA.id)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Dashboard A');
    });

    it('should return 404 when Tenant A tries to access Tenant B dashboard by id', async () => {
      const dashB = await prisma.dashboard.create({
        data: { tenantId: tenantB.id, name: 'Dashboard B' },
      });

      await request(app.getHttpServer())
        .get(`/dashboards/${dashB.id}`)
        .set('x-tenant-id', tenantA.id)
        .expect(404);
    });
  });

  describe('Data source isolation', () => {
    it('should not return Tenant B data sources when queried as Tenant A', async () => {
      await prisma.dataSource.create({
        data: { tenantId: tenantA.id, name: 'Source A', type: 'api' },
      });
      await prisma.dataSource.create({
        data: { tenantId: tenantB.id, name: 'Source B', type: 'webhook' },
      });

      const res = await request(app.getHttpServer())
        .get('/data-sources')
        .set('x-tenant-id', tenantA.id)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Source A');
    });

    it('should return 404 when Tenant A tries to access Tenant B data source', async () => {
      const dsB = await prisma.dataSource.create({
        data: { tenantId: tenantB.id, name: 'Source B', type: 'csv' },
      });

      await request(app.getHttpServer())
        .get(`/data-sources/${dsB.id}`)
        .set('x-tenant-id', tenantA.id)
        .expect(404);
    });

    it('should not allow Tenant A to update Tenant B data source', async () => {
      const dsB = await prisma.dataSource.create({
        data: { tenantId: tenantB.id, name: 'Source B', type: 'api' },
      });

      await request(app.getHttpServer())
        .put(`/data-sources/${dsB.id}`)
        .set('x-tenant-id', tenantA.id)
        .send({ name: 'Hacked' })
        .expect(404);

      const unchanged = await prisma.dataSource.findUnique({ where: { id: dsB.id } });
      expect(unchanged!.name).toBe('Source B');
    });

    it('should not allow Tenant A to delete Tenant B data source', async () => {
      const dsB = await prisma.dataSource.create({
        data: { tenantId: tenantB.id, name: 'Source B', type: 'postgresql' },
      });

      await request(app.getHttpServer())
        .delete(`/data-sources/${dsB.id}`)
        .set('x-tenant-id', tenantA.id)
        .expect(404);

      const stillExists = await prisma.dataSource.findUnique({ where: { id: dsB.id } });
      expect(stillExists).not.toBeNull();
    });
  });
});
