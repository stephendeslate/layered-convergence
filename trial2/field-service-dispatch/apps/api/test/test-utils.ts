import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  return app;
}

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.$executeRaw`TRUNCATE TABLE invoices CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE job_photos CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE work_order_status_history CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE work_orders CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE routes CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE technicians CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE customers CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE companies CASCADE`;
}

export interface TestCompany {
  companyId: string;
  token: string;
  userId: string;
}

export async function registerCompany(
  app: INestApplication,
  data: {
    companyName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  },
): Promise<TestCompany> {
  const supertest = (await import('supertest')).default;
  const response = await supertest(app.getHttpServer())
    .post('/api/auth/register')
    .send(data)
    .expect(201);

  return {
    companyId: response.body.company.id,
    token: response.body.accessToken,
    userId: response.body.user.id,
  };
}
