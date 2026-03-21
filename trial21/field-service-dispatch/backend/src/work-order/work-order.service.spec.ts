import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { WorkOrderStatus } from '@prisma/client';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let companyContext: { setCompanyContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    companyContext = { setCompanyContext: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyContextService, useValue: companyContext },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transition', () => {
    it('should allow valid transition PENDING -> ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      const result = await service.transition(
        'wo-1',
        { status: WorkOrderStatus.ASSIGNED, technicianId: 'tech-1' },
        'c1',
      );
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should reject invalid transition PENDING -> COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });

      await expect(
        service.transition('wo-1', { status: WorkOrderStatus.COMPLETED }, 'c1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.transition('missing', { status: WorkOrderStatus.ASSIGNED }, 'c1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
        companyId: 'c1',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });

      await service.transition('wo-1', { status: WorkOrderStatus.COMPLETED }, 'c1');
      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WorkOrderStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
