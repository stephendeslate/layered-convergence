import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, WorkOrderStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('WorkOrder State Machine (Integration)', () => {
  let prisma: PrismaClient;
  let companyId: string;
  let customerId: string;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL } },
    });
    await prisma.$connect();

    const company = await prisma.company.create({ data: { name: 'Integration Test Co' } });
    companyId = company.id;

    const hashedPassword = await bcrypt.hash('password123', 12);
    await prisma.user.create({
      data: { email: 'inttest@test.com', password: hashedPassword, role: Role.DISPATCHER, companyId },
    });

    const customer = await prisma.customer.create({
      data: { name: 'Test Customer', email: 'cust@test.com', phone: '555-0000', address: '1 Test St', companyId },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({ where: { companyId } });
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.user.deleteMany({ where: { companyId } });
    await prisma.company.delete({ where: { id: companyId } });
    await prisma.$disconnect();
  });

  it('should follow the full lifecycle: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> INVOICED', async () => {
    const technician = await prisma.technician.create({
      data: { name: 'Tech', email: 'tech@int.com', phone: '555-1111', specialties: ['HVAC'], companyId },
    });

    const wo = await prisma.workOrder.create({
      data: {
        title: 'Fix Heater',
        description: 'Heater broken',
        customerId,
        companyId,
        status: WorkOrderStatus.PENDING,
      },
    });

    expect(wo.status).toBe(WorkOrderStatus.PENDING);

    const assigned = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.ASSIGNED, technicianId: technician.id },
    });
    expect(assigned.status).toBe(WorkOrderStatus.ASSIGNED);

    const inProgress = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.IN_PROGRESS },
    });
    expect(inProgress.status).toBe(WorkOrderStatus.IN_PROGRESS);

    const completed = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.COMPLETED, completedAt: new Date() },
    });
    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);
    expect(completed.completedAt).toBeTruthy();

    const invoiced = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.INVOICED },
    });
    expect(invoiced.status).toBe(WorkOrderStatus.INVOICED);

    await prisma.workOrder.delete({ where: { id: wo.id } });
    await prisma.technician.delete({ where: { id: technician.id } });
  });

  it('should persist ON_HOLD status correctly', async () => {
    const technician = await prisma.technician.create({
      data: { name: 'Tech2', email: 'tech2@int.com', phone: '555-2222', specialties: ['Plumbing'], companyId },
    });

    const wo = await prisma.workOrder.create({
      data: {
        title: 'Fix Pipes',
        description: 'Leaking pipes',
        customerId,
        technicianId: technician.id,
        companyId,
        status: WorkOrderStatus.IN_PROGRESS,
      },
    });

    const onHold = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.ON_HOLD },
    });
    expect(onHold.status).toBe(WorkOrderStatus.ON_HOLD);

    const resumed = await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: WorkOrderStatus.IN_PROGRESS },
    });
    expect(resumed.status).toBe(WorkOrderStatus.IN_PROGRESS);

    await prisma.workOrder.delete({ where: { id: wo.id } });
    await prisma.technician.delete({ where: { id: technician.id } });
  });
});
