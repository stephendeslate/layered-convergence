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

  // Create 3 data sources
  const salesDs = await prisma.dataSource.create({
    data: {
      name: 'Sales Database',
      type: 'postgresql',
      config: '{"host":"db.internal","port":5432}',
      tenantId: tenant.id,
    },
  });

  const marketingDs = await prisma.dataSource.create({
    data: {
      name: 'Marketing API',
      type: 'rest_api',
      config: '{"url":"https://api.marketing.example.com","apiKey":"***"}',
      tenantId: tenant.id,
    },
  });

  const inventoryDs = await prisma.dataSource.create({
    data: {
      name: 'Inventory Feed',
      type: 'csv',
      config: '{"bucket":"s3://inventory-data","pattern":"*.csv"}',
      tenantId: tenant.id,
    },
  });

  // Create 3 data points
  await prisma.dataPoint.create({
    data: {
      value: 15299.5,
      label: 'Q1 Revenue',
      timestamp: new Date('2026-01-15'),
      dataSourceId: salesDs.id,
    },
  });

  await prisma.dataPoint.create({
    data: {
      value: 8432.75,
      label: 'Q1 Ad Spend',
      timestamp: new Date('2026-01-20'),
      dataSourceId: marketingDs.id,
    },
  });

  await prisma.dataPoint.create({
    data: {
      value: 2147.0,
      label: 'Inventory Count',
      timestamp: new Date('2026-02-01'),
      dataSourceId: inventoryDs.id,
    },
  });

  // Create 3 pipelines
  // State transition 1: Pipeline DRAFT → ACTIVE
  const pipeline1 = await prisma.pipeline.create({
    data: {
      name: 'Sales ETL Pipeline',
      status: 'DRAFT',
      config: '{"schedule":"0 * * * *"}',
      tenantId: tenant.id,
    },
  });

  await prisma.pipeline.update({
    where: { id: pipeline1.id },
    data: { status: 'ACTIVE' },
  });

  await prisma.pipeline.create({
    data: {
      name: 'Marketing Data Sync',
      status: 'ACTIVE',
      config: '{"schedule":"0 */6 * * *"}',
      tenantId: tenant.id,
    },
  });

  await prisma.pipeline.create({
    data: {
      name: 'Legacy Import',
      status: 'ARCHIVED',
      config: '{"schedule":"manual"}',
      tenantId: tenant.id,
    },
  });

  // Create 3 dashboards
  const dashboard1 = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      tenantId: tenant.id,
      userId: analyst.id,
    },
  });

  const dashboard2 = await prisma.dashboard.create({
    data: {
      title: 'Marketing Performance',
      tenantId: tenant.id,
      userId: analyst.id,
    },
  });

  await prisma.dashboard.create({
    data: {
      title: 'Executive Summary',
      tenantId: tenant.id,
      userId: analyst.id,
    },
  });

  // Create 3 widgets
  await prisma.widget.create({
    data: {
      type: 'bar_chart',
      config: '{"metric":"revenue","groupBy":"month"}',
      dashboardId: dashboard1.id,
    },
  });

  await prisma.widget.create({
    data: {
      type: 'line_chart',
      config: '{"metric":"conversions","period":"weekly"}',
      dashboardId: dashboard1.id,
    },
  });

  await prisma.widget.create({
    data: {
      type: 'pie_chart',
      config: '{"metric":"channel_distribution"}',
      dashboardId: dashboard2.id,
    },
  });

  // Create 3 embeds
  await prisma.embed.create({
    data: {
      token: 'embed-token-sales-overview',
      tenantId: tenant.id,
      config: '{"dashboardId":"' + dashboard1.id + '"}',
      expiresAt: new Date('2027-01-01'),
    },
  });

  await prisma.embed.create({
    data: {
      token: 'embed-token-marketing',
      tenantId: tenant.id,
      config: '{"dashboardId":"' + dashboard2.id + '"}',
      expiresAt: new Date('2027-06-01'),
    },
  });

  await prisma.embed.create({
    data: {
      token: 'embed-token-public-report',
      tenantId: tenant.id,
      config: '{"type":"public","readonly":true}',
      expiresAt: new Date('2026-12-31'),
    },
  });

  // State transition 2: SyncRun PENDING → RUNNING → COMPLETED
  const syncRun1 = await prisma.syncRun.create({
    data: {
      status: 'PENDING',
      dataSourceId: salesDs.id,
    },
  });

  await prisma.syncRun.update({
    where: { id: syncRun1.id },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  await prisma.syncRun.update({
    where: { id: syncRun1.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      recordCount: 1542,
    },
  });

  // Create 2 more sync runs
  const syncRun2 = await prisma.syncRun.create({
    data: {
      status: 'PENDING',
      dataSourceId: marketingDs.id,
    },
  });

  await prisma.syncRun.update({
    where: { id: syncRun2.id },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  await prisma.syncRun.create({
    data: {
      status: 'FAILED',
      dataSourceId: inventoryDs.id,
      startedAt: new Date('2026-02-28T10:00:00Z'),
      errorMessage: 'Connection timeout after 30s',
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
