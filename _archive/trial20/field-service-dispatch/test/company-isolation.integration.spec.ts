import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createApp, truncateAll } from './setup.js';

describe('Company Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyAId: string;
  let companyBId: string;

  beforeAll(async () => {
    app = await createApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(prisma);

    const companyA = await prisma.company.create({ data: { name: 'Company A' } });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({ data: { name: 'Company B' } });
    companyBId = companyB.id;
  });

  it('should isolate technicians by company', async () => {
    const server = app.getHttpServer();

    await prisma.technician.create({
      data: {
        companyId: companyAId,
        name: 'Tech A',
        email: 'tech-a@test.com',
        skills: ['plumbing'],
      },
    });

    await prisma.technician.create({
      data: {
        companyId: companyBId,
        name: 'Tech B',
        email: 'tech-b@test.com',
        skills: ['electrical'],
      },
    });

    const resA = await request(server)
      .get('/technicians')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');

    const resB = await request(server)
      .get('/technicians')
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Tech B');
  });

  it('should isolate customers by company', async () => {
    const server = app.getHttpServer();

    await prisma.customer.create({
      data: {
        companyId: companyAId,
        name: 'Cust A',
        address: '1 A St',
      },
    });

    await prisma.customer.create({
      data: {
        companyId: companyBId,
        name: 'Cust B',
        address: '2 B St',
      },
    });

    const resA = await request(server)
      .get('/customers')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Cust A');
  });

  it('should isolate work orders by company', async () => {
    const server = app.getHttpServer();

    const custA = await prisma.customer.create({
      data: { companyId: companyAId, name: 'CustA', address: '1 St' },
    });
    const custB = await prisma.customer.create({
      data: { companyId: companyBId, name: 'CustB', address: '2 St' },
    });

    await prisma.workOrder.create({
      data: {
        companyId: companyAId,
        customerId: custA.id,
        description: 'WO for A',
      },
    });

    await prisma.workOrder.create({
      data: {
        companyId: companyBId,
        customerId: custB.id,
        description: 'WO for B',
      },
    });

    const resA = await request(server)
      .get('/work-orders')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('WO for A');
  });

  it('should return 404 when accessing another company technician', async () => {
    const server = app.getHttpServer();

    const tech = await prisma.technician.create({
      data: {
        companyId: companyAId,
        name: 'Tech A',
        email: 'cross-a@test.com',
        skills: ['x'],
      },
    });

    await request(server)
      .get(`/technicians/${tech.id}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should return 404 when accessing another company work order', async () => {
    const server = app.getHttpServer();

    const custA = await prisma.customer.create({
      data: { companyId: companyAId, name: 'C', address: 'A' },
    });

    const wo = await prisma.workOrder.create({
      data: {
        companyId: companyAId,
        customerId: custA.id,
        description: 'Cross test',
      },
    });

    await request(server)
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });
});
