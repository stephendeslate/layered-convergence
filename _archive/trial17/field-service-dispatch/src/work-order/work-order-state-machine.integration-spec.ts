import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
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

    const company = await prisma.company.create({ data: { name: 'Test Co' } });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Jane', address: '123 Main St', lat: 40.7128, lng: -74.006 },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: { companyId, name: 'Bob', email: `bob-${Date.now()}@test.com`, skills: ['plumbing'] },
    });
    technicianId = technician.id;
  });

  it('should create an UNASSIGNED work order', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({ customerId, description: 'Fix leak' })
      .expect(201);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should create an ASSIGNED work order when technicianId provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({ customerId, technicianId, description: 'Fix leak' })
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should transition UNASSIGNED -> ASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Test', status: 'UNASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', technicianId })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should transition ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, description: 'Full cycle', status: 'ASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ON_SITE' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.completedAt).toBeDefined();
  });

  it('should allow back-transition ASSIGNED -> UNASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, description: 'Back transition', status: 'ASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
    expect(res.body.technicianId).toBeNull();
  });

  it('should allow back-transition EN_ROUTE -> ASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, description: 'Back transition 2', status: 'EN_ROUTE' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Invalid', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject transition from PAID (terminal state)', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Paid', status: 'PAID' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should record status history on transitions', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'History test', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', technicianId })
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
  });

  it('should create invoice only for COMPLETED work orders', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, description: 'Invoice test', status: 'COMPLETED' },
    });

    const res = await request(app.getHttpServer())
      .post(`/invoices/work-order/${wo.id}`)
      .set('x-company-id', companyId)
      .send({ amount: 150 })
      .expect(201);

    expect(res.body.workOrderId).toBe(wo.id);

    const updated = await prisma.workOrder.findUnique({ where: { id: wo.id } });
    expect(updated!.status).toBe('INVOICED');
  });
});
