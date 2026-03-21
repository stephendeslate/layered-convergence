import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: PrismaService;

  const mockPrisma = {
    workOrder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all work orders with relations', async () => {
      const mockOrders = [
        {
          id: '1',
          title: 'HVAC Repair',
          status: 'PENDING',
          customer: { name: 'Acme' },
          technician: null,
        },
        {
          id: '2',
          title: 'Plumbing Check',
          status: 'ASSIGNED',
          customer: { name: 'Acme' },
          technician: { name: 'Alice' },
        },
      ];
      mockPrisma.workOrder.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        include: { customer: true, technician: true },
      });
    });
  });

  describe('findById', () => {
    it('should return work order with full relations', async () => {
      const mockOrder = {
        id: '1',
        title: 'HVAC Repair',
        status: 'IN_PROGRESS',
        customer: { name: 'Acme' },
        technician: { name: 'Alice' },
        route: { name: 'Route A' },
        invoice: null,
      };
      mockPrisma.workOrder.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findById('1');

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.workOrder.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          customer: true,
          technician: true,
          route: true,
          invoice: true,
        },
      });
    });

    it('should return null for non-existent work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('assignTechnician', () => {
    it('should use $executeRaw for atomic assignment', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      await service.assignTechnician('wo-1', 'tech-1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('completeWorkOrder', () => {
    it('should use $executeRaw for atomic completion', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      await service.completeWorkOrder('wo-1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('countByStatus', () => {
    it('should return status counts using $queryRaw', async () => {
      const mockCounts = [
        { status: 'PENDING', count: BigInt(5) },
        { status: 'COMPLETED', count: BigInt(12) },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockCounts);

      const result = await service.countByStatus();

      expect(result).toEqual(mockCounts);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('sumEstimatedCosts', () => {
    it('should return summed costs using $queryRaw', async () => {
      const mockSum = [{ total: '4500.00' }];
      mockPrisma.$queryRaw.mockResolvedValue(mockSum);

      const result = await service.sumEstimatedCosts();

      expect(result).toEqual(mockSum);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
