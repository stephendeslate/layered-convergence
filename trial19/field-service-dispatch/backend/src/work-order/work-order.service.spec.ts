import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrderStatus } from '@prisma/client';

const mockPrisma = {
  workOrder: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkOrderService(mockPrisma as never);
  });

  describe('findAll', () => {
    it('should return work orders for a company', async () => {
      const orders = [{ id: '1', title: 'Test', companyId: 'c1' }];
      mockPrisma.workOrder.findMany.mockResolvedValue(orders);

      const result = await service.findAll('c1');
      expect(result).toEqual(orders);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        include: { customer: true, technician: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a work order when found', async () => {
      const order = { id: '1', title: 'Test', companyId: 'c1' };
      mockPrisma.workOrder.findFirst.mockResolvedValue(order);

      const result = await service.findById('1', 'c1');
      expect(result).toEqual(order);
    });

    it('should throw when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findById('1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should transition from PENDING to ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.ASSIGNED,
      });

      const result = await service.transition('1', WorkOrderStatus.ASSIGNED, 'c1');
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should set completedAt on COMPLETED transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.IN_PROGRESS,
        companyId: 'c1',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.COMPLETED,
        completedAt: new Date(),
      });

      await service.transition('1', WorkOrderStatus.COMPLETED, 'c1');
      const updateCall = mockPrisma.workOrder.update.mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeDefined();
    });

    it('should reject invalid transitions', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });

      await expect(
        service.transition('1', WorkOrderStatus.COMPLETED, 'c1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from INVOICED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.INVOICED,
        companyId: 'c1',
      });

      await expect(
        service.transition('1', WorkOrderStatus.PENDING, 'c1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for PENDING', () => {
      const transitions = service.getValidTransitions(WorkOrderStatus.PENDING);
      expect(transitions).toContain(WorkOrderStatus.ASSIGNED);
      expect(transitions).not.toContain(WorkOrderStatus.COMPLETED);
    });

    it('should return empty array for INVOICED', () => {
      const transitions = service.getValidTransitions(WorkOrderStatus.INVOICED);
      expect(transitions).toHaveLength(0);
    });
  });
});
