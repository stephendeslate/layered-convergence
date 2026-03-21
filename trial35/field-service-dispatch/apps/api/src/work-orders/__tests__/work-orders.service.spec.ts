// TRACED: FD-TEST-002 — Work orders service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from '../work-orders.service';
import { PrismaService } from '../../prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: { workOrder: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { workOrder: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), update: jest.fn() } };

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
      prisma.workOrder.create.mockResolvedValue({ id: 'wo_abc12345', title: 'Fix AC' });

      const result = await service.create('tenant-1', 'user-1', { title: 'Fix AC' });
      expect(result.id).toBeDefined();
      const createArg = prisma.workOrder.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^wo_/);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

      const result = await service.updateStatus('tenant-1', '1', 'ASSIGNED');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should reject invalid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN' });
      await expect(service.updateStatus('tenant-1', '1', 'COMPLETED')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.updateStatus('tenant-1', 'x', 'ASSIGNED')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.workOrder.findMany.mockResolvedValue([{ id: '1', title: 'Fix AC' }]);
      prisma.workOrder.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
