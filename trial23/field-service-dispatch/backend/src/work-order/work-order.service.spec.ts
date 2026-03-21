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
    it('should return all work orders for company', async () => {
      const orders = [{ id: '1', title: 'Fix AC', companyId: 'c1' }];
      prisma.workOrder.findMany.mockResolvedValue(orders);

      const result = await service.findAll('c1');
      expect(result).toEqual(orders);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        include: { customer: true, technician: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a work order', async () => {
      const order = { id: '1', title: 'Fix AC', companyId: 'c1' };
      prisma.workOrder.findFirst.mockResolvedValue(order);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a work order with OPEN status', async () => {
      const data = {
        title: 'Fix AC',
        customerId: 'cust-1',
        companyId: 'c1',
      };

      prisma.workOrder.create.mockResolvedValue({ id: '1', ...data, status: 'OPEN' });

      const result = await service.create(data);
      expect(result.status).toBe('OPEN');
      expect(prisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'OPEN' }),
      });
    });
  });

  describe('transition', () => {
    it('should allow OPEN -> ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', companyId: 'c1' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

      const result = await service.transition('1', 'c1', 'ASSIGNED' as never);
      expect(result.status).toBe('ASSIGNED');
    });

    it('should allow ASSIGNED -> IN_PROGRESS', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', companyId: 'c1' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

      const result = await service.transition('1', 'c1', 'IN_PROGRESS' as never);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow IN_PROGRESS -> COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'IN_PROGRESS', companyId: 'c1' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      const result = await service.transition('1', 'c1', 'COMPLETED' as never);
      expect(result.status).toBe('COMPLETED');
    });

    it('should allow OPEN -> CANCELLED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', companyId: 'c1' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'CANCELLED' });

      const result = await service.transition('1', 'c1', 'CANCELLED' as never);
      expect(result.status).toBe('CANCELLED');
    });

    it('should reject OPEN -> COMPLETED (invalid)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', companyId: 'c1' });

      await expect(
        service.transition('1', 'c1', 'COMPLETED' as never),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject CLOSED -> OPEN (invalid)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'CLOSED', companyId: 'c1' });

      await expect(
        service.transition('1', 'c1', 'OPEN' as never),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject CANCELLED -> ASSIGNED (invalid)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', companyId: 'c1' });

      await expect(
        service.transition('1', 'c1', 'ASSIGNED' as never),
      ).rejects.toThrow(ConflictException);
    });
  });
});
