import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('Company Context Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "WorkOrderStatusHistory", "Invoice", "WorkOrder", "Route", "Technician", "Customer", "Company" CASCADE`;
    await app.close();
  });

  it('should reject requests without x-company-id header on protected routes', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should reject requests without x-company-id on technicians', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .expect(400);
  });

  it('should reject requests without x-company-id on work-orders', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);
  });

  it('should allow company routes without x-company-id', async () => {
    const res = await request(app.getHttpServer())
      .get('/companies')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should accept requests with valid x-company-id header', async () => {
    const company = await prisma.company.create({ data: { name: 'Auth Test Co' } });

    const res = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', company.id)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    await prisma.company.delete({ where: { id: company.id } });
  });

  it('should allow creating a company without x-company-id', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'New Company' })
      .expect(201);

    expect(res.body.name).toBe('New Company');

    await prisma.company.delete({ where: { id: res.body.id } });
  });

  it('should reject POST to customers without x-company-id', async () => {
    await request(app.getHttpServer())
      .post('/customers')
      .send({ companyId: 'fake', name: 'Test', address: '1 St' })
      .expect(400);
  });

  it('should reject POST to work-orders without x-company-id', async () => {
    await request(app.getHttpServer())
      .post('/work-orders')
      .send({ companyId: 'fake', customerId: 'fake', description: 'Test' })
      .expect(400);
  });
});
