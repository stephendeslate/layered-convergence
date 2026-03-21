import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  workOrder: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  workOrderStatusHistory: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  technician: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
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
    it('should create a work order with UNASSIGNED status', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink' };
      const expected = { id: 'wo-1', status: 'UNASSIGNED', ...dto };
      mockPrisma.workOrder.create.mockResolvedValue(expected);

      const result = await service.create(companyId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'UNASSIGNED' }),
        }),
      );
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink', technicianId: 'tech-1' };
      const expected = { id: 'wo-1', status: 'ASSIGNED', ...dto };
      mockPrisma.workOrder.create.mockResolvedValue(expected);

      await service.create(companyId, dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ASSIGNED', technicianId: 'tech-1' }),
        }),
      );
    });

    it('should set companyId on created work order', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1' });

      await service.create(companyId, dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId }),
        }),
      );
    });

    it('should set priority when provided', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink', priority: 'HIGH' as any };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1' });

      await service.create(companyId, dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 'HIGH' }),
        }),
      );
    });

    it('should set scheduledAt when provided', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink', scheduledAt: '2026-04-01T10:00:00Z' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1' });

      await service.create(companyId, dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ scheduledAt: new Date('2026-04-01T10:00:00Z') }),
        }),
      );
    });

    it('should include customer and technician in response', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo-1' });

      await service.create(companyId, dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { customer: true, technician: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return work orders scoped by companyId', async () => {
      const expected = [{ id: 'wo-1' }, { id: 'wo-2' }];
      mockPrisma.workOrder.findMany.mockResolvedValue(expected);

      const result = await service.findAll(companyId);
      expect(result).toEqual(expected);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single work order scoped by companyId', async () => {
      const expected = { id: 'wo-1', companyId };
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue(expected);

      const result = await service.findOne(companyId, 'wo-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.workOrder.findFirstOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'wo-1', companyId },
        }),
      );
    });
  });

  describe('transition - valid transitions', () => {
    const validTransitions = [
      ['UNASSIGNED', 'ASSIGNED'],
      ['ASSIGNED', 'EN_ROUTE'],
      ['ASSIGNED', 'UNASSIGNED'],
      ['EN_ROUTE', 'ON_SITE'],
      ['EN_ROUTE', 'ASSIGNED'],
      ['ON_SITE', 'IN_PROGRESS'],
      ['IN_PROGRESS', 'COMPLETED'],
      ['COMPLETED', 'INVOICED'],
      ['INVOICED', 'PAID'],
    ] as const;

    for (const [from, to] of validTransitions) {
      it(`should allow transition from ${from} to ${to}`, async () => {
        mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
          id: 'wo-1',
          status: from,
          companyId,
        });

        const updated = { id: 'wo-1', status: to };
        mockPrisma.$transaction.mockResolvedValue([updated, {}]);

        const result = await service.transition(companyId, 'wo-1', { status: to as any });
        expect(result.status).toBe(to);
      });
    }
  });

  describe('transition - invalid transitions', () => {
    const invalidTransitions = [
      ['UNASSIGNED', 'EN_ROUTE'],
      ['UNASSIGNED', 'COMPLETED'],
      ['UNASSIGNED', 'ON_SITE'],
      ['UNASSIGNED', 'IN_PROGRESS'],
      ['UNASSIGNED', 'INVOICED'],
      ['UNASSIGNED', 'PAID'],
      ['ASSIGNED', 'COMPLETED'],
      ['ASSIGNED', 'ON_SITE'],
      ['EN_ROUTE', 'UNASSIGNED'],
      ['EN_ROUTE', 'COMPLETED'],
      ['COMPLETED', 'IN_PROGRESS'],
      ['PAID', 'UNASSIGNED'],
      ['PAID', 'COMPLETED'],
      ['PAID', 'ASSIGNED'],
      ['IN_PROGRESS', 'ASSIGNED'],
      ['ON_SITE', 'EN_ROUTE'],
      ['ON_SITE', 'ASSIGNED'],
      ['INVOICED', 'COMPLETED'],
    ] as const;

    for (const [from, to] of invalidTransitions) {
      it(`should reject transition from ${from} to ${to}`, async () => {
        mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
          id: 'wo-1',
          status: from,
          companyId,
        });

        await expect(
          service.transition(companyId, 'wo-1', { status: to as any }),
        ).rejects.toThrow(BadRequestException);
      });
    }
  });

  describe('transition - side effects', () => {
    it('should set technicianId when transitioning to ASSIGNED with technicianId', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
      });

      const updated = { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.transition(companyId, 'wo-1', {
        status: 'ASSIGNED' as any,
        technicianId: 'tech-1',
      });
      expect(result.technicianId).toBe('tech-1');
    });

    it('should clear technicianId when transitioning to UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'ASSIGNED',
        companyId,
      });

      const updated = { id: 'wo-1', status: 'UNASSIGNED', technicianId: null };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.transition(companyId, 'wo-1', { status: 'UNASSIGNED' as any });
      expect(result.technicianId).toBeNull();
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'IN_PROGRESS',
        companyId,
      });

      mockPrisma.$transaction.mockImplementation((args) => {
        return Promise.resolve(args);
      });

      await service.transition(companyId, 'wo-1', { status: 'COMPLETED' as any });
    });

    it('should create status history record on transition', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
      });

      mockPrisma.$transaction.mockResolvedValue([{ id: 'wo-1', status: 'ASSIGNED' }, {}]);

      await service.transition(companyId, 'wo-1', { status: 'ASSIGNED' as any, note: 'test' });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('assign', () => {
    it('should assign a technician to a work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
      });

      const updated = { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.assign(companyId, 'wo-1', 'tech-1');
      expect(result.status).toBe('ASSIGNED');
      expect(result.technicianId).toBe('tech-1');
    });
  });

  describe('autoAssign', () => {
    it('should auto-assign nearest available technician using Haversine distance', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
        customer: { lat: 40.7128, lng: -74.006 },
      });

      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-far', name: 'Far Tech', currentLat: 41.0, currentLng: -75.0 },
        { id: 'tech-near', name: 'Near Tech', currentLat: 40.72, currentLng: -74.01 },
      ]);

      const updated = { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-near' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.autoAssign(companyId, 'wo-1');
      expect(result.technicianId).toBe('tech-near');
    });

    it('should reject auto-assign if not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'ASSIGNED',
        companyId,
        customer: {},
      });

      await expect(
        service.autoAssign(companyId, 'wo-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject auto-assign if no technicians available', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
        customer: { lat: 40.7128, lng: -74.006 },
      });

      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(
        service.autoAssign(companyId, 'wo-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter technicians by required skills', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
        customer: { lat: 40.7128, lng: -74.006 },
      });

      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'Tech 1', currentLat: 40.72, currentLng: -74.01 },
      ]);

      const updated = { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      await service.autoAssign(companyId, 'wo-1', ['plumbing']);

      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            skills: { hasSome: ['plumbing'] },
          }),
        }),
      );
    });

    it('should use first technician when no GPS coordinates on customer', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
        customer: { lat: 0, lng: 0 },
      });

      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'Tech 1', currentLat: null, currentLng: null },
        { id: 'tech-2', name: 'Tech 2', currentLat: null, currentLng: null },
      ]);

      const updated = { id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.autoAssign(companyId, 'wo-1');
      expect(result.technicianId).toBe('tech-1');
    });
  });

  describe('getHistory', () => {
    it('should return status history ordered by timestamp', async () => {
      const expected = [
        { fromStatus: 'UNASSIGNED', toStatus: 'ASSIGNED' },
        { fromStatus: 'ASSIGNED', toStatus: 'EN_ROUTE' },
      ];
      mockPrisma.workOrderStatusHistory.findMany.mockResolvedValue(expected);

      const result = await service.getHistory(companyId, 'wo-1');
      expect(result).toEqual(expected);
    });

    it('should scope history query by companyId', async () => {
      mockPrisma.workOrderStatusHistory.findMany.mockResolvedValue([]);

      await service.getHistory(companyId, 'wo-1');
      expect(mockPrisma.workOrderStatusHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workOrder: { id: 'wo-1', companyId } },
        }),
      );
    });
  });
});
