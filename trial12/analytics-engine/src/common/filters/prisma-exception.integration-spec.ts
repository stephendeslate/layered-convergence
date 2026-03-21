import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../../generated/prisma/client.js';

describe('PrismaExceptionFilter Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw(
      Prisma.sql`TRUNCATE "Tenant", "Dashboard", "Widget", "DataSource", "DataSourceConfig", "SyncRun", "DataPoint", "EmbedConfig", "QueryCache", "DeadLetterEvent" CASCADE`,
    );
  });

  it('should return 409 for duplicate unique constraint (P2002)', async () => {
    await prisma.tenant.create({
      data: { name: 'Existing', apiKey: 'ak_duplicate' },
    });

    await prisma.tenant.create({
      data: { name: 'Another', apiKey: 'ak_another' },
    });

    // Try to update to duplicate API key via direct prisma to trigger P2002
    // Instead, test through the tenant endpoint by creating tenants with same apiKey indirectly
    // The filter catches Prisma errors, so we test through embed config unique constraint
    const tenant = await prisma.tenant.create({
      data: { name: 'T', apiKey: 'ak_embed_test' },
    });
    const dashboard = await prisma.dashboard.create({
      data: {
        tenantId: tenant.id,
        name: 'D',
        layout: {},
        isPublished: true,
      },
    });

    // Create first embed config
    await request(app.getHttpServer())
      .post('/embed/config')
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://example.com'],
      })
      .expect(201);

    // Try to create duplicate embed config (dashboardId is unique)
    await request(app.getHttpServer())
      .post('/embed/config')
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://other.com'],
      })
      .expect(409);
  });

  it('should return 404 for record not found (P2025)', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`/tenants/${nonExistentId}`)
      .expect(404);
  });

  it('should return 400 for foreign key constraint failure (P2003)', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'FK Test', apiKey: 'ak_fk_test' },
    });

    // Try to create a widget with non-existent dashboardId
    await request(app.getHttpServer())
      .post('/widgets')
      .set('x-tenant-id', tenant.id)
      .send({
        dashboardId: '00000000-0000-0000-0000-000000000000',
        type: 'LINE_CHART',
        config: {},
        positionX: 0,
        positionY: 0,
        width: 4,
        height: 3,
      })
      .expect(400);
  });
});
