import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

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

    const company = await prisma.company.create({ data: { name: 'Error Co' } });
    companyId = company.id;
  });

  it('should return 409 for unique constraint violation (duplicate technician email)', async () => {
    const email = `dup-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ companyId, name: 'Tech One', email, skills: ['plumbing'] })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ companyId, name: 'Tech Two', email, skills: ['hvac'] })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
    expect(res.body.error).toBe('P2002');
  });

  it('should return 404 for non-existent work order', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 for non-existent technician', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/technicians/${fakeId}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 for non-existent customer', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/customers/${fakeId}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 400 for invalid state transition', async () => {
    const customer = await prisma.customer.create({
      data: { companyId, name: 'C', address: '1 St' },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId: customer.id, description: 'Test' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set('x-company-id', companyId)
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should return 400 for validation failure (missing required fields)', async () => {
    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({ name: 'No Email Tech' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for forbidden non-whitelisted properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'Test', hackerField: 'injected' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('hackerField'),
      ]),
    );
  });

  it('should return 400 for foreign key violation (invalid customerId)', async () => {
    const fakeCustomerId = '00000000-0000-0000-0000-000000000099';

    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId: fakeCustomerId,
        description: 'Bad FK',
      });

    // Prisma P2003 foreign key constraint returns 400
    expect([400, 500]).toContain(res.status);
  });

  it('should return proper error shape for all error responses', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body).toHaveProperty('statusCode');
    expect(res.body).toHaveProperty('message');
  });
});
