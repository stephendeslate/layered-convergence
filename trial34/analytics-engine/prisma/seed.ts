import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TRACED: AE-SV-SEED-001 — Seed with tenant, users, entities, error/failure states
async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'Acme Analytics', slug: 'acme-analytics' },
  });

  const owner = await prisma.user.create({
    data: {
      email: 'owner@acme.com',
      passwordHash: '$2b$12$placeholder.hash.owner',
      name: 'Alice Owner',
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'analyst@acme.com',
      passwordHash: '$2b$12$placeholder.hash.analyst',
      name: 'Bob Analyst',
      role: 'ANALYST',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Sales Overview',
      slug: 'sales-overview',
      description: 'Main sales metrics dashboard',
      tenantId: tenant.id,
      createdById: owner.id,
    },
  });

  await prisma.widget.createMany({
    data: [
      { name: 'Revenue Chart', type: 'CHART', dashboardId: dashboard.id },
      { name: 'Metrics Summary', type: 'METRIC', dashboardId: dashboard.id },
    ],
  });

  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'ETL Daily',
      slug: 'etl-daily',
      status: 'COMPLETED',
      tenantId: tenant.id,
    },
  });

  // Success run
  await prisma.pipelineRun.create({
    data: {
      pipelineId: pipeline.id,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // TRACED: AE-SV-SEED-002 — Error/failure state seed data
  const failedPipeline = await prisma.pipeline.create({
    data: {
      name: 'Import Broken',
      slug: 'import-broken',
      status: 'FAILED',
      tenantId: tenant.id,
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: failedPipeline.id,
      status: 'FAILED',
      completedAt: new Date(),
      errorLog: 'Connection timeout after 30s',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Dashboard',
      entityId: dashboard.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
