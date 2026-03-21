import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('Company Context Middleware (integration)', () => {
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
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Invoice" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrderStatusHistory" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrder" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Route" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Customer" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Technician" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Company" CASCADE');

    const company = await prisma.company.create({ data: { name: 'Auth Co' } });
    companyId = company.id;
  });

  describe('routes requiring x-company-id header', () => {
    it('should reject GET /technicians without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .get('/technicians')
        .expect(400);

      expect(res.body.message).toContain('x-company-id');
    });

    it('should reject GET /customers without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .get('/customers')
        .expect(400);

      expect(res.body.message).toContain('x-company-id');
    });

    it('should reject GET /work-orders without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .expect(400);

      expect(res.body.message).toContain('x-company-id');
    });

    it('should reject GET /invoices without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .get('/invoices')
        .expect(400);

      expect(res.body.message).toContain('x-company-id');
    });

    it('should reject POST /technicians without x-company-id', async () => {
      await request(app.getHttpServer())
        .post('/technicians')
        .send({ companyId, name: 'Test', email: 'test@test.com', skills: [] })
        .expect(400);
    });
  });

  describe('routes NOT requiring x-company-id header', () => {
    it('should allow GET /companies without x-company-id', async () => {
      await request(app.getHttpServer())
        .get('/companies')
        .expect(200);
    });

    it('should allow POST /companies without x-company-id', async () => {
      await request(app.getHttpServer())
        .post('/companies')
        .send({ name: 'New Co' })
        .expect(201);
    });

    it('should allow GET /companies/:id without x-company-id', async () => {
      await request(app.getHttpServer())
        .get(`/companies/${companyId}`)
        .expect(200);
    });
  });

  describe('with valid x-company-id header', () => {
    it('should pass companyId to controllers for technicians', async () => {
      const res = await request(app.getHttpServer())
        .get('/technicians')
        .set('x-company-id', companyId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should pass companyId to controllers for customers', async () => {
      const res = await request(app.getHttpServer())
        .get('/customers')
        .set('x-company-id', companyId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should pass companyId to controllers for work orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .set('x-company-id', companyId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
