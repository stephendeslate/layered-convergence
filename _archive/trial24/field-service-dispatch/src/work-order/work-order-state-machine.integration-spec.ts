import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Work Order State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

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

    const company = await prisma.company.create({ data: { name: 'State Machine Co' } });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Test Customer', address: '123 Main St' },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: { companyId, name: 'Test Tech', email: 'tech@test.com', skills: ['plumbing'] },
    });
    technicianId = technician.id;
  });

  it('should create work order with UNASSIGNED status', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({ companyId, customerId, description: 'Fix sink' })
      .expect(201);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should transition UNASSIGNED -> ASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Fix', status: 'UNASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should transition through full lifecycle', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Full lifecycle', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/en-route`)
      .set('x-company-id', companyId)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/on-site`)
      .set('x-company-id', companyId)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/start`)
      .set('x-company-id', companyId)
      .expect(200);

    const completedRes = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(completedRes.body.status).toBe('COMPLETED');
  });

  it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Bad transition', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject invalid transition PAID -> anything', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Paid order', status: 'PAID' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'INVOICED' })
      .expect(400);
  });

  it('should allow ASSIGNED -> UNASSIGNED (unassign)', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, description: 'Unassign', status: 'ASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/unassign`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
    expect(res.body.technicianId).toBeNull();
  });

  it('should record status history on transition', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'History test', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
  });

  it('should allow EN_ROUTE -> ASSIGNED (return to assigned)', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, description: 'Return', status: 'EN_ROUTE' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/return-to-assigned`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });
});
