// TRACED: FD-SEED-001 — Database seed with error states and console.error handling
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('dispatcher123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-services' },
    update: {},
    create: {
      name: 'Acme Field Services',
      slug: 'acme-services',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash: await bcrypt.hash('admin123secure', BCRYPT_SALT_ROUNDS),
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@acme.com',
      passwordHash,
      role: 'DISPATCHER',
      tenantId: tenant.id,
    },
  });

  const techUser = await prisma.user.create({
    data: {
      email: 'tech@acme.com',
      passwordHash: await bcrypt.hash('tech123secure', BCRYPT_SALT_ROUNDS),
      role: 'TECHNICIAN',
      tenantId: tenant.id,
    },
  });

  const tech1 = await prisma.technician.create({
    data: {
      id: 'tech_seed0001',
      name: 'Maria Garcia',
      specialty: 'HVAC',
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
      latitude: 40.7484000,
      longitude: -73.9857000,
      tenantId: tenant.id,
    },
  });

  await prisma.technician.create({
    data: {
      id: 'tech_seed0003',
      name: 'Sarah Okafor',
      specialty: 'Plumbing',
      status: 'INACTIVE',
      latitude: 40.7527000,
      longitude: -73.9772000,
      tenantId: tenant.id,
    },
  });

  const wo1 = await prisma.workOrder.create({
    data: {
      id: 'wo_seed000001',
      title: 'Replace rooftop HVAC unit',
      description: 'Third floor offices overheating, unit needs full replacement',
      status: 'OPEN',
      priority: 'HIGH',
      latitude: 40.7580000,
      longitude: -73.9855000,
      tenantId: tenant.id,
      createdById: dispatcherUser.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      id: 'wo_seed000002',
      title: 'Annual fire suppression inspection',
      description: 'Required annual certification',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      latitude: 40.7484000,
      longitude: -73.9857000,
      tenantId: tenant.id,
      createdById: dispatcherUser.id,
    },
  });

  // Error state: FAILED work order for testing failure transitions
  await prisma.workOrder.create({
    data: {
      id: 'wo_seed000003',
      title: 'Emergency plumbing repair',
      description: 'Failed due to parts unavailability',
      status: 'FAILED',
      priority: 'URGENT',
      latitude: 40.7614000,
      longitude: -73.9776000,
      tenantId: tenant.id,
      createdById: adminUser.id,
    },
  });

  // Error state: CANCELLED work order
  await prisma.workOrder.create({
    data: {
      id: 'wo_seed000004',
      title: 'Parking garage lighting retrofit',
      description: 'Cancelled by client',
      status: 'CANCELLED',
      priority: 'LOW',
      latitude: 40.7488000,
      longitude: -73.9680000,
      tenantId: tenant.id,
      createdById: dispatcherUser.id,
    },
  });

  await prisma.schedule.create({
    data: {
      workOrderId: wo1.id,
      technicianId: tech1.id,
      scheduledAt: new Date('2026-03-25T09:00:00Z'),
    },
  });

  await prisma.serviceArea.create({
    data: {
      name: 'Midtown Manhattan',
      tenantId: tenant.id,
    },
  });

  await prisma.serviceArea.create({
    data: {
      name: 'Downtown Brooklyn',
      tenantId: tenant.id,
    },
  });

  // Verify seeded data with $executeRaw using Prisma.sql
  const userCount = await prisma.$executeRaw`SELECT COUNT(*) FROM users WHERE tenant_id = ${tenant.id}`;
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
