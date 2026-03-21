import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  describe('findAll', () => {
    it('should return work orders for a company', async () => {
      const mockOrders = [{ id: '1', title: 'Test WO' }];
      prisma.workOrder.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll('company-1');
      expect(result).toEqual(mockOrders);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: { customer: true, technician: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a work order by id and company', async () => {
      const mockOrder = { id: '1', title: 'Test', companyId: 'c-1' };
      prisma.workOrder.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne('1', 'c-1');
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a work order with OPEN status', async () => {
      const data = {
        title: 'New WO',
        customerId: 'cust-1',
        companyId: 'c-1',
      };

      prisma.workOrder.create.mockResolvedValue({ id: '1', ...data, status: 'OPEN' });

      const result = await service.create(data);
      expect(result.status).toBe('OPEN');
      expect(prisma.workOrder.create).toHaveBeenCalled();
    });
  });

  describe('transition', () => {
    it('should allow OPEN -> ASSIGNED transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', companyId: 'c-1' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

      const result = await service.transition('1', 'c-1', 'ASSIGNED' as 'ASSIGNED');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should reject invalid transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'CLOSED', companyId: 'c-1' });

      await expect(
        service.transition('1', 'c-1', 'OPEN' as 'OPEN'),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow OPEN -> CANCELLED transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', companyId: 'c-1' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'CANCELLED' });

      const result = await service.transition('1', 'c-1', 'CANCELLED' as 'CANCELLED');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
