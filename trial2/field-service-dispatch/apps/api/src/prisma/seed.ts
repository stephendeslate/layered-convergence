import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // Company 1: AcmePlumbing
  const company1 = await prisma.company.create({
    data: {
      name: 'Acme Plumbing',
      slug: 'acme-plumbing',
      address: '123 Main St, Austin, TX 78701',
      phone: '512-555-0100',
      email: 'info@acmeplumbing.com',
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      companyId: company1.id,
      email: 'admin@acmeplumbing.com',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  const dispatcher1 = await prisma.user.create({
    data: {
      companyId: company1.id,
      email: 'dispatch@acmeplumbing.com',
      passwordHash,
      firstName: 'Dan',
      lastName: 'Dispatcher',
      role: 'DISPATCHER',
    },
  });

  const techUser1 = await prisma.user.create({
    data: {
      companyId: company1.id,
      email: 'john@acmeplumbing.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Smith',
      role: 'TECHNICIAN',
    },
  });

  const techUser2 = await prisma.user.create({
    data: {
      companyId: company1.id,
      email: 'jane@acmeplumbing.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'TECHNICIAN',
    },
  });

  const tech1 = await prisma.technician.create({
    data: {
      companyId: company1.id,
      userId: techUser1.id,
      name: 'John Smith',
      email: 'john@acmeplumbing.com',
      phone: '512-555-0101',
      skills: ['plumbing', 'drain-cleaning', 'water-heater'],
      status: 'AVAILABLE',
      currentLat: 30.2672,
      currentLng: -97.7431,
      hourlyRate: 75,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      companyId: company1.id,
      userId: techUser2.id,
      name: 'Jane Doe',
      email: 'jane@acmeplumbing.com',
      phone: '512-555-0102',
      skills: ['plumbing', 'pipe-repair', 'bathroom-install'],
      status: 'AVAILABLE',
      currentLat: 30.2849,
      currentLng: -97.7341,
      hourlyRate: 80,
    },
  });

  const customer1a = await prisma.customer.create({
    data: {
      companyId: company1.id,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      phone: '512-555-0201',
      address: '456 Oak Ave, Austin, TX 78702',
      lat: 30.2620,
      lng: -97.7295,
    },
  });

  const customer1b = await prisma.customer.create({
    data: {
      companyId: company1.id,
      name: 'Carol Brown',
      email: 'carol@example.com',
      phone: '512-555-0202',
      address: '789 Pine Rd, Austin, TX 78703',
      lat: 30.2987,
      lng: -97.7580,
    },
  });

  await prisma.workOrder.create({
    data: {
      companyId: company1.id,
      customerId: customer1a.id,
      technicianId: tech1.id,
      title: 'Fix leaky faucet',
      description: 'Kitchen faucet is dripping constantly',
      serviceType: 'plumbing',
      priority: 'HIGH',
      status: 'ASSIGNED',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      estimatedDuration: 60,
      address: '456 Oak Ave, Austin, TX 78702',
      lat: 30.2620,
      lng: -97.7295,
      trackingToken: 'track-acme-001',
    },
  });

  await prisma.workOrder.create({
    data: {
      companyId: company1.id,
      customerId: customer1b.id,
      title: 'Install new water heater',
      description: 'Replace 40-gallon tank water heater',
      serviceType: 'water-heater',
      priority: 'NORMAL',
      status: 'UNASSIGNED',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedDuration: 180,
      address: '789 Pine Rd, Austin, TX 78703',
      lat: 30.2987,
      lng: -97.7580,
      trackingToken: 'track-acme-002',
    },
  });

  // Company 2: FastFix HVAC
  const company2 = await prisma.company.create({
    data: {
      name: 'FastFix HVAC',
      slug: 'fastfix-hvac',
      address: '500 Congress Ave, Austin, TX 78701',
      phone: '512-555-0300',
      email: 'info@fastfixhvac.com',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      companyId: company2.id,
      email: 'admin@fastfixhvac.com',
      passwordHash,
      firstName: 'Eve',
      lastName: 'Manager',
      role: 'ADMIN',
    },
  });

  const techUser3 = await prisma.user.create({
    data: {
      companyId: company2.id,
      email: 'mike@fastfixhvac.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'TECHNICIAN',
    },
  });

  const tech3 = await prisma.technician.create({
    data: {
      companyId: company2.id,
      userId: techUser3.id,
      name: 'Mike Johnson',
      email: 'mike@fastfixhvac.com',
      phone: '512-555-0301',
      skills: ['hvac', 'ac-repair', 'heating'],
      status: 'AVAILABLE',
      currentLat: 30.2500,
      currentLng: -97.7500,
      hourlyRate: 85,
    },
  });

  const customer2a = await prisma.customer.create({
    data: {
      companyId: company2.id,
      name: 'Dave Clark',
      email: 'dave@example.com',
      phone: '512-555-0401',
      address: '100 Barton Springs Rd, Austin, TX 78704',
      lat: 30.2610,
      lng: -97.7478,
    },
  });

  await prisma.workOrder.create({
    data: {
      companyId: company2.id,
      customerId: customer2a.id,
      technicianId: tech3.id,
      title: 'AC not cooling',
      description: 'Central AC unit running but not producing cold air',
      serviceType: 'ac-repair',
      priority: 'URGENT',
      status: 'EN_ROUTE',
      scheduledAt: new Date(),
      estimatedDuration: 120,
      address: '100 Barton Springs Rd, Austin, TX 78704',
      lat: 30.2610,
      lng: -97.7478,
      trackingToken: 'track-fastfix-001',
    },
  });

  // Company 3: SparkElectric
  const company3 = await prisma.company.create({
    data: {
      name: 'Spark Electric',
      slug: 'spark-electric',
      address: '200 E 6th St, Austin, TX 78701',
      phone: '512-555-0500',
      email: 'info@sparkelectric.com',
    },
  });

  const admin3 = await prisma.user.create({
    data: {
      companyId: company3.id,
      email: 'admin@sparkelectric.com',
      passwordHash,
      firstName: 'Grace',
      lastName: 'Owner',
      role: 'ADMIN',
    },
  });

  const techUser4 = await prisma.user.create({
    data: {
      companyId: company3.id,
      email: 'tom@sparkelectric.com',
      passwordHash,
      firstName: 'Tom',
      lastName: 'Watts',
      role: 'TECHNICIAN',
    },
  });

  const tech4 = await prisma.technician.create({
    data: {
      companyId: company3.id,
      userId: techUser4.id,
      name: 'Tom Watts',
      email: 'tom@sparkelectric.com',
      phone: '512-555-0501',
      skills: ['electrical', 'panel-upgrade', 'wiring'],
      status: 'AVAILABLE',
      currentLat: 30.2700,
      currentLng: -97.7400,
      hourlyRate: 90,
    },
  });

  const customer3a = await prisma.customer.create({
    data: {
      companyId: company3.id,
      name: 'Frank Miller',
      email: 'frank@example.com',
      phone: '512-555-0601',
      address: '300 W Riverside Dr, Austin, TX 78704',
      lat: 30.2590,
      lng: -97.7510,
    },
  });

  await prisma.workOrder.create({
    data: {
      companyId: company3.id,
      customerId: customer3a.id,
      title: 'Panel upgrade to 200A',
      description: 'Upgrade electrical panel from 100A to 200A',
      serviceType: 'panel-upgrade',
      priority: 'NORMAL',
      status: 'UNASSIGNED',
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      estimatedDuration: 240,
      address: '300 W Riverside Dr, Austin, TX 78704',
      lat: 30.2590,
      lng: -97.7510,
      trackingToken: 'track-spark-001',
    },
  });

  console.log('Seed complete!');
  console.log('Companies: Acme Plumbing, FastFix HVAC, Spark Electric');
  console.log('Login with any admin: admin@acmeplumbing.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
