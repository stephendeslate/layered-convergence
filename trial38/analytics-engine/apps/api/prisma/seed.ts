// TRACED: AE-DB-07
// TRACED: AE-DB-08
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.test',
      passwordHash: '$2b$12$placeholder.hash.for.seed.data.only',
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@acme.test',
      passwordHash: '$2b$12$placeholder.hash.for.seed.data.only',
      name: 'Editor User',
      role: 'EDITOR',
      tenantId: tenant.id,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@acme.test',
      passwordHash: '$2b$12$placeholder.hash.for.seed.data.only',
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const revenueDashboard = await prisma.dashboard.create({
    data: {
      title: 'Revenue Overview',
      slug: 'revenue-overview',
      description: 'Monthly revenue metrics and trends',
      config: { widgets: ['revenue-chart', 'top-products'] },
      tenantId: tenant.id,
      createdBy: adminUser.id,
    },
  });

  await prisma.dashboard.create({
    data: {
      title: 'User Engagement',
      slug: 'user-engagement',
      description: 'User activity and retention analytics',
      config: { widgets: ['active-users', 'session-duration'] },
      tenantId: tenant.id,
      createdBy: editorUser.id,
    },
  });

  const activePipeline = await prisma.pipeline.create({
    data: {
      name: 'Daily ETL',
      description: 'Extract, transform, and load daily data',
      schedule: '0 2 * * *',
      status: 'ACTIVE',
      config: { source: 'warehouse', destination: 'analytics' },
      tenantId: tenant.id,
      createdBy: adminUser.id,
    },
  });

  const failedPipeline = await prisma.pipeline.create({
    data: {
      name: 'Legacy Import',
      description: 'Import data from legacy system',
      schedule: '0 4 * * 1',
      status: 'FAILED',
      config: { source: 'legacy-db', destination: 'analytics' },
      tenantId: tenant.id,
      createdBy: adminUser.id,
    },
  });

  await prisma.pipeline.create({
    data: {
      name: 'Hourly Metrics Sync',
      description: 'Synchronize metrics from external providers',
      schedule: '0 * * * *',
      status: 'PAUSED',
      tenantId: tenant.id,
      createdBy: editorUser.id,
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: activePipeline.id,
      status: 'COMPLETED',
      startedAt: new Date('2026-03-20T02:00:00Z'),
      completedAt: new Date('2026-03-20T02:15:00Z'),
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: failedPipeline.id,
      status: 'FAILED',
      startedAt: new Date('2026-03-17T04:00:00Z'),
      completedAt: new Date('2026-03-17T04:03:00Z'),
      errorMessage: 'Connection to legacy database timed out after 180s',
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: activePipeline.id,
      status: 'PENDING',
      startedAt: null,
      completedAt: null,
    },
  });

  await prisma.report.create({
    data: {
      title: 'Q1 Revenue Summary',
      description: 'First quarter revenue analysis',
      format: 'PDF',
      data: { generatedAt: '2026-03-15T10:00:00Z' },
      tenantId: tenant.id,
      dashboardId: revenueDashboard.id,
    },
  });

  await prisma.report.create({
    data: {
      title: 'Monthly Active Users',
      description: 'User engagement metrics for March 2026',
      format: 'CSV',
      data: { generatedAt: '2026-03-10T08:00:00Z' },
      tenantId: tenant.id,
    },
  });

  // Suppress unused variable warnings
  void viewerUser;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
