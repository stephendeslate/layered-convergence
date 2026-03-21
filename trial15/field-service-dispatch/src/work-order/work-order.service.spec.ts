import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderStatus } from '@prisma/client';

const mockPrisma = {
  workOrder: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  customer: {
    findFirst: vi.fn(),
  },
  technician: {
    findFirst: vi.fn(),
  },
};

const COMPANY_ID = 'company-1';

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a work order', async () => {
      const dto = { title: 'Fix pipe', customerId: 'cust-1' };
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', companyId: COMPANY_ID });
      mockPrisma.workOrder.create.mockResolvedValue({
        id: 'wo-1',
        ...dto,
        status: WorkOrderStatus.CREATED,
        companyId: COMPANY_ID,
      });

      const result = await service.create(COMPANY_ID, dto);
      expect(result.status).toBe(WorkOrderStatus.CREATED);
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.create(COMPANY_ID, { title: 'X', customerId: 'bad' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should set default priority to 0', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1' });
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1', priority: 0 });

      await service.create(COMPANY_ID, { title: 'Test', customerId: 'cust-1' });
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 0 }),
        }),
      );
    });

    it('should include customer and technician in response', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1' });
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1' });

      await service.create(COMPANY_ID, { title: 'Test', customerId: 'cust-1' });
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { customer: true, technician: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all work orders for a company', async () => {
      const orders = [{ id: 'wo-1' }];
      mockPrisma.workOrder.findMany.mockResolvedValue(orders);

      const result = await service.findAll(COMPANY_ID);
      expect(result).toEqual(orders);
    });

    it('should scope by companyId', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      await service.findAll(COMPANY_ID);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: COMPANY_ID } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a work order by id', async () => {
      const wo = { id: 'wo-1', companyId: COMPANY_ID, status: WorkOrderStatus.CREATED };
      mockPrisma.workOrder.findFirst.mockResolvedValue(wo);

      const result = await service.findOne('wo-1', COMPANY_ID);
      expect(result).toEqual(wo);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should scope by companyId', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      await service.findOne('wo-1', COMPANY_ID);
      expect(mockPrisma.workOrder.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'wo-1', companyId: COMPANY_ID } }),
      );
    });
  });

  describe('assign', () => {
    it('should assign a technician to a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CREATED,
        companyId: COMPANY_ID,
      });
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId: COMPANY_ID });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ASSIGNED,
        technicianId: 'tech-1',
      });

      const result = await service.assign('wo-1', COMPANY_ID, { technicianId: 'tech-1' });
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should throw BadRequestException when work order is not CREATED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.assign('wo-1', COMPANY_ID, { technicianId: 'tech-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when technician not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CREATED,
      });
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.assign('wo-1', COMPANY_ID, { technicianId: 'bad' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.assign('bad', COMPANY_ID, { technicianId: 'tech-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should transition ASSIGNED to EN_ROUTE', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ASSIGNED,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.EN_ROUTE,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.EN_ROUTE);
      expect(result.status).toBe(WorkOrderStatus.EN_ROUTE);
    });

    it('should transition EN_ROUTE to IN_PROGRESS', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.EN_ROUTE,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.IN_PROGRESS);
      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });

    it('should transition IN_PROGRESS to ON_HOLD', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ON_HOLD,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.ON_HOLD);
      expect(result.status).toBe(WorkOrderStatus.ON_HOLD);
    });

    it('should transition ON_HOLD to IN_PROGRESS', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ON_HOLD,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.IN_PROGRESS);
      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });

    it('should transition IN_PROGRESS to COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.COMPLETED);
      expect(result.status).toBe(WorkOrderStatus.COMPLETED);
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });
      mockPrisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.COMPLETED });

      await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.COMPLETED);
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WorkOrderStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should transition COMPLETED to INVOICED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.INVOICED,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.INVOICED);
      expect(result.status).toBe(WorkOrderStatus.INVOICED);
    });

    it('should transition INVOICED to PAID', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.INVOICED,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.PAID,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.PAID);
      expect(result.status).toBe(WorkOrderStatus.PAID);
    });

    it('should transition PAID to CLOSED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.PAID,
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CLOSED,
      });

      const result = await service.transition('wo-1', COMPANY_ID, WorkOrderStatus.CLOSED);
      expect(result.status).toBe(WorkOrderStatus.CLOSED);
    });

    it('should throw BadRequestException for invalid transition CREATED to COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CREATED,
      });

      await expect(
        service.transition('wo-1', COMPANY_ID, WorkOrderStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid transition CLOSED to anything', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CLOSED,
      });

      await expect(
        service.transition('wo-1', COMPANY_ID, WorkOrderStatus.CREATED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for backwards transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.EN_ROUTE,
      });

      await expect(
        service.transition('wo-1', COMPANY_ID, WorkOrderStatus.ASSIGNED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for skipping states', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CREATED,
      });

      await expect(
        service.transition('wo-1', COMPANY_ID, WorkOrderStatus.EN_ROUTE),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getValidTransitions', () => {
    it('should return ASSIGNED for CREATED', () => {
      const result = service.getValidTransitions(WorkOrderStatus.CREATED);
      expect(result).toEqual([WorkOrderStatus.ASSIGNED]);
    });

    it('should return EN_ROUTE for ASSIGNED', () => {
      const result = service.getValidTransitions(WorkOrderStatus.ASSIGNED);
      expect(result).toEqual([WorkOrderStatus.EN_ROUTE]);
    });

    it('should return IN_PROGRESS for EN_ROUTE', () => {
      const result = service.getValidTransitions(WorkOrderStatus.EN_ROUTE);
      expect(result).toEqual([WorkOrderStatus.IN_PROGRESS]);
    });

    it('should return ON_HOLD and COMPLETED for IN_PROGRESS', () => {
      const result = service.getValidTransitions(WorkOrderStatus.IN_PROGRESS);
      expect(result).toEqual([WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED]);
    });

    it('should return IN_PROGRESS for ON_HOLD', () => {
      const result = service.getValidTransitions(WorkOrderStatus.ON_HOLD);
      expect(result).toEqual([WorkOrderStatus.IN_PROGRESS]);
    });

    it('should return empty array for CLOSED', () => {
      const result = service.getValidTransitions(WorkOrderStatus.CLOSED);
      expect(result).toEqual([]);
    });

    it('should return INVOICED for COMPLETED', () => {
      const result = service.getValidTransitions(WorkOrderStatus.COMPLETED);
      expect(result).toEqual([WorkOrderStatus.INVOICED]);
    });

    it('should return PAID for INVOICED', () => {
      const result = service.getValidTransitions(WorkOrderStatus.INVOICED);
      expect(result).toEqual([WorkOrderStatus.PAID]);
    });

    it('should return CLOSED for PAID', () => {
      const result = service.getValidTransitions(WorkOrderStatus.PAID);
      expect(result).toEqual([WorkOrderStatus.CLOSED]);
    });
  });

  describe('findByTechnician', () => {
    it('should return work orders for a technician', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: 'wo-1', technicianId: 'tech-1' }]);

      const result = await service.findByTechnician('tech-1', COMPANY_ID);
      expect(result).toHaveLength(1);
    });

    it('should scope by companyId', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      await service.findByTechnician('tech-1', COMPANY_ID);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { technicianId: 'tech-1', companyId: COMPANY_ID },
        }),
      );
    });
  });

  describe('findByStatus', () => {
    it('should return work orders by status', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: 'wo-1', status: WorkOrderStatus.CREATED }]);

      const result = await service.findByStatus(WorkOrderStatus.CREATED, COMPANY_ID);
      expect(result).toHaveLength(1);
    });

    it('should scope by companyId', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      await service.findByStatus(WorkOrderStatus.ASSIGNED, COMPANY_ID);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: WorkOrderStatus.ASSIGNED, companyId: COMPANY_ID },
        }),
      );
    });
  });
});
