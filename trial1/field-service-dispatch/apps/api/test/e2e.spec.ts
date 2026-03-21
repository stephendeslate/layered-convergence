/**
 * E2E / Integration Tests for Field Service Dispatch API
 *
 * These tests exercise the service layer with mocked Prisma, BullMQ, and Redis.
 * They validate end-to-end business flows across multiple services.
 *
 * Test suites:
 *  1. Work order lifecycle (full 8-state happy path)
 *  2. Invalid state transitions (return 400)
 *  3. Dispatch auto-assign (nearest technician with matching skills)
 *  4. Route optimization (ordered stops)
 *  5. Customer tracking portal (token generation + public access)
 *  6. Invoice generation (line items, tax calculation, totals)
 *  7. Auth flow (register, login, role-based access)
 *  8. Tenant isolation (company A vs company B)
 *  9. GPS gateway handlers (position streaming)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Services
import { WorkOrderService } from '../src/work-order/work-order.service';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { InvoiceService } from '../src/invoice/invoice.service';
import { CustomerPortalService } from '../src/customer-portal/customer-portal.service';
import { AuthService } from '../src/auth/auth.service';
import { RouteService } from '../src/route/route.service';
import { RoutingService } from '../src/routing/routing.service';
import { GpsHistoryService } from '../src/gateway/gps-history.service';

// Dependencies
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditService } from '../src/audit/audit.service';
import { BullMqService, QUEUE_NAMES } from '../src/bullmq/bullmq.service';
import { RedisService } from '../src/redis/redis.service';

// Shared
import { WorkOrderStatus, WORK_ORDER_TRANSITIONS } from '@fsd/shared';

// ============================================================
// Helpers
// ============================================================

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-uuid-token'),
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$12$hashed-password'),
    compare: vi.fn().mockImplementation((plain: string, hash: string) => {
      return Promise.resolve(plain === 'ValidPass123!' || plain === 'Password123!');
    }),
  },
  hash: vi.fn().mockResolvedValue('$2b$12$hashed-password'),
  compare: vi.fn().mockImplementation((plain: string, hash: string) => {
    return Promise.resolve(plain === 'ValidPass123!' || plain === 'Password123!');
  }),
}));

const COMPANY_A = 'company-a';
const COMPANY_B = 'company-b';
const USER_ADMIN = 'user-admin';
const USER_DISPATCHER = 'user-dispatcher';
const USER_TECH = 'user-tech';

function makeWorkOrder(overrides: Record<string, any> = {}) {
  return {
    id: 'wo-1',
    companyId: COMPANY_A,
    customerId: 'cust-1',
    technicianId: null,
    referenceNumber: 'WO-00001',
    status: WorkOrderStatus.UNASSIGNED,
    priority: 'NORMAL',
    serviceType: 'HVAC_REPAIR',
    description: 'Fix AC unit',
    notes: null,
    address: '123 Main St',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    latitude: 39.7392,
    longitude: -104.9903,
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
    companyId: COMPANY_A,
    userId: 'user-tech-1',
    status: 'AVAILABLE',
    skills: ['HVAC_REPAIR', 'HVAC_INSTALL', 'HVAC_MAINTENANCE'],
    maxJobsPerDay: 8,
    currentLatitude: 39.7400,
    currentLongitude: -104.9910,
    lastPositionAt: new Date(),
    vehicleInfo: 'Van #101',
    color: '#3B82F6',
    simulationMode: false,
    schedule: {},
    user: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: null, avatarUrl: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCustomer(overrides: Record<string, any> = {}) {
  return {
    id: 'cust-1',
    companyId: COMPANY_A,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@customer.com',
    phone: '(303) 555-0100',
    address: '456 Oak Ave',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    latitude: 39.7392,
    longitude: -104.9903,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeUser(overrides: Record<string, any> = {}) {
  return {
    id: USER_ADMIN,
    companyId: COMPANY_A,
    email: 'admin@acme.com',
    passwordHash: '$2b$12$hashed-password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    phone: null,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    company: { id: COMPANY_A },
    ...overrides,
  };
}

// ============================================================
// 1. WORK ORDER LIFECYCLE (full happy path)
// ============================================================

describe('E2E: Work Order Lifecycle', () => {
  let service: WorkOrderService;
  let prisma: any;
  let audit: any;
  let bullmq: any;

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
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      invoice: {
        create: vi.fn().mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-00001' }),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(0),
      },
      company: {
        findUnique: vi.fn().mockResolvedValue({ taxRate: 0.0875 }),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
      logWorkOrderTransition: vi.fn().mockResolvedValue(undefined),
      logDispatchAction: vi.fn().mockResolvedValue(undefined),
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

  it('should complete full lifecycle: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID', async () => {
    const tech = makeTechnician();
    const lineItems = [
      { type: 'LABOR', description: 'HVAC repair labor', quantity: 2, unitPrice: 85 },
      { type: 'MATERIAL', description: 'Refrigerant', quantity: 1, unitPrice: 45 },
    ];

    // Step 1: Create work order
    const woCreated = makeWorkOrder();
    prisma.workOrder.create.mockResolvedValue(woCreated);

    const created = await service.create(COMPANY_A, {
      customerId: 'cust-1',
      serviceType: 'HVAC_REPAIR',
      address: '123 Main St',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      latitude: 39.7392,
      longitude: -104.9903,
      scheduledStart: '2026-03-20T09:00:00Z',
      scheduledEnd: '2026-03-20T10:00:00Z',
    }, USER_ADMIN);

    expect(created.status).toBe(WorkOrderStatus.UNASSIGNED);
    expect(created.referenceNumber).toBe('WO-00001');
    expect(prisma.workOrderStatusHistory.create).toHaveBeenCalledTimes(1);
    expect(audit.logWorkOrderTransition).toHaveBeenCalledWith(
      COMPANY_A, USER_ADMIN, 'wo-1', null, WorkOrderStatus.UNASSIGNED, expect.any(Object),
    );

    // Step 2: Assign technician
    prisma.workOrder.findFirst.mockResolvedValue(makeWorkOrder());
    prisma.technician.findFirst.mockResolvedValue(tech);
    const woAssigned = makeWorkOrder({
      status: WorkOrderStatus.ASSIGNED,
      technicianId: 'tech-1',
      technician: tech,
      customer: makeCustomer(),
    });
    prisma.workOrder.update.mockResolvedValue(woAssigned);

    const assigned = await service.assign(COMPANY_A, 'wo-1', 'tech-1', USER_ADMIN);

    expect(assigned.status).toBe(WorkOrderStatus.ASSIGNED);
    expect(assigned.technicianId).toBe('tech-1');
    expect(bullmq.addJob).toHaveBeenCalledWith(
      QUEUE_NAMES.NOTIFICATIONS, 'new-assignment', expect.objectContaining({ workOrderId: 'wo-1' }),
    );

    // Step 3: Start route (EN_ROUTE)
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ status: WorkOrderStatus.ASSIGNED, technicianId: 'tech-1' }),
    );
    const woEnRoute = makeWorkOrder({
      status: WorkOrderStatus.EN_ROUTE,
      technicianId: 'tech-1',
      trackingToken: 'mock-uuid-token',
      trackingExpiresAt: new Date(Date.now() + 86400000),
    });
    prisma.workOrder.update.mockResolvedValue(woEnRoute);

    const enRoute = await service.startRoute(COMPANY_A, 'wo-1', USER_ADMIN);

    expect(enRoute.status).toBe(WorkOrderStatus.EN_ROUTE);
    expect(enRoute.trackingToken).toBe('mock-uuid-token');
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { status: 'EN_ROUTE' },
    });

    // Step 4: Arrive on site
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ status: WorkOrderStatus.EN_ROUTE, technicianId: 'tech-1' }),
    );
    const woOnSite = makeWorkOrder({ status: WorkOrderStatus.ON_SITE, technicianId: 'tech-1' });
    prisma.workOrder.update.mockResolvedValue(woOnSite);

    const onSite = await service.arrive(COMPANY_A, 'wo-1', USER_ADMIN, 39.7392, -104.9903);

    expect(onSite.status).toBe(WorkOrderStatus.ON_SITE);
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { status: 'ON_JOB' },
    });

    // Step 5: Start work
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ status: WorkOrderStatus.ON_SITE, technicianId: 'tech-1' }),
    );
    const woInProgress = makeWorkOrder({ status: WorkOrderStatus.IN_PROGRESS, technicianId: 'tech-1' });
    prisma.workOrder.update.mockResolvedValue(woInProgress);

    const inProgress = await service.startWork(COMPANY_A, 'wo-1', USER_ADMIN);

    expect(inProgress.status).toBe(WorkOrderStatus.IN_PROGRESS);

    // Step 6: Complete with line items
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ status: WorkOrderStatus.IN_PROGRESS, technicianId: 'tech-1' }),
    );
    const woCompleted = makeWorkOrder({
      status: WorkOrderStatus.COMPLETED,
      technicianId: 'tech-1',
      lineItems: lineItems.map((li, i) => ({
        id: `li-${i + 1}`,
        companyId: COMPANY_A,
        workOrderId: 'wo-1',
        ...li,
        totalPrice: li.quantity * li.unitPrice,
        sortOrder: i,
      })),
    });
    prisma.workOrder.update.mockResolvedValue(woCompleted);

    const completed = await service.complete(COMPANY_A, 'wo-1', {
      notes: 'Replaced compressor',
      lineItems,
    }, USER_ADMIN);

    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);
    expect(prisma.lineItem.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ type: 'LABOR', quantity: 2, unitPrice: 85, totalPrice: 170 }),
        expect.objectContaining({ type: 'MATERIAL', quantity: 1, unitPrice: 45, totalPrice: 45 }),
      ]),
    });
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { status: 'AVAILABLE' },
    });
    expect(bullmq.addJob).toHaveBeenCalledWith(
      QUEUE_NAMES.INVOICE_GENERATION, 'generate-invoice', expect.objectContaining({ workOrderId: 'wo-1' }),
    );

    // Step 7: Generate invoice (COMPLETED -> INVOICED)
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ status: WorkOrderStatus.COMPLETED }),
    );
    prisma.lineItem.findMany.mockResolvedValue([
      { id: 'li-1', totalPrice: 170 },
      { id: 'li-2', totalPrice: 45 },
    ]);
    const woInvoiced = makeWorkOrder({
      status: WorkOrderStatus.INVOICED,
      invoice: { id: 'inv-1', invoiceNumber: 'INV-00001', totalAmount: 233.38 },
    });
    prisma.workOrder.update.mockResolvedValue(woInvoiced);

    const invoiced = await service.generateInvoice(COMPANY_A, 'wo-1', USER_ADMIN);

    expect(invoiced.status).toBe(WorkOrderStatus.INVOICED);
    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: COMPANY_A,
          customerId: 'cust-1',
          workOrderId: 'wo-1',
          status: 'DRAFT',
        }),
      }),
    );

    // Verify invoice totals calculation: subtotal = 215, tax = 215 * 0.0875 = 18.8125, total = 233.8125
    const invoiceCreateCall = prisma.invoice.create.mock.calls[0][0];
    expect(invoiceCreateCall.data.subtotal).toBe(215);
    expect(invoiceCreateCall.data.taxAmount).toBeCloseTo(18.8125, 2);
    expect(invoiceCreateCall.data.totalAmount).toBeCloseTo(233.8125, 2);

    // Step 8: Mark as paid
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ status: WorkOrderStatus.INVOICED }),
    );
    prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', workOrderId: 'wo-1' });
    const woPaid = makeWorkOrder({ status: WorkOrderStatus.PAID });
    prisma.workOrder.update.mockResolvedValue(woPaid);

    const paid = await service.markPaid(
      COMPANY_A, 'wo-1', { stripePaymentIntentId: 'pi_live_123' }, USER_ADMIN,
    );

    expect(paid.status).toBe(WorkOrderStatus.PAID);
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: { status: 'PAID', paidAt: expect.any(Date) },
    });

    // Verify audit trail was created at each step
    expect(audit.logWorkOrderTransition).toHaveBeenCalledTimes(8);
  });

  it('should generate company-scoped sequential reference numbers', async () => {
    prisma.workOrder.count.mockResolvedValueOnce(0);
    prisma.workOrder.create.mockResolvedValue(makeWorkOrder({ referenceNumber: 'WO-00001' }));

    await service.create(COMPANY_A, {
      customerId: 'cust-1',
      serviceType: 'HVAC_REPAIR',
      address: '123 Main St',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      latitude: 39.7392,
      longitude: -104.9903,
      scheduledStart: '2026-03-20T09:00:00Z',
      scheduledEnd: '2026-03-20T10:00:00Z',
    }, USER_ADMIN);

    const createCall = prisma.workOrder.create.mock.calls[0][0];
    expect(createCall.data.referenceNumber).toBe('WO-00001');

    prisma.workOrder.count.mockResolvedValueOnce(41);
    prisma.workOrder.create.mockResolvedValue(makeWorkOrder({ referenceNumber: 'WO-00042' }));

    await service.create(COMPANY_A, {
      customerId: 'cust-1',
      serviceType: 'HVAC_REPAIR',
      address: '456 Elm St',
      city: 'Denver',
      state: 'CO',
      zipCode: '80203',
      latitude: 39.7400,
      longitude: -104.9800,
      scheduledStart: '2026-03-20T11:00:00Z',
      scheduledEnd: '2026-03-20T12:00:00Z',
    }, USER_ADMIN);

    const secondCall = prisma.workOrder.create.mock.calls[1][0];
    expect(secondCall.data.referenceNumber).toBe('WO-00042');
  });
});

// ============================================================
// 2. INVALID STATE TRANSITIONS
// ============================================================

describe('E2E: Invalid State Transitions', () => {
  let service: WorkOrderService;
  let prisma: any;
  let audit: any;
  let bullmq: any;

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      workOrderStatusHistory: { create: vi.fn().mockResolvedValue({}) },
      technician: { findFirst: vi.fn(), update: vi.fn().mockResolvedValue({}) },
      lineItem: { createMany: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
      invoice: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn().mockResolvedValue(0) },
      company: { findUnique: vi.fn().mockResolvedValue({ taxRate: 0.08 }) },
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

  const invalidTransitions: Array<{ from: WorkOrderStatus; action: string; method: string }> = [
    { from: WorkOrderStatus.UNASSIGNED, action: 'arrive', method: 'arrive' },
    { from: WorkOrderStatus.UNASSIGNED, action: 'startWork', method: 'startWork' },
    { from: WorkOrderStatus.UNASSIGNED, action: 'complete', method: 'complete' },
    { from: WorkOrderStatus.UNASSIGNED, action: 'generateInvoice', method: 'generateInvoice' },
    { from: WorkOrderStatus.UNASSIGNED, action: 'markPaid', method: 'markPaid' },
    { from: WorkOrderStatus.ASSIGNED, action: 'arrive', method: 'arrive' },
    { from: WorkOrderStatus.ASSIGNED, action: 'startWork', method: 'startWork' },
    { from: WorkOrderStatus.ASSIGNED, action: 'complete', method: 'complete' },
    { from: WorkOrderStatus.EN_ROUTE, action: 'startWork', method: 'startWork' },
    { from: WorkOrderStatus.EN_ROUTE, action: 'complete', method: 'complete' },
    { from: WorkOrderStatus.ON_SITE, action: 'assign', method: 'assign' },
    { from: WorkOrderStatus.IN_PROGRESS, action: 'assign', method: 'assign' },
    { from: WorkOrderStatus.COMPLETED, action: 'startRoute', method: 'startRoute' },
    { from: WorkOrderStatus.COMPLETED, action: 'arrive', method: 'arrive' },
    { from: WorkOrderStatus.INVOICED, action: 'startRoute', method: 'startRoute' },
    { from: WorkOrderStatus.PAID, action: 'cancel', method: 'cancel' },
    { from: WorkOrderStatus.PAID, action: 'startRoute', method: 'startRoute' },
    { from: WorkOrderStatus.CANCELLED, action: 'assign', method: 'assign' },
    { from: WorkOrderStatus.CANCELLED, action: 'startRoute', method: 'startRoute' },
  ];

  for (const { from, action, method } of invalidTransitions) {
    it(`should reject ${from} -> ${action} with 400`, async () => {
      const wo = makeWorkOrder({ status: from, technicianId: 'tech-1' });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      let promise: Promise<any>;
      switch (method) {
        case 'assign':
          promise = service.assign(COMPANY_A, 'wo-1', 'tech-1', USER_ADMIN);
          break;
        case 'startRoute':
          promise = service.startRoute(COMPANY_A, 'wo-1', USER_ADMIN);
          break;
        case 'arrive':
          promise = service.arrive(COMPANY_A, 'wo-1', USER_ADMIN);
          break;
        case 'startWork':
          promise = service.startWork(COMPANY_A, 'wo-1', USER_ADMIN);
          break;
        case 'complete':
          promise = service.complete(COMPANY_A, 'wo-1', {}, USER_ADMIN);
          break;
        case 'generateInvoice':
          promise = service.generateInvoice(COMPANY_A, 'wo-1', USER_ADMIN);
          break;
        case 'markPaid':
          promise = service.markPaid(COMPANY_A, 'wo-1', undefined, USER_ADMIN);
          break;
        case 'cancel':
          promise = service.cancel(COMPANY_A, 'wo-1', 'test', USER_ADMIN);
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }

      await expect(promise).rejects.toThrow(BadRequestException);
    });
  }

  it('should include allowed transitions in error response', async () => {
    const wo = makeWorkOrder({ status: WorkOrderStatus.UNASSIGNED });
    prisma.workOrder.findFirst.mockResolvedValue(wo);

    try {
      await service.arrive(COMPANY_A, 'wo-1', USER_ADMIN);
      expect.unreachable('Should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestException);
      const response = err.getResponse();
      expect(response.details).toBeDefined();
      expect(response.details.currentStatus).toBe(WorkOrderStatus.UNASSIGNED);
      expect(response.details.allowedTransitions).toContain(WorkOrderStatus.ASSIGNED);
      expect(response.details.allowedTransitions).toContain(WorkOrderStatus.CANCELLED);
      expect(response.details.allowedTransitions).not.toContain(WorkOrderStatus.ON_SITE);
    }
  });
});

// ============================================================
// 3. DISPATCH AUTO-ASSIGN
// ============================================================

describe('E2E: Dispatch Auto-Assign', () => {
  let dispatchService: DispatchService;
  let workOrderService: WorkOrderService;
  let prisma: any;
  let audit: any;
  let routing: any;

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn(),
      },
      workOrderStatusHistory: { create: vi.fn().mockResolvedValue({}) },
      technician: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      lineItem: { createMany: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
      invoice: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn().mockResolvedValue(0) },
      company: { findUnique: vi.fn().mockResolvedValue({ taxRate: 0.08 }) },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
      logWorkOrderTransition: vi.fn().mockResolvedValue(undefined),
      logDispatchAction: vi.fn().mockResolvedValue(undefined),
    };

    const bullmq = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    routing = {
      optimizeRoute: vi.fn().mockResolvedValue({ routes: [], unassigned: [] }),
      getDirections: vi.fn(),
    };

    // Create WorkOrderService first as DispatchService depends on it
    workOrderService = new WorkOrderService(prisma as any, audit, bullmq as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DispatchService,
          useFactory: () => new DispatchService(prisma as any, audit, workOrderService, routing as any),
        },
      ],
    }).compile();

    dispatchService = module.get<DispatchService>(DispatchService);
  });

  it('should auto-assign nearest technician with matching skills', async () => {
    // Two unassigned work orders for today
    const workOrders = [
      makeWorkOrder({ id: 'wo-1', serviceType: 'HVAC_REPAIR', latitude: 39.7392, longitude: -104.9903 }),
      makeWorkOrder({ id: 'wo-2', serviceType: 'PLUMBING_REPAIR', latitude: 39.7500, longitude: -104.9800 }),
    ];
    prisma.workOrder.findMany.mockResolvedValue(workOrders);

    // Three technicians: one HVAC nearby, one HVAC far, one plumber
    const technicians = [
      makeTechnician({
        id: 'tech-hvac-near',
        skills: ['HVAC_REPAIR', 'HVAC_INSTALL'],
        currentLatitude: 39.7400,
        currentLongitude: -104.9910,
        user: { firstName: 'Near', lastName: 'HVAC' },
      }),
      makeTechnician({
        id: 'tech-hvac-far',
        skills: ['HVAC_REPAIR'],
        currentLatitude: 39.8500,
        currentLongitude: -104.8500,
        user: { firstName: 'Far', lastName: 'HVAC' },
      }),
      makeTechnician({
        id: 'tech-plumber',
        skills: ['PLUMBING_REPAIR', 'PLUMBING_INSTALL'],
        currentLatitude: 39.7450,
        currentLongitude: -104.9850,
        user: { firstName: 'Sam', lastName: 'Plumber' },
      }),
    ];
    prisma.technician.findMany.mockResolvedValue(technicians);

    // Job counts for capacity check
    prisma.workOrder.count
      .mockResolvedValueOnce(2) // tech-hvac-near: 2 jobs
      .mockResolvedValueOnce(1) // tech-hvac-far: 1 job
      .mockResolvedValueOnce(0); // tech-plumber: 0 jobs

    // Mock the assign call
    prisma.technician.findFirst.mockImplementation(async (args: any) => {
      return technicians.find((t) => t.id === args.where.id);
    });
    prisma.workOrder.findFirst.mockImplementation(async (args: any) => {
      return workOrders.find((wo) => wo.id === args.where.id);
    });
    prisma.workOrder.update.mockImplementation(async (args: any) => {
      const wo = workOrders.find((wo) => wo.id === args.where.id);
      return { ...wo, status: WorkOrderStatus.ASSIGNED, technicianId: args.data.technicianId };
    });

    const result = await dispatchService.autoAssign(
      COMPANY_A,
      { date: '2026-03-20' },
      USER_ADMIN,
    );

    expect(result.summary.totalProcessed).toBe(2);
    expect(result.summary.assigned).toBe(2);
    expect(result.summary.unassigned).toBe(0);

    // HVAC work order should go to nearest HVAC tech
    const hvacAssignment = result.assignments.find((a) => a.workOrderId === 'wo-1');
    expect(hvacAssignment).toBeDefined();
    expect(hvacAssignment!.technicianId).toBe('tech-hvac-near');

    // Plumbing work order should go to plumber (only one with matching skill)
    const plumbingAssignment = result.assignments.find((a) => a.workOrderId === 'wo-2');
    expect(plumbingAssignment).toBeDefined();
    expect(plumbingAssignment!.technicianId).toBe('tech-plumber');
  });

  it('should leave work orders unassigned when no technicians have matching skills', async () => {
    const workOrders = [
      makeWorkOrder({ id: 'wo-1', serviceType: 'PEST_CONTROL' }),
    ];
    prisma.workOrder.findMany.mockResolvedValue(workOrders);

    // Only HVAC technicians available
    const technicians = [
      makeTechnician({ id: 'tech-1', skills: ['HVAC_REPAIR'] }),
    ];
    prisma.technician.findMany.mockResolvedValue(technicians);
    prisma.workOrder.count.mockResolvedValue(0);

    const result = await dispatchService.autoAssign(
      COMPANY_A,
      { date: '2026-03-20' },
      USER_ADMIN,
    );

    expect(result.summary.assigned).toBe(0);
    expect(result.summary.unassigned).toBe(1);
    expect(result.unassigned[0].reason).toContain('PEST_CONTROL');
  });

  it('should not assign technicians at capacity', async () => {
    const workOrders = [
      makeWorkOrder({ id: 'wo-1', serviceType: 'HVAC_REPAIR' }),
    ];
    prisma.workOrder.findMany.mockResolvedValue(workOrders);

    const technicians = [
      makeTechnician({ id: 'tech-1', skills: ['HVAC_REPAIR'], maxJobsPerDay: 3 }),
    ];
    prisma.technician.findMany.mockResolvedValue(technicians);
    // Tech already has 3 jobs (at max capacity)
    prisma.workOrder.count.mockResolvedValueOnce(3);

    const result = await dispatchService.autoAssign(
      COMPANY_A,
      { date: '2026-03-20' },
      USER_ADMIN,
    );

    expect(result.summary.assigned).toBe(0);
    expect(result.summary.unassigned).toBe(1);
    expect(result.unassigned[0].reason).toContain('capacity');
  });

  it('should support dry run without making actual assignments', async () => {
    const workOrders = [
      makeWorkOrder({ id: 'wo-1', serviceType: 'HVAC_REPAIR' }),
    ];
    prisma.workOrder.findMany.mockResolvedValue(workOrders);

    const technicians = [
      makeTechnician({ id: 'tech-1', skills: ['HVAC_REPAIR'] }),
    ];
    prisma.technician.findMany.mockResolvedValue(technicians);
    prisma.workOrder.count.mockResolvedValueOnce(0);

    const result = await dispatchService.autoAssign(
      COMPANY_A,
      { date: '2026-03-20', dryRun: true },
      USER_ADMIN,
    );

    expect(result.summary.assigned).toBe(1);
    // Should NOT have called the actual assign method (no workOrder.update calls beyond setup)
    expect(prisma.workOrder.update).not.toHaveBeenCalled();
    expect(audit.logDispatchAction).not.toHaveBeenCalled();
  });
});

// ============================================================
// 4. ROUTE OPTIMIZATION
// ============================================================

describe('E2E: Route Optimization', () => {
  let routeService: RouteService;
  let prisma: any;
  let routing: any;
  let redis: any;

  beforeEach(async () => {
    prisma = {
      route: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
      },
      routeStop: {
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
      },
      technician: {
        findMany: vi.fn(),
      },
      workOrder: {
        findMany: vi.fn(),
      },
    };

    routing = {
      optimizeRoute: vi.fn(),
      getDirections: vi.fn(),
    };

    redis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
        { provide: RoutingService, useValue: routing },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    routeService = module.get<RouteService>(RouteService);
  });

  it('should create a route with ordered stops', async () => {
    const routeRecord = {
      id: 'route-1',
      companyId: COMPANY_A,
      technicianId: 'tech-1',
      date: new Date('2026-03-20'),
      optimized: false,
      totalDistanceMeters: null,
      totalDurationSeconds: null,
      geometryJson: null,
    };

    prisma.route.create.mockResolvedValue(routeRecord);

    // Mock get() to return the full route with stops
    prisma.route.findFirst.mockResolvedValue({
      ...routeRecord,
      stops: [
        { id: 'stop-1', routeId: 'route-1', workOrderId: 'wo-1', sortOrder: 0, workOrder: makeWorkOrder({ id: 'wo-1' }), customer: makeCustomer() },
        { id: 'stop-2', routeId: 'route-1', workOrderId: 'wo-2', sortOrder: 1, workOrder: makeWorkOrder({ id: 'wo-2' }), customer: makeCustomer() },
        { id: 'stop-3', routeId: 'route-1', workOrderId: 'wo-3', sortOrder: 2, workOrder: makeWorkOrder({ id: 'wo-3' }), customer: makeCustomer() },
      ],
      technician: {
        ...makeTechnician(),
        user: { firstName: 'John', lastName: 'Doe' },
      },
    });

    const result = await routeService.create(
      COMPANY_A,
      'tech-1',
      '2026-03-20',
      ['wo-1', 'wo-2', 'wo-3'],
    );

    expect(result.stops).toHaveLength(3);
    expect(result.stops[0].sortOrder).toBe(0);
    expect(result.stops[1].sortOrder).toBe(1);
    expect(result.stops[2].sortOrder).toBe(2);

    // Verify stops were created in order
    expect(prisma.routeStop.create).toHaveBeenCalledTimes(3);
    const firstStopCall = prisma.routeStop.create.mock.calls[0][0];
    expect(firstStopCall.data.workOrderId).toBe('wo-1');
    expect(firstStopCall.data.sortOrder).toBe(0);
  });

  it('should optimize a route and reorder stops', async () => {
    // Route with 3 stops in original order
    const routeWithStops = {
      id: 'route-1',
      companyId: COMPANY_A,
      technicianId: 'tech-1',
      optimized: false,
      stops: [
        { workOrderId: 'wo-1', workOrder: makeWorkOrder({ id: 'wo-1', latitude: 39.7392, longitude: -104.9903, estimatedMinutes: 60 }) },
        { workOrderId: 'wo-2', workOrder: makeWorkOrder({ id: 'wo-2', latitude: 39.7500, longitude: -104.9800, estimatedMinutes: 45 }) },
        { workOrderId: 'wo-3', workOrder: makeWorkOrder({ id: 'wo-3', latitude: 39.7600, longitude: -104.9700, estimatedMinutes: 30 }) },
      ],
      technician: makeTechnician(),
    };

    prisma.route.findFirst
      .mockResolvedValueOnce(routeWithStops) // first call for optimize
      .mockResolvedValueOnce({ // second call for get (return optimized)
        ...routeWithStops,
        optimized: true,
        totalDistanceMeters: 5200,
        totalDurationSeconds: 480,
        stops: [
          { id: 'stop-1', routeId: 'route-1', workOrderId: 'wo-3', sortOrder: 0, workOrder: makeWorkOrder({ id: 'wo-3' }), customer: makeCustomer() },
          { id: 'stop-2', routeId: 'route-1', workOrderId: 'wo-1', sortOrder: 1, workOrder: makeWorkOrder({ id: 'wo-1' }), customer: makeCustomer() },
          { id: 'stop-3', routeId: 'route-1', workOrderId: 'wo-2', sortOrder: 2, workOrder: makeWorkOrder({ id: 'wo-2' }), customer: makeCustomer() },
        ],
        technician: {
          ...makeTechnician(),
          user: { firstName: 'John', lastName: 'Doe' },
        },
      });

    // Mock optimization result: reorder to wo-3, wo-1, wo-2
    routing.optimizeRoute.mockResolvedValue({
      routes: [{
        vehicleId: 'tech-1',
        steps: [
          { type: 'start', arrival: 0, duration: 0, distanceMeters: 0, location: [-104.9910, 39.7400] },
          { type: 'job', jobId: 'wo-3', arrival: 120, duration: 1800, distanceMeters: 1200, location: [-104.9700, 39.7600] },
          { type: 'job', jobId: 'wo-1', arrival: 480, duration: 3600, distanceMeters: 2000, location: [-104.9903, 39.7392] },
          { type: 'job', jobId: 'wo-2', arrival: 900, duration: 2700, distanceMeters: 2000, location: [-104.9800, 39.7500] },
          { type: 'end', arrival: 1200, duration: 0, distanceMeters: 0, location: [-104.9910, 39.7400] },
        ],
        distanceMeters: 5200,
        durationSeconds: 1200,
      }],
      unassigned: [],
    });

    const result = await routeService.optimize(COMPANY_A, 'route-1');

    expect(result.stops).toHaveLength(3);
    // Verify the route was updated as optimized
    expect(prisma.route.update).toHaveBeenCalledWith({
      where: { id: 'route-1' },
      data: expect.objectContaining({
        optimized: true,
        totalDistanceMeters: 5200,
      }),
    });
    // Verify old stops were deleted and new ones created
    expect(prisma.routeStop.deleteMany).toHaveBeenCalledWith({ where: { routeId: 'route-1' } });
    // 3 new stops created with optimized order
    expect(prisma.routeStop.create).toHaveBeenCalledTimes(3);
  });
});

// ============================================================
// 5. CUSTOMER TRACKING PORTAL
// ============================================================

describe('E2E: Customer Tracking Portal', () => {
  let portalService: CustomerPortalService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      magicLink: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      customer: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPortalService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    portalService = module.get<CustomerPortalService>(CustomerPortalService);
  });

  it('should generate a tracking token with 24h expiry', async () => {
    const wo = makeWorkOrder();
    prisma.workOrder.findFirst.mockResolvedValue(wo);
    prisma.workOrder.update.mockResolvedValue(wo);

    const result = await portalService.generateTrackingToken(COMPANY_A, {
      workOrderId: 'wo-1',
    });

    expect(result.token).toBe('mock-uuid-token');
    expect(result.expiresAt).toBeInstanceOf(Date);
    const hoursUntilExpiry = (result.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
    expect(hoursUntilExpiry).toBeGreaterThan(23);
    expect(hoursUntilExpiry).toBeLessThanOrEqual(24.1);
  });

  it('should generate a tracking token with custom expiry', async () => {
    const wo = makeWorkOrder();
    prisma.workOrder.findFirst.mockResolvedValue(wo);
    prisma.workOrder.update.mockResolvedValue(wo);

    const result = await portalService.generateTrackingToken(COMPANY_A, {
      workOrderId: 'wo-1',
      expiryHours: 48,
    });

    const hoursUntilExpiry = (result.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
    expect(hoursUntilExpiry).toBeGreaterThan(47);
    expect(hoursUntilExpiry).toBeLessThanOrEqual(48.1);
  });

  it('should return tracking data via token (public, no auth)', async () => {
    const trackingData = {
      id: 'wo-1',
      status: WorkOrderStatus.EN_ROUTE,
      serviceType: 'HVAC_REPAIR',
      address: '123 Main St',
      scheduledStart: new Date('2026-03-20T09:00:00Z'),
      scheduledEnd: new Date('2026-03-20T10:00:00Z'),
      trackingToken: 'valid-token',
      trackingExpiresAt: new Date(Date.now() + 86400000),
      technician: {
        id: 'tech-1',
        currentLatitude: 39.7400,
        currentLongitude: -104.9910,
        user: { firstName: 'John', lastName: 'Doe' },
      },
      company: {
        name: 'ACME Services',
        logoUrl: 'https://acme.com/logo.png',
        phone: '(303) 555-0000',
      },
      statusHistory: [
        { fromStatus: 'ASSIGNED', toStatus: 'EN_ROUTE', createdAt: new Date(), notes: 'Technician started route' },
        { fromStatus: null, toStatus: 'UNASSIGNED', createdAt: new Date(), notes: 'Work order created' },
      ],
      routeStops: [
        { estimatedArrival: new Date('2026-03-20T09:30:00Z'), sortOrder: 0 },
      ],
    };

    prisma.workOrder.findFirst.mockResolvedValue(trackingData);

    const result = await portalService.getTrackingData('valid-token');

    expect(result.workOrderId).toBe('wo-1');
    expect(result.status).toBe(WorkOrderStatus.EN_ROUTE);
    expect(result.technicianName).toBe('John Doe');
    expect(result.technicianLatitude).toBe(39.7400);
    expect(result.technicianLongitude).toBe(-104.9910);
    expect(result.companyName).toBe('ACME Services');
    expect(result.statusHistory).toHaveLength(2);
    expect(result.estimatedArrival).toBeInstanceOf(Date);
  });

  it('should reject expired tracking tokens', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);

    await expect(
      portalService.getTrackingData('expired-token'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject non-existent tracking tokens', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);

    await expect(
      portalService.getTrackingData('non-existent-token'),
    ).rejects.toThrow(NotFoundException);
  });
});

// ============================================================
// 6. INVOICE GENERATION
// ============================================================

describe('E2E: Invoice Generation', () => {
  let invoiceService: InvoiceService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
      },
      invoice: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      company: {
        findUnique: vi.fn(),
      },
      lineItem: {
        findMany: vi.fn(),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    invoiceService = module.get<InvoiceService>(InvoiceService);
  });

  it('should generate invoice with correct subtotal, tax, and total', async () => {
    const lineItems = [
      { id: 'li-1', type: 'LABOR', description: 'HVAC repair', quantity: 2, unitPrice: 85, totalPrice: 170, sortOrder: 0 },
      { id: 'li-2', type: 'MATERIAL', description: 'Refrigerant', quantity: 1, unitPrice: 45, totalPrice: 45, sortOrder: 1 },
      { id: 'li-3', type: 'MATERIAL', description: 'Filter', quantity: 2, unitPrice: 15, totalPrice: 30, sortOrder: 2 },
    ];

    const wo = {
      ...makeWorkOrder({ status: WorkOrderStatus.COMPLETED }),
      lineItems,
      invoice: null,
    };

    prisma.workOrder.findFirst.mockResolvedValue(wo);
    prisma.company.findUnique.mockResolvedValue({ taxRate: 0.0875 }); // 8.75%
    prisma.invoice.create.mockImplementation(async (args: any) => ({
      id: 'inv-1',
      ...args.data,
      lineItems,
      customer: makeCustomer(),
      workOrder: wo,
    }));

    const result = await invoiceService.generate(COMPANY_A, 'wo-1', USER_ADMIN);

    // subtotal = 170 + 45 + 30 = 245
    // tax = 245 * 0.0875 = 21.4375
    // total = 245 + 21.4375 = 266.4375
    expect(result.subtotal).toBe(245);
    expect(result.taxAmount).toBeCloseTo(21.4375, 2);
    expect(result.totalAmount).toBeCloseTo(266.4375, 2);
    expect(result.invoiceNumber).toBe('INV-00001');
    expect(result.status).toBe('DRAFT');
  });

  it('should reject invoice generation without line items', async () => {
    const wo = {
      ...makeWorkOrder({ status: WorkOrderStatus.COMPLETED }),
      lineItems: [],
      invoice: null,
    };

    prisma.workOrder.findFirst.mockResolvedValue(wo);

    await expect(
      invoiceService.generate(COMPANY_A, 'wo-1', USER_ADMIN),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject duplicate invoice for same work order', async () => {
    const wo = {
      ...makeWorkOrder({ status: WorkOrderStatus.COMPLETED }),
      lineItems: [{ id: 'li-1', totalPrice: 100 }],
      invoice: { id: 'inv-1' }, // already has invoice
    };

    prisma.workOrder.findFirst.mockResolvedValue(wo);

    await expect(
      invoiceService.generate(COMPANY_A, 'wo-1', USER_ADMIN),
    ).rejects.toThrow(BadRequestException);
  });

  it('should only allow editing DRAFT invoices', async () => {
    // SENT invoice should be immutable
    prisma.invoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      companyId: COMPANY_A,
      status: 'SENT',
    });

    await expect(
      invoiceService.update(COMPANY_A, 'inv-1', { notes: 'Updated' }, USER_ADMIN),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow editing DRAFT invoices', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      companyId: COMPANY_A,
      status: 'DRAFT',
    });
    prisma.invoice.update.mockResolvedValue({
      id: 'inv-1',
      status: 'DRAFT',
      notes: 'Additional notes',
      lineItems: [],
      customer: makeCustomer(),
    });

    const result = await invoiceService.update(
      COMPANY_A, 'inv-1', { notes: 'Additional notes' }, USER_ADMIN,
    );

    expect(result.notes).toBe('Additional notes');
  });

  it('should reject marking already-paid invoice as paid', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      companyId: COMPANY_A,
      status: 'PAID',
    });

    await expect(
      invoiceService.markPaid(COMPANY_A, 'inv-1', undefined, USER_ADMIN),
    ).rejects.toThrow(BadRequestException);
  });

  it('should generate company-scoped invoice numbers', async () => {
    prisma.invoice.count.mockResolvedValueOnce(0);

    const lineItems = [
      { id: 'li-1', totalPrice: 100 },
    ];

    prisma.workOrder.findFirst.mockResolvedValue({
      ...makeWorkOrder({ status: WorkOrderStatus.COMPLETED }),
      lineItems,
      invoice: null,
    });
    prisma.company.findUnique.mockResolvedValue({ taxRate: 0 });
    prisma.invoice.create.mockImplementation(async (args: any) => ({
      id: 'inv-1',
      ...args.data,
      lineItems,
      customer: makeCustomer(),
      workOrder: makeWorkOrder(),
    }));

    const result = await invoiceService.generate(COMPANY_A, 'wo-1', USER_ADMIN);
    expect(result.invoiceNumber).toBe('INV-00001');
  });
});

// ============================================================
// 7. AUTH FLOW
// ============================================================

describe('E2E: Auth Flow', () => {
  let authService: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
      company: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      refreshToken: {
        create: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({}),
      },
      customer: {
        findUnique: vi.fn(),
      },
      magicLink: {
        create: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should register a new company with admin user', async () => {
    prisma.user.findFirst.mockResolvedValue(null); // no existing user
    prisma.company.findUnique.mockResolvedValue(null); // no existing company
    prisma.company.create.mockResolvedValue({
      id: COMPANY_A,
      name: 'ACME Services',
      slug: 'acme-services',
      users: [{
        id: USER_ADMIN,
        companyId: COMPANY_A,
        email: 'admin@acme.com',
        role: 'ADMIN',
      }],
    });

    const result = await authService.register({
      companyName: 'ACME Services',
      email: 'admin@acme.com',
      password: 'ValidPass123!',
      firstName: 'Admin',
      lastName: 'User',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.refreshToken).toBe('mock-uuid-token');
    expect(result.expiresIn).toBe(86400);

    // Verify company was created with correct slug
    const companyCall = prisma.company.create.mock.calls[0][0];
    expect(companyCall.data.slug).toBe('acme-services');
    expect(companyCall.data.users.create.role).toBe('ADMIN');
  });

  it('should reject registration with existing email', async () => {
    prisma.user.findFirst.mockResolvedValue(makeUser());

    await expect(
      authService.register({
        companyName: 'New Company',
        email: 'admin@acme.com',
        password: 'ValidPass123!',
        firstName: 'Admin',
        lastName: 'User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject registration with existing company slug', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.company.findUnique.mockResolvedValue({ id: 'existing', slug: 'acme-services' });

    await expect(
      authService.register({
        companyName: 'ACME Services',
        email: 'new@acme.com',
        password: 'ValidPass123!',
        firstName: 'New',
        lastName: 'User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login with valid credentials', async () => {
    const user = makeUser();
    prisma.user.findFirst.mockResolvedValue(user);

    const result = await authService.login({
      email: 'admin@acme.com',
      password: 'ValidPass123!',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.refreshToken).toBe('mock-uuid-token');

    // Verify JWT payload contains correct claims
    const signCall = jwtService.sign.mock.calls[0];
    expect(signCall[0]).toEqual({
      sub: USER_ADMIN,
      companyId: COMPANY_A,
      role: 'ADMIN',
      email: 'admin@acme.com',
    });
  });

  it('should reject login with invalid password', async () => {
    const user = makeUser();
    prisma.user.findFirst.mockResolvedValue(user);

    await expect(
      authService.login({
        email: 'admin@acme.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login with non-existent email', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nobody@nowhere.com',
        password: 'ValidPass123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should refresh tokens and rotate refresh token', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'old-refresh-token',
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      user: {
        id: USER_ADMIN,
        companyId: COMPANY_A,
        role: 'ADMIN',
        email: 'admin@acme.com',
        isActive: true,
      },
    });

    const result = await authService.refresh({
      refreshToken: 'old-refresh-token',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    // Old token should be revoked
    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('should reject expired refresh tokens', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 86400000), // expired yesterday
      revokedAt: null,
      user: {
        id: USER_ADMIN,
        companyId: COMPANY_A,
        role: 'ADMIN',
        email: 'admin@acme.com',
        isActive: true,
      },
    });

    await expect(
      authService.refresh({ refreshToken: 'expired-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject revoked refresh tokens', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'revoked-token',
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: new Date(), // already revoked
      user: {
        id: USER_ADMIN,
        companyId: COMPANY_A,
        role: 'ADMIN',
        email: 'admin@acme.com',
        isActive: true,
      },
    });

    await expect(
      authService.refresh({ refreshToken: 'revoked-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject refresh for inactive user', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      user: {
        id: USER_ADMIN,
        companyId: COMPANY_A,
        role: 'ADMIN',
        email: 'admin@acme.com',
        isActive: false,
      },
    });

    await expect(
      authService.refresh({ refreshToken: 'valid-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should logout by revoking refresh token', async () => {
    await authService.logout('some-refresh-token');

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { token: 'some-refresh-token', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});

// ============================================================
// 8. TENANT ISOLATION
// ============================================================

describe('E2E: Tenant Isolation', () => {
  let workOrderService: WorkOrderService;
  let invoiceService: InvoiceService;
  let portalService: CustomerPortalService;
  let prisma: any;
  let audit: any;
  let bullmq: any;

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      workOrderStatusHistory: { create: vi.fn().mockResolvedValue({}) },
      technician: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      lineItem: { createMany: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
      invoice: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      company: { findUnique: vi.fn() },
      magicLink: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
      customer: { findFirst: vi.fn() },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
      logWorkOrderTransition: vi.fn().mockResolvedValue(undefined),
      logDispatchAction: vi.fn().mockResolvedValue(undefined),
    };

    bullmq = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        InvoiceService,
        CustomerPortalService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: BullMqService, useValue: bullmq },
      ],
    }).compile();

    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    invoiceService = module.get<InvoiceService>(InvoiceService);
    portalService = module.get<CustomerPortalService>(CustomerPortalService);
  });

  it('should not return company A work order when queried by company B', async () => {
    // Work order belongs to company A
    prisma.workOrder.findFirst.mockResolvedValue(null); // query includes companyId filter

    await expect(
      workOrderService.get(COMPANY_B, 'wo-belongs-to-a'),
    ).rejects.toThrow(NotFoundException);

    // Verify companyId was included in query
    expect(prisma.workOrder.findFirst).toHaveBeenCalledWith({
      where: { id: 'wo-belongs-to-a', companyId: COMPANY_B },
      include: expect.any(Object),
    });
  });

  it('should scope work order list to company', async () => {
    prisma.workOrder.findMany.mockResolvedValue([]);
    prisma.workOrder.count.mockResolvedValue(0);

    await workOrderService.list(COMPANY_B, { page: 1, pageSize: 10 });

    expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: COMPANY_B }),
      }),
    );
  });

  it('should not allow company B user to assign company A technician', async () => {
    // Work order exists in company B
    prisma.workOrder.findFirst.mockResolvedValue(
      makeWorkOrder({ companyId: COMPANY_B }),
    );
    // But technician is in company A (not found when queried with companyB)
    prisma.technician.findFirst.mockResolvedValue(null);

    await expect(
      workOrderService.assign(COMPANY_B, 'wo-1', 'tech-from-company-a', 'user-b'),
    ).rejects.toThrow(BadRequestException);

    // Verify the technician query included companyId
    expect(prisma.technician.findFirst).toHaveBeenCalledWith({
      where: { id: 'tech-from-company-a', companyId: COMPANY_B },
      include: expect.any(Object),
    });
  });

  it('should not allow company B to access company A invoice', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);

    await expect(
      invoiceService.get(COMPANY_B, 'inv-belongs-to-a'),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
      where: { id: 'inv-belongs-to-a', companyId: COMPANY_B },
      include: expect.any(Object),
    });
  });

  it('should not allow company B to generate tracking token for company A work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);

    await expect(
      portalService.generateTrackingToken(COMPANY_B, { workOrderId: 'wo-belongs-to-a' }),
    ).rejects.toThrow(NotFoundException);
  });
});

// ============================================================
// 9. GPS GATEWAY & HISTORY
// ============================================================

describe('E2E: GPS History Service', () => {
  let gpsHistoryService: GpsHistoryService;
  let prisma: any;
  let bullmq: any;

  beforeEach(async () => {
    prisma = {
      technicianPosition: {
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const mockQueue = {
      add: vi.fn().mockResolvedValue({}),
    };

    bullmq = {
      getQueue: vi.fn().mockReturnValue(mockQueue),
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    // Create directly without module init to avoid timers
    gpsHistoryService = new GpsHistoryService(prisma as any, bullmq as any);
  });

  afterEach(() => {
    // Clean up any timers
    gpsHistoryService.onModuleDestroy();
  });

  it('should buffer GPS positions and batch insert on flush', async () => {
    // Add 5 positions
    for (let i = 0; i < 5; i++) {
      gpsHistoryService.addPosition({
        companyId: COMPANY_A,
        technicianId: 'tech-1',
        latitude: 39.7392 + i * 0.001,
        longitude: -104.9903,
        accuracy: 10,
        heading: 90,
        speed: 30,
        recordedAt: new Date(),
      });
    }

    expect(gpsHistoryService.getBufferSize()).toBe(5);

    prisma.technicianPosition.createMany.mockResolvedValue({ count: 5 });

    const flushed = await gpsHistoryService.flush();

    expect(flushed).toBe(5);
    expect(gpsHistoryService.getBufferSize()).toBe(0);
    expect(prisma.technicianPosition.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          companyId: COMPANY_A,
          technicianId: 'tech-1',
        }),
      ]),
    });
  });

  it('should auto-flush when buffer reaches batch size (50)', async () => {
    prisma.technicianPosition.createMany.mockResolvedValue({ count: 50 });

    for (let i = 0; i < 50; i++) {
      gpsHistoryService.addPosition({
        companyId: COMPANY_A,
        technicianId: 'tech-1',
        latitude: 39.7392,
        longitude: -104.9903,
        accuracy: 10,
        heading: null,
        speed: null,
        recordedAt: new Date(),
      });
    }

    // createMany should have been called since we hit the batch size
    expect(prisma.technicianPosition.createMany).toHaveBeenCalled();
  });

  it('should purge positions older than retention period', async () => {
    prisma.technicianPosition.deleteMany.mockResolvedValue({ count: 1500 });

    const purged = await gpsHistoryService.purgeOldPositions(90);

    expect(purged).toBe(1500);
    expect(prisma.technicianPosition.deleteMany).toHaveBeenCalledWith({
      where: {
        recordedAt: { lt: expect.any(Date) },
      },
    });

    // Verify the cutoff date is approximately 90 days ago
    const deleteCall = prisma.technicianPosition.deleteMany.mock.calls[0][0];
    const cutoff = deleteCall.where.recordedAt.lt;
    const daysAgo = (Date.now() - cutoff.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysAgo).toBeCloseTo(90, 0);
  });

  it('should return empty on flush with no buffered data', async () => {
    const flushed = await gpsHistoryService.flush();
    expect(flushed).toBe(0);
    expect(prisma.technicianPosition.createMany).not.toHaveBeenCalled();
  });

  it('should restore buffer on batch insert failure', async () => {
    // Add some positions
    for (let i = 0; i < 3; i++) {
      gpsHistoryService.addPosition({
        companyId: COMPANY_A,
        technicianId: 'tech-1',
        latitude: 39.7392,
        longitude: -104.9903,
        accuracy: 10,
        heading: null,
        speed: null,
        recordedAt: new Date(),
      });
    }

    // Simulate DB failure
    prisma.technicianPosition.createMany.mockRejectedValue(new Error('DB connection lost'));

    const flushed = await gpsHistoryService.flush();

    expect(flushed).toBe(0);
    // Buffer should be restored for retry
    expect(gpsHistoryService.getBufferSize()).toBe(3);
  });

  it('should query recent positions within time window', async () => {
    const positions = [
      { latitude: 39.7392, longitude: -104.9903, accuracy: 10, heading: 90, speed: 30, recordedAt: new Date() },
      { latitude: 39.7400, longitude: -104.9910, accuracy: 10, heading: 91, speed: 35, recordedAt: new Date() },
    ];
    prisma.technicianPosition.findMany.mockResolvedValue(positions);

    const result = await gpsHistoryService.getRecentPositions(COMPANY_A, 'tech-1', 8, 500);

    expect(result).toHaveLength(2);
    expect(prisma.technicianPosition.findMany).toHaveBeenCalledWith({
      where: {
        companyId: COMPANY_A,
        technicianId: 'tech-1',
        recordedAt: { gte: expect.any(Date) },
      },
      orderBy: { recordedAt: 'asc' },
      take: 500,
      select: expect.any(Object),
    });
  });
});

// ============================================================
// 10. ROUTING SERVICE (Mock mode)
// ============================================================

describe('E2E: Routing Service (Mock)', () => {
  let routingService: RoutingService;
  let redis: any;

  beforeEach(async () => {
    redis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };

    // RoutingService reads from env, no ORS key = mock mode
    delete process.env.OPENROUTESERVICE_API_KEY;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutingService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    routingService = module.get<RoutingService>(RoutingService);
  });

  it('should calculate mock directions between two waypoints', async () => {
    const result = await routingService.getDirections([
      { latitude: 39.7392, longitude: -104.9903 },
      { latitude: 39.7500, longitude: -104.9800 },
    ]);

    expect(result.distanceMeters).toBeGreaterThan(0);
    expect(result.durationSeconds).toBeGreaterThan(0);
    expect(result.geometry).toBeDefined();
    expect(result.geometry.type).toBe('LineString');
    expect(result.geometry.coordinates).toHaveLength(2);
    expect(result.steps).toHaveLength(1);
  });

  it('should cache directions result in Redis', async () => {
    await routingService.getDirections([
      { latitude: 39.7392, longitude: -104.9903 },
      { latitude: 39.7500, longitude: -104.9800 },
    ]);

    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining('route:directions:'),
      expect.any(String),
      3600,
    );
  });

  it('should return cached result on second call', async () => {
    const cachedResult = {
      distanceMeters: 1500,
      durationSeconds: 135,
      geometry: { type: 'LineString', coordinates: [] },
      steps: [],
    };

    redis.get.mockResolvedValue(JSON.stringify(cachedResult));

    const result = await routingService.getDirections([
      { latitude: 39.7392, longitude: -104.9903 },
      { latitude: 39.7500, longitude: -104.9800 },
    ]);

    expect(result.distanceMeters).toBe(1500);
    // Should not call set again (used cache)
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should optimize route for multiple jobs', async () => {
    const result = await routingService.optimizeRoute(
      [
        { id: 'job-1', location: [-104.9903, 39.7392], service: 3600 },
        { id: 'job-2', location: [-104.9800, 39.7500], service: 2700 },
        { id: 'job-3', location: [-104.9700, 39.7600], service: 1800 },
      ],
      [
        { id: 'vehicle-1', start: [-104.9910, 39.7400], end: [-104.9910, 39.7400] },
      ],
    );

    expect(result.routes).toHaveLength(1);
    expect(result.unassigned).toHaveLength(0);

    const route = result.routes[0];
    expect(route.vehicleId).toBe('vehicle-1');
    // Should have start + 3 jobs + end = 5 steps
    expect(route.steps).toHaveLength(5);
    expect(route.steps[0].type).toBe('start');
    expect(route.steps[1].type).toBe('job');
    expect(route.steps[2].type).toBe('job');
    expect(route.steps[3].type).toBe('job');
    expect(route.steps[4].type).toBe('end');
    expect(route.distanceMeters).toBeGreaterThan(0);
  });

  it('should require at least 2 waypoints for directions', async () => {
    await expect(
      routingService.getDirections([{ latitude: 39.7392, longitude: -104.9903 }]),
    ).rejects.toThrow('At least 2 waypoints required');
  });

  it('should return empty result for no jobs', async () => {
    const result = await routingService.optimizeRoute([], []);

    expect(result.routes).toHaveLength(0);
    expect(result.unassigned).toHaveLength(0);
  });
});

// ============================================================
// 11. STATE TRANSITION MATRIX COMPLETENESS
// ============================================================

describe('E2E: State Transition Matrix', () => {
  it('should define transitions for all work order statuses', () => {
    const allStatuses = Object.values(WorkOrderStatus);

    for (const status of allStatuses) {
      expect(WORK_ORDER_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(WORK_ORDER_TRANSITIONS[status])).toBe(true);
    }
  });

  it('PAID should be a terminal state (no outgoing transitions)', () => {
    expect(WORK_ORDER_TRANSITIONS[WorkOrderStatus.PAID]).toHaveLength(0);
  });

  it('CANCELLED should be a terminal state (no outgoing transitions)', () => {
    expect(WORK_ORDER_TRANSITIONS[WorkOrderStatus.CANCELLED]).toHaveLength(0);
  });

  it('CANCELLED should be reachable from non-terminal states (except PAID)', () => {
    const nonTerminal = [
      WorkOrderStatus.UNASSIGNED,
      WorkOrderStatus.ASSIGNED,
      WorkOrderStatus.EN_ROUTE,
      WorkOrderStatus.ON_SITE,
      WorkOrderStatus.IN_PROGRESS,
      WorkOrderStatus.COMPLETED,
      WorkOrderStatus.INVOICED,
    ];

    for (const status of nonTerminal) {
      expect(WORK_ORDER_TRANSITIONS[status]).toContain(WorkOrderStatus.CANCELLED);
    }
  });

  it('should have a valid forward path from UNASSIGNED to PAID', () => {
    const path = [
      WorkOrderStatus.UNASSIGNED,
      WorkOrderStatus.ASSIGNED,
      WorkOrderStatus.EN_ROUTE,
      WorkOrderStatus.ON_SITE,
      WorkOrderStatus.IN_PROGRESS,
      WorkOrderStatus.COMPLETED,
      WorkOrderStatus.INVOICED,
      WorkOrderStatus.PAID,
    ];

    for (let i = 0; i < path.length - 1; i++) {
      expect(WORK_ORDER_TRANSITIONS[path[i]]).toContain(path[i + 1]);
    }
  });
});
