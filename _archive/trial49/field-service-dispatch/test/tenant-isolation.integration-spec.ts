import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import {
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestUser,
  createTestCustomer,
  createTestTechnician,
  createTestWorkOrder,
} from './helpers';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  let companyAId: string;
  let companyBId: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const companyA = await createTestCompany({ name: 'Company A', slug: `a-${Date.now()}` });
    const companyB = await createTestCompany({ name: 'Company B', slug: `b-${Date.now()}` });
    companyAId = companyA.id;
    companyBId = companyB.id;

    const userA = await createTestUser(companyAId, { email: `a-${Date.now()}@test.com` });
    const userB = await createTestUser(companyBId, { email: `b-${Date.now()}@test.com` });

    tokenA = await jwtService.signAsync({ sub: userA.id, email: userA.email, companyId: companyAId });
    tokenB = await jwtService.signAsync({ sub: userB.id, email: userB.email, companyId: companyBId });
  });

  it('should not allow company A to see company B technicians', async () => {
    await createTestTechnician(companyAId, { name: 'Tech A' });
    await createTestTechnician(companyBId, { name: 'Tech B' });

    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Tech B');
  });

  it('should not allow company A to see company B work orders', async () => {
    const customerA = await createTestCustomer(companyAId);
    const customerB = await createTestCustomer(companyBId);

    await createTestWorkOrder(companyAId, customerA.id, { title: 'WO A' });
    await createTestWorkOrder(companyBId, customerB.id, { title: 'WO B' });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].title).toBe('WO A');
  });

  it('should not allow company A to update company B work order status', async () => {
    const customerB = await createTestCustomer(companyBId);
    const woB = await createTestWorkOrder(companyBId, customerB.id);

    await request(app.getHttpServer())
      .patch(`/work-orders/${woB.id}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'ASSIGNED' })
      .expect(404);
  });

  it('should not allow company A to view company B technician by id', async () => {
    const techB = await createTestTechnician(companyBId, { name: 'Tech B' });

    await request(app.getHttpServer())
      .get(`/technicians/${techB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });

  it('should isolate assignments by company', async () => {
    const customerA = await createTestCustomer(companyAId);
    const techA = await createTestTechnician(companyAId);
    const woA = await createTestWorkOrder(companyAId, customerA.id);

    const customerB = await createTestCustomer(companyBId);
    const techB = await createTestTechnician(companyBId);
    const woB = await createTestWorkOrder(companyBId, customerB.id);

    await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ workOrderId: woA.id, technicianId: techA.id })
      .expect(201);

    await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ workOrderId: woB.id, technicianId: techB.id })
      .expect(404);
  });
});
