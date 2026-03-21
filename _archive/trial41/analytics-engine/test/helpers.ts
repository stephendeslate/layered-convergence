import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createTestPool(): Pool {
  return new Pool({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5433', 10),
    user: process.env.DATABASE_USER ?? 'test',
    password: process.env.DATABASE_PASSWORD ?? 'test',
    database: process.env.DATABASE_NAME ?? 'analytics_test',
  });
}

export function createTestPrisma(pool: Pool): PrismaClient {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function cleanDatabase(pool: Pool): Promise<void> {
  await pool.query(`
    TRUNCATE TABLE
      dead_letter_events,
      query_cache,
      embed_configs,
      data_points,
      sync_runs,
      data_source_configs,
      data_sources,
      widgets,
      dashboards,
      tenants
    CASCADE
  `);
}

export async function createTestTenant(
  prisma: PrismaClient,
  overrides: Partial<{
    name: string;
    apiKey: string;
    primaryColor: string;
    fontFamily: string;
    logoUrl: string;
  }> = {},
) {
  return prisma.tenant.create({
    data: {
      name: overrides.name ?? `Tenant-${Date.now()}`,
      apiKey: overrides.apiKey ?? `key-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      primaryColor: overrides.primaryColor,
      fontFamily: overrides.fontFamily,
      logoUrl: overrides.logoUrl,
    },
  });
}

export async function createTestDataSource(
  prisma: PrismaClient,
  tenantId: string,
  overrides: Partial<{
    name: string;
    type: 'POSTGRESQL' | 'API' | 'CSV' | 'WEBHOOK';
    pipelineStatus: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  }> = {},
) {
  return prisma.dataSource.create({
    data: {
      tenantId,
      name: overrides.name ?? `Source-${Date.now()}`,
      type: overrides.type ?? 'API',
      pipelineStatus: overrides.pipelineStatus ?? 'DRAFT',
    },
  });
}
