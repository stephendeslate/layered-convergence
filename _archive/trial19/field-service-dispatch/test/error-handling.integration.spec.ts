import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "Invoice", "WorkOrderStatusHistory", "WorkOrder", "Route", "Customer", "Technician", "Company" CASCADE',
    );
  });

  it('should return 404 for non-existent work order', async () => {
    const company = await prisma.company.create({ data: { name: 'Test Co' } });

    await request(app.getHttpServer())
      .get('/work-orders/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', company.id)
      .expect(404);
  });

  it('should return 404 for non-existent technician', async () => {
    const company = await prisma.company.create({ data: { name: 'Test Co' } });

    await request(app.getHttpServer())
      .get('/technicians/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', company.id)
      .expect(404);
  });

  it('should return 404 for non-existent customer', async () => {
    const company = await prisma.company.create({ data: { name: 'Test Co' } });

    await request(app.getHttpServer())
      .get('/customers/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', company.id)
      .expect(404);
  });

  it('should return 400 for invalid state transition', async () => {
    const company = await prisma.company.create({ data: { name: 'Test Co' } });
    const customer = await prisma.customer.create({
      data: { companyId: company.id, name: 'Jane', address: '123 St' },
    });
    const wo = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        description: 'Fix sink',
      },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set('x-company-id', company.id)
      .expect(400);
  });

  it('should return 400 for work order creation with extra fields (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', '00000000-0000-0000-0000-000000000000')
      .send({
        companyId: '00000000-0000-0000-0000-000000000000',
        customerId: '00000000-0000-0000-0000-000000000000',
        description: 'Fix',
        hackerField: 'inject',
      })
      .expect(400);
  });

  it('should handle duplicate technician email gracefully', async () => {
    const company = await prisma.company.create({ data: { name: 'Test Co' } });
    const email = `dup-${Date.now()}@test.com`;

    await prisma.technician.create({
      data: {
        companyId: company.id,
        name: 'John',
        email,
        skills: ['plumbing'],
      },
    });

    await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', company.id)
      .send({
        companyId: company.id,
        name: 'Jane',
        email,
        skills: ['electric'],
      })
      .expect(409);
  });
});
