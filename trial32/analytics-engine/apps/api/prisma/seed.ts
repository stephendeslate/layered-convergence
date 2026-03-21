import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  // Create tenants
  const tenant1 = await prisma.tenant.create({
    data: { name: 'Acme Analytics' },
  });

  const tenant2 = await prisma.tenant.create({
    data: { name: 'Beta Corp' },
  });

  // Create users with different roles
  await prisma.user.create({
    data: { email: 'viewer@acme.com', password: hashedPassword, role: 'VIEWER', tenantId: tenant1.id },
  });

  await prisma.user.create({
    data: { email: 'editor@acme.com', password: hashedPassword, role: 'EDITOR', tenantId: tenant1.id },
  });

  await prisma.user.create({
    data: { email: 'analyst@acme.com', password: hashedPassword, role: 'ANALYST', tenantId: tenant1.id },
  });

  await prisma.user.create({
    data: { email: 'viewer@beta.com', password: hashedPassword, role: 'VIEWER', tenantId: tenant2.id },
  });

  // Create data sources
  const ds1 = await prisma.dataSource.create({
    data: { name: 'PostgreSQL Production', type: 'postgresql', config: { host: 'db.acme.com' }, tenantId: tenant1.id },
  });

  const ds2 = await prisma.dataSource.create({
    data: { name: 'S3 Data Lake', type: 's3', config: { bucket: 'analytics-data' }, tenantId: tenant1.id },
  });

  // Create data points
  await prisma.dataPoint.create({
    data: { value: 1234.567890, label: 'Monthly Revenue', dataSourceId: ds1.id, tenantId: tenant1.id },
  });

  await prisma.dataPoint.create({
    data: { value: 42.000001, label: 'Active Users', dataSourceId: ds1.id, tenantId: tenant1.id },
  });

  // Create pipelines with state transitions
  const pipeline1 = await prisma.pipeline.create({
    data: { name: 'ETL Pipeline', tenantId: tenant1.id, status: 'DRAFT' },
  });

  // Transition DRAFT -> ACTIVE
  await prisma.pipeline.update({
    where: { id: pipeline1.id },
    data: { status: 'ACTIVE' },
  });

  // Transition ACTIVE -> PAUSED
  await prisma.pipeline.update({
    where: { id: pipeline1.id },
    data: { status: 'PAUSED' },
  });

  // Create another pipeline in ARCHIVED (terminal) state
  const pipeline2 = await prisma.pipeline.create({
    data: { name: 'Legacy Pipeline', tenantId: tenant1.id, status: 'DRAFT' },
  });
  await prisma.pipeline.update({
    where: { id: pipeline2.id },
    data: { status: 'ACTIVE' },
  });
  await prisma.pipeline.update({
    where: { id: pipeline2.id },
    data: { status: 'ARCHIVED' },
  });

  // Create dashboards and widgets
  const dashboard1 = await prisma.dashboard.create({
    data: { name: 'Revenue Dashboard', tenantId: tenant1.id },
  });

  await prisma.widget.create({
    data: { name: 'Revenue Chart', type: 'line_chart', config: { metric: 'revenue' }, dashboardId: dashboard1.id },
  });

  await prisma.widget.create({
    data: { name: 'Users Table', type: 'table', config: { columns: ['name', 'email'] }, dashboardId: dashboard1.id },
  });

  // Create embeds
  await prisma.embed.create({
    data: { tenantId: tenant1.id, dashboardId: dashboard1.id, isActive: true },
  });

  // Create an inactive embed
  await prisma.embed.create({
    data: { tenantId: tenant1.id, dashboardId: dashboard1.id, isActive: false },
  });

  // Create sync runs with state transitions including error states
  const syncRun1 = await prisma.syncRun.create({
    data: { dataSourceId: ds1.id, tenantId: tenant1.id, status: 'PENDING' },
  });

  // Transition PENDING -> RUNNING -> COMPLETED (success path)
  await prisma.syncRun.update({
    where: { id: syncRun1.id },
    data: { status: 'RUNNING', startedAt: new Date() },
  });
  await prisma.syncRun.update({
    where: { id: syncRun1.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Create a failed sync run (error state)
  const syncRun2 = await prisma.syncRun.create({
    data: { dataSourceId: ds2.id, tenantId: tenant1.id, status: 'PENDING' },
  });
  await prisma.syncRun.update({
    where: { id: syncRun2.id },
    data: { status: 'RUNNING', startedAt: new Date() },
  });
  await prisma.syncRun.update({
    where: { id: syncRun2.id },
    data: { status: 'FAILED', completedAt: new Date(), errorMessage: 'Connection timeout after 30s' },
  });
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      process.stderr.write(e.message + '\n');
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
