import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Invoice" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrderStatusHistory" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkOrder" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Route" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Customer" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Technician" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Company" CASCADE');

    const company = await prisma.company.create({ data: { name: 'Error Co' } });
    companyId = company.id;
  });

  describe('PrismaExceptionFilter', () => {
    it('should return 404 for non-existent record (P2025)', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    it('should return 409 for unique constraint violation (P2002)', async () => {
      const email = `dup-${Date.now()}@test.com`;
      await prisma.technician.create({
        data: { companyId, name: 'Tech 1', email, skills: [] },
      });

      const res = await request(app.getHttpServer())
        .post('/technicians')
        .set('x-company-id', companyId)
        .send({ name: 'Tech 2', email, skills: [] })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.error).toBe('P2002');
    });

    it('should return 400 for foreign key constraint violation (P2003)', async () => {
      const res = await request(app.getHttpServer())
        .post('/work-orders')
        .set('x-company-id', companyId)
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          description: 'Bad FK',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('ValidationPipe', () => {
    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send({})
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should strip unknown properties (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send({ name: 'Test', unknownProp: 'value' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should return 400 for invalid enum values in work order transition', async () => {
      const customer = await prisma.customer.create({
        data: { companyId, name: 'C', address: '1 St', lat: 40.0, lng: -74.0 },
      });
      const wo = await prisma.workOrder.create({
        data: { companyId, customerId: customer.id, description: 'Test', status: 'UNASSIGNED' },
      });

      await request(app.getHttpServer())
        .patch(`/work-orders/${wo.id}/transition`)
        .set('x-company-id', companyId)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });
});
