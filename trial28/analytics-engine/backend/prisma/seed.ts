import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
    },
  });

  // Create 2 users with different roles
  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@acme.com',
      passwordHash,
      role: 'ANALYST',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'editor@acme.com',
      passwordHash,
      role: 'EDITOR',
      tenantId: tenant.id,
    },
  });

  // Create data source
  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Sales Database',
      type: 'postgresql',
      config: '{"host":"db.internal","port":5432}',
      tenantId: tenant.id,
    },
  });

  // Create data points
  await prisma.dataPoint.create({
    data: {
      value: 15299.5,
      label: 'Q1 Revenue',
      timestamp: new Date('2026-01-15'),
      dataSourceId: dataSource.id,
    },
  });

  // State transition 1: Pipeline DRAFT → ACTIVE
  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'Sales ETL Pipeline',
      status: 'DRAFT',
      config: '{"schedule":"0 * * * *"}',
      tenantId: tenant.id,
    },
  });

  await prisma.pipeline.update({
    where: { id: pipeline.id },
    data: { status: 'ACTIVE' },
  });

  // State transition 2: SyncRun PENDING → RUNNING → COMPLETED
  const syncRun = await prisma.syncRun.create({
    data: {
      status: 'PENDING',
      dataSourceId: dataSource.id,
    },
  });

  await prisma.syncRun.update({
    where: { id: syncRun.id },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  await prisma.syncRun.update({
    where: { id: syncRun.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      recordCount: 1542,
    },
  });

  // Create dashboard and widget
  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      tenantId: tenant.id,
      userId: analyst.id,
    },
  });

  await prisma.widget.create({
    data: {
      type: 'bar_chart',
      config: '{"metric":"revenue","groupBy":"month"}',
      dashboardId: dashboard.id,
    },
  });

  // Create embed
  await prisma.embed.create({
    data: {
      token: 'embed-token-sales-overview',
      tenantId: tenant.id,
      config: '{"dashboardId":"' + dashboard.id + '"}',
      expiresAt: new Date('2027-01-01'),
    },
  });
}

main()
  .catch((e: Error) => {
    process.stderr.write(`Seed error: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
