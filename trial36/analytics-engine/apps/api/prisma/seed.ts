// TRACED: AE-DB-006
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@acme.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const analystUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'analyst@acme.com',
      name: 'Analyst User',
      passwordHash,
      role: 'ANALYST',
    },
  });

  await prisma.dashboard.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Revenue Overview',
        description: 'Monthly revenue metrics and trends',
        config: { widgets: ['revenue-chart', 'kpi-cards'] },
        createdById: adminUser.id,
      },
      {
        tenantId: tenant.id,
        name: 'User Engagement',
        description: 'Daily active users and session metrics',
        config: { widgets: ['dau-chart', 'session-table'] },
        createdById: analystUser.id,
      },
    ],
  });

  const activePipeline = await prisma.pipeline.create({
    data: {
      tenantId: tenant.id,
      name: 'Daily ETL',
      description: 'Extracts data from source systems daily',
      status: 'ACTIVE',
      schedule: '0 2 * * *',
      config: { source: 'postgres', destination: 'warehouse' },
      createdById: adminUser.id,
    },
  });

  const failedPipeline = await prisma.pipeline.create({
    data: {
      tenantId: tenant.id,
      name: 'Legacy Import',
      description: 'Failed migration from legacy system',
      status: 'FAILED',
      config: { source: 'csv', destination: 'warehouse' },
      createdById: adminUser.id,
    },
  });

  await prisma.pipelineRun.createMany({
    data: [
      {
        pipelineId: activePipeline.id,
        status: 'COMPLETED',
        startedAt: new Date('2025-01-01T02:00:00Z'),
        completedAt: new Date('2025-01-01T02:15:00Z'),
        recordsProcessed: 15420,
      },
      {
        pipelineId: activePipeline.id,
        status: 'COMPLETED',
        startedAt: new Date('2025-01-02T02:00:00Z'),
        completedAt: new Date('2025-01-02T02:12:00Z'),
        recordsProcessed: 14890,
      },
      {
        pipelineId: failedPipeline.id,
        status: 'FAILED',
        startedAt: new Date('2025-01-01T03:00:00Z'),
        completedAt: new Date('2025-01-01T03:05:00Z'),
        errorMessage: 'Connection timeout: legacy database unreachable after 300s',
        recordsProcessed: 0,
      },
    ],
  });

  await prisma.report.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Q4 2024 Summary',
        description: 'Quarterly business metrics report',
        status: 'PUBLISHED',
        config: { format: 'pdf', sections: ['revenue', 'users', 'pipelines'] },
        generatedAt: new Date('2025-01-05T10:00:00Z'),
        createdById: analystUser.id,
      },
      {
        tenantId: tenant.id,
        name: 'Failed Export Report',
        description: 'Attempted data export that encountered errors',
        status: 'FAILED',
        config: { format: 'csv', sections: ['raw-data'] },
        errorMessage: 'Export failed: insufficient permissions on target bucket',
        createdById: adminUser.id,
      },
      {
        tenantId: tenant.id,
        name: 'Monthly Metrics Draft',
        description: 'Work in progress monthly report',
        status: 'DRAFT',
        config: { format: 'pdf', sections: ['engagement'] },
        createdById: analystUser.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
