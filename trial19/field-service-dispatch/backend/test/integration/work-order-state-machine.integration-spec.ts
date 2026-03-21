import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkOrderStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { WorkOrderService } from '../../src/work-order/work-order.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { BadRequestException } from '@nestjs/common';

describe('WorkOrder State Machine (Integration)', () => {
  let module: TestingModule;
  let workOrderService: WorkOrderService;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [WorkOrderService],
    }).compile();

    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({ data: { name: 'State Machine Test Co' } });
    companyId = company.id;

    const hashedPassword = await bcrypt.hash('password123', 12);
    await prisma.user.create({
      data: { email: 'sm-test@test.com', password: hashedPassword, role: Role.DISPATCHER, companyId },
    });

    const customer = await prisma.customer.create({
      data: { name: 'SM Customer', email: 'sm-cust@test.com', phone: '555-0000', address: '1 Test St', companyId },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: { name: 'SM Tech', email: 'sm-tech@test.com', phone: '555-1111', skills: ['HVAC'], companyId },
    });
    technicianId = technician.id;
  });

  afterAll(async () => {
    await prisma.invoice.deleteMany({ where: { companyId } });
    await prisma.workOrder.deleteMany({ where: { companyId } });
    await prisma.technician.deleteMany({ where: { companyId } });
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.user.deleteMany({ where: { companyId } });
    await prisma.company.delete({ where: { id: companyId } });
    await module.close();
  });

  it('should follow the full lifecycle: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> INVOICED', async () => {
    const workOrder = await workOrderService.create(
      { title: 'Fix Heater', description: 'Heater broken', customerId, technicianId: undefined },
      companyId,
    );
    expect(workOrder.status).toBe(WorkOrderStatus.PENDING);

    const assigned = await workOrderService.transition(workOrder.id, WorkOrderStatus.ASSIGNED, companyId);
    expect(assigned.status).toBe(WorkOrderStatus.ASSIGNED);

    const inProgress = await workOrderService.transition(workOrder.id, WorkOrderStatus.IN_PROGRESS, companyId);
    expect(inProgress.status).toBe(WorkOrderStatus.IN_PROGRESS);

    const completed = await workOrderService.transition(workOrder.id, WorkOrderStatus.COMPLETED, companyId);
    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);
    expect(completed.completedAt).toBeTruthy();

    const invoiced = await workOrderService.transition(workOrder.id, WorkOrderStatus.INVOICED, companyId);
    expect(invoiced.status).toBe(WorkOrderStatus.INVOICED);
  });

  it('should handle ON_HOLD transitions correctly', async () => {
    const workOrder = await workOrderService.create(
      { title: 'Fix Pipes', description: 'Leaking', customerId, technicianId },
      companyId,
    );
    expect(workOrder.status).toBe(WorkOrderStatus.ASSIGNED);

    const inProgress = await workOrderService.transition(workOrder.id, WorkOrderStatus.IN_PROGRESS, companyId);
    expect(inProgress.status).toBe(WorkOrderStatus.IN_PROGRESS);

    const onHold = await workOrderService.transition(workOrder.id, WorkOrderStatus.ON_HOLD, companyId);
    expect(onHold.status).toBe(WorkOrderStatus.ON_HOLD);

    const resumed = await workOrderService.transition(workOrder.id, WorkOrderStatus.IN_PROGRESS, companyId);
    expect(resumed.status).toBe(WorkOrderStatus.IN_PROGRESS);
  });

  it('should reject invalid transition from PENDING to COMPLETED', async () => {
    const workOrder = await workOrderService.create(
      { title: 'Test Invalid', description: 'Should fail', customerId },
      companyId,
    );

    await expect(
      workOrderService.transition(workOrder.id, WorkOrderStatus.COMPLETED, companyId),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition from INVOICED', async () => {
    const workOrder = await workOrderService.create(
      { title: 'Invoiced Test', description: 'Final state', customerId },
      companyId,
    );

    await workOrderService.transition(workOrder.id, WorkOrderStatus.ASSIGNED, companyId);
    await workOrderService.transition(workOrder.id, WorkOrderStatus.IN_PROGRESS, companyId);
    await workOrderService.transition(workOrder.id, WorkOrderStatus.COMPLETED, companyId);
    await workOrderService.transition(workOrder.id, WorkOrderStatus.INVOICED, companyId);

    await expect(
      workOrderService.transition(workOrder.id, WorkOrderStatus.PENDING, companyId),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject transition from PENDING to IN_PROGRESS (must go through ASSIGNED)', async () => {
    const workOrder = await workOrderService.create(
      { title: 'Skip Step', description: 'Should fail', customerId },
      companyId,
    );

    await expect(
      workOrderService.transition(workOrder.id, WorkOrderStatus.IN_PROGRESS, companyId),
    ).rejects.toThrow(BadRequestException);
  });
});
