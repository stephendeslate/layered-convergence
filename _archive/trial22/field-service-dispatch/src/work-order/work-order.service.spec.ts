import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service.js';

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

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkOrderService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create UNASSIGNED work order without technicianId', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix leak' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'UNASSIGNED', ...dto });

      const result = await service.create(dto as any);
      expect(result.status).toBe('UNASSIGNED');
    });

    it('should create ASSIGNED work order with technicianId', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', technicianId: 't1', description: 'Fix leak' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'ASSIGNED', ...dto });

      const result = await service.create(dto as any);
      expect(result.status).toBe('ASSIGNED');
    });

    it('should pass scheduledAt as Date when provided', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', scheduledAt: '2024-01-01T10:00:00Z' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto });

      await service.create(dto as any);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scheduledAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should set priority when provided', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', priority: 'HIGH' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto, status: 'UNASSIGNED' });
      await service.create(dto as any);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 'HIGH' }),
        }),
      );
    });

    it('should set notes when provided', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', notes: 'Urgent' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto, status: 'UNASSIGNED' });
      await service.create(dto as any);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ notes: 'Urgent' }),
        }),
      );
    });
  });

  describe('findAllByCompany', () => {
    it('should return work orders scoped to company', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });
      const result = await service.findOne('1', 'c1');
      expect(result.status).toBe('UNASSIGNED');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow valid transition UNASSIGNED -> ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);

      const result = await service.transition('1', 'c1', 'ASSIGNED', { technicianId: 't1' });
      expect(result.status).toBe('ASSIGNED');
    });

    it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
      });

      await expect(service.transition('1', 'c1', 'COMPLETED' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject transition from PAID (terminal state)', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'PAID', customer: {}, technician: null, statusHistory: [],
      });

      await expect(service.transition('1', 'c1', 'COMPLETED' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow back-transition ASSIGNED -> UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'ASSIGNED', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'UNASSIGNED', technicianId: null }, {}]);

      const result = await service.transition('1', 'c1', 'UNASSIGNED');
      expect(result.technicianId).toBeNull();
    });

    it('should allow back-transition EN_ROUTE -> ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'EN_ROUTE', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);

      const result = await service.transition('1', 'c1', 'ASSIGNED');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'IN_PROGRESS', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'COMPLETED', completedAt: new Date() }, {}]);

      await service.transition('1', 'c1', 'COMPLETED');
      const txCall = mockPrisma.$transaction.mock.calls[0][0];
      expect(txCall).toHaveLength(2);
    });

    it('should include error message with from and to status on invalid transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
      });

      try {
        await service.transition('1', 'c1', 'PAID' as any);
      } catch (err) {
        expect((err as BadRequestException).message).toContain('UNASSIGNED');
        expect((err as BadRequestException).message).toContain('PAID');
      }
    });

    it('should allow ASSIGNED -> EN_ROUTE', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'ASSIGNED', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'EN_ROUTE' }, {}]);
      const result = await service.transition('1', 'c1', 'EN_ROUTE');
      expect(result.status).toBe('EN_ROUTE');
    });

    it('should allow EN_ROUTE -> ON_SITE', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'EN_ROUTE', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ON_SITE' }, {}]);
      const result = await service.transition('1', 'c1', 'ON_SITE');
      expect(result.status).toBe('ON_SITE');
    });

    it('should allow ON_SITE -> IN_PROGRESS', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'ON_SITE', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'IN_PROGRESS' }, {}]);
      const result = await service.transition('1', 'c1', 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow COMPLETED -> INVOICED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'COMPLETED', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'INVOICED' }, {}]);
      const result = await service.transition('1', 'c1', 'INVOICED');
      expect(result.status).toBe('INVOICED');
    });

    it('should allow INVOICED -> PAID', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'INVOICED', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'PAID' }, {}]);
      const result = await service.transition('1', 'c1', 'PAID');
      expect(result.status).toBe('PAID');
    });
  });

  describe('assign', () => {
    it('should delegate to transition with ASSIGNED status', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);

      const result = await service.assign('1', 'c1', 't1');
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('autoAssign', () => {
    it('should auto-assign to nearest available technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: 40.7128, lng: -74.006 },
        technician: null,
        statusHistory: [],
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: 40.8, currentLng: -73.9 },
        { id: 't2', currentLat: 40.72, currentLng: -74.01 },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't2' }, {}]);

      const result = await service.autoAssign('1', 'c1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should throw when no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: 40.7, lng: -74.0 },
        technician: null,
        statusHistory: [],
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.autoAssign('1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when work order is not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'ASSIGNED',
        customer: {},
        technician: null,
        statusHistory: [],
      });

      await expect(service.autoAssign('1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('should pick first technician when customer has no coordinates', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: null, lng: null },
        technician: null,
        statusHistory: [],
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: 40.8, currentLng: -73.9 },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't1' }, {}]);

      const result = await service.autoAssign('1', 'c1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should handle technicians without coordinates', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: 40.7, lng: -74.0 },
        technician: null,
        statusHistory: [],
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: null, currentLng: null },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't1' }, {}]);

      const result = await service.autoAssign('1', 'c1');
      expect(result.status).toBe('ASSIGNED');
    });
  });
});
