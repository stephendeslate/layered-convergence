import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();
  return app;
}

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.$executeRaw`TRUNCATE TABLE
    dead_letter_events,
    pipeline_state_history,
    pipelines,
    data_points,
    sync_runs,
    data_source_configs,
    embed_configs,
    widgets,
    dashboards,
    data_sources,
    query_caches,
    tenants
  CASCADE`;
}

export async function createTestTenant(
  app: INestApplication,
  overrides: { name?: string; apiKey?: string } = {},
): Promise<{ id: string; apiKey: string }> {
  const prisma = app.get(PrismaService);
  const tenant = await prisma.tenant.create({
    data: {
      name: overrides.name ?? 'Test Tenant',
      apiKey: overrides.apiKey ?? `test-key-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
  });
  return { id: tenant.id, apiKey: tenant.apiKey };
}

export async function createTestDataSource(
  app: INestApplication,
  tenantId: string,
  overrides: { name?: string; type?: string } = {},
): Promise<{ id: string }> {
  const prisma = app.get(PrismaService);
  const ds = await prisma.dataSource.create({
    data: {
      tenantId,
      name: overrides.name ?? 'Test Source',
      type: overrides.type ?? 'api',
    },
  });
  return { id: ds.id };
}
