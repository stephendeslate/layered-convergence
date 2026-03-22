// TRACED: FD-TEST-002 — Work orders service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrdersService } from '../src/work-orders/work-orders.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: { workOrder: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { workOrder: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), update: jest.fn(), delete: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  describe('create', () => {
    it('should create a work order with generated ID and ref code', async () => {
      prisma.workOrder.create.mockResolvedValue({ id: 'wo_abc12345', title: 'Fix AC' });

      const result = await service.create('tenant-1', 'user-1', { title: 'Fix AC' });
      expect(result.id).toBeDefined();
      const createArg = prisma.workOrder.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^wo_/);
      expect(createArg.data.description).toContain('[ref:fix-ac]');
    });

    it('should sanitize title before saving', async () => {
      prisma.workOrder.create.mockResolvedValue({ id: 'wo_abc12345', title: 'Repair Job' });

      await service.create('tenant-1', 'user-1', { title: '<script>Repair Job</script>' });
      const createArg = prisma.workOrder.create.mock.calls[0][0];
      expect(createArg.data.title).not.toContain('<script>');
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN' });
      prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

      const result = await service.updateStatus('tenant-1', '1', 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should reject invalid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'OPEN' });
      await expect(service.updateStatus('tenant-1', '1', 'COMPLETED')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.updateStatus('tenant-1', 'x', 'IN_PROGRESS')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.workOrder.findMany.mockResolvedValue([{ id: '1', title: 'Fix AC' }]);
      prisma.workOrder.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should calculate correct total pages', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(45);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('remove', () => {
    it('should delete a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1' });
      prisma.workOrder.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('tenant-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when deleting non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.remove('tenant-1', 'x')).rejects.toThrow(NotFoundException);
    });
  });
});
