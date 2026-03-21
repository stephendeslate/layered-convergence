import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('WorkOrder State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;
  let workOrderId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

    const company = await prisma.company.create({ data: { name: 'Test Corp' } });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Alice', address: '123 Main St', lat: 40.7128, lng: -74.006 },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: { companyId, name: 'John', email: 'john@test.com', skills: ['plumbing'], currentLat: 40.72, currentLng: -74.01 },
    });
    technicianId = technician.id;

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Fix sink' },
    });
    workOrderId = wo.id;
  });

  it('should complete full lifecycle: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
    const transitions = [
      { status: 'ASSIGNED', technicianId },
      { status: 'EN_ROUTE' },
      { status: 'ON_SITE' },
      { status: 'IN_PROGRESS' },
      { status: 'COMPLETED' },
    ];

    for (const dto of transitions) {
      const res = await request(app.getHttpServer())
        .patch(`/work-orders/${workOrderId}/transition`)
        .set('x-company-id', companyId)
        .send(dto)
        .expect(200);

      expect(res.body.status).toBe(dto.status);
    }

    const historyRes = await request(app.getHttpServer())
      .get(`/work-orders/${workOrderId}/history`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(historyRes.body).toHaveLength(5);
  });

  it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject invalid transition ASSIGNED -> UNASSIGNED', async () => {
    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED' })
      .expect(400);
  });

  it('should auto-assign nearest technician', async () => {
    const farTech = await prisma.technician.create({
      data: { companyId, name: 'Far', email: 'far@test.com', skills: ['plumbing'], currentLat: 50.0, currentLng: -80.0 },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${workOrderId}/auto-assign`)
      .set('x-company-id', companyId)
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });

  it('should set completedAt when transitioning to COMPLETED', async () => {
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'IN_PROGRESS', technicianId },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.completedAt).toBeTruthy();
  });
});
