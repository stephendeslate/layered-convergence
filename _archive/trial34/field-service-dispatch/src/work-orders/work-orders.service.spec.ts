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

  describe('create', () => {
    it('should create work order as UNASSIGNED without technician', async () => {
      const dto = { title: 'Fix AC', customerId: 'cust-1' };
      prisma.workOrder.create.mockResolvedValue({
        id: 'wo-1', ...dto, companyId, status: 'UNASSIGNED',
      });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create(companyId, dto);
      expect(result.status).toBe('UNASSIGNED');
    });

    it('should create work order as ASSIGNED with technician', async () => {
      const dto = { title: 'Fix AC', customerId: 'cust-1', technicianId: 'tech-1' };
      prisma.workOrder.create.mockResolvedValue({
        id: 'wo-1', ...dto, companyId, status: 'ASSIGNED',
      });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create(companyId, dto);
      expect(result.status).toBe('ASSIGNED');
    });

    it('should record initial status history', async () => {
      const dto = { title: 'Fix Heater', customerId: 'cust-1' };
      prisma.workOrder.create.mockResolvedValue({ id: 'wo-1', status: 'UNASSIGNED' });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      await service.create(companyId, dto);

      expect(prisma.workOrderStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workOrderId: 'wo-1',
          fromStatus: 'UNASSIGNED',
          toStatus: 'UNASSIGNED',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return work orders for company', async () => {
      prisma.workOrder.findMany.mockResolvedValue([{ id: 'wo-1', companyId }]);
      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return work order with relations', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, customer: {}, statusHistory: [],
      });
      const result = await service.findOne(companyId, 'wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne(companyId, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.ASSIGNED, technicianId: 'tech-1',
        customer: {}, statusHistory: [],
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-1', status: WorkOrderStatus.EN_ROUTE,
      });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.updateStatus(companyId, 'wo-1', {
        status: WorkOrderStatus.EN_ROUTE,
      });
      expect(result.status).toBe('EN_ROUTE');
    });

    it('should reject invalid transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.UNASSIGNED,
        customer: {}, statusHistory: [],
      });

      await expect(
        service.updateStatus(companyId, 'wo-1', { status: WorkOrderStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject assigning without technician', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.UNASSIGNED, technicianId: null,
        customer: {}, statusHistory: [],
      });

      await expect(
        service.updateStatus(companyId, 'wo-1', { status: WorkOrderStatus.ASSIGNED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set completedAt when completing', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.IN_PROGRESS, technicianId: 'tech-1',
        customer: {}, statusHistory: [],
      });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'COMPLETED' });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      await service.updateStatus(companyId, 'wo-1', { status: WorkOrderStatus.COMPLETED });

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: expect.objectContaining({ completedAt: expect.any(Date) }),
        include: expect.anything(),
      });
    });

    it('should record status change history', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.ASSIGNED, technicianId: 'tech-1',
        customer: {}, statusHistory: [],
      });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'EN_ROUTE' });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      await service.updateStatus(companyId, 'wo-1', {
        status: WorkOrderStatus.EN_ROUTE,
        note: 'On my way',
      }, 'user-1');

      expect(prisma.workOrderStatusHistory.create).toHaveBeenCalledWith({
        data: {
          workOrderId: 'wo-1',
          fromStatus: WorkOrderStatus.ASSIGNED,
          toStatus: WorkOrderStatus.EN_ROUTE,
          note: 'On my way',
          changedBy: 'user-1',
        },
      });
    });
  });

  describe('assignTechnician', () => {
    it('should assign technician and update status to ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.UNASSIGNED,
        customer: {}, statusHistory: [],
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-1', technicianId: 'tech-1', status: 'ASSIGNED',
      });
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.assignTechnician(companyId, 'wo-1', 'tech-1');
      expect(result.technicianId).toBe('tech-1');
    });

    it('should not change status if already past ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.EN_ROUTE,
        customer: {}, statusHistory: [],
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-1', technicianId: 'tech-2', status: 'EN_ROUTE',
      });

      const result = await service.assignTechnician(companyId, 'wo-1', 'tech-2');
      expect(result.status).toBe('EN_ROUTE');
    });
  });

  describe('remove', () => {
    it('should delete a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, customer: {}, statusHistory: [],
      });
      prisma.workOrder.delete.mockResolvedValue({ id: 'wo-1' });
      const result = await service.remove(companyId, 'wo-1');
      expect(result.id).toBe('wo-1');
    });
  });
});
