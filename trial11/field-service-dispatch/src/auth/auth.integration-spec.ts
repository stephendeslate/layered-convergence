import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Context / Auth (integration)', () => {
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

  it('should return 400 when x-company-id header is missing', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);
  });

  it('should succeed when x-company-id header is provided', async () => {
    const company = await prisma.company.create({
      data: { name: 'Valid Co' },
    });

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', company.id)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not require x-company-id for /companies endpoints', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'New Company' })
      .expect(201);

    expect(res.body.name).toBe('New Company');
  });
});
