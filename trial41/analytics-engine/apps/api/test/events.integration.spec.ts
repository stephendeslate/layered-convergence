// TRACED:AE-EVENTS-INTEGRATION-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Events Integration (e2e)', () => {
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

  describe('GET /events', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer bad-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /events', () => {
    it('should reject unauthenticated event creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({ name: 'Test Event' });

      expect(response.status).toBe(401);
    });

    it('should reject event creation with extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', 'Bearer invalid')
        .send({
          name: 'Test Event',
          maliciousField: 'injection',
        });

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('GET /events/:id', () => {
    it('should reject unauthenticated access to single event', async () => {
      const response = await request(app.getHttpServer()).get(
        '/events/some-id',
      );
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /events/:id', () => {
    it('should reject unauthenticated event update', async () => {
      const response = await request(app.getHttpServer())
        .put('/events/some-id')
        .send({ name: 'Updated' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /events/:id', () => {
    it('should reject unauthenticated event deletion', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/events/some-id',
      );
      expect(response.status).toBe(401);
    });
  });
});
