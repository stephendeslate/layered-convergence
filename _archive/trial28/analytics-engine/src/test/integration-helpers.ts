import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma };
}

export async function truncateAll(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "DeadLetterEvent",
      "QueryCache",
      "EmbedConfig",
      "DataPoint",
      "SyncRun",
      "DataSourceConfig",
      "Widget",
      "DataSource",
      "Dashboard",
      "Tenant"
    CASCADE
  `);
}
