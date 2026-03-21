import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  workOrder: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  workOrderStatusHistory: {
    create: vi.fn(),
  },
  technician: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

const makeWorkOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'wo-1',
  companyId: 'co-1',
  customerId: 'cust-1',
  technicianId: null,
  priority: 'MEDIUM',
  status: 'UNASSIGNED',
  description: 'Fix sink',
  notes: null,
  completedAt: null,
  customer: { id: 'cust-1', lat: null, lng: null },
  technician: null,
  statusHistory: [],
  ...overrides,
});

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: mockPrisma },
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
        companyId: 'co-1',
        customerId: 'cust-1',
        description: 'Fix sink',
      };
      const expected = { id: 'wo-1', ...dto, status: 'UNASSIGNED' };
      mockPrisma.workOrder.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a work order scoped by company', async () => {
      const expected = makeWorkOrder();
      mockPrisma.workOrder.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('wo-1', 'co-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('no', 'co')).rejects.toThrow(NotFoundException);
    });
  });

  describe('state machine - valid transitions', () => {
    const transitionCases: Array<{
      from: string;
      to: string;
      method: keyof WorkOrderService;
      args?: unknown[];
    }> = [
      { from: 'UNASSIGNED', to: 'ASSIGNED', method: 'assign', args: ['wo-1', 'co-1', 'tech-1'] },
      { from: 'ASSIGNED', to: 'EN_ROUTE', method: 'enRoute', args: ['wo-1', 'co-1'] },
      { from: 'EN_ROUTE', to: 'ON_SITE', method: 'onSite', args: ['wo-1', 'co-1'] },
      { from: 'ON_SITE', to: 'IN_PROGRESS', method: 'start', args: ['wo-1', 'co-1'] },
      { from: 'IN_PROGRESS', to: 'COMPLETED', method: 'complete', args: ['wo-1', 'co-1'] },
    ];

    for (const { from, to, method, args } of transitionCases) {
      it(`should transition from ${from} to ${to}`, async () => {
        const wo = makeWorkOrder({ status: from });
        mockPrisma.workOrder.findFirst.mockResolvedValue(wo);
        const updated = { ...wo, status: to };
        mockPrisma.$transaction.mockResolvedValue([updated, {}]);

        // Type assertion justified: dynamically calling service method with known args
        const result = await (service[method] as (...a: unknown[]) => Promise<unknown>)(
          ...(args || []),
        );
        expect(result).toEqual(updated);
      });
    }
  });

  describe('state machine - invalid transitions', () => {
    const invalidCases: Array<{
      from: string;
      to: string;
      method: keyof WorkOrderService;
      args?: unknown[];
    }> = [
      { from: 'UNASSIGNED', to: 'COMPLETED', method: 'complete', args: ['wo-1', 'co-1'] },
      { from: 'UNASSIGNED', to: 'EN_ROUTE', method: 'enRoute', args: ['wo-1', 'co-1'] },
      { from: 'ASSIGNED', to: 'COMPLETED', method: 'complete', args: ['wo-1', 'co-1'] },
      { from: 'COMPLETED', to: 'ASSIGNED', method: 'assign', args: ['wo-1', 'co-1', 'tech-1'] },
      { from: 'PAID', to: 'ASSIGNED', method: 'assign', args: ['wo-1', 'co-1', 'tech-1'] },
      { from: 'EN_ROUTE', to: 'COMPLETED', method: 'complete', args: ['wo-1', 'co-1'] },
      { from: 'ON_SITE', to: 'COMPLETED', method: 'complete', args: ['wo-1', 'co-1'] },
    ];

    for (const { from, to, method, args } of invalidCases) {
      it(`should reject transition from ${from} to ${to}`, async () => {
        const wo = makeWorkOrder({ status: from });
        mockPrisma.workOrder.findFirst.mockResolvedValue(wo);

        // Type assertion justified: dynamically calling service method with known args
        await expect(
          (service[method] as (...a: unknown[]) => Promise<unknown>)(
            ...(args || []),
          ),
        ).rejects.toThrow(BadRequestException);
      });
    }
  });

  describe('autoAssign', () => {
    it('should assign the nearest available technician', async () => {
      const wo = makeWorkOrder({
        customer: { id: 'cust-1', lat: 40.0, lng: -74.0 },
      });
      mockPrisma.workOrder.findFirst.mockResolvedValue(wo);

      const techs = [
        { id: 'tech-far', currentLat: 50.0, currentLng: -80.0, status: 'AVAILABLE' },
        { id: 'tech-near', currentLat: 40.1, currentLng: -74.1, status: 'AVAILABLE' },
      ];
      mockPrisma.technician.findMany.mockResolvedValue(techs);
      const updated = { ...wo, status: 'ASSIGNED', technicianId: 'tech-near' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.autoAssign('wo-1', 'co-1');
      expect(result.technicianId).toBe('tech-near');
    });

    it('should throw if no available technicians', async () => {
      const wo = makeWorkOrder();
      mockPrisma.workOrder.findFirst.mockResolvedValue(wo);
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.autoAssign('wo-1', 'co-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject auto-assign when not UNASSIGNED', async () => {
      const wo = makeWorkOrder({ status: 'ASSIGNED' });
      mockPrisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(service.autoAssign('wo-1', 'co-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
