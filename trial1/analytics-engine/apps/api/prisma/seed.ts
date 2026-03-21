import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function fakeEncryptedConfig(config: Record<string, unknown>) {
  return {
    configEncrypted: Buffer.from(JSON.stringify(config)),
    configIv: randomBytes(12),
    configTag: randomBytes(16),
  };
}

/** Generate realistic time-series values with daily/weekly seasonality. */
function generateSeasonalValue(
  base: number,
  dayOfWeek: number,
  dayIndex: number,
  noise: number = 0.15,
): number {
  // Weekend dip
  const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.65 : 1.0;
  // Slight upward trend
  const trendFactor = 1 + dayIndex * 0.002;
  // Random noise
  const noiseFactor = 1 + (Math.random() - 0.5) * 2 * noise;
  return Math.round(base * weekendFactor * trendFactor * noiseFactor);
}

// ─── Main Seed Function ──────────────────────────────────────

async function seed() {
  console.log('Seeding database...');

  // ─── Tenants ────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('DemoPass123!', 4);

  const tenantConfigs = [
    {
      name: 'Acme Analytics',
      email: 'admin@acme.example.com',
      tier: 'PRO' as const,
      primaryColor: '#3B82F6',
      secondaryColor: '#6366F1',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter',
      cornerRadius: 8,
      logoUrl: 'https://placehold.co/200x50/3B82F6/FFFFFF?text=Acme',
    },
    {
      name: 'TechCorp',
      email: 'admin@techcorp.example.com',
      tier: 'ENTERPRISE' as const,
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      backgroundColor: '#F0FDF4',
      textColor: '#064E3B',
      fontFamily: 'Roboto',
      cornerRadius: 12,
      logoUrl: 'https://placehold.co/200x50/10B981/FFFFFF?text=TechCorp',
    },
    {
      name: 'StartupXYZ',
      email: 'admin@startupxyz.example.com',
      tier: 'FREE' as const,
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      backgroundColor: '#FFFBEB',
      textColor: '#78350F',
      fontFamily: 'Poppins',
      cornerRadius: 4,
      logoUrl: null,
    },
  ];

  const tenants = await Promise.all(
    tenantConfigs.map((cfg) =>
      prisma.tenant.create({
        data: {
          ...cfg,
          passwordHash,
          emailVerified: true,
        },
      }),
    ),
  );
  console.log(`Created ${tenants.length} tenants (password: DemoPass123!)`);

  // ─── API Keys per tenant ───────────────────────────────────
  const apiKeys: Map<string, { adminKey: string; embedKey: string }> =
    new Map();

  for (const tenant of tenants) {
    const adminKeyRaw = `ae_admin_${tenant.name.toLowerCase().replace(/\s+/g, '')}_${randomBytes(16).toString('base64url')}`;
    const embedKeyRaw = `ae_embed_${tenant.name.toLowerCase().replace(/\s+/g, '')}_${randomBytes(16).toString('base64url')}`;

    await prisma.apiKey.createMany({
      data: [
        {
          tenantId: tenant.id,
          type: 'ADMIN',
          keyHash: hashApiKey(adminKeyRaw),
          keyPrefix: adminKeyRaw.slice(-4),
          name: 'Admin Key',
        },
        {
          tenantId: tenant.id,
          type: 'EMBED',
          keyHash: hashApiKey(embedKeyRaw),
          keyPrefix: embedKeyRaw.slice(-4),
          name: 'Embed Key',
        },
      ],
    });

    apiKeys.set(tenant.id, {
      adminKey: adminKeyRaw,
      embedKey: embedKeyRaw,
    });
  }
  console.log('Created API keys for all tenants');

  // ─── Data Sources ──────────────────────────────────────────
  for (const tenant of tenants) {
    const isFree = tenant.tier === 'FREE';

    // 1) REST API — Web Analytics
    const webAnalytics = await prisma.dataSource.create({
      data: {
        tenantId: tenant.id,
        name: 'Web Analytics API',
        connectorType: 'REST_API',
        syncSchedule: isFree ? 'MANUAL' : 'HOURLY',
      },
    });

    await prisma.dataSourceConfig.create({
      data: {
        dataSourceId: webAnalytics.id,
        ...fakeEncryptedConfig({
          url: 'https://analytics-api.example.com/v2/events',
          method: 'GET',
          headers: { Authorization: 'Bearer demo-token-analytics' },
          authType: 'bearer',
          jsonPath: '$.data.records',
          paginationType: 'cursor',
          paginationConfig: { cursorParam: 'after', pageSize: 500 },
        }),
        transforms: [{ type: 'rename', from: 'page_views', to: 'pageViews' }],
      },
    });

    await prisma.fieldMapping.createMany({
      data: [
        { dataSourceId: webAnalytics.id, sourceField: 'date', targetField: 'date', fieldType: 'DATE', fieldRole: 'DIMENSION', isRequired: true, sortOrder: 0 },
        { dataSourceId: webAnalytics.id, sourceField: 'region', targetField: 'region', fieldType: 'STRING', fieldRole: 'DIMENSION', sortOrder: 1 },
        { dataSourceId: webAnalytics.id, sourceField: 'page', targetField: 'page', fieldType: 'STRING', fieldRole: 'DIMENSION', sortOrder: 2 },
        { dataSourceId: webAnalytics.id, sourceField: 'page_views', targetField: 'pageViews', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 3 },
        { dataSourceId: webAnalytics.id, sourceField: 'unique_visitors', targetField: 'uniqueVisitors', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 4 },
        { dataSourceId: webAnalytics.id, sourceField: 'sessions', targetField: 'sessions', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 5 },
        { dataSourceId: webAnalytics.id, sourceField: 'bounce_rate', targetField: 'bounceRate', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 6 },
      ],
    });

    // 2) CSV — Revenue Data
    const revenueData = await prisma.dataSource.create({
      data: {
        tenantId: tenant.id,
        name: 'Revenue CSV Import',
        connectorType: 'CSV',
        syncSchedule: 'MANUAL',
      },
    });

    await prisma.dataSourceConfig.create({
      data: {
        dataSourceId: revenueData.id,
        ...fakeEncryptedConfig({
          delimiter: ',',
          hasHeader: true,
          dateFormat: 'YYYY-MM-DD',
        }),
        transforms: [],
      },
    });

    await prisma.fieldMapping.createMany({
      data: [
        { dataSourceId: revenueData.id, sourceField: 'date', targetField: 'date', fieldType: 'DATE', fieldRole: 'DIMENSION', isRequired: true, sortOrder: 0 },
        { dataSourceId: revenueData.id, sourceField: 'product', targetField: 'product', fieldType: 'STRING', fieldRole: 'DIMENSION', sortOrder: 1 },
        { dataSourceId: revenueData.id, sourceField: 'channel', targetField: 'channel', fieldType: 'STRING', fieldRole: 'DIMENSION', sortOrder: 2 },
        { dataSourceId: revenueData.id, sourceField: 'revenue', targetField: 'revenue', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 3 },
        { dataSourceId: revenueData.id, sourceField: 'orders', targetField: 'orders', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 4 },
        { dataSourceId: revenueData.id, sourceField: 'refunds', targetField: 'refunds', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 5 },
      ],
    });

    // 3) Webhook — Conversion Events (skip for FREE to stay under limit)
    let conversionEvents: { id: string } | null = null;
    if (!isFree) {
      conversionEvents = await prisma.dataSource.create({
        data: {
          tenantId: tenant.id,
          name: 'Conversion Webhook',
          connectorType: 'WEBHOOK',
          syncSchedule: 'MANUAL',
        },
      });

      await prisma.dataSourceConfig.create({
        data: {
          dataSourceId: conversionEvents.id,
          ...fakeEncryptedConfig({
            webhookSecret: 'whsec_demo_secret_' + tenant.name.toLowerCase(),
            signatureHeader: 'X-Webhook-Signature',
            expectedSchema: [
              { field: 'event_type', type: 'STRING' },
              { field: 'timestamp', type: 'DATE' },
              { field: 'value', type: 'NUMBER' },
            ],
          }),
          transforms: [],
        },
      });

      await prisma.fieldMapping.createMany({
        data: [
          { dataSourceId: conversionEvents.id, sourceField: 'event_type', targetField: 'eventType', fieldType: 'STRING', fieldRole: 'DIMENSION', isRequired: true, sortOrder: 0 },
          { dataSourceId: conversionEvents.id, sourceField: 'funnel_stage', targetField: 'funnelStage', fieldType: 'STRING', fieldRole: 'DIMENSION', sortOrder: 1 },
          { dataSourceId: conversionEvents.id, sourceField: 'timestamp', targetField: 'timestamp', fieldType: 'DATE', fieldRole: 'DIMENSION', sortOrder: 2 },
          { dataSourceId: conversionEvents.id, sourceField: 'conversions', targetField: 'conversions', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 3 },
          { dataSourceId: conversionEvents.id, sourceField: 'value', targetField: 'value', fieldType: 'NUMBER', fieldRole: 'METRIC', sortOrder: 4 },
        ],
      });
    }

    console.log(`Created ${isFree ? 2 : 3} data sources for ${tenant.name}`);

    // ─── DataPoints — Web Analytics (90 days) ─────────────────
    const regions = ['US', 'EU', 'APAC', 'LATAM'];
    const pages = ['/home', '/pricing', '/docs', '/blog', '/signup'];
    const now = new Date();
    const webDataPoints = [];

    for (let day = 0; day < 90; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();

      for (const region of regions) {
        for (const page of pages) {
          const baseViews =
            region === 'US' ? 800 : region === 'EU' ? 500 : region === 'APAC' ? 300 : 150;
          const pageFactor =
            page === '/home' ? 1.5 : page === '/pricing' ? 1.2 : page === '/docs' ? 1.0 : page === '/blog' ? 0.8 : 0.4;

          const pageViews = generateSeasonalValue(
            Math.round(baseViews * pageFactor),
            dayOfWeek,
            day,
          );
          const uniqueVisitors = Math.round(pageViews * (0.6 + Math.random() * 0.2));
          const sessions = Math.round(uniqueVisitors * (0.7 + Math.random() * 0.3));
          const bounceRate = Math.round(30 + Math.random() * 40);

          const dimensions = {
            date: date.toISOString().split('T')[0],
            region,
            page,
          };
          const metrics = { pageViews, uniqueVisitors, sessions, bounceRate };

          const sourceHash = createHash('sha256')
            .update(
              JSON.stringify({
                ds: webAnalytics.id,
                ...dimensions,
              }),
            )
            .digest('hex');

          webDataPoints.push({
            tenantId: tenant.id,
            dataSourceId: webAnalytics.id,
            dimensions,
            metrics,
            timestamp: date,
            sourceHash,
          });
        }
      }
    }

    // Insert in batches of 500
    for (let i = 0; i < webDataPoints.length; i += 500) {
      await prisma.dataPoint.createMany({
        data: webDataPoints.slice(i, i + 500),
        skipDuplicates: true,
      });
    }
    console.log(
      `Created ${webDataPoints.length} web analytics data points for ${tenant.name}`,
    );

    // ─── DataPoints — Revenue (60 days) ───────────────────────
    const products = ['Pro Plan', 'Enterprise Plan', 'Add-on: Analytics', 'Add-on: Exports'];
    const channels = ['Direct', 'Referral', 'Organic', 'Paid'];
    const revenueDataPoints = [];

    for (let day = 0; day < 60; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();

      for (const product of products) {
        for (const channel of channels) {
          const baseRevenue =
            product === 'Enterprise Plan' ? 2500 : product === 'Pro Plan' ? 800 : 200;
          const channelFactor =
            channel === 'Direct' ? 1.3 : channel === 'Organic' ? 1.0 : channel === 'Referral' ? 0.7 : 0.5;

          const revenue = generateSeasonalValue(
            Math.round(baseRevenue * channelFactor),
            dayOfWeek,
            day,
            0.2,
          );
          const orders = Math.max(1, Math.round(revenue / (baseRevenue * 0.8)));
          const refunds = Math.random() < 0.05 ? Math.round(revenue * 0.1) : 0;

          const dimensions = {
            date: date.toISOString().split('T')[0],
            product,
            channel,
          };
          const metrics = { revenue, orders, refunds };

          const sourceHash = createHash('sha256')
            .update(JSON.stringify({ ds: revenueData.id, ...dimensions }))
            .digest('hex');

          revenueDataPoints.push({
            tenantId: tenant.id,
            dataSourceId: revenueData.id,
            dimensions,
            metrics,
            timestamp: date,
            sourceHash,
          });
        }
      }
    }

    for (let i = 0; i < revenueDataPoints.length; i += 500) {
      await prisma.dataPoint.createMany({
        data: revenueDataPoints.slice(i, i + 500),
        skipDuplicates: true,
      });
    }
    console.log(
      `Created ${revenueDataPoints.length} revenue data points for ${tenant.name}`,
    );

    // ─── DataPoints — Conversions (30 days, non-free only) ────
    if (conversionEvents) {
      const funnelStages = ['Visit', 'Signup', 'Trial', 'Purchase', 'Renewal'];
      const convDataPoints = [];

      for (let day = 0; day < 30; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(0, 0, 0, 0);
        const dayOfWeek = date.getDay();

        for (let s = 0; s < funnelStages.length; s++) {
          const stage = funnelStages[s];
          const dropoff = Math.pow(0.4, s); // funnel narrows
          const conversions = generateSeasonalValue(
            Math.round(1000 * dropoff),
            dayOfWeek,
            day,
          );
          const value = Math.round(conversions * (10 + s * 20));

          const dimensions = {
            eventType: 'conversion',
            funnelStage: stage,
            date: date.toISOString().split('T')[0],
          };
          const metrics = { conversions, value };

          const sourceHash = createHash('sha256')
            .update(
              JSON.stringify({ ds: conversionEvents!.id, ...dimensions }),
            )
            .digest('hex');

          convDataPoints.push({
            tenantId: tenant.id,
            dataSourceId: conversionEvents!.id,
            dimensions,
            metrics,
            timestamp: date,
            sourceHash,
          });
        }
      }

      for (let i = 0; i < convDataPoints.length; i += 500) {
        await prisma.dataPoint.createMany({
          data: convDataPoints.slice(i, i + 500),
          skipDuplicates: true,
        });
      }
      console.log(
        `Created ${convDataPoints.length} conversion data points for ${tenant.name}`,
      );
    }

    // ─── AggregatedDataPoints (daily rollups for web analytics) ──
    const aggPoints = [];
    for (let day = 0; day < 90; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      // Aggregate across all regions/pages for the day
      const dayPoints = webDataPoints.filter(
        (dp) =>
          dp.dimensions.date === date.toISOString().split('T')[0],
      );

      for (const metricName of ['pageViews', 'uniqueVisitors', 'sessions']) {
        const values = dayPoints.map(
          (dp) => (dp.metrics as any)[metricName] as number,
        );
        if (values.length === 0) continue;

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        aggPoints.push({
          tenantId: tenant.id,
          dataSourceId: webAnalytics.id,
          period: 'DAILY' as const,
          periodStart: date,
          dimensionKey: 'all',
          metricName,
          sumValue: sum,
          avgValue: Math.round(avg * 100) / 100,
          countValue: values.length,
          minValue: min,
          maxValue: max,
        });
      }

      // Hourly aggregations for last 7 days
      if (day < 7) {
        for (let hour = 0; hour < 24; hour++) {
          const hourDate = new Date(date);
          hourDate.setHours(hour, 0, 0, 0);

          for (const metricName of ['pageViews', 'sessions']) {
            const daySum = dayPoints.reduce(
              (s, dp) => s + ((dp.metrics as any)[metricName] as number),
              0,
            );
            // Distribute across hours with a peak at 10-14
            const hourFactor =
              hour >= 10 && hour <= 14
                ? 0.08
                : hour >= 7 && hour <= 20
                  ? 0.05
                  : 0.02;
            const hourValue = Math.round(daySum * hourFactor);

            aggPoints.push({
              tenantId: tenant.id,
              dataSourceId: webAnalytics.id,
              period: 'HOURLY' as const,
              periodStart: hourDate,
              dimensionKey: 'all',
              metricName,
              sumValue: hourValue,
              avgValue: hourValue,
              countValue: 1,
              minValue: hourValue,
              maxValue: hourValue,
            });
          }
        }
      }
    }

    for (let i = 0; i < aggPoints.length; i += 500) {
      await prisma.aggregatedDataPoint.createMany({
        data: aggPoints.slice(i, i + 500),
        skipDuplicates: true,
      });
    }
    console.log(
      `Created ${aggPoints.length} aggregated data points for ${tenant.name}`,
    );

    // ─── SyncRun history ─────────────────────────────────────
    const syncRuns = [];
    for (let i = 0; i < 12; i++) {
      const runDate = new Date(now);
      runDate.setDate(runDate.getDate() - i * 3);

      const isFailed = i === 3 || i === 7; // 2 failures out of 12

      syncRuns.push({
        dataSourceId: webAnalytics.id,
        tenantId: tenant.id,
        status: isFailed ? ('FAILED' as const) : ('COMPLETED' as const),
        rowsSynced: isFailed ? 0 : 100 + Math.round(Math.random() * 200),
        rowsFailed: isFailed ? Math.round(Math.random() * 10) : 0,
        errorMessage: isFailed
          ? 'ECONNREFUSED: Connection refused to analytics-api.example.com'
          : null,
        startedAt: new Date(runDate.getTime() - 30000),
        completedAt: runDate,
      });
    }

    const createdSyncRuns = [];
    for (const sr of syncRuns) {
      const created = await prisma.syncRun.create({ data: sr });
      createdSyncRuns.push(created);
    }
    console.log(
      `Created ${createdSyncRuns.length} sync runs for ${tenant.name}`,
    );

    // ─── DeadLetterEvents for failed syncs ───────────────────
    const failedRuns = createdSyncRuns.filter((r) => r.status === 'FAILED');
    for (const failedRun of failedRuns) {
      await prisma.deadLetterEvent.createMany({
        data: [
          {
            syncRunId: failedRun.id,
            tenantId: tenant.id,
            dataSourceId: webAnalytics.id,
            payload: {
              row: 42,
              date: '2026-02-30',
              page_views: 'not-a-number',
            },
            errorMessage: 'Invalid date: 2026-02-30',
          },
          {
            syncRunId: failedRun.id,
            tenantId: tenant.id,
            dataSourceId: webAnalytics.id,
            payload: { row: 67, date: null, page_views: 100 },
            errorMessage: 'Required field "date" is null',
          },
        ],
      });
    }
    console.log(
      `Created ${failedRuns.length * 2} dead letter events for ${tenant.name}`,
    );

    // ─── Dashboards ──────────────────────────────────────────
    const dashboardConfigs = [
      {
        name: 'Website Traffic Overview',
        description: 'High-level view of website traffic metrics across regions',
        status: 'PUBLISHED' as const,
        widgets: [
          { type: 'KPI_CARD' as const, title: 'Total Page Views', subtitle: 'Last 30 days', dsRef: 'web', dim: 'date', metrics: [{ field: 'pageViews', aggregation: 'SUM' }], col: 1, span: 3, row: 1, typeConfig: { showSparkline: true, comparisonPeriod: 'week' } },
          { type: 'KPI_CARD' as const, title: 'Unique Visitors', subtitle: 'Last 30 days', dsRef: 'web', dim: 'date', metrics: [{ field: 'uniqueVisitors', aggregation: 'SUM' }], col: 4, span: 3, row: 1, typeConfig: { showSparkline: true } },
          { type: 'KPI_CARD' as const, title: 'Sessions', subtitle: 'Last 30 days', dsRef: 'web', dim: 'date', metrics: [{ field: 'sessions', aggregation: 'SUM' }], col: 7, span: 3, row: 1, typeConfig: { showSparkline: true } },
          { type: 'KPI_CARD' as const, title: 'Avg Bounce Rate', subtitle: 'Last 30 days', dsRef: 'web', dim: 'date', metrics: [{ field: 'bounceRate', aggregation: 'AVG' }], col: 10, span: 3, row: 1, typeConfig: { suffix: '%' } },
          { type: 'LINE' as const, title: 'Traffic Trend', subtitle: 'Daily page views and sessions', dsRef: 'web', dim: 'date', metrics: [{ field: 'pageViews', aggregation: 'SUM' }, { field: 'sessions', aggregation: 'SUM' }], col: 1, span: 8, row: 2, typeConfig: { showPoints: true, curveType: 'monotone' } },
          { type: 'PIE_DONUT' as const, title: 'Traffic by Region', subtitle: null, dsRef: 'web', dim: 'region', metrics: [{ field: 'pageViews', aggregation: 'SUM' }], col: 9, span: 4, row: 2, period: 'NONE' as const, typeConfig: { donut: true, showLabels: true } },
          { type: 'BAR' as const, title: 'Top Pages', subtitle: 'By page views', dsRef: 'web', dim: 'page', metrics: [{ field: 'pageViews', aggregation: 'SUM' }], col: 1, span: 6, row: 3, period: 'NONE' as const, typeConfig: { orientation: 'horizontal', mode: 'grouped' } },
          { type: 'AREA' as const, title: 'Visitor Trends', subtitle: 'Unique visitors over time', dsRef: 'web', dim: 'date', metrics: [{ field: 'uniqueVisitors', aggregation: 'SUM' }], col: 7, span: 6, row: 3, typeConfig: { stacked: false, fillOpacity: 0.3 } },
        ],
      },
      {
        name: 'Revenue Dashboard',
        description: 'Revenue performance across products and channels',
        status: 'PUBLISHED' as const,
        widgets: [
          { type: 'KPI_CARD' as const, title: 'Total Revenue', subtitle: 'Last 30 days', dsRef: 'revenue', dim: 'date', metrics: [{ field: 'revenue', aggregation: 'SUM' }], col: 1, span: 4, row: 1, typeConfig: { prefix: '$', showSparkline: true } },
          { type: 'KPI_CARD' as const, title: 'Total Orders', subtitle: 'Last 30 days', dsRef: 'revenue', dim: 'date', metrics: [{ field: 'orders', aggregation: 'SUM' }], col: 5, span: 4, row: 1, typeConfig: {} },
          { type: 'KPI_CARD' as const, title: 'Refund Amount', subtitle: 'Last 30 days', dsRef: 'revenue', dim: 'date', metrics: [{ field: 'refunds', aggregation: 'SUM' }], col: 9, span: 4, row: 1, typeConfig: { prefix: '$' } },
          { type: 'LINE' as const, title: 'Revenue Over Time', subtitle: null, dsRef: 'revenue', dim: 'date', metrics: [{ field: 'revenue', aggregation: 'SUM' }], col: 1, span: 12, row: 2, typeConfig: { curveType: 'monotone', showPoints: false } },
          { type: 'BAR' as const, title: 'Revenue by Product', subtitle: null, dsRef: 'revenue', dim: 'product', metrics: [{ field: 'revenue', aggregation: 'SUM' }], col: 1, span: 6, row: 3, period: 'NONE' as const, typeConfig: { mode: 'grouped', orientation: 'vertical' } },
          { type: 'PIE_DONUT' as const, title: 'Revenue by Channel', subtitle: null, dsRef: 'revenue', dim: 'channel', metrics: [{ field: 'revenue', aggregation: 'SUM' }], col: 7, span: 6, row: 3, period: 'NONE' as const, typeConfig: { donut: true } },
        ],
      },
      {
        name: 'Real-time Monitor',
        description: 'Live session tracking and alerts',
        status: 'DRAFT' as const,
        widgets: [
          { type: 'KPI_CARD' as const, title: 'Active Sessions', subtitle: 'Real-time', dsRef: 'web', dim: 'date', metrics: [{ field: 'sessions', aggregation: 'SUM' }], col: 1, span: 4, row: 1, typeConfig: {} },
          { type: 'LINE' as const, title: 'Sessions Last 24h', subtitle: null, dsRef: 'web', dim: 'date', metrics: [{ field: 'sessions', aggregation: 'SUM' }], col: 5, span: 8, row: 1, typeConfig: {} },
        ],
      },
      {
        name: 'Executive Summary',
        description: 'C-suite overview of key business metrics',
        status: 'PUBLISHED' as const,
        widgets: [
          { type: 'KPI_CARD' as const, title: 'Monthly Revenue', subtitle: 'Current month', dsRef: 'revenue', dim: 'date', metrics: [{ field: 'revenue', aggregation: 'SUM' }], col: 1, span: 6, row: 1, typeConfig: { prefix: '$', showSparkline: true } },
          { type: 'KPI_CARD' as const, title: 'Monthly Visitors', subtitle: 'Current month', dsRef: 'web', dim: 'date', metrics: [{ field: 'uniqueVisitors', aggregation: 'SUM' }], col: 7, span: 6, row: 1, typeConfig: { showSparkline: true } },
          { type: 'AREA' as const, title: 'Revenue vs Traffic', subtitle: null, dsRef: 'revenue', dim: 'date', metrics: [{ field: 'revenue', aggregation: 'SUM' }, { field: 'orders', aggregation: 'SUM' }], col: 1, span: 12, row: 2, typeConfig: { stacked: true, fillOpacity: 0.4 } },
        ],
      },
      {
        name: 'Historical Archive Q1',
        description: 'Archived Q1 2026 performance data',
        status: 'ARCHIVED' as const,
        widgets: [
          { type: 'TABLE' as const, title: 'Q1 Daily Breakdown', subtitle: null, dsRef: 'web', dim: 'date', metrics: [{ field: 'pageViews', aggregation: 'SUM' }, { field: 'sessions', aggregation: 'SUM' }], col: 1, span: 12, row: 1, period: 'NONE' as const, typeConfig: {} },
        ],
      },
    ];

    // Add conversion funnel dashboard for non-free
    if (conversionEvents) {
      dashboardConfigs.push(
        {
          name: 'Conversion Funnel',
          description: 'End-to-end conversion pipeline analysis',
          status: 'PUBLISHED' as const,
          widgets: [
            { type: 'FUNNEL' as const, title: 'Conversion Funnel', subtitle: 'Last 30 days', dsRef: 'conversion', dim: 'funnelStage', metrics: [{ field: 'conversions', aggregation: 'SUM' }], col: 1, span: 6, row: 1, period: 'NONE' as const, typeConfig: { showLabels: true, showPercentages: true } },
            { type: 'LINE' as const, title: 'Conversions Over Time', subtitle: null, dsRef: 'conversion', dim: 'date', metrics: [{ field: 'conversions', aggregation: 'SUM' }], col: 7, span: 6, row: 1, typeConfig: { showPoints: true } },
            { type: 'KPI_CARD' as const, title: 'Total Conversion Value', subtitle: 'Last 30 days', dsRef: 'conversion', dim: 'date', metrics: [{ field: 'value', aggregation: 'SUM' }], col: 1, span: 4, row: 2, typeConfig: { prefix: '$' } },
            { type: 'BAR' as const, title: 'Value by Stage', subtitle: null, dsRef: 'conversion', dim: 'funnelStage', metrics: [{ field: 'value', aggregation: 'SUM' }], col: 5, span: 8, row: 2, period: 'NONE' as const, typeConfig: { mode: 'grouped' } },
          ],
        },
        {
          name: 'AB Test Results',
          description: 'Comparing test variants',
          status: 'DRAFT' as const,
          widgets: [
            { type: 'BAR' as const, title: 'Variant Comparison', subtitle: null, dsRef: 'web', dim: 'page', metrics: [{ field: 'sessions', aggregation: 'SUM' }, { field: 'pageViews', aggregation: 'SUM' }], col: 1, span: 12, row: 1, period: 'NONE' as const, typeConfig: { mode: 'grouped' } },
          ],
        },
      );
    }

    // Create dashboards with widgets
    const dsMap: Record<string, string> = {
      web: webAnalytics.id,
      revenue: revenueData.id,
      conversion: conversionEvents?.id ?? webAnalytics.id,
    };

    for (const dCfg of dashboardConfigs) {
      const dashboard = await prisma.dashboard.create({
        data: {
          tenantId: tenant.id,
          name: dCfg.name,
          description: dCfg.description,
          status: dCfg.status,
          gridColumns: 12,
        },
      });

      if (dCfg.widgets.length > 0) {
        await prisma.widget.createMany({
          data: dCfg.widgets.map((w, idx) => ({
            dashboardId: dashboard.id,
            tenantId: tenant.id,
            dataSourceId: dsMap[w.dsRef],
            type: w.type,
            title: w.title,
            subtitle: w.subtitle ?? null,
            gridColumnStart: w.col,
            gridColumnSpan: w.span,
            gridRowStart: w.row,
            gridRowSpan: 1,
            dimensionField: w.dim,
            metricFields: w.metrics,
            dateRangePreset: 'LAST_30_DAYS',
            groupingPeriod: (w as any).period ?? 'DAILY',
            typeConfig: w.typeConfig,
            sortOrder: idx,
          })),
        });
      }

      // Create EmbedConfig for published dashboards
      if (dCfg.status === 'PUBLISHED') {
        await prisma.embedConfig.create({
          data: {
            dashboardId: dashboard.id,
            tenantId: tenant.id,
            allowedOrigins: [
              'http://localhost:3000',
              'http://localhost:3002',
              'https://demo.analytics-engine.example.com',
            ],
            isEnabled: true,
          },
        });
      }
    }

    console.log(
      `Created ${dashboardConfigs.length} dashboards with widgets for ${tenant.name}`,
    );

    // ─── Audit Log entries ───────────────────────────────────
    await prisma.auditLog.createMany({
      data: [
        {
          tenantId: tenant.id,
          action: 'TENANT_CREATED',
          resourceType: 'Tenant',
          resourceId: tenant.id,
          metadata: { tier: tenant.tier },
        },
        {
          tenantId: tenant.id,
          action: 'DATASOURCE_CREATED',
          resourceType: 'DataSource',
          resourceId: webAnalytics.id,
          metadata: { name: 'Web Analytics API' },
        },
        {
          tenantId: tenant.id,
          action: 'DATASOURCE_CREATED',
          resourceType: 'DataSource',
          resourceId: revenueData.id,
          metadata: { name: 'Revenue CSV Import' },
        },
        {
          tenantId: tenant.id,
          action: 'API_KEY_CREATED',
          resourceType: 'ApiKey',
          metadata: { type: 'ADMIN' },
        },
        {
          tenantId: tenant.id,
          action: 'API_KEY_CREATED',
          resourceType: 'ApiKey',
          metadata: { type: 'EMBED' },
        },
      ],
    });
  }

  // ─── Summary ────────────────────────────────────────────────
  const counts = {
    tenants: await prisma.tenant.count(),
    dataSources: await prisma.dataSource.count(),
    dataPoints: await prisma.dataPoint.count(),
    aggregatedDataPoints: await prisma.aggregatedDataPoint.count(),
    dashboards: await prisma.dashboard.count(),
    widgets: await prisma.widget.count(),
    syncRuns: await prisma.syncRun.count(),
    deadLetterEvents: await prisma.deadLetterEvent.count(),
    apiKeys: await prisma.apiKey.count(),
    embedConfigs: await prisma.embedConfig.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log('\n─── Seed Summary ────────────────────────────');
  for (const [entity, count] of Object.entries(counts)) {
    console.log(`  ${entity}: ${count}`);
  }
  console.log('');
  console.log('Login credentials for all tenants:');
  console.log('  Password: DemoPass123!');
  console.log('  Emails:');
  for (const t of tenants) {
    const keys = apiKeys.get(t.id)!;
    console.log(`    ${t.email} (${t.tier})`);
    console.log(`      Admin API Key: ${keys.adminKey}`);
    console.log(`      Embed API Key: ${keys.embedKey}`);
  }
  console.log('\nSeed completed successfully!');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
