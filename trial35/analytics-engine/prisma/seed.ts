// TRACED: AE-SEED-001 — Database seed with error/failure states
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@acme.com',
      passwordHash,
      role: 'ANALYST',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Revenue Overview',
      description: 'Monthly revenue metrics and trends',
      tenantId: tenant.id,
      createdById: admin.id,
    },
  });

  await prisma.widget.createMany({
    data: [
      { type: 'CHART', title: 'Revenue Trend', dashboardId: dashboard.id, position: 0 },
      { type: 'METRIC', title: 'Total Revenue', dashboardId: dashboard.id, position: 1 },
      { type: 'TABLE', title: 'Top Products', dashboardId: dashboard.id, position: 2 },
    ],
  });

  // Active pipeline
  await prisma.pipeline.create({
    data: {
      name: 'ETL Main',
      source: 'postgresql',
      schedule: '0 * * * *',
      status: 'ACTIVE',
      tenantId: tenant.id,
      createdById: analyst.id,
    },
  });

  // Failed pipeline — error state
  await prisma.pipeline.create({
    data: {
      name: 'Legacy Import',
      source: 'csv',
      status: 'FAILED',
      tenantId: tenant.id,
      createdById: analyst.id,
    },
  });

  // Draft pipeline
  await prisma.pipeline.create({
    data: {
      name: 'Real-time Events',
      source: 'kafka',
      status: 'DRAFT',
      tenantId: tenant.id,
      createdById: admin.id,
    },
  });

  // Reports in various states
  await prisma.report.create({
    data: {
      name: 'Monthly Summary',
      type: 'SUMMARY',
      status: 'READY',
      fileSize: 524288,
      tenantId: tenant.id,
      generatedAt: new Date(),
    },
  });

  // Failed report — failure state
  await prisma.report.create({
    data: {
      name: 'Failed Export',
      type: 'EXPORT',
      status: 'FAILED',
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(String(e));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
