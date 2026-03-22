// TRACED: FD-WO-005 — Work orders service unit tests with state machine validation
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from '../src/work-orders/work-orders.service';
import { PrismaService } from '../src/prisma/prisma.service';

const mockPrisma = {
  workOrder: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a work order with generated id', async () => {
      mockPrisma.workOrder.create.mockResolvedValue({
        id: 'wo_test0001',
        title: 'Test WO',
        status: 'OPEN',
      });

      const result = await service.create('tenant-1', 'user-1', {
        title: 'Test WO',
        priority: 'HIGH',
        latitude: '40.7128',
        longitude: '-74.0060',
      });

      expect(result.status).toBe('OPEN');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            createdById: 'user-1',
          }),
        }),
      );
    });

    it('should sanitize title input', async () => {
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo_1', title: 'Clean' });

      await service.create('tenant-1', 'user-1', {
        title: '<b>Bold</b> title',
        priority: 'MEDIUM',
      });

      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: expect.not.stringContaining('<b>'),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: 'wo_1' }]);
      mockPrisma.workOrder.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'wo_missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transition OPEN -> IN_PROGRESS', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo_1',
        status: 'OPEN',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo_1',
        status: 'IN_PROGRESS',
      });

      const result = await service.updateStatus('tenant-1', 'wo_1', 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should reject invalid status transition OPEN -> COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo_1',
        status: 'OPEN',
      });

      await expect(
        service.updateStatus('tenant-1', 'wo_1', 'COMPLETED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from COMPLETED to anything', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo_1',
        status: 'COMPLETED',
      });

      await expect(
        service.updateStatus('tenant-1', 'wo_1', 'OPEN'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow FAILED -> OPEN transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo_1',
        status: 'FAILED',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo_1',
        status: 'OPEN',
      });

      const result = await service.updateStatus('tenant-1', 'wo_1', 'OPEN');
      expect(result.status).toBe('OPEN');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for missing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'wo_missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete existing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo_1' });
      mockPrisma.workOrder.delete.mockResolvedValue({ id: 'wo_1' });

      const result = await service.remove('tenant-1', 'wo_1');
      expect(result).toEqual({ id: 'wo_1' });
    });
  });
});
