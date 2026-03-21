import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderStatus } from '@prisma/client';

describe('WorkOrder State Machine (Integration)', () => {
  let service: WorkOrderService;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrderService, PrismaService],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.cleanDatabase();

    const company = await prisma.company.create({ data: { name: 'Test Corp' } });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        email: 'customer@test.com',
        lat: 40.7128,
        lng: -74.006,
        address: '123 Main St',
        companyId,
      },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        name: 'Test Tech',
        email: 'tech@test.com',
        lat: 40.72,
        lng: -74.01,
        skills: ['plumbing', 'electrical'],
        availability: 'AVAILABLE',
        companyId,
      },
    });
    technicianId = technician.id;
  });

  it('should complete full lifecycle: CREATED -> ASSIGNED -> EN_ROUTE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID -> CLOSED', async () => {
    // CREATED
    const wo = await service.create(companyId, {
      title: 'Full Lifecycle Test',
      customerId,
    });
    expect(wo.status).toBe(WorkOrderStatus.CREATED);

    // CREATED -> ASSIGNED
    const assigned = await service.assign(wo.id, companyId, { technicianId });
    expect(assigned.status).toBe(WorkOrderStatus.ASSIGNED);

    // ASSIGNED -> EN_ROUTE
    const enRoute = await service.transition(wo.id, companyId, WorkOrderStatus.EN_ROUTE);
    expect(enRoute.status).toBe(WorkOrderStatus.EN_ROUTE);

    // EN_ROUTE -> IN_PROGRESS
    const inProgress = await service.transition(wo.id, companyId, WorkOrderStatus.IN_PROGRESS);
    expect(inProgress.status).toBe(WorkOrderStatus.IN_PROGRESS);

    // IN_PROGRESS -> COMPLETED
    const completed = await service.transition(wo.id, companyId, WorkOrderStatus.COMPLETED);
    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);

    // COMPLETED -> INVOICED
    const invoiced = await service.transition(wo.id, companyId, WorkOrderStatus.INVOICED);
    expect(invoiced.status).toBe(WorkOrderStatus.INVOICED);

    // INVOICED -> PAID
    const paid = await service.transition(wo.id, companyId, WorkOrderStatus.PAID);
    expect(paid.status).toBe(WorkOrderStatus.PAID);

    // PAID -> CLOSED
    const closed = await service.transition(wo.id, companyId, WorkOrderStatus.CLOSED);
    expect(closed.status).toBe(WorkOrderStatus.CLOSED);
  });

  it('should support ON_HOLD cycle: IN_PROGRESS -> ON_HOLD -> IN_PROGRESS -> COMPLETED', async () => {
    const wo = await service.create(companyId, { title: 'Hold Test', customerId });
    await service.assign(wo.id, companyId, { technicianId });
    await service.transition(wo.id, companyId, WorkOrderStatus.EN_ROUTE);
    await service.transition(wo.id, companyId, WorkOrderStatus.IN_PROGRESS);

    // IN_PROGRESS -> ON_HOLD
    const onHold = await service.transition(wo.id, companyId, WorkOrderStatus.ON_HOLD);
    expect(onHold.status).toBe(WorkOrderStatus.ON_HOLD);

    // ON_HOLD -> IN_PROGRESS
    const resumed = await service.transition(wo.id, companyId, WorkOrderStatus.IN_PROGRESS);
    expect(resumed.status).toBe(WorkOrderStatus.IN_PROGRESS);

    // IN_PROGRESS -> COMPLETED
    const completed = await service.transition(wo.id, companyId, WorkOrderStatus.COMPLETED);
    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);
  });

  it('should reject invalid transition CREATED -> EN_ROUTE (skipping ASSIGNED)', async () => {
    const wo = await service.create(companyId, { title: 'Skip Test', customerId });

    await expect(
      service.transition(wo.id, companyId, WorkOrderStatus.EN_ROUTE),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition CREATED -> COMPLETED (skipping multiple)', async () => {
    const wo = await service.create(companyId, { title: 'Skip Test', customerId });

    await expect(
      service.transition(wo.id, companyId, WorkOrderStatus.COMPLETED),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject backward transition ASSIGNED -> CREATED', async () => {
    const wo = await service.create(companyId, { title: 'Backward Test', customerId });
    await service.assign(wo.id, companyId, { technicianId });

    await expect(
      service.transition(wo.id, companyId, WorkOrderStatus.CREATED),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject transitions from CLOSED', async () => {
    const wo = await service.create(companyId, { title: 'Closed Test', customerId });
    await service.assign(wo.id, companyId, { technicianId });
    await service.transition(wo.id, companyId, WorkOrderStatus.EN_ROUTE);
    await service.transition(wo.id, companyId, WorkOrderStatus.IN_PROGRESS);
    await service.transition(wo.id, companyId, WorkOrderStatus.COMPLETED);
    await service.transition(wo.id, companyId, WorkOrderStatus.INVOICED);
    await service.transition(wo.id, companyId, WorkOrderStatus.PAID);
    await service.transition(wo.id, companyId, WorkOrderStatus.CLOSED);

    await expect(
      service.transition(wo.id, companyId, WorkOrderStatus.CREATED),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject assigning work order that is not CREATED', async () => {
    const wo = await service.create(companyId, { title: 'Assign Test', customerId });
    await service.assign(wo.id, companyId, { technicianId });

    await expect(
      service.assign(wo.id, companyId, { technicianId }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should set completedAt when transitioning to COMPLETED', async () => {
    const wo = await service.create(companyId, { title: 'Completed Test', customerId });
    await service.assign(wo.id, companyId, { technicianId });
    await service.transition(wo.id, companyId, WorkOrderStatus.EN_ROUTE);
    await service.transition(wo.id, companyId, WorkOrderStatus.IN_PROGRESS);

    const completed = await service.transition(wo.id, companyId, WorkOrderStatus.COMPLETED);
    const fetched = await service.findOne(completed.id, companyId);
    expect(fetched.completedAt).toBeDefined();
    expect(fetched.completedAt).toBeInstanceOf(Date);
  });

  it('should reject ON_HOLD from ASSIGNED', async () => {
    const wo = await service.create(companyId, { title: 'Hold from Assigned', customerId });
    await service.assign(wo.id, companyId, { technicianId });

    await expect(
      service.transition(wo.id, companyId, WorkOrderStatus.ON_HOLD),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject COMPLETED from ON_HOLD (must go through IN_PROGRESS)', async () => {
    const wo = await service.create(companyId, { title: 'Hold to Complete', customerId });
    await service.assign(wo.id, companyId, { technicianId });
    await service.transition(wo.id, companyId, WorkOrderStatus.EN_ROUTE);
    await service.transition(wo.id, companyId, WorkOrderStatus.IN_PROGRESS);
    await service.transition(wo.id, companyId, WorkOrderStatus.ON_HOLD);

    await expect(
      service.transition(wo.id, companyId, WorkOrderStatus.COMPLETED),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException for nonexistent work order', async () => {
    await expect(
      service.transition('nonexistent-id', companyId, WorkOrderStatus.ASSIGNED),
    ).rejects.toThrow(NotFoundException);
  });
});
