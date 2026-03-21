import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Field Pro Services',
      domain: 'fieldpro.example.com',
    },
  });

  // Create users — dispatcher and manager
  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@fieldpro.example.com',
      passwordHash,
      name: 'Jane Dispatcher',
      role: 'DISPATCHER',
      companyId: company.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@fieldpro.example.com',
      passwordHash,
      name: 'Bob Manager',
      role: 'MANAGER',
      companyId: company.id,
    },
  });

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Acme Corp',
      email: 'contact@acme.example.com',
      phone: '+1-555-0100',
      address: '123 Main St, Springfield, IL 62701',
      companyId: company.id,
    },
  });

  // Create technician
  const technician = await prisma.technician.create({
    data: {
      name: 'Alice Tech',
      email: 'alice@fieldpro.example.com',
      phone: '+1-555-0101',
      specialty: 'HVAC',
      companyId: company.id,
    },
  });

  // Create route: PLANNED -> ACTIVE -> COMPLETED
  const route = await prisma.route.create({
    data: {
      name: 'Morning Route A',
      status: 'PLANNED',
      scheduledDate: new Date('2026-03-25'),
      technicianId: technician.id,
      companyId: company.id,
    },
  });

  await prisma.route.update({
    where: { id: route.id },
    data: { status: 'ACTIVE' },
  });

  await prisma.route.update({
    where: { id: route.id },
    data: { status: 'COMPLETED', totalDistance: 45.30 },
  });

  // Work order 1: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED
  const workOrder1 = await prisma.workOrder.create({
    data: {
      title: 'HVAC Repair — Unit 3B',
      description: 'Air conditioning unit not cooling properly',
      status: 'PENDING',
      priority: 2,
      estimatedCost: 350.00,
      customerId: customer.id,
      companyId: company.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: workOrder1.id },
    data: {
      status: 'ASSIGNED',
      technicianId: technician.id,
      routeId: route.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: workOrder1.id },
    data: { status: 'IN_PROGRESS' },
  });

  await prisma.workOrder.update({
    where: { id: workOrder1.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      actualCost: 325.50,
    },
  });

  // Work order 2: PENDING -> ASSIGNED -> CANCELLED
  const workOrder2 = await prisma.workOrder.create({
    data: {
      title: 'Plumbing Check — Suite 101',
      description: 'Annual plumbing inspection',
      status: 'PENDING',
      priority: 4,
      estimatedCost: 150.00,
      customerId: customer.id,
      companyId: company.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: workOrder2.id },
    data: {
      status: 'ASSIGNED',
      technicianId: technician.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: workOrder2.id },
    data: { status: 'CANCELLED' },
  });

  // Invoice: DRAFT -> SENT -> PAID
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-0001',
      status: 'DRAFT',
      amount: 325.50,
      taxAmount: 26.04,
      totalAmount: 351.54,
      dueDate: new Date('2026-04-25'),
      customerId: customer.id,
      workOrderId: workOrder1.id,
      companyId: company.id,
    },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: 'SENT' },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  // GPS events for technician
  await prisma.gpsEvent.createMany({
    data: [
      {
        latitude: 39.7817,
        longitude: -89.6501,
        speed: 35.5,
        recordedAt: new Date('2026-03-25T08:00:00Z'),
        technicianId: technician.id,
      },
      {
        latitude: 39.7900,
        longitude: -89.6440,
        speed: 0,
        recordedAt: new Date('2026-03-25T08:30:00Z'),
        technicianId: technician.id,
      },
    ],
  });

  // Suppress unused variable warnings
  void dispatcher;
  void manager;
}

main()
  .catch((e: unknown) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
