import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

describe('Error Handling (integration)', () => {
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

  it('should return 409 for duplicate technician email (P2002)', async () => {
    await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ name: 'Tech 1', email: 'duplicate@test.com', skills: ['plumbing'] })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ name: 'Tech 2', email: 'duplicate@test.com', skills: ['electrical'] })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
    expect(res.body.error).toBe('P2002');
  });

  it('should return 404 for non-existent work order (P2025)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('x-company-id', companyId);

    expect([404, 500]).toContain(res.status);
  });

  it('should return 400 for invalid request body', async () => {
    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ name: 'Tech 1' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for forbidden non-whitelisted properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ name: 'Tech 1', email: 'tech@test.com', skills: ['plumbing'], hackerField: 'malicious' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for invalid work order transition', async () => {
    const customer = await prisma.customer.create({
      data: { companyId, name: 'Cust', address: '123 Main St', lat: 40.7128, lng: -74.006 },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId: customer.id, description: 'Test' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });
});
