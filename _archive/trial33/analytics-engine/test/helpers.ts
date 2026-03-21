import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.$executeRaw`
    TRUNCATE TABLE
      dead_letter_events,
      query_cache,
      dashboard_widgets,
      dashboards,
      transformations,
      data_sources,
      pipeline_runs,
      pipeline_status_history,
      pipelines,
      users,
      organizations
    CASCADE
  `;
}

export async function createTestOrg(
  app: INestApplication,
  slug: string = 'test-org',
) {
  const prisma = app.get(PrismaService);
  return prisma.organization.create({
    data: {
      name: `Test Org ${slug}`,
      slug,
      apiKey: `api-key-${slug}-${Date.now()}`,
      branding: {},
    },
  });
}

export async function createTestUser(
  app: INestApplication,
  organizationId: string,
  email: string = 'test@example.com',
  role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'ADMIN',
) {
  const bcrypt = await import('bcrypt');
  const prisma = app.get(PrismaService);
  return prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash('password1', 10),
      role,
      organizationId,
    },
  });
}

export async function getAuthToken(
  app: INestApplication,
  email: string = 'test@example.com',
  password: string = 'password1',
): Promise<string> {
  const { default: request } = await import('supertest');
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);
  return res.body.accessToken;
}
