import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';

const mockPrisma = {
  workOrder: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  const companyId = 'company-1';

  beforeEach(() => {
    service = new WorkOrderService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a work order with CREATED status when no technician', async () => {
      mockPrisma.workOrder.create.mockResolvedValue({
        id: 'wo-1',
        title: 'Fix AC',
        status: 'CREATED',
        companyId,
      });

      const result = await service.create(companyId, {
        title: 'Fix AC',
      });

      expect(result.status).toBe('CREATED');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CREATED', companyId }),
        }),
      );
    });

    it('should create a work order with ASSIGNED status when technician provided', async () => {
      mockPrisma.workOrder.create.mockResolvedValue({
        id: 'wo-1',
        title: 'Fix AC',
        status: 'ASSIGNED',
        companyId,
      });

      await service.create(companyId, {
        title: 'Fix AC',
        technicianId: 'tech-1',
      });

      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ASSIGNED', technicianId: 'tech-1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'CREATED',
      });

      const result = await service.findOne(companyId, 'wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.findOne(companyId, 'wo-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for different company', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId: 'other-company',
      });

      await expect(service.findOne(companyId, 'wo-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should transition CREATED to ASSIGNED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'CREATED',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: 'ASSIGNED',
      });

      const result = await service.transition(companyId, 'wo-1', 'ASSIGNED');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'IN_PROGRESS',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
      });

      await service.transition(companyId, 'wo-1', 'COMPLETED');
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'CREATED',
      });

      await expect(
        service.transition(companyId, 'wo-1', 'COMPLETED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow any state to transition to CANCELLED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'EN_ROUTE',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: 'CANCELLED',
      });

      const result = await service.transition(companyId, 'wo-1', 'CANCELLED');
      expect(result.status).toBe('CANCELLED');
    });

    it('should not allow transition from CLOSED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'CLOSED',
      });

      await expect(
        service.transition(companyId, 'wo-1', 'CANCELLED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow transition from CANCELLED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'CANCELLED',
      });

      await expect(
        service.transition(companyId, 'wo-1', 'CREATED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for CREATED', () => {
      expect(service.getValidTransitions('CREATED')).toEqual(['ASSIGNED', 'CANCELLED']);
    });

    it('should return empty for CLOSED', () => {
      expect(service.getValidTransitions('CLOSED')).toEqual([]);
    });

    it('should return empty for CANCELLED', () => {
      expect(service.getValidTransitions('CANCELLED')).toEqual([]);
    });
  });
});
