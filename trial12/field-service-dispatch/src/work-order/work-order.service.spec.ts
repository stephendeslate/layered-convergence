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
  });

  describe('transition - valid transitions', () => {
    const validTransitions = [
      ['UNASSIGNED', 'ASSIGNED'],
      ['ASSIGNED', 'EN_ROUTE'],
      ['EN_ROUTE', 'ON_SITE'],
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
      ['ASSIGNED', 'COMPLETED'],
      ['ASSIGNED', 'UNASSIGNED'],
      ['EN_ROUTE', 'ASSIGNED'],
      ['COMPLETED', 'IN_PROGRESS'],
      ['PAID', 'UNASSIGNED'],
      ['PAID', 'COMPLETED'],
      ['IN_PROGRESS', 'ASSIGNED'],
      ['ON_SITE', 'EN_ROUTE'],
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

  describe('autoAssign', () => {
    it('should auto-assign nearest available technician', async () => {
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
        customer: {},
      });

      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(
        service.autoAssign(companyId, 'wo-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getHistory', () => {
    it('should return status history', async () => {
      const expected = [
        { fromStatus: 'UNASSIGNED', toStatus: 'ASSIGNED' },
      ];
      mockPrisma.workOrderStatusHistory.findMany.mockResolvedValue(expected);

      const result = await service.getHistory(companyId, 'wo-1');
      expect(result).toEqual(expected);
    });
  });
});
