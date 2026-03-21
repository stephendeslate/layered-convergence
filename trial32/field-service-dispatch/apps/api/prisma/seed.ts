import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  // Create company
  const company = await prisma.company.create({ data: { name: 'FieldForce Inc.' } });

  // Create users with different roles
  await prisma.user.create({
    data: { email: 'dispatcher@fieldforce.com', password: hashedPassword, role: 'DISPATCHER', companyId: company.id },
  });

  await prisma.user.create({
    data: { email: 'manager@fieldforce.com', password: hashedPassword, role: 'MANAGER', companyId: company.id },
  });

  // Create customers
  const customer1 = await prisma.customer.create({
    data: { name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0100', address: '123 Main St', companyId: company.id },
  });

  const customer2 = await prisma.customer.create({
    data: { name: 'Global Industries', email: 'ops@global.com', phone: '555-0200', address: '456 Oak Ave', companyId: company.id },
  });

  // Create technicians
  const tech1 = await prisma.technician.create({
    data: { name: 'Alice Johnson', specialty: 'Electrical', companyId: company.id },
  });

  const tech2 = await prisma.technician.create({
    data: { name: 'Bob Smith', specialty: 'Plumbing', isAvailable: false, companyId: company.id },
  });

  // Create work orders with state transitions
  const wo1 = await prisma.workOrder.create({
    data: {
      title: 'Install new circuit breaker',
      description: 'Replace old panel with 200A breaker',
      priority: 'HIGH',
      customerId: customer1.id,
      technicianId: tech1.id,
      companyId: company.id,
    },
  });

  // Transition PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED (success path)
  await prisma.workOrder.update({ where: { id: wo1.id }, data: { status: 'ASSIGNED' } });
  await prisma.workOrder.update({ where: { id: wo1.id }, data: { status: 'IN_PROGRESS' } });
  await prisma.workOrder.update({ where: { id: wo1.id }, data: { status: 'COMPLETED', completedAt: new Date() } });

  // Create a cancelled work order (failure path)
  const wo2 = await prisma.workOrder.create({
    data: {
      title: 'Fix leaking faucet',
      description: 'Kitchen faucet dripping continuously',
      priority: 'MEDIUM',
      customerId: customer2.id,
      technicianId: tech2.id,
      companyId: company.id,
    },
  });
  await prisma.workOrder.update({ where: { id: wo2.id }, data: { status: 'ASSIGNED' } });
  await prisma.workOrder.update({ where: { id: wo2.id }, data: { status: 'CANCELLED' } });

  // Create a pending work order (urgent, no technician yet)
  await prisma.workOrder.create({
    data: {
      title: 'Emergency generator repair',
      description: 'Backup generator failed during power outage',
      priority: 'URGENT',
      customerId: customer1.id,
      companyId: company.id,
    },
  });

  // Create routes
  await prisma.route.create({
    data: { name: 'Downtown Route A', date: new Date('2024-01-15'), technicianId: tech1.id, companyId: company.id },
  });

  // Create GPS events
  await prisma.gpsEvent.create({
    data: { latitude: 40.7128, longitude: -74.0060, technicianId: tech1.id, companyId: company.id },
  });

  await prisma.gpsEvent.create({
    data: { latitude: 40.7580, longitude: -73.9855, technicianId: tech1.id, companyId: company.id },
  });

  // Create invoices
  await prisma.invoice.create({
    data: { amount: 2500.00, currency: 'USD', workOrderId: wo1.id, customerId: customer1.id, companyId: company.id, paidAt: new Date() },
  });

  await prisma.invoice.create({
    data: { amount: 150.00, currency: 'USD', workOrderId: wo2.id, customerId: customer2.id, companyId: company.id },
  });
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      process.stderr.write(e.message + '\n');
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
