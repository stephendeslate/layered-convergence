import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  const mockPrisma = {
    workOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return work orders ordered by createdAt desc', async () => {
      const orders = [
        { id: 'wo1', title: 'HVAC Repair', status: 'OPEN' },
        { id: 'wo2', title: 'Plumbing Fix', status: 'ASSIGNED' },
      ];
      mockPrisma.workOrder.findMany.mockResolvedValue(orders);

      const result = await service.findAll();

      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      });
      expect(result).toEqual(orders);
    });
  });

  describe('findById', () => {
    it('should return a work order with relations', async () => {
      const order = { id: 'wo1', title: 'HVAC Repair', customer: {} };
      mockPrisma.workOrder.findFirst.mockResolvedValue(order);

      const result = await service.findById('wo1');
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should allow OPEN → ASSIGNED transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'OPEN',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo1',
        status: 'ASSIGNED',
      });

      const result = await service.transitionStatus('wo1', 'ASSIGNED', 'tech-1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should allow ASSIGNED → IN_PROGRESS transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'ASSIGNED',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo1',
        status: 'IN_PROGRESS',
      });

      const result = await service.transitionStatus('wo1', 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow IN_PROGRESS → COMPLETED transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'IN_PROGRESS',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo1',
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      });

      const result = await service.transitionStatus('wo1', 'COMPLETED', undefined, 2200);
      expect(result.status).toBe('COMPLETED');
    });

    it('should reject invalid transition COMPLETED → OPEN', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'COMPLETED',
      });

      await expect(
        service.transitionStatus('wo1', 'OPEN'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('nonexistent', 'ASSIGNED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('countByStatusRaw', () => {
    it('should return count from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ count: BigInt(3) }]);

      const result = await service.countByStatusRaw('OPEN');
      expect(result).toBe(3);
    });
  });

  describe('markUrgent', () => {
    it('should execute raw update and return work order', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        priority: 'CRITICAL',
      });

      const result = await service.markUrgent('wo1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(result?.priority).toBe('CRITICAL');
    });
  });
});
