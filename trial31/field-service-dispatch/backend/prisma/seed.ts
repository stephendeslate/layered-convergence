import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Apex Field Services',
      slug: 'apex-field',
    },
  });

  // Create users with different roles
  await prisma.user.create({
    data: {
      email: 'dispatcher@apex.com',
      passwordHash,
      role: 'DISPATCHER',
      companyId: company.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@apex.com',
      passwordHash,
      role: 'MANAGER',
      companyId: company.id,
    },
  });

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Metro Commercial Properties',
      email: 'facilities@metro.com',
      phone: '+1-555-0100',
      address: '100 Commerce Blvd, Suite 200',
      companyId: company.id,
    },
  });

  // Create technician
  const tech = await prisma.technician.create({
    data: {
      name: 'Alex Rivera',
      phone: '+1-555-0201',
      specialties: 'HVAC, Electrical, Plumbing',
      companyId: company.id,
    },
  });

  // Create route
  const route = await prisma.route.create({
    data: {
      name: 'North District Morning Route',
      status: 'PLANNED',
      date: new Date('2026-03-22'),
      companyId: company.id,
      technicianId: tech.id,
    },
  });

  await prisma.route.update({
    where: { id: route.id },
    data: { status: 'ACTIVE' },
  });

  // Work Order 1: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED (success path)
  const wo1 = await prisma.workOrder.create({
    data: {
      title: 'HVAC System Inspection',
      description: 'Annual inspection of rooftop HVAC units',
      status: 'PENDING',
      priority: 2,
      scheduledAt: new Date('2026-03-22T09:00:00Z'),
      companyId: company.id,
      customerId: customer.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: wo1.id },
    data: { status: 'ASSIGNED', technicianId: tech.id, routeId: route.id },
  });

  await prisma.workOrder.update({
    where: { id: wo1.id },
    data: { status: 'IN_PROGRESS' },
  });

  await prisma.workOrder.update({
    where: { id: wo1.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Work Order 2: PENDING -> ASSIGNED -> CANCELLED (T31 variation: error state)
  const wo2 = await prisma.workOrder.create({
    data: {
      title: 'Emergency Electrical Repair',
      description: 'Main panel breaker tripping repeatedly',
      status: 'PENDING',
      priority: 1,
      scheduledAt: new Date('2026-03-22T14:00:00Z'),
      companyId: company.id,
      customerId: customer.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: wo2.id },
    data: { status: 'ASSIGNED', technicianId: tech.id },
  });

  await prisma.workOrder.update({
    where: { id: wo2.id },
    data: { status: 'CANCELLED' },
  });

  // Work Order 3: PENDING (unassigned, waiting)
  await prisma.workOrder.create({
    data: {
      title: 'Plumbing Leak Assessment',
      description: 'Water stain on ceiling tiles, possible pipe leak',
      status: 'PENDING',
      priority: 3,
      companyId: company.id,
      customerId: customer.id,
    },
  });

  // GPS events for technician
  await prisma.gpsEvent.create({
    data: {
      latitude: 40.7128,
      longitude: -74.006,
      timestamp: new Date('2026-03-22T08:30:00Z'),
      technicianId: tech.id,
    },
  });

  await prisma.gpsEvent.create({
    data: {
      latitude: 40.7589,
      longitude: -73.9851,
      timestamp: new Date('2026-03-22T09:15:00Z'),
      technicianId: tech.id,
    },
  });

  // Invoice 1: DRAFT -> SENT -> PAID (success path)
  const inv1 = await prisma.invoice.create({
    data: {
      amount: 850.00,
      status: 'DRAFT',
      dueDate: new Date('2026-04-22'),
      companyId: company.id,
      customerId: customer.id,
      workOrderId: wo1.id,
    },
  });

  await prisma.invoice.update({
    where: { id: inv1.id },
    data: { status: 'SENT' },
  });

  await prisma.invoice.update({
    where: { id: inv1.id },
    data: { status: 'PAID', paidAt: new Date() },
  });

  // Invoice 2: DRAFT -> SENT -> OVERDUE (T31 variation: error state)
  const inv2 = await prisma.invoice.create({
    data: {
      amount: 1200.00,
      status: 'DRAFT',
      dueDate: new Date('2026-02-15'),
      companyId: company.id,
      customerId: customer.id,
      workOrderId: wo2.id,
    },
  });

  await prisma.invoice.update({
    where: { id: inv2.id },
    data: { status: 'SENT' },
  });

  await prisma.invoice.update({
    where: { id: inv2.id },
    data: { status: 'OVERDUE' },
  });
}

main()
  .catch((e: Error) => {
    process.stderr.write(`Seed error: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
