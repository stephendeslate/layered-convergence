import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Domain Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Dashboards API', () => {
    it('should require authentication for GET /dashboards', async () => {
      const response = await request(app.getHttpServer()).get('/dashboards');
      expect(response.status).toBe(401);
    });

    it('should require authentication for POST /dashboards', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ name: 'Test Dashboard' });
      expect(response.status).toBe(401);
    });

    it('should require authentication for GET /dashboards/:id', async () => {
      const response = await request(app.getHttpServer()).get(
        '/dashboards/some-id',
      );
      expect(response.status).toBe(401);
    });

    it('should require authentication for DELETE /dashboards/:id', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/dashboards/some-id',
      );
      expect(response.status).toBe(401);
    });
  });

  describe('Pipelines API', () => {
    it('should require authentication for GET /pipelines', async () => {
      const response = await request(app.getHttpServer()).get('/pipelines');
      expect(response.status).toBe(401);
    });

    it('should require authentication for POST /pipelines', async () => {
      const response = await request(app.getHttpServer())
        .post('/pipelines')
        .send({ name: 'Test Pipeline' });
      expect(response.status).toBe(401);
    });

    it('should require authentication for PATCH /pipelines/:id/status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/pipelines/some-id/status')
        .send({ status: 'PAUSED' });
      expect(response.status).toBe(401);
    });

    it('should require authentication for DELETE /pipelines/:id', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/pipelines/some-id',
      );
      expect(response.status).toBe(401);
    });
  });
});
