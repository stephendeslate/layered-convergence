import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyAId: string;
  let companyBId: string;

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

    const companyA = await prisma.company.create({ data: { name: 'Company A' } });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({ data: { name: 'Company B' } });
    companyBId = companyB.id;
  });

  it('should isolate technicians by company', async () => {
    await prisma.technician.create({
      data: { companyId: companyAId, name: 'Tech A', email: 'techa@test.com', skills: ['plumbing'] },
    });
    await prisma.technician.create({
      data: { companyId: companyBId, name: 'Tech B', email: 'techb@test.com', skills: ['electrical'] },
    });

    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Tech B');
  });

  it('should isolate customers by company', async () => {
    await prisma.customer.create({
      data: { companyId: companyAId, name: 'Customer A', address: '123 A St', lat: 40.7128, lng: -74.006 },
    });
    await prisma.customer.create({
      data: { companyId: companyBId, name: 'Customer B', address: '456 B St', lat: 41.0, lng: -75.0 },
    });

    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Customer A');
  });

  it('should isolate work orders by company', async () => {
    const custA = await prisma.customer.create({
      data: { companyId: companyAId, name: 'Cust A', address: '123 A St', lat: 40.7128, lng: -74.006 },
    });
    const custB = await prisma.customer.create({
      data: { companyId: companyBId, name: 'Cust B', address: '456 B St', lat: 41.0, lng: -75.0 },
    });

    await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: custA.id, description: 'WO A' },
    });
    await prisma.workOrder.create({
      data: { companyId: companyBId, customerId: custB.id, description: 'WO B' },
    });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('WO A');

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].description).toBe('WO B');
  });

  it('should not allow Company A to see Company B technician by ID', async () => {
    const techB = await prisma.technician.create({
      data: { companyId: companyBId, name: 'Tech B', email: 'techb@test.com', skills: ['plumbing'] },
    });

    await request(app.getHttpServer())
      .get(`/technicians/${techB.id}`)
      .set('x-company-id', companyAId)
      .expect(500);
  });
});
