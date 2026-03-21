import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from '../src/work-order/work-order.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CompanyContextService } from '../src/company-context/company-context.service';
import { WorkOrderStatus } from '@prisma/client';

describe('WorkOrderService (integration)', () => {
  let module: TestingModule;
  let workOrderService: WorkOrderService;
  let prisma: PrismaService;
  let companyContext: CompanyContextService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        PrismaService,
        CompanyContextService,
      ],
    }).compile();

    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);
    companyContext = module.get<CompanyContextService>(CompanyContextService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('state machine transitions', () => {
    it('should enforce valid state transitions', async () => {
      const mockSetContext = jest.spyOn(companyContext, 'setCompanyContext').mockResolvedValue(undefined);
      const mockFindFirst = jest.spyOn(prisma.workOrder, 'findFirst').mockResolvedValue({
        id: 'wo-1',
        title: 'Test Order',
        description: 'Test',
        status: WorkOrderStatus.PENDING,
        priority: 3,
        customerId: 'cust-1',
        technicianId: null,
        companyId: 'c1',
        scheduledAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const mockUpdate = jest.spyOn(prisma.workOrder, 'update').mockResolvedValue({
        id: 'wo-1',
        title: 'Test Order',
        description: 'Test',
        status: WorkOrderStatus.ASSIGNED,
        priority: 3,
        customerId: 'cust-1',
        technicianId: 'tech-1',
        companyId: 'c1',
        scheduledAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await workOrderService.transition(
        'wo-1',
        { status: WorkOrderStatus.ASSIGNED, technicianId: 'tech-1' },
        'c1',
      );

      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);

      mockSetContext.mockRestore();
      mockFindFirst.mockRestore();
      mockUpdate.mockRestore();
    });

    it('should reject invalid state transitions', async () => {
      const mockSetContext = jest.spyOn(companyContext, 'setCompanyContext').mockResolvedValue(undefined);
      const mockFindFirst = jest.spyOn(prisma.workOrder, 'findFirst').mockResolvedValue({
        id: 'wo-2',
        title: 'Test Order 2',
        description: 'Test',
        status: WorkOrderStatus.PENDING,
        priority: 3,
        customerId: 'cust-1',
        technicianId: null,
        companyId: 'c1',
        scheduledAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        workOrderService.transition(
          'wo-2',
          { status: WorkOrderStatus.COMPLETED },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);

      mockSetContext.mockRestore();
      mockFindFirst.mockRestore();
    });

    it('should handle ON_HOLD transitions correctly', async () => {
      const mockSetContext = jest.spyOn(companyContext, 'setCompanyContext').mockResolvedValue(undefined);
      const mockFindFirst = jest.spyOn(prisma.workOrder, 'findFirst').mockResolvedValue({
        id: 'wo-3',
        title: 'Test Order 3',
        description: 'Test',
        status: WorkOrderStatus.ASSIGNED,
        priority: 3,
        customerId: 'cust-1',
        technicianId: 'tech-1',
        companyId: 'c1',
        scheduledAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const mockUpdate = jest.spyOn(prisma.workOrder, 'update').mockResolvedValue({
        id: 'wo-3',
        title: 'Test Order 3',
        description: 'Test',
        status: WorkOrderStatus.ON_HOLD,
        priority: 3,
        customerId: 'cust-1',
        technicianId: 'tech-1',
        companyId: 'c1',
        scheduledAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await workOrderService.transition(
        'wo-3',
        { status: WorkOrderStatus.ON_HOLD },
        'c1',
      );

      expect(result.status).toBe(WorkOrderStatus.ON_HOLD);

      mockSetContext.mockRestore();
      mockFindFirst.mockRestore();
      mockUpdate.mockRestore();
    });

    it('should throw NotFoundException for missing work order', async () => {
      const mockSetContext = jest.spyOn(companyContext, 'setCompanyContext').mockResolvedValue(undefined);
      const mockFindFirst = jest.spyOn(prisma.workOrder, 'findFirst').mockResolvedValue(null);

      await expect(
        workOrderService.transition('missing', { status: WorkOrderStatus.ASSIGNED }, 'c1'),
      ).rejects.toThrow(NotFoundException);

      mockSetContext.mockRestore();
      mockFindFirst.mockRestore();
    });
  });
});
