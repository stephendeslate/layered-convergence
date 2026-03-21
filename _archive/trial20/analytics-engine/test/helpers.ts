import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();
  return app;
}

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.$executeRaw`TRUNCATE TABLE "QueryCache", "EmbedConfig", "Widget", "Dashboard", "DataPoint", "SyncRun", "Pipeline", "DataSourceConfig", "DataSource", "Tenant" CASCADE`;
}

export async function createTestTenant(
  app: INestApplication,
  data: { name: string; apiKey: string },
): Promise<{ id: string; name: string; apiKey: string }> {
  const prisma = app.get(PrismaService);
  return prisma.tenant.create({
    data: {
      name: data.name,
      apiKey: data.apiKey,
    },
  });
}

export async function createTestDataSource(
  app: INestApplication,
  tenantId: string,
  data: { name: string; type: string },
): Promise<{ id: string; tenantId: string; name: string; type: string }> {
  const prisma = app.get(PrismaService);
  return prisma.dataSource.create({
    data: {
      tenantId,
      name: data.name,
      type: data.type,
    },
  });
}
