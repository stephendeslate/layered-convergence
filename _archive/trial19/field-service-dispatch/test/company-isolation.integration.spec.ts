import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Company Isolation (integration)', () => {
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

  it('should not allow company A to see company B technicians', async () => {
    const coA = await prisma.company.create({ data: { name: 'Company A' } });
    const coB = await prisma.company.create({ data: { name: 'Company B' } });

    await prisma.technician.create({
      data: {
        companyId: coB.id,
        name: 'Bob',
        email: `bob-${Date.now()}@test.com`,
        skills: ['electric'],
      },
    });

    const res = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', coA.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should not allow company A to see company B customers', async () => {
    const coA = await prisma.company.create({ data: { name: 'Company A' } });
    const coB = await prisma.company.create({ data: { name: 'Company B' } });

    await prisma.customer.create({
      data: {
        companyId: coB.id,
        name: 'Jane',
        address: '456 Oak',
      },
    });

    const res = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', coA.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should not allow company A to see company B work orders', async () => {
    const coA = await prisma.company.create({ data: { name: 'Company A' } });
    const coB = await prisma.company.create({ data: { name: 'Company B' } });

    const cust = await prisma.customer.create({
      data: { companyId: coB.id, name: 'Jane', address: '456 Oak' },
    });
    await prisma.workOrder.create({
      data: {
        companyId: coB.id,
        customerId: cust.id,
        description: 'Fix pipe',
      },
    });

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', coA.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should return 404 when company A tries to access company B work order by id', async () => {
    const coA = await prisma.company.create({ data: { name: 'Company A' } });
    const coB = await prisma.company.create({ data: { name: 'Company B' } });

    const cust = await prisma.customer.create({
      data: { companyId: coB.id, name: 'Jane', address: '456 Oak' },
    });
    const wo = await prisma.workOrder.create({
      data: {
        companyId: coB.id,
        customerId: cust.id,
        description: 'Fix pipe',
      },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', coA.id)
      .expect(404);
  });

  it('should isolate technician updates across companies', async () => {
    const coA = await prisma.company.create({ data: { name: 'Company A' } });
    const coB = await prisma.company.create({ data: { name: 'Company B' } });

    const tech = await prisma.technician.create({
      data: {
        companyId: coB.id,
        name: 'Bob',
        email: `bob-${Date.now()}@test.com`,
        skills: ['electric'],
      },
    });

    await request(app.getHttpServer())
      .get(`/technicians/${tech.id}`)
      .set('x-company-id', coA.id)
      .expect(404);
  });
});
