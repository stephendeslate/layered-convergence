import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../../src/common/filters/prisma-exception.filter';

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
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "TransactionStateHistory", "Dispute", "Payout", "WebhookLog", "StripeConnectedAccount", "Transaction", "User" CASCADE
  `);
}

export async function createTestUsers(prisma: PrismaService) {
  const buyer = await prisma.user.create({
    data: { email: 'buyer@test.com', password: 'buyer123', role: 'BUYER' },
  });
  const provider = await prisma.user.create({
    data: {
      email: 'provider@test.com',
      password: 'provider123',
      role: 'PROVIDER',
    },
  });
  const admin = await prisma.user.create({
    data: { email: 'admin@test.com', password: 'admin123', role: 'ADMIN' },
  });

  return {
    buyer,
    provider,
    admin,
    buyerToken: Buffer.from('buyer@test.com:buyer123').toString('base64'),
    providerToken: Buffer.from('provider@test.com:provider123').toString(
      'base64',
    ),
    adminToken: Buffer.from('admin@test.com:admin123').toString('base64'),
  };
}
