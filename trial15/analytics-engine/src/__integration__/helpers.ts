import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';
import { AuthService } from '../auth/auth.service';

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  authService: AuthService;
  module: TestingModule;
}

export async function createTestApp(): Promise<TestContext> {
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

  const prisma = module.get(PrismaService);
  const authService = module.get(AuthService);

  return { app, prisma, authService, module };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  const tableNames = [
    'embed_configs',
    'widgets',
    'dashboards',
    'sync_runs',
    'pipelines',
    'data_points',
    'data_source_configs',
    'data_sources',
    'users',
    'tenants',
  ];

  for (const table of tableNames) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
}

export async function createTestTenant(
  prisma: PrismaService,
  overrides: { name?: string; slug?: string } = {},
): Promise<{ id: string; name: string; slug: string }> {
  const slug = overrides.slug ?? `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return prisma.tenant.create({
    data: {
      name: overrides.name ?? 'Test Tenant',
      slug,
    },
  });
}

export async function createTestUser(
  prisma: PrismaService,
  tenantId: string,
  overrides: { email?: string; name?: string; role?: string } = {},
): Promise<{ id: string; email: string; tenantId: string; role: string }> {
  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${Date.now()}@test.com`,
      name: overrides.name ?? 'Test User',
      role: overrides.role ?? 'admin',
      tenantId,
    },
  });
}

export function generateAuthToken(
  authService: AuthService,
  user: { id: string; email: string; tenantId: string; role: string },
): string {
  const { accessToken } = authService.sign({
    sub: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
  });
  return accessToken;
}

export async function createTestDataSource(
  prisma: PrismaService,
  tenantId: string,
  overrides: { name?: string; type?: string } = {},
) {
  return prisma.dataSource.create({
    data: {
      name: overrides.name ?? 'Test DataSource',
      type: overrides.type ?? 'postgres',
      tenantId,
    },
  });
}

export async function teardownTestApp(ctx: TestContext): Promise<void> {
  await cleanDatabase(ctx.prisma);
  await ctx.app.close();
}
