import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create with UNASSIGNED status when no technician', async () => {
      mockPrisma.workOrder.create.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        title: 'Test',
      });

      const result = await service.create('comp-1', {
        customerId: 'cust-1',
        title: 'Test',
      });

      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'UNASSIGNED' }),
        }),
      );
      expect(result.status).toBe('UNASSIGNED');
    });

    it('should create with ASSIGNED status when technician provided', async () => {
      mockPrisma.workOrder.create.mockResolvedValue({
        id: '1',
        status: 'ASSIGNED',
      });

      await service.create('comp-1', {
        customerId: 'cust-1',
        title: 'Test',
        technicianId: 'tech-1',
      });

      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ASSIGNED' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all work orders for a company', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([
        { id: '1', title: 'WO1' },
      ]);

      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp-1' },
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      await service.findAll('comp-1', 'ASSIGNED');
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp-1', status: 'ASSIGNED' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        title: 'Test',
      });
      const result = await service.findOne('comp-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should throw BadRequestException for invalid transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: {},
      });

      await expect(
        service.transitionStatus('comp-1', '1', 'COMPLETED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition with valid status', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'ASSIGNED',
        customer: {},
        technician: {},
      });
      mockPrisma.$transaction.mockResolvedValue([
        { id: '1', status: 'EN_ROUTE' },
        {},
      ]);

      const result = await service.transitionStatus(
        'comp-1',
        '1',
        'EN_ROUTE',
        'Going now',
      );
      expect(result.status).toBe('EN_ROUTE');
    });
  });

  describe('autoAssign', () => {
    it('should throw if work order is not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'ASSIGNED',
        customer: {},
      });

      await expect(service.autoAssign('comp-1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: 40.0, lng: -74.0 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.autoAssign('comp-1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.workOrder.delete.mockResolvedValue({ id: '1' });

      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if work order does not exist', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.delete('comp-1', 'bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
