import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WorkOrderService } from './workorder.service';
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

  it('findAllByCompany returns work orders with relations', async () => {
    const workOrders = [
      { id: 'wo1', title: 'HVAC Repair', status: 'PENDING', companyId: 'c1', customer: {}, technician: null },
    ];
    mockPrisma.workOrder.findMany.mockResolvedValue(workOrders);

    const result = await service.findAllByCompany('c1');
    expect(result).toEqual(workOrders);
    expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      include: { customer: true, technician: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findById returns work order when found', async () => {
    const workOrder = { id: 'wo1', title: 'HVAC Repair', customer: {}, technician: null, invoices: [] };
    mockPrisma.workOrder.findFirst.mockResolvedValue(workOrder);

    const result = await service.findById('wo1');
    expect(result).toEqual(workOrder);
  });

  it('findById throws BadRequestException when not found', async () => {
    mockPrisma.workOrder.findFirst.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('transitionStatus validates state machine transitions', async () => {
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

  it('transitionStatus rejects invalid transitions', async () => {
    mockPrisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1',
      status: 'COMPLETED',
    });

    await expect(
      service.transitionStatus('wo1', 'IN_PROGRESS'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus throws when work order not found', async () => {
    mockPrisma.workOrder.findFirst.mockResolvedValue(null);

    await expect(
      service.transitionStatus('missing', 'ASSIGNED'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus sets completedAt when transitioning to COMPLETED', async () => {
    mockPrisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1',
      status: 'IN_PROGRESS',
    });
    mockPrisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    await service.transitionStatus('wo1', 'COMPLETED');
    expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('assignTechnician assigns technician to PENDING work order', async () => {
    mockPrisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1',
      status: 'PENDING',
    });
    mockPrisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'ASSIGNED',
      technicianId: 'tech-1',
    });

    const result = await service.assignTechnician('wo1', 'tech-1');
    expect(result.technicianId).toBe('tech-1');
    expect(result.status).toBe('ASSIGNED');
  });

  it('assignTechnician rejects non-PENDING work orders', async () => {
    mockPrisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1',
      status: 'IN_PROGRESS',
    });

    await expect(
      service.assignTechnician('wo1', 'tech-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('countByCompanyRaw returns count from raw SQL', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ count: BigInt(12) }]);

    const count = await service.countByCompanyRaw('c1');
    expect(count).toBe(12);
  });

  it('completeWorkOrder uses $executeRaw and returns work order', async () => {
    const workOrder = { id: 'wo1', status: 'COMPLETED' };
    mockPrisma.$executeRaw.mockResolvedValue(1);
    mockPrisma.workOrder.findFirst.mockResolvedValue(workOrder);

    const result = await service.completeWorkOrder('wo1');
    expect(result).toEqual(workOrder);
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });
});
