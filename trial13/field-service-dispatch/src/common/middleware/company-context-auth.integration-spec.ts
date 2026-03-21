import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('Company Context Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrderStatusHistory" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Invoice" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrder" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Route" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Technician" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Customer" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Company" CASCADE');

    const company = await prisma.company.create({ data: { name: 'Test Co' } });
    companyId = company.id;
  });

  it('should return 400 when x-company-id header is missing on GET /technicians', async () => {
    const res = await request(app.getHttpServer())
      .get('/technicians')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should return 400 when x-company-id header is missing on POST /technicians', async () => {
    await request(app.getHttpServer())
      .post('/technicians')
      .send({ name: 'Tech', email: 'tech@test.com', skills: ['plumbing'] })
      .expect(400);
  });

  it('should return 400 when x-company-id header is missing on GET /customers', async () => {
    await request(app.getHttpServer())
      .get('/customers')
      .expect(400);
  });

  it('should return 400 when x-company-id header is missing on GET /work-orders', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);
  });

  it('should return 400 when x-company-id header is missing on GET /invoices', async () => {
    await request(app.getHttpServer())
      .get('/invoices')
      .expect(400);
  });

  it('should return 200 when valid x-company-id header is provided on GET /technicians', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyId)
      .expect(200);
  });

  it('should return 200 when valid x-company-id header is provided on GET /customers', async () => {
    await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyId)
      .expect(200);
  });

  it('should return 200 when valid x-company-id header is provided on GET /work-orders', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyId)
      .expect(200);
  });

  it('should not require x-company-id for GET /companies', async () => {
    await request(app.getHttpServer())
      .get('/companies')
      .expect(200);
  });

  it('should not require x-company-id for routes endpoint', async () => {
    const tech = await prisma.technician.create({
      data: { companyId, name: 'Tech', email: 'tech@test.com', skills: [] },
    });

    await request(app.getHttpServer())
      .get(`/routes/technician/${tech.id}`)
      .expect(200);
  });
});
