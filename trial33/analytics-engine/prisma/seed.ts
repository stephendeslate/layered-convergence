import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SecureP@ss123', 12);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'Acme Analytics', slug: 'acme-analytics' },
  });

  // Create users with all roles
  const owner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'owner@acme.com',
      passwordHash,
      role: 'OWNER',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@acme.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'analyst@acme.com',
      passwordHash,
      role: 'ANALYST',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'viewer@acme.com',
      passwordHash,
      role: 'VIEWER',
    },
  });

  // Dashboard
  const dashboard = await prisma.dashboard.create({
    data: {
      tenantId: tenant.id,
      userId: owner.id,
      name: 'Main Dashboard',
      isDefault: true,
    },
  });

  // Widgets (including error state)
  await prisma.widget.createMany({
    data: [
      {
        dashboardId: dashboard.id,
        userId: owner.id,
        name: 'Revenue Chart',
        widgetType: 'CHART',
        status: 'ACTIVE',
      },
      {
        dashboardId: dashboard.id,
        userId: analyst.id,
        name: 'User Table',
        widgetType: 'TABLE',
        status: 'ACTIVE',
      },
      {
        dashboardId: dashboard.id,
        userId: analyst.id,
        name: 'Broken Widget',
        widgetType: 'METRIC',
        status: 'ERROR',
      },
    ],
  });

  // Data Source
  const dataSource = await prisma.dataSource.create({
    data: {
      tenantId: tenant.id,
      name: 'Production DB',
      connectionType: 'postgresql',
    },
  });

  // Pipeline
  const pipeline = await prisma.pipeline.create({
    data: {
      tenantId: tenant.id,
      dataSourceId: dataSource.id,
      name: 'Daily Sync',
      schedule: '0 2 * * *',
    },
  });

  // Pipeline Runs (including failure state)
  await prisma.pipelineRun.createMany({
    data: [
      { pipelineId: pipeline.id, status: 'COMPLETED', rowsRead: 15000 },
      { pipelineId: pipeline.id, status: 'RUNNING', rowsRead: 500 },
      {
        pipelineId: pipeline.id,
        status: 'FAILED',
        errorMsg: 'Connection timeout after 30s',
        rowsRead: 0,
      },
    ],
  });

  // Report
  await prisma.report.create({
    data: {
      tenantId: tenant.id,
      name: 'Weekly Revenue',
      query: 'SELECT date, SUM(amount) FROM transactions GROUP BY date',
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: owner.id,
      action: 'CREATE',
      entity: 'dashboard',
      entityId: dashboard.id,
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
