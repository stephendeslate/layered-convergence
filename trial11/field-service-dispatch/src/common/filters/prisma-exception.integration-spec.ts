import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('PrismaExceptionFilter (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

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

    const company = await prisma.company.create({
      data: { name: 'Test Co' },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 409 for duplicate unique constraint (technician email)', async () => {
    await prisma.technician.create({
      data: {
        companyId,
        name: 'Tech One',
        email: 'duplicate@test.com',
        skills: ['plumbing'],
      },
    });

    await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({
        companyId,
        name: 'Tech Two',
        email: 'duplicate@test.com',
        skills: ['hvac'],
      })
      .expect(409);
  });

  it('should return 404 for nonexistent work order', async () => {
    await request(app.getHttpServer())
      .get('/work-orders/00000000-0000-0000-0000-000000000000')
      .set('x-company-id', companyId)
      .expect(404);
  });
});
