import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// TRACED: FD-SEED-BCRYPT
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Metro Field Services',
    },
  });

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@fieldservice.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Create dispatcher user
  await prisma.user.create({
    data: {
      email: 'dispatcher@fieldservice.com',
      passwordHash,
      role: 'DISPATCHER',
      tenantId: tenant.id,
    },
  });

  // Create technicians
  const tech1 = await prisma.technician.create({
    data: {
      name: 'John Smith',
      email: 'john@fieldservice.com',
      phone: '555-0101',
      status: 'AVAILABLE',
      specialties: ['electrical', 'plumbing'],
      latitude: 40.7128000,
      longitude: -74.0060000,
      tenantId: tenant.id,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@fieldservice.com',
      phone: '555-0102',
      status: 'ON_ASSIGNMENT',
      specialties: ['hvac', 'electrical'],
      latitude: 40.7580000,
      longitude: -73.9855000,
      tenantId: tenant.id,
    },
  });

  // Create suspended technician — error/failure state
  await prisma.technician.create({
    data: {
      name: 'Bob Failed',
      email: 'bob@fieldservice.com',
      phone: '555-0103',
      status: 'SUSPENDED',
      specialties: ['plumbing'],
      latitude: 40.7300000,
      longitude: -73.9950000,
      tenantId: tenant.id,
    },
  });

  // Create service areas
  await prisma.serviceArea.create({
    data: {
      name: 'Manhattan',
      zipCodes: ['10001', '10002', '10003'],
      latitude: 40.7831000,
      longitude: -73.9712000,
      radius: 15.00,
      active: true,
      tenantId: tenant.id,
    },
  });

  await prisma.serviceArea.create({
    data: {
      name: 'Brooklyn (Inactive)',
      zipCodes: ['11201', '11202'],
      latitude: 40.6782000,
      longitude: -73.9442000,
      radius: 10.00,
      active: false,
      tenantId: tenant.id,
    },
  });

  // Create work orders
  const wo1 = await prisma.workOrder.create({
    data: {
      title: 'Fix broken AC unit',
      description: 'Commercial AC unit not cooling properly',
      status: 'ASSIGNED',
      priority: 'HIGH',
      latitude: 40.7484000,
      longitude: -73.9857000,
      address: '350 5th Ave, New York, NY 10118',
      tenantId: tenant.id,
      technicianId: tech1.id,
    },
  });

  // Create failed work order — error/failure state
  await prisma.workOrder.create({
    data: {
      title: 'Failed electrical inspection',
      description: 'Inspection could not be completed due to access issues',
      status: 'FAILED',
      priority: 'URGENT',
      latitude: 40.7580000,
      longitude: -73.9855000,
      address: '1 Times Square, New York, NY 10036',
      tenantId: tenant.id,
      technicianId: tech2.id,
      notes: 'Access denied by building management',
    },
  });

  // Create cancelled work order — error state
  await prisma.workOrder.create({
    data: {
      title: 'Cancelled plumbing repair',
      description: 'Customer cancelled the appointment',
      status: 'CANCELLED',
      priority: 'LOW',
      latitude: 40.7128000,
      longitude: -74.0060000,
      address: '100 Broadway, New York, NY 10005',
      tenantId: tenant.id,
      notes: 'Customer resolved issue independently',
    },
  });

  // Create schedules
  await prisma.schedule.create({
    data: {
      startTime: new Date('2026-03-21T09:00:00Z'),
      endTime: new Date('2026-03-21T11:00:00Z'),
      status: 'SCHEDULED',
      tenantId: tenant.id,
      technicianId: tech1.id,
      workOrderId: wo1.id,
    },
  });

  // Create cancelled schedule — error state
  await prisma.schedule.create({
    data: {
      startTime: new Date('2026-03-20T14:00:00Z'),
      endTime: new Date('2026-03-20T16:00:00Z'),
      status: 'CANCELLED',
      tenantId: tenant.id,
      technicianId: tech2.id,
      workOrderId: wo1.id,
      notes: 'Technician called in sick',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
