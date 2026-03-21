// TRACED:TS-001 Integration tests use real DB, not Prisma mocks
// TRACED:TS-002 Integration tests in backend/test/ directory

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WorkOrderModule } from '../src/work-order/work-order.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WorkOrderService } from '../src/work-order/work-order.service';

describe('WorkOrderService Integration', () => {
  let module: TestingModule;
  let workOrderService: WorkOrderService;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [WorkOrderModule, PrismaModule],
    }).compile();

    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);

    // Create real test data in the database
    const company = await prisma.company.create({
      data: { name: 'Integration Test Company' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        address: '123 Test St',
        companyId,
      },
    });
    customerId = customer.id;

    const user = await prisma.user.create({
      data: {
        email: `wo-test-${Date.now()}@test.com`,
        passwordHash: 'hashed',
        role: 'TECHNICIAN',
        companyId,
      },
    });

    const technician = await prisma.technician.create({
      data: {
        name: 'Test Technician',
        userId: user.id,
        companyId,
      },
    });
    technicianId = technician.id;
  });

  afterAll(async () => {
    // Clean up in reverse dependency order
    await prisma.invoice.deleteMany({ where: { companyId } });
    await prisma.workOrder.deleteMany({ where: { companyId } });
    await prisma.route.deleteMany({ where: { companyId } });
    await prisma.gpsEvent.deleteMany({ where: { companyId } });
    await prisma.technician.deleteMany({ where: { companyId } });
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.user.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await module.close();
  });

  it('should create a work order with OPEN status', async () => {
    const result = await workOrderService.create(
      {
        title: 'Fix HVAC Unit',
        description: 'AC not cooling properly',
        priority: 'HIGH',
        customerId,
      },
      companyId,
    );

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Fix HVAC Unit');
    expect(result.status).toBe('OPEN');
    expect(result.priority).toBe('HIGH');
    expect(result.companyId).toBe(companyId);
    expect(result.customerId).toBe(customerId);
  });

  it('should list work orders for a company', async () => {
    const results = await workOrderService.findAll(companyId);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].companyId).toBe(companyId);
    expect(results[0].customer).toBeDefined();
  });

  it('should find a work order by ID', async () => {
    const created = await workOrderService.create(
      {
        title: 'Plumbing Repair',
        priority: 'MEDIUM',
        customerId,
      },
      companyId,
    );

    const found = await workOrderService.findOne(created.id, companyId);
    expect(found.id).toBe(created.id);
    expect(found.title).toBe('Plumbing Repair');
  });

  it('should throw NotFoundException for non-existent work order', async () => {
    await expect(
      workOrderService.findOne(
        '00000000-0000-0000-0000-000000000000',
        companyId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a work order', async () => {
    const created = await workOrderService.create(
      {
        title: 'Original Title',
        priority: 'LOW',
        customerId,
      },
      companyId,
    );

    const updated = await workOrderService.update(
      created.id,
      { title: 'Updated Title', priority: 'URGENT' },
      companyId,
    );

    expect(updated.title).toBe('Updated Title');
    expect(updated.priority).toBe('URGENT');
  });

  it('should assign a technician and transition to ASSIGNED', async () => {
    const created = await workOrderService.create(
      {
        title: 'Electrical Work',
        priority: 'HIGH',
        customerId,
      },
      companyId,
    );

    const assigned = await workOrderService.assign(
      created.id,
      { technicianId },
      companyId,
    );

    expect(assigned.status).toBe('ASSIGNED');
    expect(assigned.technicianId).toBe(technicianId);
    expect(assigned.technician).toBeDefined();
  });

  it('should follow the full state machine lifecycle', async () => {
    // Create work order (OPEN)
    const wo = await workOrderService.create(
      {
        title: 'Full Lifecycle Test',
        priority: 'MEDIUM',
        customerId,
      },
      companyId,
    );
    expect(wo.status).toBe('OPEN');

    // Assign technician (OPEN → ASSIGNED)
    const assigned = await workOrderService.assign(
      wo.id,
      { technicianId },
      companyId,
    );
    expect(assigned.status).toBe('ASSIGNED');

    // Start work (ASSIGNED → IN_PROGRESS)
    const inProgress = await workOrderService.updateStatus(
      wo.id,
      { status: 'IN_PROGRESS' },
      companyId,
    );
    expect(inProgress.status).toBe('IN_PROGRESS');

    // Complete work (IN_PROGRESS → COMPLETED)
    const completed = await workOrderService.updateStatus(
      wo.id,
      { status: 'COMPLETED' },
      companyId,
    );
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedDate).toBeDefined();
  });

  it('should reject invalid state transitions', async () => {
    const wo = await workOrderService.create(
      {
        title: 'Invalid Transition Test',
        priority: 'LOW',
        customerId,
      },
      companyId,
    );

    // OPEN → IN_PROGRESS is not valid (must go through ASSIGNED first)
    await expect(
      workOrderService.updateStatus(
        wo.id,
        { status: 'IN_PROGRESS' },
        companyId,
      ),
    ).rejects.toThrow(ConflictException);

    // OPEN → COMPLETED is not valid
    await expect(
      workOrderService.updateStatus(
        wo.id,
        { status: 'COMPLETED' },
        companyId,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should allow cancellation from any state', async () => {
    const wo = await workOrderService.create(
      {
        title: 'Cancel Test',
        priority: 'LOW',
        customerId,
      },
      companyId,
    );

    const cancelled = await workOrderService.updateStatus(
      wo.id,
      { status: 'CANCELLED' },
      companyId,
    );
    expect(cancelled.status).toBe('CANCELLED');
  });

  it('should reject assignment on non-OPEN work orders', async () => {
    const wo = await workOrderService.create(
      {
        title: 'Already Assigned Test',
        priority: 'MEDIUM',
        customerId,
      },
      companyId,
    );

    // Assign once (transitions to ASSIGNED)
    await workOrderService.assign(wo.id, { technicianId }, companyId);

    // Try to assign again — should fail because status is now ASSIGNED
    await expect(
      workOrderService.assign(wo.id, { technicianId }, companyId),
    ).rejects.toThrow(ConflictException);
  });

  it('should filter work orders by status', async () => {
    // Create one explicitly OPEN
    await workOrderService.create(
      {
        title: 'Filter Test Open',
        priority: 'LOW',
        customerId,
      },
      companyId,
    );

    const openOrders = await workOrderService.findAll(companyId, 'OPEN');
    for (const order of openOrders) {
      expect(order.status).toBe('OPEN');
    }
  });

  it('should not find work orders from a different company', async () => {
    const otherCompany = await prisma.company.create({
      data: { name: 'Other Company' },
    });

    const otherCustomer = await prisma.customer.create({
      data: {
        name: 'Other Customer',
        address: '456 Other St',
        companyId: otherCompany.id,
      },
    });

    const otherWo = await prisma.workOrder.create({
      data: {
        title: 'Other Company Work Order',
        status: 'OPEN',
        priority: 'LOW',
        customerId: otherCustomer.id,
        companyId: otherCompany.id,
      },
    });

    // Should not find work order from other company
    await expect(
      workOrderService.findOne(otherWo.id, companyId),
    ).rejects.toThrow(NotFoundException);

    // Clean up other company data
    await prisma.workOrder.deleteMany({ where: { companyId: otherCompany.id } });
    await prisma.customer.deleteMany({ where: { companyId: otherCompany.id } });
    await prisma.company.delete({ where: { id: otherCompany.id } });
  });
});
