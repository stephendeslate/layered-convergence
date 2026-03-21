import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';

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
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();
  return app;
}

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.$executeRaw`TRUNCATE TABLE "TransactionStateHistory", "Dispute", "Payout", "WebhookLog", "Transaction", "StripeConnectedAccount", "User" CASCADE`;
}

export function getAuthHeader(user: {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key-for-integration-tests';
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    secret,
    { expiresIn: 3600 },
  );
  return `Bearer ${token}`;
}

export async function createTestUser(
  app: INestApplication,
  data: { email: string; password: string; name: string; role?: string },
): Promise<{ user: any; token: string }> {
  const res = await request(app.getHttpServer())
    .post('/auth/register')
    .send(data)
    .expect(201);
  return res.body;
}

export { request };
