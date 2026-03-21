import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

export async function createApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.init();
  return app;
}

export async function truncateAll(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Invoice", "WorkOrderStatusHistory", "WorkOrder", "Route", "Customer", "Technician", "Company" CASCADE
  `);
}
