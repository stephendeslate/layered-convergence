// TRACED: AE-TEST-06
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Domain Integration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        dashboard: {
          create: jest.fn().mockResolvedValue({
            id: 'dash-1',
            title: 'Test',
            slug: 'test',
            tenantId: 'tenant-1',
          }),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null),
          count: jest.fn().mockResolvedValue(0),
          update: jest.fn(),
          delete: jest.fn(),
        },
        pipeline: {
          create: jest.fn().mockResolvedValue({
            id: 'pipe-1',
            name: 'Test Pipeline',
            tenantId: 'tenant-1',
          }),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null),
          count: jest.fn().mockResolvedValue(0),
          update: jest.fn(),
          delete: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

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

  describe('GET /dashboards', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /dashboards', () => {
    it('should require authentication to create a dashboard', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ title: 'Test Dashboard' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /pipelines', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/pipelines');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /pipelines', () => {
    it('should require authentication to create a pipeline', async () => {
      const response = await request(app.getHttpServer())
        .post('/pipelines')
        .send({ name: 'Test Pipeline' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should require authentication to access a specific dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards/some-id');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /pipelines/:id', () => {
    it('should require authentication to update a pipeline', async () => {
      const response = await request(app.getHttpServer())
        .patch('/pipelines/some-id')
        .send({ name: 'Updated' });

      expect(response.status).toBe(401);
    });
  });
});
