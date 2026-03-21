import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      assignment: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      workOrder: {
        findFirst: vi.fn(),
      },
      technician: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  describe('create', () => {
    it('should create an assignment', async () => {
      const dto = { workOrderId: 'wo1', technicianId: 't1' };
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.assignment.findFirst.mockResolvedValue(null);
      prisma.assignment.create.mockResolvedValue({
        id: 'a1', ...dto, active: true,
      });

      const result = await service.create(companyId, dto);
      expect(result.id).toBe('a1');
      expect(result.active).toBe(true);
    });

    it('should throw NotFoundException if work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.create(companyId, { workOrderId: 'missing', technicianId: 't1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if technician not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(
        service.create(companyId, { workOrderId: 'wo1', technicianId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already assigned', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.assignment.findFirst.mockResolvedValue({ id: 'existing', active: true });

      await expect(
        service.create(companyId, { workOrderId: 'wo1', technicianId: 't1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include note in assignment', async () => {
      const dto = { workOrderId: 'wo1', technicianId: 't1', note: 'Urgent' };
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.assignment.findFirst.mockResolvedValue(null);
      prisma.assignment.create.mockResolvedValue({ id: 'a1', ...dto, active: true });

      const result = await service.create(companyId, dto);
      expect(prisma.assignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ note: 'Urgent' }),
        }),
      );
    });
  });

  describe('findByWorkOrder', () => {
    it('should find assignments by work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo1', companyId });
      prisma.assignment.findMany.mockResolvedValue([{ id: 'a1', workOrderId: 'wo1' }]);

      const result = await service.findByWorkOrder(companyId, 'wo1');
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findByWorkOrder(companyId, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTechnician', () => {
    it('should find active assignments by technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.assignment.findMany.mockResolvedValue([{ id: 'a1', technicianId: 't1', active: true }]);

      const result = await service.findByTechnician(companyId, 't1');
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if technician not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findByTechnician(companyId, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find one assignment', async () => {
      prisma.assignment.findUnique.mockResolvedValue({ id: 'a1' });
      const result = await service.findOne('a1');
      expect(result.id).toBe('a1');
    });

    it('should throw NotFoundException for missing assignment', async () => {
      prisma.assignment.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unassign', () => {
    it('should deactivate an assignment', async () => {
      prisma.assignment.findUnique.mockResolvedValue({
        id: 'a1', active: true, workOrder: { companyId },
      });
      prisma.assignment.update.mockResolvedValue({
        id: 'a1', active: false, unassignedAt: new Date(),
      });

      const result = await service.unassign(companyId, 'a1');
      expect(result.active).toBe(false);
    });

    it('should throw NotFoundException for missing assignment', async () => {
      prisma.assignment.findUnique.mockResolvedValue(null);
      await expect(service.unassign(companyId, 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong company', async () => {
      prisma.assignment.findUnique.mockResolvedValue({
        id: 'a1', active: true, workOrder: { companyId: 'other-company' },
      });
      await expect(service.unassign(companyId, 'a1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already inactive', async () => {
      prisma.assignment.findUnique.mockResolvedValue({
        id: 'a1', active: false, workOrder: { companyId },
      });
      await expect(service.unassign(companyId, 'a1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findActiveByWorkOrder', () => {
    it('should find active assignments for a work order', async () => {
      prisma.assignment.findMany.mockResolvedValue([{ id: 'a1', active: true }]);
      const result = await service.findActiveByWorkOrder('wo1');
      expect(result).toHaveLength(1);
      expect(prisma.assignment.findMany).toHaveBeenCalledWith({
        where: { workOrderId: 'wo1', active: true },
        include: { technician: true },
      });
    });
  });
});
