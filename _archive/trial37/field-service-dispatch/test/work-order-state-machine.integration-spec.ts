import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { PrismaClient, WorkOrderStatus } from '@prisma/client';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestCustomer,
  createTestTechnician,
  createTestWorkOrder,
} from './helpers';

describe('Work Order State Machine (integration)', () => {
  let prisma: PrismaClient;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    prisma = getTestPrisma();
    await prisma.$connect();
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const company = await createTestCompany(prisma);
    companyId = company.id;
    const customer = await createTestCustomer(prisma, companyId);
    customerId = customer.id;
    const tech = await createTestTechnician(prisma, companyId);
    technicianId = tech.id;
  });

  it('should create work order with UNASSIGNED status', async () => {
    const wo = await createTestWorkOrder(prisma, companyId, customerId);
    expect(wo.status).toBe(WorkOrderStatus.UNASSIGNED);
  });

  it('should transition through full lifecycle: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID', async () => {
    const wo = await createTestWorkOrder(prisma, companyId, customerId);

    // UNASSIGNED -> ASSIGNED (assign technician)
    const assigned = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.ASSIGNED, technicianId },
    });
    expect(assigned.status).toBe(WorkOrderStatus.ASSIGNED);

    // ASSIGNED -> EN_ROUTE
    const enRoute = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.EN_ROUTE },
    });
    expect(enRoute.status).toBe(WorkOrderStatus.EN_ROUTE);

    // EN_ROUTE -> ON_SITE
    const onSite = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.ON_SITE },
    });
    expect(onSite.status).toBe(WorkOrderStatus.ON_SITE);

    // ON_SITE -> IN_PROGRESS
    const inProgress = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.IN_PROGRESS },
    });
    expect(inProgress.status).toBe(WorkOrderStatus.IN_PROGRESS);

    // IN_PROGRESS -> COMPLETED
    const completed = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.COMPLETED, completedAt: new Date() },
    });
    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);

    // Create invoice (COMPLETED -> INVOICED)
    const invoice = await prisma.invoice.create({
      data: { workOrderId: wo.id, amount: 250.0 },
    });
    const invoiced = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.INVOICED },
    });
    expect(invoiced.status).toBe(WorkOrderStatus.INVOICED);

    // INVOICED -> PAID
    const paid = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.PAID },
    });
    expect(paid.status).toBe(WorkOrderStatus.PAID);

    // Verify invoice exists
    expect(invoice.id).toBeDefined();
  });

  it('should store status history records', async () => {
    const wo = await createTestWorkOrder(prisma, companyId, customerId);

    await prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: wo.id,
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: WorkOrderStatus.ASSIGNED,
        note: 'Assigned to technician',
      },
    });

    await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.ASSIGNED, technicianId },
    });

    await prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: wo.id,
        fromStatus: WorkOrderStatus.ASSIGNED,
        toStatus: WorkOrderStatus.EN_ROUTE,
      },
    });

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
      orderBy: { createdAt: 'asc' },
    });

    expect(history).toHaveLength(2);
    expect(history[0].fromStatus).toBe(WorkOrderStatus.UNASSIGNED);
    expect(history[0].toStatus).toBe(WorkOrderStatus.ASSIGNED);
    expect(history[0].note).toBe('Assigned to technician');
    expect(history[1].fromStatus).toBe(WorkOrderStatus.ASSIGNED);
    expect(history[1].toStatus).toBe(WorkOrderStatus.EN_ROUTE);
  });

  it('should cascade delete status history when work order deleted', async () => {
    const wo = await createTestWorkOrder(prisma, companyId, customerId);

    await prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: wo.id,
        fromStatus: WorkOrderStatus.UNASSIGNED,
        toStatus: WorkOrderStatus.ASSIGNED,
      },
    });

    await prisma.workOrder.delete({ where: { id: wo.id } });

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });
    expect(history).toHaveLength(0);
  });

  it('should allow backward transition ASSIGNED -> UNASSIGNED in database', async () => {
    const wo = await createTestWorkOrder(prisma, companyId, customerId, {
      status: 'ASSIGNED',
      technicianId,
    });

    const updated = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.UNASSIGNED, technicianId: null },
    });

    expect(updated.status).toBe(WorkOrderStatus.UNASSIGNED);
    expect(updated.technicianId).toBeNull();
  });
});
