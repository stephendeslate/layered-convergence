import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/field_service_test';

let prisma: PrismaClient;
let pool: Pool;

export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    pool = new Pool({ connectionString: DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function cleanDatabase() {
  const p = getTestPrisma();
  await p.$executeRaw`TRUNCATE TABLE
    gps_events,
    routes,
    invoices,
    work_order_status_history,
    work_orders,
    technicians,
    customers,
    users,
    companies
    CASCADE`;
}

export async function teardown() {
  if (prisma) {
    await prisma.$disconnect();
  }
  if (pool) {
    await pool.end();
  }
}

export async function createTestCompany(
  p: PrismaClient,
  overrides: Partial<{ name: string; slug: string }> = {},
) {
  return p.company.create({
    data: {
      name: overrides.name ?? 'Test Company',
      slug: overrides.slug ?? `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
  });
}

export async function createTestUser(
  p: PrismaClient,
  companyId: string,
  overrides: Partial<{ email: string; name: string; password: string; role: any }> = {},
) {
  return p.user.create({
    data: {
      email: overrides.email ?? `user-${Date.now()}@test.com`,
      name: overrides.name ?? 'Test User',
      password: overrides.password ?? '$2b$10$hashedpassword',
      companyId,
      role: overrides.role ?? 'DISPATCHER',
    },
  });
}

export async function createTestCustomer(
  p: PrismaClient,
  companyId: string,
  overrides: Partial<{ name: string; address: string; lat: number; lng: number }> = {},
) {
  return p.customer.create({
    data: {
      companyId,
      name: overrides.name ?? 'Test Customer',
      address: overrides.address ?? '123 Main St',
      lat: overrides.lat,
      lng: overrides.lng,
    },
  });
}

export async function createTestTechnician(
  p: PrismaClient,
  companyId: string,
  overrides: Partial<{ name: string; skills: string[]; status: any; currentLat: number; currentLng: number }> = {},
) {
  return p.technician.create({
    data: {
      companyId,
      name: overrides.name ?? 'Test Tech',
      skills: overrides.skills ?? ['HVAC'],
      status: overrides.status,
      currentLat: overrides.currentLat,
      currentLng: overrides.currentLng,
    },
  });
}

export async function createTestWorkOrder(
  p: PrismaClient,
  companyId: string,
  customerId: string,
  overrides: Partial<{
    title: string;
    technicianId: string;
    status: any;
    priority: number;
  }> = {},
) {
  return p.workOrder.create({
    data: {
      companyId,
      customerId,
      title: overrides.title ?? 'Test Work Order',
      technicianId: overrides.technicianId,
      status: overrides.status ?? 'UNASSIGNED',
      priority: overrides.priority ?? 3,
    },
  });
}
