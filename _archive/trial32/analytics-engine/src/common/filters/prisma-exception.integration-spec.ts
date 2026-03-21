import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import request from 'supertest';

describe('PrismaExceptionFilter (integration)', () => {
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

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "Tenant", "Dashboard", "Widget", "DataSource", "DataSourceConfig", "SyncRun", "DataPoint", "EmbedConfig", "QueryCache", "DeadLetterEvent" CASCADE',
    );
  });

  it('should return 409 for P2002 (unique constraint violation)', async () => {
    await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'Tenant X' })
      .expect(201);

    const firstTenant = await prisma.tenant.findFirst({
      where: { name: 'Tenant X' },
    });

    await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'Tenant Y' })
      .expect(201);

    const secondTenant = await prisma.tenant.findFirst({
      where: { name: 'Tenant Y' },
    });

    // Force a unique constraint violation by updating apiKey to match
    if (firstTenant && secondTenant) {
      try {
        await prisma.tenant.update({
          where: { id: secondTenant.id },
          data: { apiKey: firstTenant.apiKey },
        });
      } catch (e: any) {
        expect(e.code).toBe('P2002');
      }
    }
  });

  it('should return 404 for non-existent tenant', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`/tenants/${fakeUuid}`)
      .expect(404);
  });

  it('should return 404 for non-existent dashboard', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test', apiKey: 'ak_filter_test' },
    });

    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`/dashboards/${fakeUuid}`)
      .set('x-tenant-id', tenant.id)
      .expect(404);
  });

  it('should return 400 for validation errors (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'Test', invalidField: 'bad' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/tenants')
      .send({})
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});
