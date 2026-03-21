import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  seedCompany,
  seedUser,
  generateToken,
} from './integration-setup';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let companyA: { id: string };
  let companyB: { id: string };
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    companyA = await seedCompany(app, { name: 'Company A', slug: `a-${Date.now()}` });
    companyB = await seedCompany(app, { name: 'Company B', slug: `b-${Date.now()}` });

    const userA = await seedUser(app, companyA.id, { email: `a-${Date.now()}@test.com` });
    const userB = await seedUser(app, companyB.id, { email: `b-${Date.now()}@test.com` });

    tokenA = generateToken(userA);
    tokenB = generateToken(userB);
  });

  it('should isolate customers between companies', async () => {
    await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ name: 'Customer A', email: 'ca@test.com', address: '123 A St' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id)
      .send({ name: 'Customer B', email: 'cb@test.com', address: '456 B St' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Customer A');

    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Customer B');
  });

  it('should isolate technicians between companies', async () => {
    await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ name: 'Tech A', email: 'ta@test.com', phone: '111' })
      .expect(201);

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);
    expect(resB.body).toHaveLength(0);
  });

  it('should not allow cross-company work order access', async () => {
    const custRes = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ name: 'Cust A', email: 'ca@test.com', address: '123 St' });

    const woRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({
        title: 'WO A',
        description: 'Test',
        customerId: custRes.body.id,
        priority: 'HIGH',
      });

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${woRes.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);

    expect(res.status).toBe(404);
  });

  it('should require x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(400);
  });
});
