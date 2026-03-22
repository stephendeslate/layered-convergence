// TRACED: FD-TEST-002 — Work orders service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from '../src/work-orders/work-orders.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: {
    workOrder: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  describe('create', () => {
    it('should create a work order with generated ID', async () => {
      prisma.workOrder.create.mockResolvedValue({
        id: 'wo_test1234',
        title: 'Fix HVAC',
        status: 'OPEN',
      });

      const result = await service.create('tenant-1', 'user-1', {
        title: 'Fix HVAC',
        priority: 'HIGH',
      });

      expect(result.status).toBe('OPEN');
      expect(prisma.workOrder.create).toHaveBeenCalledTimes(1);
    });

    it('should sanitize title input', async () => {
      prisma.workOrder.create.mockResolvedValue({ id: 'wo_test1235', title: 'Clean title' });

      await service.create('tenant-1', 'user-1', {
        title: '<script>alert("xss")</script>Clean title',
      });

      const arg = prisma.workOrder.create.mock.calls[0][0];
      expect(arg.data.title).toBe('alert("xss")Clean title');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.workOrder.findMany.mockResolvedValue([
        { id: 'wo-1', title: 'Test', status: 'OPEN' },
      ]);
      prisma.workOrder.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return work order with schedules', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        title: 'Test',
        schedules: [],
      });

      const result = await service.findOne('tenant-1', 'wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'wo-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: 'OPEN' });
      prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'IN_PROGRESS' });

      const result = await service.updateStatus('tenant-1', 'wo-1', 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should reject invalid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: 'COMPLETED' });

      await expect(
        service.updateStatus('tenant-1', 'wo-1', 'IN_PROGRESS'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from OPEN to COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: 'OPEN' });

      await expect(
        service.updateStatus('tenant-1', 'wo-1', 'COMPLETED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete work order by id', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1' });
      prisma.workOrder.delete.mockResolvedValue({ id: 'wo-1' });

      const result = await service.remove('tenant-1', 'wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException if work order does not exist', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'wo-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
