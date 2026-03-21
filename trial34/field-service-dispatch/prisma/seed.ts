import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TRACED: FD-SV-SEED-001 — Seed with tenant, users, work orders, technicians
async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'Acme Field Services', slug: 'acme-field-services' },
  });

  const owner = await prisma.user.create({
    data: {
      email: 'owner@acme.com',
      passwordHash: '$2b$12$placeholder.hash.owner',
      name: 'Alice Owner',
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'dispatcher@acme.com',
      passwordHash: '$2b$12$placeholder.hash.dispatcher',
      name: 'Bob Dispatcher',
      role: 'DISPATCHER',
      tenantId: tenant.id,
    },
  });

  const technician = await prisma.technician.create({
    data: {
      name: 'Charlie Tech',
      slug: 'charlie-tech',
      specialization: 'HVAC',
      availability: 'AVAILABLE',
      latitude: 37.7749,
      longitude: -122.4194,
      tenantId: tenant.id,
    },
  });

  await prisma.technician.create({
    data: {
      name: 'Diana Electrician',
      slug: 'diana-electrician',
      specialization: 'Electrical',
      availability: 'ON_JOB',
      tenantId: tenant.id,
    },
  });

  const completedOrder = await prisma.workOrder.create({
    data: {
      title: 'Fix HVAC Unit',
      slug: 'fix-hvac-unit',
      description: 'HVAC unit on 3rd floor not cooling',
      priority: 'HIGH',
      status: 'COMPLETED',
      tenantId: tenant.id,
      assignedToId: technician.id,
    },
  });

  await prisma.workOrderTransition.create({
    data: {
      workOrderId: completedOrder.id,
      fromStatus: 'CREATED',
      toStatus: 'ASSIGNED',
      changedBy: owner.id,
    },
  });

  await prisma.workOrderTransition.create({
    data: {
      workOrderId: completedOrder.id,
      fromStatus: 'ASSIGNED',
      toStatus: 'IN_PROGRESS',
      changedBy: technician.id,
    },
  });

  await prisma.workOrderTransition.create({
    data: {
      workOrderId: completedOrder.id,
      fromStatus: 'IN_PROGRESS',
      toStatus: 'COMPLETED',
      changedBy: technician.id,
    },
  });

  // TRACED: FD-SV-SEED-002 — Escalated/cancelled work order seed data
  const escalatedOrder = await prisma.workOrder.create({
    data: {
      title: 'Emergency Pipe Burst',
      slug: 'emergency-pipe-burst',
      description: 'Major water leak in basement - requires urgent attention',
      priority: 'URGENT',
      status: 'ESCALATED',
      tenantId: tenant.id,
    },
  });

  await prisma.workOrderTransition.create({
    data: {
      workOrderId: escalatedOrder.id,
      fromStatus: 'ASSIGNED',
      toStatus: 'ESCALATED',
      changedBy: owner.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      title: 'Routine Inspection',
      slug: 'routine-inspection',
      description: 'Quarterly building inspection',
      priority: 'LOW',
      status: 'CREATED',
      tenantId: tenant.id,
    },
  });

  await prisma.serviceArea.create({
    data: {
      name: 'Downtown District',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 5.0,
      tenantId: tenant.id,
    },
  });

  await prisma.equipment.create({
    data: {
      name: 'Pipe Wrench Set',
      serialNumber: 'EQ-2024-001',
      tenantId: tenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'WorkOrder',
      entityId: completedOrder.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
