import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/field_service_test';

let pool: Pool;
let prisma: PrismaClient;

export async function getTestPrisma(): Promise<PrismaClient> {
  if (!prisma) {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
  }
  return prisma;
}

export async function cleanDatabase(): Promise<void> {
  const client = await getTestPrisma();
  await client.$executeRaw`TRUNCATE TABLE
    gps_events,
    work_order_status_history,
    invoices,
    routes,
    work_orders,
    customers,
    technicians,
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

export async function createTestCompany(
  client: PrismaClient,
  data?: Partial<{ name: string; slug: string }>,
) {
  return client.company.create({
    data: {
      name: data?.name ?? 'Test Company',
      slug: data?.slug ?? `test-${Date.now()}`,
    },
  });
}

export async function createTestUser(
  client: PrismaClient,
  companyId: string,
  data?: Partial<{ email: string; name: string; role: any }>,
) {
  return client.user.create({
    data: {
      email: data?.email ?? `user-${Date.now()}@test.com`,
      password: '$2b$10$dummyhashedpassword',
      name: data?.name ?? 'Test User',
      role: data?.role ?? 'ADMIN',
      companyId,
    },
  });
}

export async function createTestCustomer(
  client: PrismaClient,
  companyId: string,
  data?: Partial<{ name: string; address: string; lat: number; lng: number }>,
) {
  return client.customer.create({
    data: {
      name: data?.name ?? 'Test Customer',
      address: data?.address ?? '123 Test St',
      lat: data?.lat,
      lng: data?.lng,
      companyId,
    },
  });
}

export async function createTestTechnician(
  client: PrismaClient,
  companyId: string,
  data?: Partial<{ name: string; skills: string[]; currentLat: number; currentLng: number }>,
) {
  return client.technician.create({
    data: {
      name: data?.name ?? 'Test Technician',
      skills: data?.skills ?? [],
      currentLat: data?.currentLat,
      currentLng: data?.currentLng,
      companyId,
    },
  });
}
