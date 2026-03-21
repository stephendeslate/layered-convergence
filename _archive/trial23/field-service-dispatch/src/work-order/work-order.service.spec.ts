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
    it('should create a work order with UNASSIGNED status', async () => {
      const dto = { companyId: 'c1', customerId: 'cust1', description: 'Fix sink' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'UNASSIGNED', ...dto });
      const result = await service.create(dto as any);
      expect(result.status).toBe('UNASSIGNED');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ companyId: 'c1', status: 'UNASSIGNED' }),
      });
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      const dto = { companyId: 'c1', customerId: 'cust1', technicianId: 't1', description: 'Fix' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
      await service.create(dto as any);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'ASSIGNED', technicianId: 't1' }),
      });
    });

    it('should convert scheduledAt to Date', async () => {
      const dto = { companyId: 'c1', customerId: 'cust1', description: 'Fix', scheduledAt: '2024-01-01T10:00:00Z' };
      mockPrisma.workOrder.create.mockResolvedValue({ id: '1' });
      await service.create(dto as any);
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

    it('should filter by companyId and include relations', async () => {
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
      expect(result.status).toBe('UNASSIGNED');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });

    it('should scope by companyId', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1' });
      await service.findOne('1', 'c1');
      expect(mockPrisma.workOrder.findFirst).toHaveBeenCalledWith({
        where: { id: '1', companyId: 'c1' },
        include: { customer: true, technician: true, statusHistory: true },
      });
    });
  });

  describe('transition', () => {
    it('should transition from UNASSIGNED to ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
      const result = await service.transition('1', 'c1', 'ASSIGNED' as any, { technicianId: 't1' });
      expect(result.status).toBe('ASSIGNED');
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });
      await expect(service.transition('1', 'c1', 'COMPLETED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for transition from PAID', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'PAID' });
      await expect(service.transition('1', 'c1', 'INVOICED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'COMPLETED' }, {}]);
      await service.transition('1', 'c1', 'COMPLETED' as any);
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ status: 'COMPLETED', completedAt: expect.any(Date) }),
      });
    });

    it('should null out technicianId when transitioning to UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'UNASSIGNED' }, {}]);
      await service.transition('1', 'c1', 'UNASSIGNED' as any);
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ technicianId: null }),
      });
    });

    it('should create status history entry', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1' }, {}]);
      await service.transition('1', 'c1', 'EN_ROUTE' as any);
      expect(mockPrisma.workOrderStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workOrderId: '1',
          fromStatus: 'ASSIGNED',
          toStatus: 'EN_ROUTE',
        }),
      });
    });
  });

  describe('assign', () => {
    it('should assign a technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
      const result = await service.assign('1', 'c1', 't1');
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('unassign', () => {
    it('should unassign a work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'UNASSIGNED' }, {}]);
      const result = await service.unassign('1', 'c1');
      expect(result.status).toBe('UNASSIGNED');
    });
  });

  describe('autoAssign', () => {
    it('should auto-assign nearest technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: 40.7128, lng: -74.006 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: 40.8, currentLng: -74.1 },
        { id: 't2', currentLat: 40.72, currentLng: -74.01 },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
      await service.autoAssign('1', 'c1');
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ technicianId: 't2' }),
      });
    });

    it('should throw if not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'ASSIGNED',
        customer: {},
      });
      await expect(service.autoAssign('1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: 40.7, lng: -74.0 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);
      await expect(service.autoAssign('1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('should pick first technician when customer has no coordinates', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        status: 'UNASSIGNED',
        customer: { lat: null, lng: null },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: null, currentLng: null },
      ]);
      mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
      await service.autoAssign('1', 'c1');
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ technicianId: 't1' }),
      });
    });
  });
});
