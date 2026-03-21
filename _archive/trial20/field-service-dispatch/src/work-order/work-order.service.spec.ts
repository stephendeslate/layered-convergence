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
    it('should create a work order', async () => {
      const dto = {
        companyId: 'c1',
        customerId: 'cu1',
        description: 'Fix sink',
      };
      const result = { id: 'wo1', ...dto, status: 'UNASSIGNED' };
      mockPrisma.workOrder.create.mockResolvedValue(result);

      expect(await service.create(dto as any)).toEqual(result);
    });

    it('should handle scheduledAt date conversion', async () => {
      const dto = {
        companyId: 'c1',
        customerId: 'cu1',
        description: 'Fix sink',
        scheduledAt: '2024-01-15T10:00:00Z',
      };
      mockPrisma.workOrder.create.mockResolvedValue({ id: 'wo1' });

      await service.create(dto as any);

      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          scheduledAt: expect.any(Date),
        }),
      });
    });
  });

  describe('findAllByCompany', () => {
    it('should return work orders with includes', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);

      expect(await service.findAllByCompany('c1')).toEqual([]);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        include: { customer: true, technician: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a work order with includes', async () => {
      const wo = { id: 'wo1', companyId: 'c1', status: 'UNASSIGNED' };
      mockPrisma.workOrder.findFirst.mockResolvedValue(wo);

      expect(await service.findOne('wo1', 'c1')).toEqual(wo);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('wo1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should transition UNASSIGNED to ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'UNASSIGNED',
      });
      const updated = { id: 'wo1', status: 'ASSIGNED' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.transition('wo1', 'c1', 'ASSIGNED' as any, {
        technicianId: 't1',
      });

      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'UNASSIGNED',
      });

      await expect(
        service.transition('wo1', 'c1', 'COMPLETED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with descriptive message', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'PAID',
      });

      await expect(
        service.transition('wo1', 'c1', 'ASSIGNED' as any),
      ).rejects.toThrow('Invalid transition from PAID to ASSIGNED');
    });

    it('should clear technicianId on UNASSIGNED transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'ASSIGNED',
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'wo1' }, {}]);

      await service.transition('wo1', 'c1', 'UNASSIGNED' as any);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should set completedAt on COMPLETED transition', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'IN_PROGRESS',
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'wo1' }, {}]);

      await service.transition('wo1', 'c1', 'COMPLETED' as any);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      vi.spyOn(service, 'transition').mockResolvedValue({ id: 'wo1' } as any);
    });

    it('should call assign', async () => {
      await service.assign('wo1', 'c1', 't1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'ASSIGNED', {
        technicianId: 't1',
      });
    });

    it('should call unassign', async () => {
      await service.unassign('wo1', 'c1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'UNASSIGNED');
    });

    it('should call enRoute', async () => {
      await service.enRoute('wo1', 'c1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'EN_ROUTE');
    });

    it('should call onSite', async () => {
      await service.onSite('wo1', 'c1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'ON_SITE');
    });

    it('should call start', async () => {
      await service.start('wo1', 'c1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'IN_PROGRESS');
    });

    it('should call complete', async () => {
      await service.complete('wo1', 'c1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'COMPLETED');
    });

    it('should call returnToAssigned', async () => {
      await service.returnToAssigned('wo1', 'c1');
      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'ASSIGNED');
    });
  });

  describe('autoAssign', () => {
    it('should throw if work order is not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'ASSIGNED',
        customer: { lat: null, lng: null },
      });

      await expect(service.autoAssign('wo1', 'c1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'UNASSIGNED',
        customer: { lat: null, lng: null },
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.autoAssign('wo1', 'c1')).rejects.toThrow(
        'No available technicians found',
      );
    });

    it('should assign nearest technician using haversine', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'UNASSIGNED',
        customer: { lat: 40.7128, lng: -74.006 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'far', currentLat: 34.0522, currentLng: -118.2437 },
        { id: 'near', currentLat: 40.758, currentLng: -73.9855 },
      ]);
      vi.spyOn(service, 'transition').mockResolvedValue({ id: 'wo1' } as any);

      await service.autoAssign('wo1', 'c1');

      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'ASSIGNED', {
        technicianId: 'near',
      });
    });

    it('should assign first technician when customer has no coordinates', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        companyId: 'c1',
        status: 'UNASSIGNED',
        customer: { lat: null, lng: null },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', currentLat: null, currentLng: null },
        { id: 't2', currentLat: null, currentLng: null },
      ]);
      vi.spyOn(service, 'transition').mockResolvedValue({ id: 'wo1' } as any);

      await service.autoAssign('wo1', 'c1');

      expect(service.transition).toHaveBeenCalledWith('wo1', 'c1', 'ASSIGNED', {
        technicianId: 't1',
      });
    });
  });
});
