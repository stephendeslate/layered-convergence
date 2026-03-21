import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Isolation / Tenant Context (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyA: string;
  let companyB: string;

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

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "WorkOrderStatusHistory", "Invoice", "WorkOrder", "Route", "Technician", "Customer", "Company" CASCADE`;

    const a = await prisma.company.create({ data: { name: 'Company A' } });
    const b = await prisma.company.create({ data: { name: 'Company B' } });
    companyA = a.id;
    companyB = b.id;
  });

  it('should only return customers for the requesting company', async () => {
    await prisma.customer.createMany({
      data: [
        { companyId: companyA, name: 'Cust A', address: '1 St' },
        { companyId: companyB, name: 'Cust B', address: '2 St' },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyA)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Cust A');
  });

  it('should only return technicians for the requesting company', async () => {
    await prisma.technician.createMany({
      data: [
        { companyId: companyA, name: 'Tech A', email: 'a@test.com', skills: ['x'] },
        { companyId: companyB, name: 'Tech B', email: 'b@test.com', skills: ['y'] },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyA)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Tech A');
  });

  it('should only return work orders for the requesting company', async () => {
    const custA = await prisma.customer.create({ data: { companyId: companyA, name: 'CA', address: '1' } });
    const custB = await prisma.customer.create({ data: { companyId: companyB, name: 'CB', address: '2' } });

    await prisma.workOrder.createMany({
      data: [
        { companyId: companyA, customerId: custA.id, description: 'WO A', status: 'UNASSIGNED' },
        { companyId: companyB, customerId: custB.id, description: 'WO B', status: 'UNASSIGNED' },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyA)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].description).toBe('WO A');
  });

  it('should not allow accessing another companys customer by id', async () => {
    const custB = await prisma.customer.create({
      data: { companyId: companyB, name: 'Cust B', address: '2 St' },
    });

    await request(app.getHttpServer())
      .get(`/customers/${custB.id}`)
      .set('x-company-id', companyA)
      .expect(404);
  });

  it('should not allow accessing another companys technician by id', async () => {
    const techB = await prisma.technician.create({
      data: { companyId: companyB, name: 'Tech B', email: 'b@test.com', skills: ['y'] },
    });

    await request(app.getHttpServer())
      .get(`/technicians/${techB.id}`)
      .set('x-company-id', companyA)
      .expect(404);
  });

  it('should not allow accessing another companys work order by id', async () => {
    const custB = await prisma.customer.create({ data: { companyId: companyB, name: 'CB', address: '2' } });
    const woB = await prisma.workOrder.create({
      data: { companyId: companyB, customerId: custB.id, description: 'WO B', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${woB.id}`)
      .set('x-company-id', companyA)
      .expect(404);
  });
});
