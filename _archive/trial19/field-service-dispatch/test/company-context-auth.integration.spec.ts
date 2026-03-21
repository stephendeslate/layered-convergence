import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Company Context Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "Invoice", "WorkOrderStatusHistory", "WorkOrder", "Route", "Customer", "Technician", "Company" CASCADE',
    );
  });

  it('should reject requests without x-company-id header on protected routes', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);
  });

  it('should reject requests without x-company-id on technicians route', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .expect(400);
  });

  it('should reject requests without x-company-id on customers route', async () => {
    await request(app.getHttpServer())
      .get('/customers')
      .expect(400);
  });

  it('should allow company CRUD without x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'New Corp' })
      .expect(201);

    expect(res.body.name).toBe('New Corp');
  });

  it('should allow GET /companies without x-company-id header', async () => {
    await prisma.company.create({ data: { name: 'Corp A' } });

    const res = await request(app.getHttpServer())
      .get('/companies')
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow GET /companies/:id without x-company-id header', async () => {
    const company = await prisma.company.create({ data: { name: 'Corp B' } });

    const res = await request(app.getHttpServer())
      .get(`/companies/${company.id}`)
      .expect(200);

    expect(res.body.name).toBe('Corp B');
  });

  it('should accept valid x-company-id and return data', async () => {
    const company = await prisma.company.create({ data: { name: 'Valid Co' } });

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', company.id)
      .expect(200);

    expect(res.body).toEqual([]);
  });
});
