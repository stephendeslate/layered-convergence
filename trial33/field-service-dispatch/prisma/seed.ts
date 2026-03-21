import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SecureP@ss123', 12);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'QuickFix Services', slug: 'quickfix' },
  });

  // Create users with all roles
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@quickfix.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dispatch@quickfix.com',
      passwordHash,
      role: 'DISPATCHER',
    },
  });

  const techUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'tech@quickfix.com',
      passwordHash,
      role: 'TECHNICIAN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'customer@quickfix.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  // Technician profile
  const techProfile = await prisma.technicianProfile.create({
    data: {
      userId: techUser.id,
      skills: ['plumbing', 'electrical', 'hvac'],
      availability: 'AVAILABLE',
      latitude: 40.7128,
      longitude: -74.006,
    },
  });

  // Service location
  const location = await prisma.serviceLocation.create({
    data: {
      tenantId: tenant.id,
      name: 'Main Office',
      address: '123 Service Blvd, New York, NY 10001',
      latitude: 40.7505,
      longitude: -73.9934,
    },
  });

  // Work orders (including cancelled/on-hold states)
  const wo1 = await prisma.workOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      technicianId: techProfile.id,
      locationId: location.id,
      title: 'Fix leaking pipe',
      description: 'Kitchen sink leaking under cabinet',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    },
  });

  await prisma.workOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      title: 'Install outlet',
      description: 'New electrical outlet in garage',
      status: 'CREATED',
      priority: 'MEDIUM',
    },
  });

  await prisma.workOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      technicianId: techProfile.id,
      title: 'HVAC maintenance',
      description: 'Annual HVAC system inspection',
      status: 'CANCELLED',
      priority: 'LOW',
    },
  });

  await prisma.workOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      title: 'Electrical panel upgrade',
      description: 'Upgrade from 100A to 200A panel',
      status: 'ON_HOLD',
      priority: 'URGENT',
    },
  });

  // Work order note
  await prisma.workOrderNote.create({
    data: {
      workOrderId: wo1.id,
      authorId: techUser.id,
      content: 'Arrived on site. Pipe corroded, needs replacement part.',
    },
  });

  // Transition
  await prisma.workOrderTransition.create({
    data: {
      workOrderId: wo1.id,
      fromStatus: 'ASSIGNED',
      toStatus: 'EN_ROUTE',
      changedBy: techUser.id,
    },
  });

  await prisma.workOrderTransition.create({
    data: {
      workOrderId: wo1.id,
      fromStatus: 'EN_ROUTE',
      toStatus: 'IN_PROGRESS',
      changedBy: techUser.id,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: dispatcher.id,
      action: 'ASSIGN',
      entity: 'work_order',
      entityId: wo1.id,
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
