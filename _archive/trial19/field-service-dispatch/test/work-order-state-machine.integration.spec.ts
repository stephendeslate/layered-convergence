import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Work Order State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

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

    const company = await prisma.company.create({
      data: { name: 'Test Co' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Jane', address: '123 Main St' },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'John',
        email: `john-${Date.now()}@test.com`,
        skills: ['plumbing'],
      },
    });
    technicianId = technician.id;
  });

  const createWorkOrder = async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId,
        description: 'Fix sink',
      })
      .expect(201);
    return res.body;
  };

  it('should walk through the full happy path: UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED', async () => {
    const wo = await createWorkOrder();
    expect(wo.status).toBe('UNASSIGNED');

    const headers = { 'x-company-id': companyId };

    const assigned = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set(headers)
      .send({ technicianId })
      .expect(200);
    expect(assigned.body.status).toBe('ASSIGNED');

    const enRoute = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/en-route`)
      .set(headers)
      .expect(200);
    expect(enRoute.body.status).toBe('EN_ROUTE');

    const onSite = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/on-site`)
      .set(headers)
      .expect(200);
    expect(onSite.body.status).toBe('ON_SITE');

    const started = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/start`)
      .set(headers)
      .expect(200);
    expect(started.body.status).toBe('IN_PROGRESS');

    const completed = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set(headers)
      .expect(200);
    expect(completed.body.status).toBe('COMPLETED');
  });

  it('should reject invalid transition from UNASSIGNED to COMPLETED', async () => {
    const wo = await createWorkOrder();
    const headers = { 'x-company-id': companyId };

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set(headers)
      .expect(400);
  });

  it('should allow unassign from ASSIGNED back to UNASSIGNED', async () => {
    const wo = await createWorkOrder();
    const headers = { 'x-company-id': companyId };

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set(headers)
      .send({ technicianId })
      .expect(200);

    const unassigned = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/unassign`)
      .set(headers)
      .expect(200);
    expect(unassigned.body.status).toBe('UNASSIGNED');
  });

  it('should allow return to assigned from EN_ROUTE', async () => {
    const wo = await createWorkOrder();
    const headers = { 'x-company-id': companyId };

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set(headers)
      .send({ technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/en-route`)
      .set(headers)
      .expect(200);

    const returned = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/return-to-assigned`)
      .set(headers)
      .expect(200);
    expect(returned.body.status).toBe('ASSIGNED');
  });

  it('should record status history entries', async () => {
    const wo = await createWorkOrder();
    const headers = { 'x-company-id': companyId };

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set(headers)
      .send({ technicianId })
      .expect(200);

    const detail = await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set(headers)
      .expect(200);

    expect(detail.body.statusHistory.length).toBeGreaterThanOrEqual(1);
    expect(detail.body.statusHistory[0].fromStatus).toBe('UNASSIGNED');
    expect(detail.body.statusHistory[0].toStatus).toBe('ASSIGNED');
  });
});
