import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Summit Field Services',
      slug: 'summit-field-services',
    },
  });

  // Create 3 users with different roles
  await prisma.user.create({
    data: {
      email: 'dispatcher@summit.com',
      passwordHash,
      role: 'DISPATCHER',
      companyId: company.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@summit.com',
      passwordHash,
      role: 'MANAGER',
      companyId: company.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'tech@summit.com',
      passwordHash,
      role: 'TECHNICIAN',
      companyId: company.id,
    },
  });

  // Create 3 customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Riverside Office Park',
      email: 'facilities@riverside.com',
      phone: '555-0101',
      address: '100 River Rd, Portland, OR 97201',
      companyId: company.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Downtown Medical Center',
      email: 'ops@downtownmed.com',
      phone: '555-0202',
      address: '450 Main St, Portland, OR 97204',
      companyId: company.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Eastside Warehouse',
      email: 'maintenance@eastside.com',
      phone: '555-0303',
      address: '2200 Industrial Blvd, Portland, OR 97220',
      companyId: company.id,
    },
  });

  // Create 3 technicians
  const tech1 = await prisma.technician.create({
    data: {
      name: 'Jake Morrison',
      phone: '555-1001',
      specialty: 'HVAC',
      companyId: company.id,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      name: 'Maria Chen',
      phone: '555-1002',
      specialty: 'Electrical',
      companyId: company.id,
    },
  });

  const tech3 = await prisma.technician.create({
    data: {
      name: 'Sam Rodriguez',
      phone: '555-1003',
      specialty: 'Plumbing',
      companyId: company.id,
    },
  });

  // Create 3 work orders
  // State transition 1: WorkOrder PENDING -> ASSIGNED -> IN_PROGRESS
  const wo1 = await prisma.workOrder.create({
    data: {
      title: 'HVAC annual inspection',
      description: 'Perform annual HVAC system inspection and filter replacement',
      status: 'PENDING',
      priority: 2,
      scheduledAt: new Date('2026-03-25T09:00:00Z'),
      companyId: company.id,
      customerId: customer1.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: wo1.id },
    data: { status: 'ASSIGNED', technicianId: tech1.id },
  });

  await prisma.workOrder.update({
    where: { id: wo1.id },
    data: { status: 'IN_PROGRESS' },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      title: 'Emergency generator repair',
      description: 'Diagnose and repair backup generator failure',
      status: 'ASSIGNED',
      priority: 1,
      scheduledAt: new Date('2026-03-22T08:00:00Z'),
      companyId: company.id,
      customerId: customer2.id,
      technicianId: tech2.id,
    },
  });

  await prisma.workOrder.create({
    data: {
      title: 'Water heater replacement',
      description: 'Replace commercial water heater unit in warehouse',
      status: 'PENDING',
      priority: 3,
      scheduledAt: new Date('2026-03-28T10:00:00Z'),
      companyId: company.id,
      customerId: customer3.id,
    },
  });

  // Create 3 routes
  // State transition 2: Route PLANNED -> ACTIVE
  const route1 = await prisma.route.create({
    data: {
      name: 'East Portland AM Route',
      status: 'PLANNED',
      date: new Date('2026-03-25'),
      technicianId: tech1.id,
      companyId: company.id,
    },
  });

  await prisma.route.update({
    where: { id: route1.id },
    data: { status: 'ACTIVE' },
  });

  await prisma.route.create({
    data: {
      name: 'Downtown PM Route',
      status: 'PLANNED',
      date: new Date('2026-03-25'),
      technicianId: tech2.id,
      companyId: company.id,
    },
  });

  await prisma.route.create({
    data: {
      name: 'West Side Full Day',
      status: 'COMPLETED',
      date: new Date('2026-03-20'),
      technicianId: tech3.id,
      companyId: company.id,
    },
  });

  // Create 3 GPS events
  await prisma.gpsEvent.create({
    data: {
      latitude: 45.5152,
      longitude: -122.6784,
      accuracy: 5.5,
      technicianId: tech1.id,
      recordedAt: new Date('2026-03-21T09:15:00Z'),
    },
  });

  await prisma.gpsEvent.create({
    data: {
      latitude: 45.5231,
      longitude: -122.6765,
      accuracy: 3.2,
      technicianId: tech2.id,
      recordedAt: new Date('2026-03-21T09:30:00Z'),
    },
  });

  await prisma.gpsEvent.create({
    data: {
      latitude: 45.5088,
      longitude: -122.6550,
      accuracy: 8.1,
      technicianId: tech3.id,
      recordedAt: new Date('2026-03-20T14:45:00Z'),
    },
  });

  // Create 3 invoices
  // State transition: Invoice DRAFT -> SENT
  const inv1 = await prisma.invoice.create({
    data: {
      amount: 2450.00,
      status: 'DRAFT',
      dueDate: new Date('2026-04-25'),
      workOrderId: wo2.id,
      customerId: customer2.id,
    },
  });

  await prisma.invoice.update({
    where: { id: inv1.id },
    data: { status: 'SENT' },
  });

  await prisma.invoice.create({
    data: {
      amount: 875.50,
      status: 'PAID',
      dueDate: new Date('2026-03-15'),
      paidAt: new Date('2026-03-12'),
      workOrderId: wo2.id,
      customerId: customer2.id,
    },
  });

  await prisma.invoice.create({
    data: {
      amount: 3200.00,
      status: 'DRAFT',
      dueDate: new Date('2026-04-30'),
      workOrderId: wo1.id,
      customerId: customer1.id,
    },
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
