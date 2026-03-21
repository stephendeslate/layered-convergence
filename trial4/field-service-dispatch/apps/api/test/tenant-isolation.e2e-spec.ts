/**
 * Field Service Dispatch — Tenant Isolation E2E Tests
 * Verifies cross-company access returns 404.
 * Uses real Prisma client against test database — NO mocks.
 * Per v3.0: E2E tests must use real database, not Prisma mocks.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenant Isolation (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyA: { id: string };
  let companyB: { id: string };
  let technicianA: { id: string };
  let customerA: { id: string };
  let workOrderA: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Seed two companies
    companyA = await prisma.company.create({ data: { name: 'Company A' } });
    companyB = await prisma.company.create({ data: { name: 'Company B' } });

    technicianA = await prisma.technician.create({
      data: { companyId: companyA.id, name: 'Tech A', email: `tech_a_${Date.now()}@test.com` },
    });

    customerA = await prisma.customer.create({
      data: { companyId: companyA.id, name: 'Customer A', address: '123 Main St' },
    });

    workOrderA = await prisma.workOrder.create({
      data: {
        companyId: companyA.id,
        customerId: customerA.id,
        description: 'Test work order',
      },
    });
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
    await prisma.customer.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
    await prisma.technician.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
    await prisma.company.deleteMany({ where: { id: { in: [companyA.id, companyB.id] } } });
    await app.close();
  });

  it('should return work orders for the owning company', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyA.id)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((wo: { id: string }) => wo.id === workOrderA.id)).toBe(true);
  });

  it('should return empty array for other company (cross-tenant isolation)', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyB.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should return 404 when accessing another company work order by ID', async () => {
    await request(app.getHttpServer())
      .get(`/work-orders/${workOrderA.id}`)
      .set('x-company-id', companyB.id)
      .expect(404);
  });

  it('should return 404 when accessing another company technician', async () => {
    await request(app.getHttpServer())
      .get(`/technicians/${technicianA.id}`)
      .set('x-company-id', companyB.id)
      .expect(404);
  });

  it('should return 404 when accessing another company customer', async () => {
    await request(app.getHttpServer())
      .get(`/customers/${customerA.id}`)
      .set('x-company-id', companyB.id)
      .expect(404);
  });
});

describe('Work Order State Machine — Side Effects (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let company: { id: string };
  let technician: { id: string };
  let customer: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    company = await prisma.company.create({ data: { name: 'Side Effect Co' } });
    technician = await prisma.technician.create({
      data: {
        companyId: company.id,
        name: 'Side Effect Tech',
        email: `se_tech_${Date.now()}@test.com`,
        status: 'AVAILABLE',
      },
    });
    customer = await prisma.customer.create({
      data: { companyId: company.id, name: 'SE Customer', address: '456 Oak Ave' },
    });
  });

  afterAll(async () => {
    await prisma.workOrderStatusHistory.deleteMany({ where: { workOrder: { companyId: company.id } } });
    await prisma.workOrder.deleteMany({ where: { companyId: company.id } });
    await prisma.customer.deleteMany({ where: { companyId: company.id } });
    await prisma.technician.deleteMany({ where: { companyId: company.id } });
    await prisma.company.delete({ where: { id: company.id } });
    await app.close();
  });

  it('should set technician status to EN_ROUTE on work order EN_ROUTE transition', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        technicianId: technician.id,
        description: 'EN_ROUTE test',
        status: 'ASSIGNED',
      },
    });

    await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', company.id)
      .send({ toStatus: 'EN_ROUTE' })
      .expect(201);

    const updatedTech = await prisma.technician.findFirstOrThrow({
      where: { id: technician.id },
    });
    expect(updatedTech.status).toBe('EN_ROUTE');
  });

  it('should set technician status to AVAILABLE when work order is COMPLETED', async () => {
    // Reset technician
    await prisma.technician.update({ where: { id: technician.id }, data: { status: 'ON_SITE' } });

    const wo = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        technicianId: technician.id,
        description: 'COMPLETED test',
        status: 'IN_PROGRESS',
      },
    });

    await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', company.id)
      .send({ toStatus: 'COMPLETED' })
      .expect(201);

    const updatedTech = await prisma.technician.findFirstOrThrow({
      where: { id: technician.id },
    });
    expect(updatedTech.status).toBe('AVAILABLE');
  });

  it('should reject invalid state transition', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        description: 'Invalid transition test',
        status: 'UNASSIGNED',
      },
    });

    await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', company.id)
      .send({ toStatus: 'COMPLETED' })
      .expect(400);
  });

  // [PUBLIC_ENDPOINT] tracking endpoint test — no tenant scope required
  it('should allow public access to tracking endpoint', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        technicianId: technician.id,
        description: 'Tracking test',
        status: 'EN_ROUTE',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/work-orders/tracking/${wo.id}`)
      .expect(200);

    expect(res.body.status).toBe('EN_ROUTE');
    expect(res.body.technician.name).toBeDefined();
    // Should NOT include companyId in response (public endpoint)
    expect(res.body.companyId).toBeUndefined();
  });
});
