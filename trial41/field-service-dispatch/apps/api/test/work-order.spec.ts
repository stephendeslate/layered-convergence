import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from '../src/work-order/work-order.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// TRACED: FD-WORK-ORDER-UNIT-TEST
describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a work order', async () => {
      const dto = {
        title: 'Fix AC',
        description: 'AC not working',
        priority: 1,
        latitude: 40.7128,
        longitude: -74.006,
        address: '123 Main St',
      };

      prisma.workOrder.create.mockResolvedValue({
        id: 'wo-1',
        ...dto,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(dto, 'tenant-1');
      expect(result.id).toBe('wo-1');
      expect(prisma.workOrder.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 500);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
