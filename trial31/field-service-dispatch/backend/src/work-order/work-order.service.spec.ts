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

  describe('findAllByCompany', () => {
    it('should return work orders for a company', async () => {
      const orders = [
        { id: 'wo1', title: 'HVAC Inspection', status: 'PENDING' },
      ];
      mockPrisma.workOrder.findMany.mockResolvedValue(orders);

      const result = await service.findAllByCompany('company-1');
      expect(result).toEqual(orders);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        orderBy: { createdAt: 'desc' },
        include: { customer: true, technician: true },
      });
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should allow PENDING -> ASSIGNED transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'PENDING',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo1',
        status: 'ASSIGNED',
      });

      const result = await service.transitionStatus('wo1', 'ASSIGNED');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should allow IN_PROGRESS -> COMPLETED and set completedAt', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'IN_PROGRESS',
      });
      mockPrisma.workOrder.update.mockResolvedValue({
        id: 'wo1',
        status: 'COMPLETED',
        completedAt: new Date(),
      });

      const result = await service.transitionStatus('wo1', 'COMPLETED');
      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should reject invalid transition COMPLETED -> PENDING', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: 'COMPLETED',
      });

      await expect(
        service.transitionStatus('wo1', 'PENDING'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('missing', 'ASSIGNED'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countByCompanyRaw', () => {
    it('should return count from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ count: BigInt(8) }]);

      const result = await service.countByCompanyRaw('company-1');
      expect(result).toBe(8);
    });
  });

  describe('cancelOverdueOrders', () => {
    it('should execute raw update for overdue orders', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(3);

      await service.cancelOverdueOrders('company-1');
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
