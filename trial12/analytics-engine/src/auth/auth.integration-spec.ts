import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

describe('Auth / Tenant Context Integration', () => {
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

  it('should require x-tenant-id header for protected routes', async () => {
    await request(app.getHttpServer()).get('/dashboards').expect(400);
  });

  it('should reject invalid UUID format for x-tenant-id', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', 'not-a-uuid')
      .expect(400);

    expect(res.body.message).toContain('valid UUID');
  });

  it('should reject non-existent tenant id', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', '00000000-0000-0000-0000-000000000000')
      .expect(400);

    expect(res.body.message).toContain('Tenant not found');
  });

  it('should allow valid tenant id', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Valid Tenant', apiKey: 'ak_valid' },
    });

    await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenant.id)
      .expect(200);
  });

  it('should not require x-tenant-id for tenant CRUD', async () => {
    await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'New Tenant' })
      .expect(201);

    await request(app.getHttpServer()).get('/tenants').expect(200);
  });

  it('should not require x-tenant-id for ingest endpoint', async () => {
    // Will return 404 for invalid API key, but NOT 400 for missing tenant header
    const res = await request(app.getHttpServer())
      .post('/ingest/fake-api-key')
      .send({ metrics: { value: 1 } })
      .expect(404);

    expect(res.body.message).not.toContain('x-tenant-id');
  });

  it('should not require x-tenant-id for embed endpoints', async () => {
    const res = await request(app.getHttpServer())
      .get('/embed/render/fake-api-key')
      .expect(404);

    expect(res.body.message).not.toContain('x-tenant-id');
  });
});
