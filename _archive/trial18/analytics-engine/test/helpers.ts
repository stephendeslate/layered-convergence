import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
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

  const prisma = app.get(PrismaService);

  return { app, prisma };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE embed_configs, widgets, dashboards, pipelines, data_points, sync_runs, data_source_configs, data_sources, query_caches, tenants CASCADE`;
}

export async function createTestTenant(
  prisma: PrismaService,
  overrides: { name?: string; apiKey?: string } = {},
): Promise<{ id: string; name: string; apiKey: string }> {
  return prisma.tenant.create({
    data: {
      name: overrides.name || 'Test Tenant',
      apiKey: overrides.apiKey || `test-api-key-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
  });
}

export async function createTestDataSource(
  prisma: PrismaService,
  tenantId: string,
  overrides: { name?: string; type?: string } = {},
): Promise<{ id: string; tenantId: string; name: string; type: string }> {
  return prisma.dataSource.create({
    data: {
      tenantId,
      name: overrides.name || 'Test Source',
      type: overrides.type || 'api',
    },
  });
}
