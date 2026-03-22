// TRACED:AE-SEED-SCRIPT
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Demo Analytics Corp',
    },
  });

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const adminUser = await prisma.user.create({
    data: {
      id: 'u1000000-0000-0000-0000-000000000001',
      email: 'admin@demo.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      id: 'u2000000-0000-0000-0000-000000000002',
      email: 'editor@demo.com',
      password: passwordHash,
      name: 'Editor User',
      role: 'EDITOR',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      id: 'ds100000-0000-0000-0000-000000000001',
      name: 'Production Database',
      description: 'Main PostgreSQL production database',
      type: 'DATABASE',
      connectionUrl: 'postgresql://readonly:pass@db.example.com:5432/prod',
      cost: 150.00,
      isActive: true,
      tenantId: tenant.id,
    },
  });

  const inactiveDataSource = await prisma.dataSource.create({
    data: {
      id: 'ds200000-0000-0000-0000-000000000002',
      name: 'Deprecated API Feed',
      description: 'Legacy API — scheduled for removal',
      type: 'API',
      cost: 0,
      isActive: false,
      tenantId: tenant.id,
    },
  });

  await prisma.event.createMany({
    data: [
      {
        id: 'ev100000-0000-0000-0000-000000000001',
        name: 'User Signup Tracking',
        description: 'Tracks new user registrations',
        status: 'COMPLETED',
        cost: 0.50,
        tenantId: tenant.id,
        dataSourceId: dataSource.id,
      },
      {
        id: 'ev200000-0000-0000-0000-000000000002',
        name: 'Revenue Report Generation',
        description: 'Monthly revenue aggregation',
        status: 'PROCESSING',
        cost: 12.75,
        tenantId: tenant.id,
        dataSourceId: dataSource.id,
      },
      {
        id: 'ev300000-0000-0000-0000-000000000003',
        name: 'Failed Import Job',
        description: 'Data import that encountered an error',
        status: 'FAILED',
        cost: 3.20,
        tenantId: tenant.id,
        dataSourceId: inactiveDataSource.id,
      },
      {
        id: 'ev400000-0000-0000-0000-000000000004',
        name: 'Pending Batch Process',
        description: 'Queued for processing',
        status: 'PENDING',
        cost: 0,
        tenantId: tenant.id,
      },
    ],
  });

  await prisma.dashboard.createMany({
    data: [
      {
        id: 'db100000-0000-0000-0000-000000000001',
        name: 'Executive Overview',
        description: 'High-level KPIs for leadership',
        isPublic: true,
        tenantId: tenant.id,
        ownerId: adminUser.id,
      },
      {
        id: 'db200000-0000-0000-0000-000000000002',
        name: 'Engineering Metrics',
        description: 'CI/CD and deployment tracking',
        isPublic: false,
        tenantId: tenant.id,
        ownerId: editorUser.id,
      },
    ],
  });

  await prisma.pipeline.createMany({
    data: [
      {
        id: 'pl100000-0000-0000-0000-000000000001',
        name: 'ETL Daily Sync',
        description: 'Daily data synchronization pipeline',
        status: 'ACTIVE',
        cost: 25.00,
        tenantId: tenant.id,
        dataSourceId: dataSource.id,
      },
      {
        id: 'pl200000-0000-0000-0000-000000000002',
        name: 'Legacy Import',
        description: 'Pipeline in error state due to source deprecation',
        status: 'ERROR',
        cost: 0,
        tenantId: tenant.id,
        dataSourceId: inactiveDataSource.id,
      },
      {
        id: 'pl300000-0000-0000-0000-000000000003',
        name: 'Paused Aggregation',
        description: 'Temporarily paused for maintenance',
        status: 'PAUSED',
        cost: 10.00,
        tenantId: tenant.id,
      },
    ],
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
