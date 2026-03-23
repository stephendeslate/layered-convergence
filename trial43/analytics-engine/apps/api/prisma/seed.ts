import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-DATA-001
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@demo.com',
      passwordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  await prisma.event.createMany({
    data: [
      {
        type: 'PAGE_VIEW',
        status: 'PROCESSED',
        payload: { url: '/dashboard', userAgent: 'Chrome' },
        source: 'web',
        tenantId: tenant.id,
      },
      {
        type: 'CLICK',
        status: 'PENDING',
        payload: { element: 'button#submit' },
        source: 'web',
        tenantId: tenant.id,
      },
      {
        type: 'ERROR',
        status: 'FAILED',
        payload: { message: 'Connection timeout', code: 'ETIMEDOUT' },
        source: 'api',
        tenantId: tenant.id,
      },
    ],
  });

  await prisma.dashboard.create({
    data: {
      name: 'Main Dashboard',
      description: 'Primary analytics dashboard',
      config: { widgets: ['chart', 'table'] },
      isPublic: false,
      tenantId: tenant.id,
      userId: adminUser.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Production DB',
      type: 'POSTGRESQL',
      status: 'CONNECTED',
      connectionUri: 'postgresql://readonly:pass@db.example.com:5432/prod',
      config: { ssl: true },
      monthlyCost: 49.99,
      tenantId: tenant.id,
    },
  });

  const errorDataSource = await prisma.dataSource.create({
    data: {
      name: 'Failed Import Source',
      type: 'CSV',
      status: 'ERROR',
      connectionUri: 's3://bucket/data.csv',
      config: { delimiter: ',' },
      monthlyCost: 0.00,
      tenantId: tenant.id,
    },
  });

  await prisma.pipeline.createMany({
    data: [
      {
        name: 'ETL Pipeline',
        description: 'Extract transform load daily',
        status: 'ACTIVE',
        schedule: '0 2 * * *',
        config: { retries: 3 },
        processingCost: 15.50,
        dataSourceId: dataSource.id,
        tenantId: tenant.id,
      },
      {
        name: 'Failed Pipeline',
        description: 'Pipeline in error state for testing',
        status: 'FAILED',
        schedule: '0 * * * *',
        config: { retries: 0, lastError: 'OOM killed' },
        processingCost: 5.00,
        dataSourceId: errorDataSource.id,
        tenantId: tenant.id,
      },
    ],
  });

  process.stdout.write('Seed completed successfully\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
