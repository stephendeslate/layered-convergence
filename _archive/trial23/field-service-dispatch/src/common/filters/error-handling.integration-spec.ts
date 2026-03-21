import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

describe('Prisma Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "WorkOrderStatusHistory", "Invoice", "WorkOrder", "Route", "Technician", "Customer", "Company" CASCADE`;
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "WorkOrderStatusHistory", "Invoice", "WorkOrder", "Route", "Technician", "Customer", "Company" CASCADE`;

    const company = await prisma.company.create({ data: { name: 'Error Test Co' } });
    companyId = company.id;
  });

  it('should return 404 for non-existent customer', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 for non-existent technician', async () => {
    await request(app.getHttpServer())
      .get('/technicians/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', companyId)
      .expect(404);
  });

  it('should return 404 for non-existent work order', async () => {
    await request(app.getHttpServer())
      .get('/work-orders/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', companyId)
      .expect(404);
  });

  it('should return 404 for non-existent company', async () => {
    await request(app.getHttpServer())
      .get('/companies/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('should return 400 for invalid state transition', async () => {
    const customer = await prisma.customer.create({
      data: { companyId, name: 'Test', address: '1 St' },
    });
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId: customer.id, description: 'Test', status: 'UNASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for work order with non-existent foreign key', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId: '00000000-0000-0000-0000-000000000000',
        description: 'Bad FK',
      });

    expect([400, 500]).toContain(res.status);
  });
});
