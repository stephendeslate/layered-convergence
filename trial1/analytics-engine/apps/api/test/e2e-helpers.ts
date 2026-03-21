/**
 * E2E test helpers — bootstraps a real NestJS app with real
 * Redis and BullMQ connections for full integration testing.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import request from 'supertest';

/**
 * Mock BullMQ Queue that captures jobs in-memory.
 * Prevents actual job processing during tests.
 */
export class MockQueue {
  public jobs: { name: string; data: unknown; opts?: unknown }[] = [];

  async add(name: string, data: unknown, opts?: unknown) {
    this.jobs.push({ name, data, opts });
    return { id: `mock-job-${this.jobs.length}` };
  }

  async getRepeatableJobs() {
    return [];
  }

  async removeRepeatableByKey(_key: string) {}

  async close() {}
}

export interface E2EContext {
  app: INestApplication;
  prisma: PrismaService;
  syncQueue: MockQueue;
  aggregationQueue: MockQueue;
  cacheInvalidationQueue: MockQueue;
}

/**
 * Create a fully bootstrapped NestJS app for E2E testing.
 * Uses real Redis connection but mock BullMQ queues to prevent job processing.
 */
export async function createE2EApp(): Promise<E2EContext> {
  const syncQueue = new MockQueue();
  const aggregationQueue = new MockQueue();
  const cacheInvalidationQueue = new MockQueue();

  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  // Override BullMQ queues with mocks to prevent real job processing
  moduleBuilder
    .overrideProvider('BULLMQ_QUEUE_DATA_SYNC')
    .useValue(syncQueue);
  moduleBuilder
    .overrideProvider('BULLMQ_QUEUE_AGGREGATION')
    .useValue(aggregationQueue);
  moduleBuilder
    .overrideProvider('BULLMQ_QUEUE_CACHE_INVALIDATION')
    .useValue(cacheInvalidationQueue);

  const module: TestingModule = await moduleBuilder.compile();

  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  const prisma = module.get<PrismaService>(PrismaService);

  return {
    app,
    prisma,
    syncQueue,
    aggregationQueue,
    cacheInvalidationQueue,
  };
}

/**
 * Clean all test data from the database (order matters for FK constraints).
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.deadLetterEvent.deleteMany();
  await prisma.syncRun.deleteMany();
  await prisma.queryCache.deleteMany();
  await prisma.aggregatedDataPoint.deleteMany();
  await prisma.dataPoint.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.embedConfig.deleteMany();
  await prisma.dashboard.deleteMany();
  await prisma.fieldMapping.deleteMany();
  await prisma.dataSourceConfig.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.tenant.deleteMany();
}

/**
 * Register a tenant and return the auth token + tenant ID.
 */
export async function registerTenant(
  app: INestApplication,
  overrides: { name?: string; email?: string; password?: string } = {},
): Promise<{ accessToken: string; refreshToken: string; tenantId: string }> {
  const name = overrides.name ?? 'Test Tenant';
  const email = overrides.email ?? `test-${Date.now()}@example.com`;
  const password = overrides.password ?? 'TestPass123!';

  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ name, email, password })
    .expect(201);

  // Extract tenantId from the JWT
  const accessToken = res.body.data.accessToken;
  const payload = JSON.parse(
    Buffer.from(accessToken.split('.')[1], 'base64').toString(),
  );

  return {
    accessToken,
    refreshToken: res.body.data.refreshToken,
    tenantId: payload.sub,
  };
}

/**
 * Login and return tokens.
 */
export async function loginTenant(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
}

/**
 * Create a data source for a tenant.
 */
export async function createDataSource(
  app: INestApplication,
  token: string,
  overrides: {
    name?: string;
    connectorType?: string;
    syncSchedule?: string;
    config?: Record<string, unknown>;
    fieldMappings?: {
      sourceField: string;
      targetField: string;
      fieldType: string;
      fieldRole: string;
    }[];
  } = {},
) {
  const res = await request(app.getHttpServer())
    .post('/api/data-sources')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: overrides.name ?? 'Test Data Source',
      connectorType: overrides.connectorType ?? 'REST_API',
      syncSchedule: overrides.syncSchedule ?? 'MANUAL',
      config: overrides.config ?? { url: 'https://api.example.com' },
      fieldMappings: overrides.fieldMappings ?? [
        {
          sourceField: 'date',
          targetField: 'date',
          fieldType: 'DATE',
          fieldRole: 'DIMENSION',
        },
        {
          sourceField: 'value',
          targetField: 'value',
          fieldType: 'NUMBER',
          fieldRole: 'METRIC',
        },
      ],
    })
    .expect(201);

  return res.body.data;
}

/**
 * Create a dashboard.
 */
export async function createDashboard(
  app: INestApplication,
  token: string,
  overrides: { name?: string; description?: string } = {},
) {
  const res = await request(app.getHttpServer())
    .post('/api/dashboards')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: overrides.name ?? 'Test Dashboard',
      description: overrides.description ?? 'A test dashboard',
    })
    .expect(201);

  return res.body.data;
}

/**
 * Create a widget on a dashboard.
 */
export async function createWidget(
  app: INestApplication,
  token: string,
  dashboardId: string,
  dataSourceId: string,
  overrides: {
    type?: string;
    title?: string;
    dimensionField?: string;
    metricFields?: { field: string; aggregation: string }[];
    groupingPeriod?: string;
  } = {},
) {
  const body: Record<string, unknown> = {
    type: overrides.type ?? 'LINE',
    title: overrides.title ?? 'Test Widget',
    dataSourceId,
    dimensionField: overrides.dimensionField ?? 'date',
    metricFields: overrides.metricFields ?? [
      { field: 'value', aggregation: 'SUM' },
    ],
  };
  if (overrides.groupingPeriod) {
    body.groupingPeriod = overrides.groupingPeriod;
  }

  const res = await request(app.getHttpServer())
    .post(`/api/dashboards/${dashboardId}/widgets`)
    .set('Authorization', `Bearer ${token}`)
    .send(body)
    .expect(201);

  return res.body.data;
}
