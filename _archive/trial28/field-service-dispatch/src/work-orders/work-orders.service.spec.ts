import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
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
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  describe('create', () => {
    it('should create a work order with UNASSIGNED status when no technicianId', async () => {
      const dto = { title: 'Fix AC', description: 'AC broken', customerId: 'c1', priority: 'HIGH' as any };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo1', ...dto, status: 'UNASSIGNED' });
      const result = await service.create('comp1', dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: WorkOrderStatus.UNASSIGNED }),
        }),
      );
      expect(result.id).toBe('wo1');
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      const dto = { title: 'Fix AC', description: 'AC broken', customerId: 'c1', technicianId: 't1', priority: 'HIGH' as any };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo1', status: 'ASSIGNED' });
      await service.create('comp1', dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: WorkOrderStatus.ASSIGNED }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all work orders for a company', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: 'wo1' }]);
      const result = await service.findAll('comp1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: 'comp1' } }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      await service.findAll('comp1', WorkOrderStatus.ASSIGNED);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp1', status: WorkOrderStatus.ASSIGNED },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return work order when found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId: 'comp1' });
      const result = await service.findOne('comp1', 'wo1');
      expect(result.id).toBe('wo1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp1', 'wo999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update work order fields', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1' });
      mockPrisma.workOrder.update.mockResolvedValue({ id: 'wo1', title: 'Updated' });
      const result = await service.update('comp1', 'wo1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.update('comp1', 'wo999', { title: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('transitionStatus', () => {
    it('should transition status and create history entry', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.UNASSIGNED,
        customer: {},
        technician: null,
      });
      const updated = { id: 'wo1', status: WorkOrderStatus.ASSIGNED };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.transitionStatus('comp1', 'wo1', WorkOrderStatus.ASSIGNED);
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should throw for invalid transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.UNASSIGNED,
      });
      await expect(
        service.transitionStatus('comp1', 'wo1', WorkOrderStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignTechnician', () => {
    it('should assign technician to UNASSIGNED work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.UNASSIGNED,
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'wo1', technicianId: 't1', status: 'ASSIGNED' }, {}]);
      const result = await service.assignTechnician('comp1', 'wo1', 't1');
      expect(result.technicianId).toBe('t1');
    });

    it('should throw for non-assignable status', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.COMPLETED,
      });
      await expect(service.assignTechnician('comp1', 'wo1', 't1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete an existing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1' });
      mockPrisma.workOrder.delete.mockResolvedValue({ id: 'wo1' });
      const result = await service.delete('comp1', 'wo1');
      expect(result.id).toBe('wo1');
    });
  });

  describe('autoAssign', () => {
    it('should assign the nearest available technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.UNASSIGNED,
        customer: { lat: 10, lng: 20 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: 50, currentLng: 50 },
        { id: 't2', currentLat: 11, currentLng: 21 },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: 'wo1', technicianId: 't2', status: 'ASSIGNED' }, {}]);

      const result = await service.autoAssign('comp1', 'wo1');
      expect(result.technicianId).toBe('t2');
    });

    it('should throw if no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.UNASSIGNED,
        customer: { lat: 10, lng: 20 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);
      await expect(service.autoAssign('comp1', 'wo1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if work order is not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.ASSIGNED,
      });
      await expect(service.autoAssign('comp1', 'wo1')).rejects.toThrow(BadRequestException);
    });
  });
});
