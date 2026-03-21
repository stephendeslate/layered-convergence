import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      workOrderStatusHistory: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  it('should create a work order with UNASSIGNED status', async () => {
    const dto = { title: 'Fix AC', customerId: 'c1' };
    prisma.workOrder.create.mockResolvedValue({
      id: 'wo1', ...dto, status: WorkOrderStatus.UNASSIGNED, companyId,
    });
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    const result = await service.create(companyId, dto as any);
    expect(result.status).toBe(WorkOrderStatus.UNASSIGNED);
    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ companyId, status: WorkOrderStatus.UNASSIGNED }),
      }),
    );
  });

  it('should create with ASSIGNED status when technicianId provided', async () => {
    const dto = { title: 'Fix AC', customerId: 'c1', technicianId: 't1' };
    prisma.workOrder.create.mockResolvedValue({
      id: 'wo1', ...dto, status: WorkOrderStatus.ASSIGNED, companyId,
    });
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    const result = await service.create(companyId, dto as any);
    expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
  });

  it('should create status history on creation', async () => {
    const dto = { title: 'Fix AC', customerId: 'c1' };
    prisma.workOrder.create.mockResolvedValue({
      id: 'wo1', status: WorkOrderStatus.UNASSIGNED, companyId,
    });
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    await service.create(companyId, dto as any);
    expect(prisma.workOrderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workOrderId: 'wo1',
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: WorkOrderStatus.UNASSIGNED,
      }),
    });
  });

  it('should find all work orders for company', async () => {
    prisma.workOrder.findMany.mockResolvedValue([{ id: 'wo1', companyId }]);
    const result = await service.findAll(companyId);
    expect(result).toHaveLength(1);
    expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId } }),
    );
  });

  it('should find one work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
    const result = await service.findOne(companyId, 'wo1');
    expect(result.id).toBe('wo1');
  });

  it('should throw NotFoundException when work order not found', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);
    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo1', title: 'Updated' });
    const result = await service.update(companyId, 'wo1', { title: 'Updated' } as any);
    expect(result.title).toBe('Updated');
  });

  it('should update status with valid transition', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.ASSIGNED, technicianId: 't1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1', status: WorkOrderStatus.EN_ROUTE,
    });
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    const result = await service.updateStatus(companyId, 'wo1', {
      status: WorkOrderStatus.EN_ROUTE,
    });
    expect(result.status).toBe(WorkOrderStatus.EN_ROUTE);
  });

  it('should throw on invalid status transition', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.UNASSIGNED,
    });

    await expect(
      service.updateStatus(companyId, 'wo1', { status: WorkOrderStatus.COMPLETED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when assigning without technician', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.UNASSIGNED, technicianId: null,
    });

    await expect(
      service.updateStatus(companyId, 'wo1', { status: WorkOrderStatus.ASSIGNED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should set completedAt when status changes to COMPLETED', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.IN_PROGRESS, technicianId: 't1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1', status: WorkOrderStatus.COMPLETED,
    });
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    await service.updateStatus(companyId, 'wo1', { status: WorkOrderStatus.COMPLETED });
    expect(prisma.workOrder.update).toHaveBeenCalledWith({
      where: { id: 'wo1' },
      data: expect.objectContaining({ completedAt: expect.any(Date) }),
      include: expect.any(Object),
    });
  });

  it('should assign technician to work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.UNASSIGNED,
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1', technicianId: 't1', status: WorkOrderStatus.ASSIGNED,
    });
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    const result = await service.assignTechnician(companyId, 'wo1', 't1');
    expect(result.technicianId).toBe('t1');
    expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
  });

  it('should not change status when assigning to non-UNASSIGNED work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.EN_ROUTE, technicianId: 't1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1', technicianId: 't2', status: WorkOrderStatus.EN_ROUTE,
    });

    const result = await service.assignTechnician(companyId, 'wo1', 't2');
    expect(result.status).toBe(WorkOrderStatus.EN_ROUTE);
    expect(prisma.workOrderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('should delete a work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
    prisma.workOrder.delete.mockResolvedValue({ id: 'wo1' });
    await service.remove(companyId, 'wo1');
    expect(prisma.workOrder.delete).toHaveBeenCalledWith({ where: { id: 'wo1' } });
  });
});
