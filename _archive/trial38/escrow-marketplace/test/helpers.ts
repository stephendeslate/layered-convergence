import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

export function createTestPool(): Pool {
  return new Pool({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5433', 10),
    user: process.env.DATABASE_USER ?? 'test',
    password: process.env.DATABASE_PASSWORD ?? 'test',
    database: process.env.DATABASE_NAME ?? 'escrow_test',
  });
}

export function createTestPrisma(pool: Pool): PrismaClient {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function cleanDatabase(pool: Pool): Promise<void> {
  await pool.query(`
    TRUNCATE TABLE
      webhook_events,
      webhook_endpoints,
      audit_logs,
      transaction_status_history,
      milestones,
      payouts,
      disputes,
      transactions,
      users
    CASCADE
  `);
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides: Partial<{
    email: string;
    name: string;
    role: 'BUYER' | 'PROVIDER' | 'ADMIN';
    password: string;
  }> = {},
) {
  const passwordHash = await bcrypt.hash(overrides.password ?? 'password123', 10);
  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${Date.now()}@test.com`,
      name: overrides.name ?? 'Test User',
      role: overrides.role ?? 'BUYER',
      passwordHash,
    },
  });
}
