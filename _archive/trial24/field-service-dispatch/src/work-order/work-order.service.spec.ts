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
    it('should create a work order with UNASSIGNED status when no technician', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix sink' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'UNASSIGNED', ...dto });

      const result = await service.create(dto);
      expect(result.status).toBe('UNASSIGNED');
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', technicianId: 't1', description: 'Fix' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'ASSIGNED', ...dto });

      const result = await service.create(dto);
      expect(result.status).toBe('ASSIGNED');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'ASSIGNED' }),
      });
    });

    it('should pass priority when provided', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', priority: 'HIGH' as const };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto });

      await service.create(dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ priority: 'HIGH' }),
      });
    });

    it('should convert scheduledAt string to Date', async () => {
      const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', scheduledAt: '2024-01-01' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto });

      await service.create(dto);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ scheduledAt: expect.any(Date) }),
      });
    });
  });

  describe('findAllByCompany', () => {
    it('should return work orders for a company', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
    });

    it('should include customer and technician relations', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);

      await service.findAllByCompany('c1');
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        include: { customer: true, technician: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });

      const result = await service.findOne('1', 'c1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [] });

      await expect(service.transition('1', 'c1', 'COMPLETED')).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition PAID -> anything', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'PAID', customer: {}, technician: null, statusHistory: [] });

      await expect(service.transition('1', 'c1', 'INVOICED')).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition UNASSIGNED -> ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);

      const result = await service.transition('1', 'c1', 'ASSIGNED', { technicianId: 't1' });
      expect(result.status).toBe('ASSIGNED');
    });

    it('should allow ASSIGNED -> EN_ROUTE', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'EN_ROUTE' }, {}]);

      const result = await service.transition('1', 'c1', 'EN_ROUTE');
      expect(result.status).toBe('EN_ROUTE');
    });

    it('should allow EN_ROUTE -> ON_SITE', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'EN_ROUTE', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ON_SITE' }, {}]);

      const result = await service.transition('1', 'c1', 'ON_SITE');
      expect(result.status).toBe('ON_SITE');
    });

    it('should allow ON_SITE -> IN_PROGRESS', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ON_SITE', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'IN_PROGRESS' }, {}]);

      const result = await service.transition('1', 'c1', 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow IN_PROGRESS -> COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'IN_PROGRESS', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'COMPLETED' }, {}]);

      const result = await service.transition('1', 'c1', 'COMPLETED');
      expect(result.status).toBe('COMPLETED');
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'IN_PROGRESS', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'COMPLETED' }, {}]);

      await service.transition('1', 'c1', 'COMPLETED');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should clear technicianId when unassigning', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'UNASSIGNED', technicianId: null }, {}]);

      const result = await service.transition('1', 'c1', 'UNASSIGNED');
      expect(result.technicianId).toBeNull();
    });

    it('should reject UNASSIGNED -> EN_ROUTE', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [] });

      await expect(service.transition('1', 'c1', 'EN_ROUTE')).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', customer: {}, technician: {}, statusHistory: [] });

      await expect(service.transition('1', 'c1', 'ASSIGNED')).rejects.toThrow(BadRequestException);
    });
  });

  describe('assign', () => {
    it('should call transition with ASSIGNED status', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);

      const result = await service.assign('1', 'c1', 't1');
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('unassign', () => {
    it('should call transition with UNASSIGNED status', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', customer: {}, technician: {}, statusHistory: [] });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'UNASSIGNED', technicianId: null }, {}]);

      const result = await service.unassign('1', 'c1');
      expect(result.status).toBe('UNASSIGNED');
    });
  });

  describe('autoAssign', () => {
    it('should throw when work order is not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', customer: {}, technician: {}, statusHistory: [] });

      await expect(service.autoAssign('1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED', customer: { lat: null, lng: null }, technician: null, statusHistory: [] });
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.autoAssign('1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('should assign nearest technician by haversine distance', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'UNASSIGNED',
        customer: { lat: 40.7128, lng: -74.006 },
        technician: null, statusHistory: [],
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: 41.0, currentLng: -75.0 },
        { id: 't2', currentLat: 40.72, currentLng: -74.01 },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't2' }, {}]);

      const result = await service.autoAssign('1', 'c1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('should assign first technician when customer has no coordinates', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1', status: 'UNASSIGNED',
        customer: { lat: null, lng: null },
        technician: null, statusHistory: [],
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
