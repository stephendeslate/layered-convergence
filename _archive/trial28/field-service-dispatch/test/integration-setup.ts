import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createHash } from 'crypto';

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
  await prisma.truncateAll();
}

export async function seedCompany(
  app: INestApplication,
  data?: { name?: string; slug?: string },
): Promise<{ id: string; name: string; slug: string }> {
  const prisma = app.get(PrismaService);
  return prisma.company.create({
    data: {
      name: data?.name || 'Test Company',
      slug: data?.slug || `test-company-${Date.now()}`,
    },
  });
}

export async function seedUser(
  app: INestApplication,
  companyId: string,
  data?: { email?: string; role?: string },
): Promise<{ id: string; email: string; companyId: string; role: string }> {
  const prisma = app.get(PrismaService);
  const email = data?.email || `user-${Date.now()}@test.com`;
  const hashedPassword = createHash('sha256').update('password123').digest('hex');
  return prisma.user.create({
    data: {
      email,
      name: 'Test User',
      password: hashedPassword,
      companyId,
      role: data?.role || 'ADMIN',
    },
  });
}

export function generateToken(user: {
  id: string;
  email: string;
  role: string;
  companyId: string;
}): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString('base64url');
  const signature = createHash('sha256')
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}
