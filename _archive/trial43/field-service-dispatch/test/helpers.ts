import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/field_service_test';

let pool: Pool;
let prisma: PrismaClient;

export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    pool = new Pool({ connectionString: DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function cleanDatabase(): Promise<void> {
  const client = getTestPrisma();
  await client.$executeRaw`TRUNCATE TABLE
    gps_events,
    parts,
    assignments,
    work_order_status_history,
    work_orders,
    notifications,
    audit_logs,
    technicians,
    customers,
    users,
    companies
    CASCADE`;
}

export async function teardown(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
  if (pool) {
    await pool.end();
  }
}

export async function createTestCompany(overrides: Partial<{ name: string; slug: string }> = {}) {
  const client = getTestPrisma();
  return client.company.create({
    data: {
      name: overrides.name || 'Test Company',
      slug: overrides.slug || `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
  });
}

export async function createTestUser(companyId: string, overrides: Partial<{ email: string; name: string; password: string; role: any }> = {}) {
  const client = getTestPrisma();
  const hashedPassword = await bcrypt.hash(overrides.password || 'password123', 10);
  return client.user.create({
    data: {
      email: overrides.email || `user-${Date.now()}@test.com`,
      password: hashedPassword,
      name: overrides.name || 'Test User',
      role: overrides.role || 'DISPATCHER',
      companyId,
    },
  });
}

export async function createTestCustomer(companyId: string, overrides: Partial<{ name: string; address: string }> = {}) {
  const client = getTestPrisma();
  return client.customer.create({
    data: {
      companyId,
      name: overrides.name || 'Test Customer',
      address: overrides.address || '123 Test St',
    },
  });
}

export async function createTestTechnician(companyId: string, overrides: Partial<{ name: string; skills: string[]; status: any }> = {}) {
  const client = getTestPrisma();
  return client.technician.create({
    data: {
      companyId,
      name: overrides.name || 'Test Technician',
      skills: overrides.skills || ['general'],
      status: overrides.status || 'AVAILABLE',
    },
  });
}

export async function createTestWorkOrder(
  companyId: string,
  customerId: string,
  overrides: Partial<{ title: string; status: any; technicianId: string; priority: number }> = {},
) {
  const client = getTestPrisma();
  return client.workOrder.create({
    data: {
      companyId,
      customerId,
      title: overrides.title || 'Test Work Order',
      status: overrides.status || 'UNASSIGNED',
      technicianId: overrides.technicianId,
      priority: overrides.priority || 3,
    },
  });
}
