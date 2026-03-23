// TRACED: FD-WORK-ORDERS-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkOrdersService } from '../src/work-orders/work-orders.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  const mockPrisma = {
    workOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a work order', async () => {
      const dto = {
        title: 'Fix AC',
        description: 'AC broken',
        latitude: 40.7128,
        longitude: -74.006,
        address: '123 Main St',
        tenantId: 'tenant-1',
      };

      mockPrisma.workOrder.create.mockResolvedValue({
        id: 'wo-1',
        ...dto,
        status: 'PENDING',
      });

      const result = await service.create(dto);
      expect(result.title).toBe('Fix AC');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: dto,
        include: { technician: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([
        { id: 'wo-1', title: 'Fix AC' },
      ]);
      mockPrisma.workOrder.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      mockPrisma.workOrder.count.mockResolvedValue(0);

      const result = await service.findAll(1, 500);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a work order by id', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        title: 'Fix AC',
      });

      const result = await service.findOne('wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        title: 'Fix AC',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo-1',
        title: 'Fix AC - Updated',
      });

      const result = await service.update('wo-1', { title: 'Fix AC - Updated' });
      expect(result.title).toBe('Fix AC - Updated');
    });
  });

  describe('remove', () => {
    it('should delete a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        title: 'Fix AC',
      });
      mockPrisma.workOrder.delete.mockResolvedValue({});

      await service.remove('wo-1');
      expect(mockPrisma.workOrder.delete).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
      });
    });
  });
});
