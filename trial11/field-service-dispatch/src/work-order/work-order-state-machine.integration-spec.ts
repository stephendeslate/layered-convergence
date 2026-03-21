import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('WorkOrder State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let technicianId: string;
  let customerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.workOrderStatusHistory.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.company.deleteMany();

    const company = await prisma.company.create({
      data: { name: 'Test Plumbing Co' },
    });
    companyId = company.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'John Tech',
        email: 'john@test.com',
        skills: ['plumbing', 'hvac'],
        currentLat: 40.7128,
        currentLng: -74.006,
      },
    });
    technicianId = technician.id;

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: 'Jane Customer',
        address: '123 Main St',
        lat: 40.72,
        lng: -74.01,
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should transition through the full lifecycle: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId,
        description: 'Fix leaky faucet',
        priority: 'HIGH',
      })
      .expect(201);

    const workOrderId = createRes.body.id;
    expect(createRes.body.status).toBe('UNASSIGNED');

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    let wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
    expect(wo!.status).toBe('ASSIGNED');
    expect(wo!.technicianId).toBe(technicianId);

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/en-route`)
      .set('x-company-id', companyId)
      .expect(200);

    wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
    expect(wo!.status).toBe('EN_ROUTE');

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/on-site`)
      .set('x-company-id', companyId)
      .expect(200);

    wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
    expect(wo!.status).toBe('ON_SITE');

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/start`)
      .set('x-company-id', companyId)
      .expect(200);

    wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
    expect(wo!.status).toBe('IN_PROGRESS');

    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}/complete`)
      .set('x-company-id', companyId)
      .expect(200);

    wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
    expect(wo!.status).toBe('COMPLETED');
    expect(wo!.completedAt).not.toBeNull();

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'asc' },
    });
    expect(history).toHaveLength(5);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
    expect(history[4].fromStatus).toBe('IN_PROGRESS');
    expect(history[4].toStatus).toBe('COMPLETED');
  });

  it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId,
        description: 'Fix drain',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/work-orders/${createRes.body.id}/complete`)
      .set('x-company-id', companyId)
      .expect(400);
  });

  it('should reject invalid transition COMPLETED -> ASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        description: 'Already done',
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(400);
  });

  it('should create WorkOrderStatusHistory records for each transition', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        description: 'History test',
      },
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
});
