import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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
    companyContext = { setCompanyContext: jest.fn() };

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

  describe('findAll', () => {
    it('should return all work orders for company', async () => {
      const workOrders = [{ id: '1', title: 'Fix pipe', companyId: 'c1' }];
      prisma.workOrder.findMany.mockResolvedValue(workOrders);

      const result = await service.findAll('c1');
      expect(result).toEqual(workOrders);
    });
  });

  describe('create', () => {
    it('should create a work order with PENDING status', async () => {
      const dto = { title: 'Fix pipe', description: 'Leaking', customerId: 'cust1' };
      prisma.workOrder.create.mockResolvedValue({
        id: '1',
        ...dto,
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });

      const result = await service.create(dto, 'c1');
      expect(result.status).toBe(WorkOrderStatus.PENDING);
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      const dto = {
        title: 'Fix pipe',
        description: 'Leaking',
        customerId: 'cust1',
        technicianId: 'tech1',
      };
      prisma.workOrder.create.mockResolvedValue({
        id: '1',
        ...dto,
        status: WorkOrderStatus.ASSIGNED,
        companyId: 'c1',
      });

      const result = await service.create(dto, 'c1');
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });
  });

  describe('transition', () => {
    it('should transition from PENDING to ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.ASSIGNED,
      });

      const result = await service.transition(
        '1',
        { status: WorkOrderStatus.ASSIGNED, technicianId: 'tech1' },
        'c1',
      );
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should reject invalid transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });

      await expect(
        service.transition('1', { status: WorkOrderStatus.COMPLETED }, 'c1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.transition('bad', { status: WorkOrderStatus.ASSIGNED }, 'c1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
