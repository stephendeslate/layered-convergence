import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkOrderService } from '../work-order/work-order.service';
import { RoutingService } from '../routing/routing.service';

describe('DispatchService', () => {
  let service: DispatchService;
  let prisma: any;
  let audit: any;
  let workOrderService: any;
  let routing: any;

  const COMPANY_ID = 'company-1';
  const USER_ID = 'user-1';
  const DATE = '2026-03-20';

  function makeWorkOrder(overrides: Record<string, any> = {}) {
    return {
      id: 'wo-1',
      companyId: COMPANY_ID,
      status: 'UNASSIGNED',
      priority: 'NORMAL',
      serviceType: 'HVAC_REPAIR',
      latitude: 39.7817,
      longitude: -89.6501,
      scheduledStart: new Date('2026-03-20T09:00:00Z'),
      estimatedMinutes: 60,
      ...overrides,
    };
  }

  function makeTechnician(overrides: Record<string, any> = {}) {
    return {
      id: 'tech-1',
      companyId: COMPANY_ID,
      status: 'AVAILABLE',
      skills: ['HVAC_REPAIR', 'HVAC_INSTALL'],
      maxJobsPerDay: 8,
      currentLatitude: 39.78,
      currentLongitude: -89.65,
      user: { firstName: 'John', lastName: 'Doe' },
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      technician: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      route: {
        upsert: vi.fn().mockResolvedValue({ id: 'route-1' }),
      },
      routeStop: {
        deleteMany: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
    };

    audit = {
      logDispatchAction: vi.fn().mockResolvedValue(undefined),
    };

    workOrderService = {
      assign: vi.fn().mockResolvedValue(undefined),
    };

    routing = {
      optimizeRoute: vi.fn().mockResolvedValue({
        routes: [{
          distanceMeters: 15000,
          durationSeconds: 1200,
          geometry: null,
          steps: [
            { type: 'start', jobId: null, arrival: null, distanceMeters: 0, duration: 0 },
            { type: 'job', jobId: 'wo-1', arrival: 1000, distanceMeters: 5000, duration: 400 },
            { type: 'job', jobId: 'wo-2', arrival: 2000, distanceMeters: 10000, duration: 800 },
            { type: 'end', jobId: null, arrival: null, distanceMeters: 0, duration: 0 },
          ],
        }],
        unassigned: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: WorkOrderService, useValue: workOrderService },
        { provide: RoutingService, useValue: routing },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  describe('autoAssign', () => {
    it('should assign nearest matching technician to work order', async () => {
      const wo = makeWorkOrder();
      const tech = makeTechnician();

      prisma.workOrder.findMany.mockResolvedValue([wo]);
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.count.mockResolvedValue(1); // 1 existing job

      const result = await service.autoAssign(COMPANY_ID, { date: DATE }, USER_ID);

      expect(result.assignments).toHaveLength(1);
      expect(result.assignments[0].technicianId).toBe('tech-1');
      expect(result.assignments[0].workOrderId).toBe('wo-1');
      expect(result.assignments[0].score).toBeGreaterThan(0);
      expect(workOrderService.assign).toHaveBeenCalledWith(COMPANY_ID, 'wo-1', 'tech-1', USER_ID);
    });

    it('should select closest technician when multiple available', async () => {
      const wo = makeWorkOrder();
      // tech-1 is close (~0.2km), tech-2 is farther (~111km)
      const techClose = makeTechnician({ id: 'tech-close', currentLatitude: 39.782, currentLongitude: -89.650 });
      const techFar = makeTechnician({ id: 'tech-far', currentLatitude: 40.78, currentLongitude: -89.65 });

      prisma.workOrder.findMany.mockResolvedValue([wo]);
      prisma.technician.findMany.mockResolvedValue([techClose, techFar]);
      prisma.workOrder.count.mockResolvedValue(0);

      const result = await service.autoAssign(COMPANY_ID, { date: DATE }, USER_ID);

      expect(result.assignments).toHaveLength(1);
      expect(result.assignments[0].technicianId).toBe('tech-close');
    });

    it('should skip work orders with no matching skills', async () => {
      const wo = makeWorkOrder({ serviceType: 'PLUMBING' });
      const tech = makeTechnician({ skills: ['HVAC_REPAIR'] }); // no PLUMBING skill

      prisma.workOrder.findMany.mockResolvedValue([wo]);
      prisma.technician.findMany.mockResolvedValue([tech]);

      const result = await service.autoAssign(COMPANY_ID, { date: DATE });

      expect(result.assignments).toHaveLength(0);
      expect(result.unassigned).toHaveLength(1);
      expect(result.unassigned[0].reason).toContain('PLUMBING');
    });

    it('should skip when all technicians at capacity', async () => {
      const wo = makeWorkOrder();
      const tech = makeTechnician({ maxJobsPerDay: 2 });

      prisma.workOrder.findMany.mockResolvedValue([wo]);
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.count.mockResolvedValue(2); // already at max

      const result = await service.autoAssign(COMPANY_ID, { date: DATE });

      expect(result.assignments).toHaveLength(0);
      expect(result.unassigned).toHaveLength(1);
      expect(result.unassigned[0].reason).toContain('capacity');
    });

    it('should not call assign in dry run mode', async () => {
      const wo = makeWorkOrder();
      const tech = makeTechnician();

      prisma.workOrder.findMany.mockResolvedValue([wo]);
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.count.mockResolvedValue(0);

      const result = await service.autoAssign(COMPANY_ID, { date: DATE, dryRun: true });

      expect(result.assignments).toHaveLength(1);
      expect(workOrderService.assign).not.toHaveBeenCalled();
      expect(audit.logDispatchAction).not.toHaveBeenCalled();
    });

    it('should return correct summary', async () => {
      const wo1 = makeWorkOrder({ id: 'wo-1' });
      const wo2 = makeWorkOrder({ id: 'wo-2', serviceType: 'PLUMBING' });
      const tech = makeTechnician();

      prisma.workOrder.findMany.mockResolvedValue([wo1, wo2]);
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.count.mockResolvedValue(0);

      const result = await service.autoAssign(COMPANY_ID, { date: DATE });

      expect(result.summary.totalProcessed).toBe(2);
      expect(result.summary.assigned).toBe(1);
      expect(result.summary.unassigned).toBe(1);
    });

    it('should handle empty work order list', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);

      const result = await service.autoAssign(COMPANY_ID, { date: DATE });

      expect(result.assignments).toHaveLength(0);
      expect(result.unassigned).toHaveLength(0);
      expect(result.summary.totalProcessed).toBe(0);
    });

    it('should track job count across multiple assignments', async () => {
      const wo1 = makeWorkOrder({ id: 'wo-1' });
      const wo2 = makeWorkOrder({ id: 'wo-2' });
      const tech = makeTechnician({ maxJobsPerDay: 2 });

      prisma.workOrder.findMany.mockResolvedValue([wo1, wo2]);
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.count.mockResolvedValue(1); // 1 existing job, max 2

      const result = await service.autoAssign(COMPANY_ID, { date: DATE });

      // Only 1 should be assigned (1 existing + 1 new = 2 = max)
      expect(result.assignments).toHaveLength(1);
      expect(result.unassigned).toHaveLength(1);
    });
  });

  describe('optimizeRoutes', () => {
    it('should skip technicians with fewer than 2 work orders', async () => {
      const tech = makeTechnician();
      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.findMany.mockResolvedValue([makeWorkOrder()]); // only 1 WO

      const result = await service.optimizeRoutes(COMPANY_ID, DATE, undefined, USER_ID);

      expect(result.optimized).toHaveLength(0);
      expect(routing.optimizeRoute).not.toHaveBeenCalled();
    });

    it('should optimize route with multiple work orders', async () => {
      const tech = makeTechnician();
      const wo1 = makeWorkOrder({ id: 'wo-1' });
      const wo2 = makeWorkOrder({ id: 'wo-2', latitude: 39.80, longitude: -89.66 });

      prisma.technician.findMany.mockResolvedValue([tech]);
      prisma.workOrder.findMany.mockResolvedValue([wo1, wo2]);

      const result = await service.optimizeRoutes(COMPANY_ID, DATE, undefined, USER_ID);

      expect(routing.optimizeRoute).toHaveBeenCalled();
      expect(result.optimized).toHaveLength(1);
      expect(result.optimized[0].technicianId).toBe('tech-1');
      expect(result.optimized[0].stopCount).toBe(2);
      expect(prisma.route.upsert).toHaveBeenCalled();
      expect(prisma.routeStop.create).toHaveBeenCalledTimes(2);
      expect(audit.logDispatchAction).toHaveBeenCalled();
    });
  });

  describe('getDispatchBoard', () => {
    it('should group work orders by status', async () => {
      const workOrders = [
        makeWorkOrder({ id: 'wo-1', status: 'UNASSIGNED' }),
        makeWorkOrder({ id: 'wo-2', status: 'ASSIGNED', technicianId: 'tech-1' }),
        makeWorkOrder({ id: 'wo-3', status: 'EN_ROUTE', technicianId: 'tech-1' }),
        makeWorkOrder({ id: 'wo-4', status: 'COMPLETED', technicianId: 'tech-1' }),
      ];

      prisma.workOrder.findMany.mockResolvedValue(workOrders);
      prisma.technician.findMany.mockResolvedValue([makeTechnician()]);

      const result = await service.getDispatchBoard(COMPANY_ID, DATE);

      expect(result.columns.UNASSIGNED).toHaveLength(1);
      expect(result.columns.ASSIGNED).toHaveLength(1);
      expect(result.columns.EN_ROUTE).toHaveLength(1);
      expect(result.columns.COMPLETED).toHaveLength(1);
      expect(result.stats.total).toBe(4);
    });

    it('should return technician list with positions', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.technician.findMany.mockResolvedValue([makeTechnician()]);

      const result = await service.getDispatchBoard(COMPANY_ID, DATE);

      expect(result.technicians).toHaveLength(1);
      expect(result.technicians[0].name).toBe('John Doe');
      expect(result.technicians[0].latitude).toBe(39.78);
    });
  });
});
