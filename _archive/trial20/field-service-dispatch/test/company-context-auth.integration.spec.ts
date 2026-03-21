import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createApp, truncateAll } from './setup.js';

describe('Company Context Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  it('should reject requests without x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/technicians')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should reject work-orders requests without x-company-id', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);
  });

  it('should reject customers requests without x-company-id', async () => {
    await request(app.getHttpServer())
      .get('/customers')
      .expect(400);
  });

  it('should allow company routes without x-company-id', async () => {
    await request(app.getHttpServer())
      .get('/companies')
      .expect(200);
  });

  it('should allow creating companies without x-company-id', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'No Header Co' })
      .expect(201);

    expect(res.body.name).toBe('No Header Co');
  });

  it('should allow accessing specific company without x-company-id', async () => {
    const company = await prisma.company.create({ data: { name: 'Test' } });

    const res = await request(app.getHttpServer())
      .get(`/companies/${company.id}`)
      .expect(200);

    expect(res.body.name).toBe('Test');
  });

  it('should accept requests with valid x-company-id header', async () => {
    const company = await prisma.company.create({ data: { name: 'Auth Co' } });

    const res = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', company.id)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('should reject invoices requests without x-company-id', async () => {
    await request(app.getHttpServer())
      .get('/invoices')
      .expect(400);
  });
});
