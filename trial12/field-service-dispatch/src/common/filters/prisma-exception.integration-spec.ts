import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

describe('PrismaExceptionFilter (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrderStatusHistory" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Invoice" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrder" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Route" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Technician" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Customer" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Company" CASCADE');

    const company = await prisma.company.create({ data: { name: 'Test Corp' } });
    companyId = company.id;
  });

  it('should return 409 for unique constraint violation', async () => {
    await prisma.technician.create({
      data: { companyId, name: 'John', email: 'john@test.com', skills: ['plumbing'] },
    });

    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ name: 'Jane', email: 'john@test.com', skills: ['electrical'] })
      .expect(409);

    expect(res.body.error).toBe('P2002');
    expect(res.body.statusCode).toBe(409);
  });

  it('should return 404 for record not found', async () => {
    const res = await request(app.getHttpServer())
      .get('/technicians/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });
});
