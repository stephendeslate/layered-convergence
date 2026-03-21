import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
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
  technician: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(WorkOrdersService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a work order with UNASSIGNED status when no technician', async () => {
      const dto = { customerId: 'cust-1', title: 'Fix sink' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1', ...dto, status: 'UNASSIGNED' });

      const result = await service.create('comp-1', dto);
      expect(result.status).toBe('UNASSIGNED');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId: 'comp-1', status: 'UNASSIGNED' }),
        }),
      );
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      const dto = { customerId: 'cust-1', title: 'Fix sink', technicianId: 'tech-1' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1', ...dto, status: 'ASSIGNED' });

      const result = await service.create('comp-1', dto);
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('findAll', () => {
    it('should return work orders for company', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: 'wo-1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: 'comp-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return work order when found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      const result = await service.findOne('comp-1', 'wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', 'wo-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should transition status and create history', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: {},
      });
      const updated = { id: 'wo-1', status: 'ASSIGNED' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.transitionStatus('comp-1', 'wo-1', {
        status: 'ASSIGNED',
      });
      expect(result.status).toBe('ASSIGNED');
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: {},
      });

      await expect(
        service.transitionStatus('comp-1', 'wo-1', { status: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      mockPrisma.workOrder.delete.mockResolvedValue({ id: 'wo-1' });
      const result = await service.delete('comp-1', 'wo-1');
      expect(result.id).toBe('wo-1');
    });
  });

  describe('autoAssign', () => {
    it('should assign nearest technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: { lat: 40.0, lng: -74.0 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'Alice', currentLat: 40.1, currentLng: -74.1 },
        { id: 'tech-2', name: 'Bob', currentLat: 40.5, currentLng: -74.5 },
      ]);
      const updated = { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.autoAssign('comp-1', 'wo-1');
      expect(result.status).toBe('ASSIGNED');
      expect(result.technicianId).toBe('tech-1');
    });

    it('should return unchanged if status is not UNASSIGNED', async () => {
      const wo = { id: 'wo-1', status: 'ASSIGNED', customer: {} };
      mockPrisma.workOrder.findFirst.mockResolvedValue(wo);
      const result = await service.autoAssign('comp-1', 'wo-1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should return unchanged if no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: { lat: 40.0, lng: -74.0 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);
      const result = await service.autoAssign('comp-1', 'wo-1');
      expect(result.status).toBe('UNASSIGNED');
    });
  });
});
