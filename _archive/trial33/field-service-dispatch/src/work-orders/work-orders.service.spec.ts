import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: any;

  const companyId = 'company-1';

  beforeEach(() => {
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
      technician: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn(),
    };
    service = new WorkOrdersService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create work order with UNASSIGNED status when no technician', async () => {
      const dto = { customerId: 'cust-1', title: 'Fix AC' };
      prisma.workOrder.create.mockResolvedValue({
        id: 'wo-1', status: 'UNASSIGNED', companyId,
      });

      const result = await service.create(companyId, dto as any);
      expect(result.status).toBe('UNASSIGNED');
      expect(prisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'UNASSIGNED' }),
        include: { customer: true, technician: true },
      });
    });

    it('should create work order with ASSIGNED status when technician provided', async () => {
      const dto = { customerId: 'cust-1', title: 'Fix AC', technicianId: 'tech-1' };
      prisma.workOrder.create.mockResolvedValue({
        id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1',
      });

      const result = await service.create(companyId, dto as any);
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('findAll', () => {
    it('should return work orders for company', async () => {
      prisma.workOrder.findMany.mockResolvedValue([{ id: 'wo-1' }]);
      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      const result = await service.findOne(companyId, 'wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne(companyId, 'nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', title: 'Updated' });

      const result = await service.update(companyId, 'wo-1', { title: 'Updated' } as any);
      expect(result.title).toBe('Updated');
    });
  });

  describe('transitionStatus', () => {
    it('should transition status and create history record', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', status: 'UNASSIGNED',
      });
      prisma.$transaction.mockResolvedValue([
        { id: 'wo-1', status: 'ASSIGNED' },
        { id: 'hist-1' },
      ]);

      const result = await service.transitionStatus(companyId, 'wo-1', {
        status: 'ASSIGNED' as any,
      });
      expect(result.status).toBe('ASSIGNED');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', status: 'UNASSIGNED',
      });

      await expect(
        service.transitionStatus(companyId, 'wo-1', {
          status: 'COMPLETED' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      prisma.workOrder.delete.mockResolvedValue({ id: 'wo-1' });

      const result = await service.delete(companyId, 'wo-1');
      expect(result.id).toBe('wo-1');
    });
  });

  describe('autoAssign', () => {
    it('should auto-assign nearest available technician', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: { lat: 40.0, lng: -74.0 },
      });
      prisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', currentLat: 40.1, currentLng: -74.1, name: 'Tech 1' },
        { id: 'tech-2', currentLat: 40.0, currentLng: -74.0, name: 'Tech 2' },
      ]);
      prisma.$transaction.mockResolvedValue([
        { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-2' },
        { id: 'hist-1' },
      ]);

      const result = await service.autoAssign(companyId, 'wo-1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should return unchanged work order when status is not UNASSIGNED', async () => {
      const workOrder = { id: 'wo-1', status: 'ASSIGNED', customer: {} };
      prisma.workOrder.findFirst.mockResolvedValue(workOrder);

      const result = await service.autoAssign(companyId, 'wo-1');
      expect(result).toEqual(workOrder);
    });

    it('should return unchanged work order when customer has no coordinates', async () => {
      const workOrder = {
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: { lat: null, lng: null },
      };
      prisma.workOrder.findFirst.mockResolvedValue(workOrder);

      const result = await service.autoAssign(companyId, 'wo-1');
      expect(result).toEqual(workOrder);
    });

    it('should return unchanged work order when no technicians available', async () => {
      const workOrder = {
        id: 'wo-1',
        status: 'UNASSIGNED',
        customer: { lat: 40.0, lng: -74.0 },
      };
      prisma.workOrder.findFirst.mockResolvedValue(workOrder);
      prisma.technician.findMany.mockResolvedValue([]);

      const result = await service.autoAssign(companyId, 'wo-1');
      expect(result).toEqual(workOrder);
    });
  });
});
