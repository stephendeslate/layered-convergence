import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BullMqService, QUEUE_NAMES } from '../bullmq/bullmq.service';
import { WorkOrderStatus } from '@fsd/shared';

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-tracking-token'),
}));

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: any;
  let audit: any;
  let bullmq: any;

  const COMPANY_ID = 'company-1';
  const USER_ID = 'user-1';

  function makeWorkOrder(overrides: Record<string, any> = {}) {
    return {
      id: 'wo-1',
      companyId: COMPANY_ID,
      customerId: 'cust-1',
      technicianId: null,
      referenceNumber: 'WO-00001',
      status: WorkOrderStatus.UNASSIGNED,
      priority: 'NORMAL',
      serviceType: 'HVAC_REPAIR',
      description: 'Fix AC unit',
      notes: null,
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      latitude: 39.7817,
      longitude: -89.6501,
      scheduledStart: new Date('2026-03-20T09:00:00Z'),
      scheduledEnd: new Date('2026-03-20T10:00:00Z'),
      estimatedMinutes: 60,
      actualStart: null,
      actualEnd: null,
      trackingToken: null,
      trackingExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  function makeTechnician(overrides: Record<string, any> = {}) {
    return {
      id: 'tech-1',
      companyId: COMPANY_ID,
      userId: 'user-tech-1',
      status: 'AVAILABLE',
      skills: ['HVAC_REPAIR', 'HVAC_INSTALL'],
      maxJobsPerDay: 8,
      currentLatitude: 39.78,
      currentLongitude: -89.65,
      lastPositionAt: new Date(),
      user: { firstName: 'John', lastName: 'Doe' },
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      workOrderStatusHistory: {
        create: vi.fn().mockResolvedValue({}),
      },
      technician: {
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      lineItem: {
        createMany: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([]),
      },
      invoice: {
        create: vi.fn().mockResolvedValue({ id: 'inv-1' }),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(0),
      },
      company: {
        findUnique: vi.fn().mockResolvedValue({ taxRate: 0.08 }),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
      logWorkOrderTransition: vi.fn().mockResolvedValue(undefined),
    };

    bullmq = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: BullMqService, useValue: bullmq },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  // ============================================================
  // Create
  // ============================================================

  describe('create', () => {
    it('should create a work order in UNASSIGNED state', async () => {
      const created = makeWorkOrder();
      prisma.workOrder.create.mockResolvedValue(created);

      const result = await service.create(COMPANY_ID, {
        customerId: 'cust-1',
        serviceType: 'HVAC_REPAIR',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        latitude: 39.7817,
        longitude: -89.6501,
        scheduledStart: '2026-03-20T09:00:00Z',
        scheduledEnd: '2026-03-20T10:00:00Z',
      }, USER_ID);

      expect(result.status).toBe(WorkOrderStatus.UNASSIGNED);
      expect(prisma.workOrderStatusHistory.create).toHaveBeenCalled();
      expect(audit.logWorkOrderTransition).toHaveBeenCalledWith(
        COMPANY_ID, USER_ID, 'wo-1', null, WorkOrderStatus.UNASSIGNED, expect.any(Object),
      );
    });
  });

  // ============================================================
  // Valid transitions
  // ============================================================

  describe('assign (UNASSIGNED -> ASSIGNED)', () => {
    it('should assign a technician with matching skills', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.ASSIGNED,
        technicianId: 'tech-1',
      });

      const result = await service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
      expect(result.technicianId).toBe('tech-1');
      expect(audit.logWorkOrderTransition).toHaveBeenCalled();
      expect(bullmq.addJob).toHaveBeenCalledWith(
        QUEUE_NAMES.NOTIFICATIONS, 'new-assignment', expect.any(Object),
      );
    });

    it('should reject if technician lacks required skill', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED, serviceType: 'PEST_CONTROL' });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.technician.findFirst.mockResolvedValue(makeTechnician());

      await expect(
        service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if technician is not available', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.technician.findFirst.mockResolvedValue(
        makeTechnician({ status: 'EN_ROUTE' }),
      );

      await expect(
        service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if technician not found in company', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('startRoute (ASSIGNED -> EN_ROUTE)', () => {
    it('should transition to EN_ROUTE and generate tracking token', async () => {
      const wo = makeWorkOrder({
        status: WorkOrderStatus.ASSIGNED,
        technicianId: 'tech-1',
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.EN_ROUTE,
        trackingToken: 'mock-tracking-token',
      });

      const result = await service.startRoute(COMPANY_ID, 'wo-1', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.EN_ROUTE);
      expect(result.trackingToken).toBe('mock-tracking-token');
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { status: 'EN_ROUTE' },
      });
    });
  });

  describe('arrive (EN_ROUTE -> ON_SITE)', () => {
    it('should transition to ON_SITE and set actualStart', async () => {
      const wo = makeWorkOrder({
        status: WorkOrderStatus.EN_ROUTE,
        technicianId: 'tech-1',
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.ON_SITE,
      });

      const result = await service.arrive(COMPANY_ID, 'wo-1', USER_ID, 39.78, -89.65);

      expect(result.status).toBe(WorkOrderStatus.ON_SITE);
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { status: 'ON_JOB' },
      });
    });
  });

  describe('startWork (ON_SITE -> IN_PROGRESS)', () => {
    it('should transition to IN_PROGRESS', async () => {
      const wo = makeWorkOrder({
        status: WorkOrderStatus.ON_SITE,
        technicianId: 'tech-1',
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.IN_PROGRESS,
      });

      const result = await service.startWork(COMPANY_ID, 'wo-1', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });
  });

  describe('complete (IN_PROGRESS -> COMPLETED)', () => {
    it('should transition to COMPLETED and create line items', async () => {
      const wo = makeWorkOrder({
        status: WorkOrderStatus.IN_PROGRESS,
        technicianId: 'tech-1',
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.COMPLETED,
        lineItems: [],
      });

      const result = await service.complete(COMPANY_ID, 'wo-1', {
        notes: 'All done',
        lineItems: [
          { type: 'LABOR', description: 'HVAC repair', quantity: 2, unitPrice: 75 },
          { type: 'MATERIAL', description: 'Freon', quantity: 1, unitPrice: 50 },
        ],
      }, USER_ID);

      expect(result.status).toBe(WorkOrderStatus.COMPLETED);
      expect(prisma.lineItem.createMany).toHaveBeenCalled();
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { status: 'AVAILABLE' },
      });
      expect(bullmq.addJob).toHaveBeenCalledWith(
        QUEUE_NAMES.INVOICE_GENERATION, 'generate-invoice', expect.any(Object),
      );
    });
  });

  describe('generateInvoice (COMPLETED -> INVOICED)', () => {
    it('should create invoice and transition to INVOICED', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.COMPLETED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.lineItem.findMany.mockResolvedValue([
        { id: 'li-1', totalPrice: 150 },
        { id: 'li-2', totalPrice: 50 },
      ]);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.INVOICED,
        invoice: { id: 'inv-1' },
      });

      const result = await service.generateInvoice(COMPANY_ID, 'wo-1', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.INVOICED);
      expect(prisma.invoice.create).toHaveBeenCalled();
    });

    it('should reject if no line items', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.COMPLETED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.lineItem.findMany.mockResolvedValue([]);

      await expect(
        service.generateInvoice(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markPaid (INVOICED -> PAID)', () => {
    it('should transition to PAID and update invoice', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.INVOICED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1' });
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.PAID,
        invoice: { id: 'inv-1', status: 'PAID' },
      });

      const result = await service.markPaid(
        COMPANY_ID, 'wo-1', { stripePaymentIntentId: 'pi_123' }, USER_ID,
      );

      expect(result.status).toBe(WorkOrderStatus.PAID);
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: 'PAID', paidAt: expect.any(Date) },
      });
    });
  });

  // ============================================================
  // Cancel transitions
  // ============================================================

  describe('cancel', () => {
    it('should cancel from UNASSIGNED', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.CANCELLED,
      });

      const result = await service.cancel(COMPANY_ID, 'wo-1', 'Customer request', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.CANCELLED);
    });

    it('should cancel from ASSIGNED and free technician', async () => {
      const wo = makeWorkOrder({
        status: WorkOrderStatus.ASSIGNED,
        technicianId: 'tech-1',
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.CANCELLED,
        technicianId: null,
      });

      const result = await service.cancel(COMPANY_ID, 'wo-1', 'Schedule conflict', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.CANCELLED);
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should cancel from EN_ROUTE', async () => {
      const wo = makeWorkOrder({
        status: WorkOrderStatus.EN_ROUTE,
        technicianId: 'tech-1',
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.workOrder.update.mockResolvedValue({
        ...wo,
        status: WorkOrderStatus.CANCELLED,
      });

      const result = await service.cancel(COMPANY_ID, 'wo-1', 'Emergency', USER_ID);

      expect(result.status).toBe(WorkOrderStatus.CANCELLED);
    });
  });

  // ============================================================
  // Invalid transitions (should throw)
  // ============================================================

  describe('invalid transitions', () => {
    it('should reject UNASSIGNED -> ON_SITE', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.arrive(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject UNASSIGNED -> IN_PROGRESS', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.startWork(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject UNASSIGNED -> COMPLETED', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.complete(COMPANY_ID, 'wo-1', {}, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ASSIGNED -> ON_SITE (must go through EN_ROUTE)', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.ASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.arrive(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ASSIGNED -> IN_PROGRESS', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.ASSIGNED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.startWork(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject EN_ROUTE -> IN_PROGRESS (must go through ON_SITE)', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.EN_ROUTE });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.startWork(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> EN_ROUTE', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.COMPLETED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.startRoute(COMPANY_ID, 'wo-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PAID -> any transition (terminal state)', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.PAID });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.cancel(COMPANY_ID, 'wo-1', 'test', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject CANCELLED -> any transition (terminal state)', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.CANCELLED });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ON_SITE -> ASSIGNED', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.ON_SITE });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      // assign expects UNASSIGNED -> ASSIGNED
      await expect(
        service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject IN_PROGRESS -> ASSIGNED', async () => {
      const wo = makeWorkOrder({ status: WorkOrderStatus.IN_PROGRESS });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.assign(COMPANY_ID, 'wo-1', 'tech-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================
  // Get & List
  // ============================================================

  describe('get', () => {
    it('should return work order with full details', async () => {
      const wo = makeWorkOrder();
      prisma.workOrder.findFirst.mockResolvedValue({
        ...wo,
        customer: {},
        technician: null,
        statusHistory: [],
        lineItems: [],
        photos: [],
        invoice: null,
      });

      const result = await service.get(COMPANY_ID, 'wo-1');

      expect(result.id).toBe('wo-1');
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.get(COMPANY_ID, 'wo-999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      prisma.workOrder.findMany.mockResolvedValue([makeWorkOrder()]);
      prisma.workOrder.count.mockResolvedValue(1);

      const result = await service.list(COMPANY_ID, { page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      await service.list(COMPANY_ID, { status: 'ASSIGNED' });

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ASSIGNED' }),
        }),
      );
    });
  });
});
