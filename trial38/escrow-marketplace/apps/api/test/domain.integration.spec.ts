import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED: EM-TEST-003 — Integration tests for domain endpoints (listings, transactions)

describe('Domain Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Listings', () => {
    it('should require authentication for GET /listings', async () => {
      const response = await request(app.getHttpServer()).get('/listings');
      expect(response.status).toBe(401);
    });

    it('should require authentication for POST /listings', async () => {
      const response = await request(app.getHttpServer())
        .post('/listings')
        .send({
          title: 'Test Item',
          description: 'A test item for sale',
          price: 49.99,
        });
      expect(response.status).toBe(401);
    });

    it('should require authentication for PATCH /listings/:id', async () => {
      const response = await request(app.getHttpServer())
        .patch('/listings/some-id')
        .send({ title: 'Updated' });
      expect(response.status).toBe(401);
    });

    it('should require authentication for DELETE /listings/:id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/listings/some-id');
      expect(response.status).toBe(401);
    });
  });

  describe('Transactions', () => {
    it('should require authentication for GET /transactions', async () => {
      const response = await request(app.getHttpServer()).get('/transactions');
      expect(response.status).toBe(401);
    });

    it('should require authentication for POST /transactions', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({ listingId: '550e8400-e29b-41d4-a716-446655440000' });
      expect(response.status).toBe(401);
    });

    it('should require authentication for PATCH /transactions/:id/status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/transactions/some-id/status')
        .send({ status: 'COMPLETED' });
      expect(response.status).toBe(401);
    });

    it('should require authentication for DELETE /transactions/:id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/transactions/some-id');
      expect(response.status).toBe(401);
    });
  });

  describe('Validation', () => {
    it('should reject requests with unknown fields via forbidNonWhitelisted', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepass',
          name: 'Test',
          role: 'BUYER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
          unknownField: 'should-be-rejected',
        });
      expect(response.status).toBe(400);
    });

    it('should reject UUID fields exceeding MaxLength', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepass',
          name: 'Test',
          role: 'BUYER',
          tenantId: 'a'.repeat(100),
        });
      expect(response.status).toBe(400);
    });
  });
});
