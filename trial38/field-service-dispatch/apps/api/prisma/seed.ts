// TRACED: FD-SEED-001 — Seed data with CANCELLED and FAILED work orders
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Metro Field Services',
      slug: 'metro-field',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@metro.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@metro.com',
      passwordHash,
      role: 'DISPATCHER',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@metro.com',
      passwordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const tech1 = await prisma.technician.create({
    data: {
      id: 'tech_seed0001',
      name: 'Maria Garcia',
      specialty: 'HVAC Systems',
      status: 'AVAILABLE',
      latitude: 40.7580000,
      longitude: -73.9855000,
      tenantId: tenant.id,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      id: 'tech_seed0002',
      name: 'James Chen',
      specialty: 'Electrical',
      status: 'BUSY',
      latitude: 34.0195000,
      longitude: -118.4912000,
      tenantId: tenant.id,
    },
  });

  await prisma.technician.create({
    data: {
      id: 'tech_seed0003',
      name: 'Sarah Williams',
      specialty: 'Plumbing',
      status: 'OFF_DUTY',
      latitude: 41.8827000,
      longitude: -87.6233000,
      tenantId: tenant.id,
    },
  });

  await prisma.technician.create({
    data: {
      id: 'tech_seed0004',
      name: 'Robert Taylor',
      specialty: 'General Maintenance',
      status: 'INACTIVE',
      latitude: 29.7589000,
      longitude: -95.3677000,
      tenantId: tenant.id,
    },
  });

  const wo1 = await prisma.workOrder.create({
    data: {
      id: 'wo_seed00001',
      title: 'HVAC Unit Replacement - Floor 3',
      description: 'Replace aging rooftop unit serving third floor offices',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      latitude: 40.7580000,
      longitude: -73.9855000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00002',
      title: 'Electrical Panel Upgrade',
      description: 'Upgrade main panel from 200A to 400A service',
      status: 'OPEN',
      priority: 'MEDIUM',
      latitude: 34.0195000,
      longitude: -118.4912000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00003',
      title: 'Plumbing Inspection - Building B',
      description: 'Annual fire sprinkler system inspection',
      status: 'OPEN',
      priority: 'LOW',
      latitude: 41.8827000,
      longitude: -87.6233000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00004',
      title: 'Cancelled Elevator Repair',
      description: 'Customer relocated, service no longer needed',
      status: 'CANCELLED',
      priority: 'MEDIUM',
      latitude: 29.7589000,
      longitude: -95.3677000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed00005',
      title: 'Failed Boiler Repair',
      description: 'Heat exchanger cracked, replacement parts on backorder',
      status: 'FAILED',
      priority: 'URGENT',
      latitude: 33.4500000,
      longitude: -112.0667000,
      tenantId: tenant.id,
      createdById: dispatcher.id,
    },
  });

  await prisma.schedule.create({
    data: {
      workOrderId: wo1.id,
      technicianId: tech1.id,
      scheduledAt: new Date('2026-03-22T08:00:00Z'),
    },
  });

  await prisma.schedule.create({
    data: {
      workOrderId: 'wo_seed00002',
      technicianId: tech2.id,
      scheduledAt: new Date('2026-03-23T10:00:00Z'),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
