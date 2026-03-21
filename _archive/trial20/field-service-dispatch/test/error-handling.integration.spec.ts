import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createApp, truncateAll } from './setup.js';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

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

    const company = await prisma.company.create({ data: { name: 'ErrCo' } });
    companyId = company.id;
  });

  it('should return 400 for validation errors (missing required fields)', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({})
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should return 400 for forbidden non-whitelisted properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'Test', invalidField: 'x' })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('should not exist')]),
    );
  });

  it('should return 404 for non-existent resources', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('x-company-id', companyId)
      .expect(404);
  });

  it('should return 404 for non-existent company', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/companies/${fakeId}`)
      .expect(404);
  });

  it('should handle unique constraint violations (P2002)', async () => {
    await prisma.technician.create({
      data: {
        companyId,
        name: 'Dup',
        email: 'dup@test.com',
        skills: ['x'],
      },
    });

    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('x-company-id', companyId)
      .send({
        companyId,
        name: 'Dup2',
        email: 'dup@test.com',
        skills: ['x'],
      })
      .expect(409);

    expect(res.body.error).toBe('P2002');
  });

  it('should handle invalid state transitions as 400', async () => {
    const customer = await prisma.customer.create({
      data: { companyId, name: 'C', address: 'A' },
    });

    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId: customer.id,
        description: 'Test',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set('x-company-id', companyId)
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should handle foreign key constraint violations', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId: fakeId,
        description: 'FK test',
      });

    expect([400, 500]).toContain(res.status);
  });
});
