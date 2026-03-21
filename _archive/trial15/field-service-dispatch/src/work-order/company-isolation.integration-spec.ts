import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyA: string;
  let companyB: string;
  let customerA: string;
  let customerB: string;
  let technicianA: string;

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

    const a = await prisma.company.create({ data: { name: 'Company A' } });
    companyA = a.id;
    const b = await prisma.company.create({ data: { name: 'Company B' } });
    companyB = b.id;

    const custA = await prisma.customer.create({
      data: { companyId: companyA, name: 'Customer A', address: '1 A St', lat: 40.0, lng: -74.0 },
    });
    customerA = custA.id;

    const custB = await prisma.customer.create({
      data: { companyId: companyB, name: 'Customer B', address: '1 B St', lat: 41.0, lng: -75.0 },
    });
    customerB = custB.id;

    const techA = await prisma.technician.create({
      data: { companyId: companyA, name: 'Tech A', email: `techA-${Date.now()}@test.com`, skills: [] },
    });
    technicianA = techA.id;
  });

  it('should only return work orders for the requesting company', async () => {
    await prisma.workOrder.create({
      data: { companyId: companyA, customerId: customerA, description: 'WO A', status: 'UNASSIGNED' },
    });
    await prisma.workOrder.create({
      data: { companyId: companyB, customerId: customerB, description: 'WO B', status: 'UNASSIGNED' },
    });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyA)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('WO A');

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyB)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].description).toBe('WO B');
  });

  it('should not allow company B to access company A work order', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyA, customerId: customerA, description: 'Private WO', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', companyB)
      .expect(404);
  });

  it('should not allow company B to transition company A work order', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyA, customerId: customerA, description: 'Private WO', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyB)
      .send({ status: 'ASSIGNED', technicianId: technicianA })
      .expect(404);
  });

  it('should only return technicians scoped to company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyA)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyB)
      .expect(200);

    expect(resB.body).toHaveLength(0);
  });

  it('should only return customers scoped to company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyA)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Customer A');

    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyB)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Customer B');
  });

  it('should isolate invoice visibility by company', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyA, customerId: customerA, technicianId: technicianA, description: 'Invoice isolation', status: 'COMPLETED' },
    });

    await request(app.getHttpServer())
      .post(`/invoices/work-order/${wo.id}`)
      .set('x-company-id', companyA)
      .send({ amount: 200 })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/invoices')
      .set('x-company-id', companyA)
      .expect(200);
    expect(resA.body).toHaveLength(1);

    const resB = await request(app.getHttpServer())
      .get('/invoices')
      .set('x-company-id', companyB)
      .expect(200);
    expect(resB.body).toHaveLength(0);
  });
});
