import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { TransactionsModule } from '../../src/transactions/transactions.module';
import { DisputesModule } from '../../src/disputes/disputes.module';
import { PayoutsModule } from '../../src/payouts/payouts.module';
import { WebhooksModule } from '../../src/webhooks/webhooks.module';
import { PrismaExceptionFilter } from '../../src/common/filters/prisma-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
  jwtService: JwtService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
        load: [
          () => ({
            DB_HOST: process.env.DB_HOST || 'localhost',
            DB_PORT: parseInt(process.env.DB_PORT || '5433'),
            DB_USER: process.env.DB_USER || 'postgres',
            DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
            DB_NAME: process.env.DB_NAME || 'escrow_marketplace_test',
            JWT_SECRET: 'test-secret',
            JWT_EXPIRES_IN: '1h',
            REDIS_HOST: process.env.REDIS_HOST || 'localhost',
            REDIS_PORT: parseInt(process.env.REDIS_PORT || '6380'),
          }),
        ],
      }),
      PrismaModule,
      AuthModule,
      UsersModule,
      TransactionsModule,
      DisputesModule,
      PayoutsModule,
      WebhooksModule,
    ],
    providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
      { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();

  const prisma = moduleFixture.get<PrismaService>(PrismaService);
  const jwtService = moduleFixture.get<JwtService>(JwtService);

  return { app, prisma, jwtService };
}

export async function cleanDatabase(prisma: PrismaService) {
  await prisma.$executeRaw`TRUNCATE TABLE "WebhookLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Payout" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "StripeConnectedAccount" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Dispute" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "TransactionStateHistory" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Transaction" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
}

export function generateToken(
  jwtService: JwtService,
  payload: { sub: string; email: string; role: string; tenantId: string },
): string {
  return jwtService.sign(payload);
}
