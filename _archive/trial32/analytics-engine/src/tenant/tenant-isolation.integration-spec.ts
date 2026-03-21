import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import request from 'supertest';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantAId: string;
  let tenantBId: string;

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

    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'ak_tenant_a' },
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'ak_tenant_b' },
    });
    tenantBId = tenantB.id;
  });

  it('tenant A should only see its own dashboards', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantAId)
      .send({ name: 'A Dashboard', layout: {} })
      .expect(201);

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantBId)
      .send({ name: 'B Dashboard', layout: {} })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('A Dashboard');

    const resB = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('B Dashboard');
  });

  it('tenant A cannot access tenant B dashboard by id', async () => {
    const dashBRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantBId)
      .send({ name: 'B Secret', layout: {} })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/dashboards/${dashBRes.body.id}`)
      .set('x-tenant-id', tenantAId)
      .expect(404);
  });

  it('tenant A should only see its own data sources', async () => {
    await request(app.getHttpServer())
      .post('/datasources')
      .set('x-tenant-id', tenantAId)
      .send({ name: 'A Source', type: 'API' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/datasources')
      .set('x-tenant-id', tenantBId)
      .send({ name: 'B Source', type: 'POSTGRESQL' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/datasources')
      .set('x-tenant-id', tenantAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('A Source');
  });

  it('tenant A cannot start sync on tenant B data source', async () => {
    const dsBRes = await request(app.getHttpServer())
      .post('/datasources')
      .set('x-tenant-id', tenantBId)
      .send({ name: 'B Source', type: 'API' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dsBRes.body.id}/sync`)
      .set('x-tenant-id', tenantAId)
      .expect(404);
  });

  it('tenant A cannot access tenant B data source by id', async () => {
    const dsBRes = await request(app.getHttpServer())
      .post('/datasources')
      .set('x-tenant-id', tenantBId)
      .send({ name: 'B Source', type: 'API' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/datasources/${dsBRes.body.id}`)
      .set('x-tenant-id', tenantAId)
      .expect(404);
  });
});
