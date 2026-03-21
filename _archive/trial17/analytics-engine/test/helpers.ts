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

  const prisma = app.get<PrismaService>(PrismaService);

  return { app, prisma };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE query_caches, embed_configs, widgets, dashboards, data_points, sync_runs, pipelines, data_source_configs, data_sources, tenants CASCADE`;
}

export async function createTestTenant(
  prisma: PrismaService,
  overrides: { apiKey?: string; name?: string } = {},
) {
  return prisma.tenant.create({
    data: {
      name: overrides.name ?? 'Test Tenant',
      apiKey: overrides.apiKey ?? `test-key-${Date.now()}`,
    },
  });
}
