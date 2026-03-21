// [TRACED:TS-002] Unit test for WorkOrderService — state machine transitions
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
  let tenantContext: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    tenantContext = {
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  describe('findAll', () => {
    it('should return work orders for company', async () => {
      const workOrders = [{ id: 'wo-1', title: 'Fix AC' }];
      prisma.workOrder.findMany.mockResolvedValue(workOrders);

      const result = await service.findAll('user-1', 'company-1');
      expect(result).toEqual(workOrders);
      expect(tenantContext.setTenantContext).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('wo-1', 'user-1', 'company-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid transition CREATED -> ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'CREATED',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: 'ASSIGNED',
      });

      const result = await service.updateStatus(
        'wo-1',
        'ASSIGNED' as never,
        'user-1',
        'company-1',
      );
      expect(result.status).toBe('ASSIGNED');
    });

    it('should reject invalid transition CREATED -> COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'CREATED',
      });

      await expect(
        service.updateStatus(
          'wo-1',
          'COMPLETED' as never,
          'user-1',
          'company-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from terminal state COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
      });

      await expect(
        service.updateStatus(
          'wo-1',
          'CANCELLED' as never,
          'user-1',
          'company-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
