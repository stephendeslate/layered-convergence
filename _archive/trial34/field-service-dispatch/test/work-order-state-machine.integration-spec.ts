import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient, WorkOrderStatus } from '@prisma/client';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestCustomer,
  createTestTechnician,
} from './helpers';

describe('Work Order State Machine (Integration)', () => {
  let prisma: PrismaClient;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    prisma = await getTestPrisma();
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
    const tech = await createTestTechnician(prisma, companyId, { name: 'Tech A', skills: ['HVAC'] });
    technicianId = tech.id;
  });

  async function createWorkOrder(status: WorkOrderStatus = WorkOrderStatus.UNASSIGNED, withTech = false) {
    return prisma.workOrder.create({
      data: {
        title: 'Test Work Order',
        companyId,
        customerId,
        technicianId: withTech ? technicianId : undefined,
        status,
      },
    });
  }

  it('should follow the full lifecycle: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID', async () => {
    const wo = await createWorkOrder(WorkOrderStatus.UNASSIGNED, true);

    const transitions: [WorkOrderStatus, WorkOrderStatus][] = [
      [WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED],
      [WorkOrderStatus.ASSIGNED, WorkOrderStatus.EN_ROUTE],
      [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ON_SITE],
      [WorkOrderStatus.ON_SITE, WorkOrderStatus.IN_PROGRESS],
      [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED],
      [WorkOrderStatus.COMPLETED, WorkOrderStatus.INVOICED],
      [WorkOrderStatus.INVOICED, WorkOrderStatus.PAID],
    ];

    let currentStatus = wo.status;
    for (const [from, to] of transitions) {
      expect(currentStatus).toBe(from);
      await prisma.workOrder.update({ where: { id: wo.id }, data: { status: to } });
      await prisma.workOrderStatusHistory.create({
        data: { workOrderId: wo.id, fromStatus: from, toStatus: to },
      });
      currentStatus = to;
    }

    const finalWo = await prisma.workOrder.findUnique({ where: { id: wo.id } });
    expect(finalWo!.status).toBe(WorkOrderStatus.PAID);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(history).toHaveLength(7);
    expect(history[0].fromStatus).toBe(WorkOrderStatus.UNASSIGNED);
    expect(history[0].toStatus).toBe(WorkOrderStatus.ASSIGNED);
    expect(history[6].toStatus).toBe(WorkOrderStatus.PAID);
  });

  it('should record status history with notes and changedBy', async () => {
    const wo = await createWorkOrder(WorkOrderStatus.ASSIGNED, true);

    await prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: wo.id,
        fromStatus: WorkOrderStatus.ASSIGNED,
        toStatus: WorkOrderStatus.EN_ROUTE,
        note: 'Heading out',
        changedBy: 'user-123',
      },
    });

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });
    expect(history[0].note).toBe('Heading out');
    expect(history[0].changedBy).toBe('user-123');
  });

  it('should cascade delete status history when work order is deleted', async () => {
    const wo = await createWorkOrder(WorkOrderStatus.ASSIGNED, true);
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

  it('should support backward transitions ASSIGNED -> UNASSIGNED', async () => {
    const wo = await createWorkOrder(WorkOrderStatus.ASSIGNED, true);

    await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.UNASSIGNED, technicianId: null },
    });

    const updated = await prisma.workOrder.findUnique({ where: { id: wo.id } });
    expect(updated!.status).toBe(WorkOrderStatus.UNASSIGNED);
    expect(updated!.technicianId).toBeNull();
  });
});
