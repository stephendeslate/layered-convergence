import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let pool: Pool;
let prisma: PrismaClient;

export async function setupTestDatabase(): Promise<PrismaClient> {
  pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5433/analytics_test',
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  await prisma.$connect();
  return prisma;
}

export async function teardownTestDatabase(): Promise<void> {
  if (prisma) await prisma.$disconnect();
  if (pool) await pool.end();
}

export async function truncateAllTables(client: PrismaClient): Promise<void> {
  const tablenames = [
    'dead_letter_events',
    'data_points',
    'sync_runs',
    'data_source_configs',
    'data_sources',
    'embed_configs',
    'widgets',
    'dashboards',
    'query_caches',
    'tenants',
  ];

  for (const table of tablenames) {
    await client.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}

export async function createTestTenant(client: PrismaClient, overrides: Partial<{
  name: string;
  apiKey: string;
}> = {}) {
  return client.tenant.create({
    data: {
      name: overrides.name || 'Test Tenant',
      apiKey: overrides.apiKey || `test-key-${Date.now()}`,
    },
  });
}

export async function createTestDataSource(client: PrismaClient, tenantId: string, overrides: Partial<{
  name: string;
  type: string;
  status: string;
}> = {}) {
  return client.dataSource.create({
    data: {
      tenantId,
      name: overrides.name || 'Test Source',
      type: overrides.type || 'webhook',
      status: overrides.status || 'active',
    },
  });
}

export async function createTestDashboard(client: PrismaClient, tenantId: string, overrides: Partial<{
  name: string;
  isPublished: boolean;
}> = {}) {
  return client.dashboard.create({
    data: {
      tenantId,
      name: overrides.name || 'Test Dashboard',
      isPublished: overrides.isPublished ?? false,
    },
  });
}
