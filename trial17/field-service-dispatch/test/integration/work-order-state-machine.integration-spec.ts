import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { WorkOrderService } from '../../src/work-order/work-order.service';

describe('WorkOrder State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let workOrderService: WorkOrderService;
  let companyId: string;
  let technicianId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    workOrderService = app.get(WorkOrderService);
  });

  afterAll(async () => {
    await prisma.gpsEvent.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    const company = await prisma.company.create({ data: { name: 'Test Company' } });
    companyId = company.id;

    const technician = await prisma.technician.create({
      data: {
        email: 'tech@test.com',
        name: 'Test Tech',
        skills: ['HVAC'],
        companyId,
      },
    });
    technicianId = technician.id;
  });

  it('should create work order with CREATED status', async () => {
    const wo = await workOrderService.create(companyId, { title: 'Fix AC unit' });
    expect(wo.status).toBe('CREATED');
  });

  it('should create work order with ASSIGNED status when technician provided', async () => {
    const wo = await workOrderService.create(companyId, {
      title: 'Fix AC unit',
      technicianId,
    });
    expect(wo.status).toBe('ASSIGNED');
  });

  it('should follow full lifecycle: CREATED -> ASSIGNED -> EN_ROUTE -> IN_PROGRESS -> COMPLETED', async () => {
    const wo = await workOrderService.create(companyId, { title: 'Full lifecycle test' });
    expect(wo.status).toBe('CREATED');

    const assigned = await workOrderService.transition(companyId, wo.id, 'ASSIGNED');
    expect(assigned.status).toBe('ASSIGNED');

    const enRoute = await workOrderService.transition(companyId, wo.id, 'EN_ROUTE');
    expect(enRoute.status).toBe('EN_ROUTE');

    const inProgress = await workOrderService.transition(companyId, wo.id, 'IN_PROGRESS');
    expect(inProgress.status).toBe('IN_PROGRESS');

    const completed = await workOrderService.transition(companyId, wo.id, 'COMPLETED');
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBeTruthy();
  });

  it('should allow ON_HOLD -> IN_PROGRESS cycle', async () => {
    const wo = await workOrderService.create(companyId, { title: 'Hold test' });
    await workOrderService.transition(companyId, wo.id, 'ASSIGNED');
    await workOrderService.transition(companyId, wo.id, 'EN_ROUTE');
    await workOrderService.transition(companyId, wo.id, 'IN_PROGRESS');

    const onHold = await workOrderService.transition(companyId, wo.id, 'ON_HOLD');
    expect(onHold.status).toBe('ON_HOLD');

    const resumed = await workOrderService.transition(companyId, wo.id, 'IN_PROGRESS');
    expect(resumed.status).toBe('IN_PROGRESS');
  });

  it('should allow CANCELLED from any non-terminal state', async () => {
    const wo1 = await workOrderService.create(companyId, { title: 'Cancel from CREATED' });
    const cancelled1 = await workOrderService.transition(companyId, wo1.id, 'CANCELLED');
    expect(cancelled1.status).toBe('CANCELLED');

    const wo2 = await workOrderService.create(companyId, { title: 'Cancel from ASSIGNED' });
    await workOrderService.transition(companyId, wo2.id, 'ASSIGNED');
    const cancelled2 = await workOrderService.transition(companyId, wo2.id, 'CANCELLED');
    expect(cancelled2.status).toBe('CANCELLED');

    const wo3 = await workOrderService.create(companyId, { title: 'Cancel from IN_PROGRESS' });
    await workOrderService.transition(companyId, wo3.id, 'ASSIGNED');
    await workOrderService.transition(companyId, wo3.id, 'EN_ROUTE');
    await workOrderService.transition(companyId, wo3.id, 'IN_PROGRESS');
    const cancelled3 = await workOrderService.transition(companyId, wo3.id, 'CANCELLED');
    expect(cancelled3.status).toBe('CANCELLED');
  });

  it('should reject invalid transitions', async () => {
    const wo = await workOrderService.create(companyId, { title: 'Invalid transition test' });

    await expect(
      workOrderService.transition(companyId, wo.id, 'COMPLETED'),
    ).rejects.toThrow('Cannot transition from CREATED to COMPLETED');

    await expect(
      workOrderService.transition(companyId, wo.id, 'IN_PROGRESS'),
    ).rejects.toThrow('Cannot transition from CREATED to IN_PROGRESS');
  });

  it('should not allow transitions from CLOSED', async () => {
    const wo = await workOrderService.create(companyId, { title: 'Closed test' });
    await workOrderService.transition(companyId, wo.id, 'ASSIGNED');
    await workOrderService.transition(companyId, wo.id, 'EN_ROUTE');
    await workOrderService.transition(companyId, wo.id, 'IN_PROGRESS');
    await workOrderService.transition(companyId, wo.id, 'COMPLETED');
    await workOrderService.transition(companyId, wo.id, 'INVOICED');
    await workOrderService.transition(companyId, wo.id, 'CLOSED');

    await expect(
      workOrderService.transition(companyId, wo.id, 'CANCELLED'),
    ).rejects.toThrow('Cannot transition from CLOSED to CANCELLED');
  });

  it('should not allow transitions from CANCELLED', async () => {
    const wo = await workOrderService.create(companyId, { title: 'Cancelled test' });
    await workOrderService.transition(companyId, wo.id, 'CANCELLED');

    await expect(
      workOrderService.transition(companyId, wo.id, 'CREATED'),
    ).rejects.toThrow('Cannot transition from CANCELLED to CREATED');
  });
});
