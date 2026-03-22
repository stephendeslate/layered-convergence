// TRACED: FD-SEED-001 — Seed data with CANCELLED and FAILED work orders
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Field Services',
      slug: 'acme-field',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@acme.com',
      passwordHash,
      role: 'DISPATCHER',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@acme.com',
      passwordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const tech1 = await prisma.technician.create({
    data: {
      id: 'tech_seed0001',
      name: 'Alice Johnson',
      status: 'AVAILABLE',
      latitude: 40.7128000,
      longitude: -74.0060000,
      tenantId: tenant.id,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      id: 'tech_seed0002',
      name: 'Bob Smith',
      status: 'BUSY',
      latitude: 34.0522000,
      longitude: -118.2437000,
      tenantId: tenant.id,
    },
  });

  await prisma.technician.create({
    data: {
      id: 'tech_seed0003',
      name: 'Carol Davis',
      status: 'OFF_DUTY',
      latitude: 41.8781000,
      longitude: -87.6298000,
      tenantId: tenant.id,
    },
  });

  await prisma.technician.create({
    data: {
      id: 'tech_seed0004',
      name: 'Dan Wilson',
      status: 'INACTIVE',
      latitude: 29.7604000,
      longitude: -95.3698000,
      tenantId: tenant.id,
    },
  });

  const wo1 = await prisma.workOrder.create({
    data: {
      id: 'wo_seed00001',
      title: 'HVAC Repair - Building A',
      description: 'Central AC unit not cooling properly',
      status: 'ASSIGNED',
      priority: 'HIGH',
      latitude: 40.7128000,
      longitude: -74.0060000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00002',
      title: 'Plumbing Install - Suite 200',
      description: 'New water heater installation',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      latitude: 34.0522000,
      longitude: -118.2437000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00003',
      title: 'Electrical Inspection',
      description: 'Annual electrical safety inspection',
      status: 'OPEN',
      priority: 'LOW',
      latitude: 41.8781000,
      longitude: -87.6298000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00004',
      title: 'Cancelled Maintenance Visit',
      description: 'Customer cancelled scheduled maintenance',
      status: 'CANCELLED',
      priority: 'LOW',
      latitude: 29.7604000,
      longitude: -95.3698000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00005',
      title: 'Failed Generator Repair',
      description: 'Parts unavailable, repair could not be completed',
      status: 'FAILED',
      priority: 'URGENT',
      latitude: 33.4484000,
      longitude: -112.0740000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.schedule.create({
    data: {
      workOrderId: wo1.id,
      technicianId: tech1.id,
      scheduledAt: new Date('2026-03-22T09:00:00Z'),
    },
  });

  await prisma.schedule.create({
    data: {
      workOrderId: 'wo_seed00002',
      technicianId: tech2.id,
      scheduledAt: new Date('2026-03-22T14:00:00Z'),
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
