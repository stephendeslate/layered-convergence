import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.workOrderStatusHistory.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should isolate work orders between companies', async () => {
    const companyA = await prisma.company.create({
      data: { name: 'Company A' },
    });
    const companyB = await prisma.company.create({
      data: { name: 'Company B' },
    });

    const customerA = await prisma.customer.create({
      data: { companyId: companyA.id, name: 'Cust A', address: '1 A St' },
    });

    await prisma.workOrder.create({
      data: {
        companyId: companyA.id,
        customerId: customerA.id,
        description: 'Work for A',
      },
    });

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyB.id)
      .expect(200);

    expect(resB.body).toHaveLength(0);

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyA.id)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('Work for A');
  });

  it('should return 404 when Company B tries to access Company A work order', async () => {
    const companyA = await prisma.company.create({
      data: { name: 'Company A' },
    });
    const companyB = await prisma.company.create({
      data: { name: 'Company B' },
    });

    const customerA = await prisma.customer.create({
      data: { companyId: companyA.id, name: 'Cust A', address: '1 A St' },
    });

    const wo = await prisma.workOrder.create({
      data: {
        companyId: companyA.id,
        customerId: customerA.id,
        description: 'Work for A',
      },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', companyB.id)
      .expect(404);
  });
});
