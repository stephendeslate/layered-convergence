import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      workOrder: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new WorkOrderService(prisma as unknown as PrismaService);
  });

  it('should find all work orders for a company', async () => {
    prisma.workOrder.findMany.mockResolvedValue([]);
    const result = await service.findAll('company-1');
    expect(result).toEqual([]);
  });

  it('should throw NotFoundException if work order not found', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);
    await expect(service.findById('wo-1', 'company-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a work order with PENDING status', async () => {
    const dto = { title: 'Fix AC', description: 'Broken AC unit', customerId: 'cust-1' };
    prisma.workOrder.create.mockResolvedValue({ id: 'wo-1', status: 'PENDING', ...dto });
    const result = await service.create(dto, 'company-1');
    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: WorkOrderStatus.PENDING }),
      }),
    );
    expect(result.status).toBe('PENDING');
  });

  it('should create a work order with ASSIGNED status when technicianId provided', async () => {
    const dto = { title: 'Fix AC', description: 'Broken AC', customerId: 'cust-1', technicianId: 'tech-1' };
    prisma.workOrder.create.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED', ...dto });
    await service.create(dto, 'company-1');
    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: WorkOrderStatus.ASSIGNED }),
      }),
    );
  });

  describe('state machine transitions', () => {
    it('should allow PENDING -> ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.PENDING, companyId: 'company-1' });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.ASSIGNED });
      const result = await service.transition('wo-1', WorkOrderStatus.ASSIGNED, 'company-1');
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should allow PENDING -> CANCELLED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.PENDING, companyId: 'company-1' });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.CANCELLED });
      await service.transition('wo-1', WorkOrderStatus.CANCELLED, 'company-1');
    });

    it('should reject PENDING -> COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.PENDING, companyId: 'company-1' });
      await expect(
        service.transition('wo-1', WorkOrderStatus.COMPLETED, 'company-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject INVOICED -> any', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.INVOICED, companyId: 'company-1' });
      await expect(
        service.transition('wo-1', WorkOrderStatus.COMPLETED, 'company-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.IN_PROGRESS, companyId: 'company-1' });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.COMPLETED });
      await service.transition('wo-1', WorkOrderStatus.COMPLETED, 'company-1');
      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ completedAt: expect.any(Date) }),
        }),
      );
    });
  });

  it('should return valid transitions for a status', () => {
    expect(service.getValidTransitions(WorkOrderStatus.PENDING)).toEqual([
      WorkOrderStatus.ASSIGNED,
      WorkOrderStatus.CANCELLED,
    ]);
    expect(service.getValidTransitions(WorkOrderStatus.INVOICED)).toEqual([]);
  });
});
