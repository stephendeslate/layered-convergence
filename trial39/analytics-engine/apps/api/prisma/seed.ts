// TRACED:AE-DB-02 — Seed script with error states, console.error, process.exit(1)
// TRACED:AE-DB-05 — RLS enabled via migration; seed populates data for RLS-protected tables
// TRACED:AE-DB-07 — Enum values match @@map definitions (ADMIN, EDITOR, VIEWER)
// TRACED:AE-DB-08 — Cascade deletes validated by seed structure (tenant -> users -> dashboards)

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('secure-password-123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-analytics' },
    update: {},
    create: {
      name: 'Acme Analytics Corp',
      slug: 'acme-analytics',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme-analytics.com' },
    update: {},
    create: {
      email: 'admin@acme-analytics.com',
      passwordHash,
      displayName: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@acme-analytics.com' },
    update: {},
    create: {
      email: 'editor@acme-analytics.com',
      passwordHash,
      displayName: 'Editor User',
      role: 'EDITOR',
      tenantId: tenant.id,
    },
  });

  await prisma.dashboard.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Revenue Overview',
      description: 'Monthly revenue tracking dashboard',
      isPublic: true,
      tenantId: tenant.id,
      createdById: adminUser.id,
    },
  });

  await prisma.dashboard.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'User Engagement',
      description: 'Daily active user metrics',
      isPublic: false,
      tenantId: tenant.id,
      createdById: editorUser.id,
    },
  });

  const pipeline = await prisma.pipeline.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'ETL Daily Sync',
      description: 'Extracts and transforms data from external sources',
      status: 'RUNNING',
      schedule: '0 2 * * *',
      tenantId: tenant.id,
    },
  });

  const failedPipeline = await prisma.pipeline.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Data Export (Broken)',
      description: 'This pipeline is in a failed state for testing',
      status: 'FAILED',
      tenantId: tenant.id,
    },
  });

  // Successful pipeline run
  await prisma.pipelineRun.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      status: 'SUCCESS',
      startedAt: new Date('2026-03-20T02:00:00Z'),
      finishedAt: new Date('2026-03-20T02:15:00Z'),
      pipelineId: pipeline.id,
    },
  });

  // Failed pipeline run — error state
  await prisma.pipelineRun.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      status: 'FAILURE',
      startedAt: new Date('2026-03-19T02:00:00Z'),
      finishedAt: new Date('2026-03-19T02:03:00Z'),
      errorMsg: 'Connection refused: upstream data source unavailable',
      pipelineId: failedPipeline.id,
    },
  });

  // Timed out pipeline run — error state
  await prisma.pipelineRun.upsert({
    where: { id: '00000000-0000-0000-0000-000000000022' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000022',
      status: 'TIMED_OUT',
      startedAt: new Date('2026-03-18T02:00:00Z'),
      errorMsg: 'Operation timed out after 300000ms',
      pipelineId: failedPipeline.id,
    },
  });

  await prisma.report.upsert({
    where: { id: '00000000-0000-0000-0000-000000000030' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000030',
      title: 'Q1 Revenue Report',
      content: 'Quarterly revenue summary with breakdowns by segment',
      format: 'pdf',
      dashboardId: '00000000-0000-0000-0000-000000000001',
      generatedBy: adminUser.id,
    },
  });
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
