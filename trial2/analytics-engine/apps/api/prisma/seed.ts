import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

async function main() {
  const apiKey = `ak_live_${randomBytes(32).toString('hex')}`;
  const apiKeyHash = hashApiKey(apiKey);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-tenant' },
    update: {},
    create: {
      name: 'Demo Tenant',
      slug: 'demo-tenant',
      apiKey,
      apiKeyHash,
      branding: {
        primaryColor: '#3b82f6',
        fontFamily: 'Inter, sans-serif',
      },
    },
  });

  console.log(`Tenant created: ${tenant.name} (${tenant.id})`);
  console.log(`API Key: ${apiKey}`);

  const dashboard = await prisma.dashboard.create({
    data: {
      tenantId: tenant.id,
      name: 'Sales Overview',
      description: 'Key sales metrics and trends',
      isPublished: true,
      layout: [
        { widgetId: 'placeholder-1', col: 0, row: 0, colSpan: 6, rowSpan: 4 },
        { widgetId: 'placeholder-2', col: 6, row: 0, colSpan: 6, rowSpan: 4 },
      ],
    },
  });

  console.log(`Dashboard created: ${dashboard.name} (${dashboard.id})`);

  const dataSource = await prisma.dataSource.create({
    data: {
      tenantId: tenant.id,
      name: 'Sales API',
      type: 'rest_api',
      isActive: true,
      config: {
        create: {
          connectionConfig: {
            url: 'https://api.example.com/sales',
            method: 'GET',
          },
          fieldMapping: [
            { source: 'date', target: 'timestamp', type: 'dimension', dataType: 'date' },
            { source: 'revenue', target: 'revenue', type: 'metric', dataType: 'number' },
            { source: 'region', target: 'region', type: 'dimension', dataType: 'string' },
          ],
          transformSteps: [],
          syncSchedule: '0 */6 * * *',
        },
      },
    },
  });

  console.log(`DataSource created: ${dataSource.name} (${dataSource.id})`);

  const widget = await prisma.widget.create({
    data: {
      dashboardId: dashboard.id,
      type: 'line',
      title: 'Revenue Over Time',
      config: {
        metric: 'revenue',
        dimension: 'timestamp',
        dateRange: '30d',
        groupBy: 'day',
      },
      position: { col: 0, row: 0 },
      size: { colSpan: 6, rowSpan: 4 },
      dataSourceId: dataSource.id,
    },
  });

  console.log(`Widget created: ${widget.title} (${widget.id})`);

  const now = new Date();
  const dataPoints = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dataPoints.push({
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
      timestamp: date,
      dimensions: { region: i % 3 === 0 ? 'North' : i % 3 === 1 ? 'South' : 'West' },
      metrics: { revenue: Math.round(10000 + Math.random() * 5000) },
    });
  }

  await prisma.dataPoint.createMany({ data: dataPoints });
  console.log(`Created ${dataPoints.length} data points`);

  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
