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
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrderStatusHistory" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Invoice" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrder" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Route" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Technician" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Customer" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Company" CASCADE');

    const company = await prisma.company.create({ data: { name: 'Test Co' } });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Test Customer', address: '123 Main St', lat: 40.7128, lng: -74.006 },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: { companyId, name: 'Test Tech', email: 'tech@test.com', skills: ['plumbing'] },
    });
    technicianId = technician.id;
  });

  it('should complete full lifecycle UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({ customerId, description: 'Fix sink' })
      .expect(201);

    const workOrderId = createRes.body.id;
    expect(createRes.body.status).toBe('UNASSIGNED');

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ON_SITE' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const completedRes = await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(completedRes.body.status).toBe('COMPLETED');

    const dbWorkOrder = await prisma.workOrder.findUniqueOrThrow({ where: { id: workOrderId } });
    expect(dbWorkOrder.status).toBe('COMPLETED');
    expect(dbWorkOrder.completedAt).not.toBeNull();

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId },
      orderBy: { timestamp: 'asc' },
    });
    expect(history).toHaveLength(5);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
    expect(history[4].fromStatus).toBe('IN_PROGRESS');
    expect(history[4].toStatus).toBe('COMPLETED');
  });

  it('should reject invalid transition UNASSIGNED -> EN_ROUTE', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({ customerId, description: 'Fix sink' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/work-orders/${createRes.body.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE' })
      .expect(400);
  });

  it('should reject invalid transition COMPLETED -> IN_PROGRESS', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Test', status: 'COMPLETED', technicianId },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'IN_PROGRESS' })
      .expect(400);
  });

  it('should allow ASSIGNED -> UNASSIGNED back-transition', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Test', status: 'ASSIGNED', technicianId },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
    expect(res.body.technicianId).toBeNull();
  });

  it('should allow EN_ROUTE -> ASSIGNED back-transition', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Test', status: 'EN_ROUTE', technicianId },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });
});
