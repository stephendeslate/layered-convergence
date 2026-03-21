import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create users with different roles
  const tech1 = await prisma.user.create({
    data: {
      email: 'tech1@example.com',
      passwordHash,
      role: 'TECHNICIAN',
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: 'tech2@example.com',
      passwordHash,
      role: 'TECHNICIAN',
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@example.com',
      passwordHash,
      role: 'DISPATCHER',
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@example.com',
      passwordHash,
      role: 'MANAGER',
    },
  });

  // Create 3 customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '555-0100',
      address: '123 Main St, Springfield, IL 62701',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Beta Industries',
      email: 'info@beta.com',
      phone: '555-0200',
      address: '456 Oak Ave, Portland, OR 97201',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Gamma LLC',
      email: 'support@gamma.com',
      phone: '555-0300',
      address: '789 Pine Rd, Austin, TX 78701',
    },
  });

  // Create 3 service areas
  const area1 = await prisma.serviceArea.create({
    data: {
      name: 'Downtown',
      zipCodes: ['62701', '62702', '62703'],
    },
  });

  await prisma.serviceArea.create({
    data: {
      name: 'Northside',
      zipCodes: ['97201', '97202'],
    },
  });

  await prisma.serviceArea.create({
    data: {
      name: 'Southside',
      zipCodes: ['78701', '78702', '78703'],
    },
  });

  // Create 3 work orders with state transitions
  // State transition 1: WorkOrder OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
  const wo1 = await prisma.workOrder.create({
    data: {
      title: 'HVAC System Repair',
      description: 'Commercial HVAC unit not cooling properly',
      status: 'OPEN',
      priority: 'HIGH',
      estimatedCost: 2500.0,
      customerId: customer1.id,
      serviceAreaId: area1.id,
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

  await prisma.workOrder.update({
    where: { id: wo1.id },
    data: { status: 'COMPLETED', actualCost: 2200.0, completedAt: new Date() },
  });

  // State transition 2: WorkOrder OPEN → ASSIGNED → CANCELLED
  const wo2 = await prisma.workOrder.create({
    data: {
      title: 'Electrical Panel Inspection',
      description: 'Annual inspection of main electrical panel',
      status: 'OPEN',
      priority: 'MEDIUM',
      estimatedCost: 800.0,
      customerId: customer2.id,
    },
  });

  await prisma.workOrder.update({
    where: { id: wo2.id },
    data: { status: 'ASSIGNED', technicianId: tech2.id },
  });

  await prisma.workOrder.update({
    where: { id: wo2.id },
    data: { status: 'CANCELLED' },
  });

  await prisma.workOrder.create({
    data: {
      title: 'Plumbing Emergency',
      description: 'Burst pipe in basement office',
      status: 'OPEN',
      priority: 'CRITICAL',
      estimatedCost: 3500.0,
      customerId: customer3.id,
    },
  });

  // Create 3 equipment items
  await prisma.equipment.create({
    data: {
      name: 'Multimeter',
      serialNumber: 'MM-2024-001',
      condition: 'good',
      workOrderId: wo1.id,
    },
  });

  await prisma.equipment.create({
    data: {
      name: 'Pipe Wrench Set',
      serialNumber: 'PW-2024-002',
      condition: 'good',
    },
  });

  await prisma.equipment.create({
    data: {
      name: 'Thermal Camera',
      serialNumber: 'TC-2024-003',
      condition: 'needs_calibration',
    },
  });

  // Create 3 skills
  await prisma.skill.create({
    data: {
      name: 'HVAC Repair',
      level: 'expert',
      technicianId: tech1.id,
    },
  });

  await prisma.skill.create({
    data: {
      name: 'Electrical Systems',
      level: 'intermediate',
      technicianId: tech1.id,
    },
  });

  await prisma.skill.create({
    data: {
      name: 'Plumbing',
      level: 'expert',
      technicianId: tech2.id,
    },
  });

  // Create 3 schedules
  await prisma.schedule.create({
    data: {
      dayOfWeek: 'Monday',
      startTime: '08:00',
      endTime: '17:00',
      technicianId: tech1.id,
    },
  });

  await prisma.schedule.create({
    data: {
      dayOfWeek: 'Tuesday',
      startTime: '09:00',
      endTime: '18:00',
      technicianId: tech1.id,
    },
  });

  await prisma.schedule.create({
    data: {
      dayOfWeek: 'Monday',
      startTime: '07:00',
      endTime: '16:00',
      technicianId: tech2.id,
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
