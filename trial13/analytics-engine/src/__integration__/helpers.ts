import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
  module: TestingModule;
}> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();

  const prisma = module.get<PrismaService>(PrismaService);

  return { app, prisma, module };
}

export async function truncateAllTables(prisma: PrismaService): Promise<void> {
  const tables = [
    'dead_letter_events',
    'query_caches',
    'embed_configs',
    'data_points',
    'sync_runs',
    'data_source_configs',
    'widgets',
    'dashboards',
    'data_sources',
    'tenants',
  ];

  for (const table of tables) {
    await prisma.$executeRaw(Prisma.sql`TRUNCATE TABLE ${Prisma.raw(table)} CASCADE`);
  }
}
