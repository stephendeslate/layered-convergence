// [TRACED:AE-TS-003] Integration test for pipeline endpoints
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { Server } from 'http';

describe('Pipeline (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    const tenant = await prisma.tenant.create({ data: { name: 'Pipeline Test Tenant' } });
    tenantId = tenant.id;
    token = jwtService.sign({ sub: 'user-1', email: 'test@test.com', role: 'EDITOR', tenantId });
  });

  afterAll(async () => {
    await prisma.pipeline.deleteMany({});
    await prisma.tenant.deleteMany({});
    await app.close();
  });

  it('POST /pipelines should create a pipeline', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Pipeline' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('DRAFT');
  });

  it('GET /pipelines should list pipelines', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .get('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('POST /pipelines/:id/transition should transition DRAFT -> ACTIVE', async () => {
    const httpServer = app.getHttpServer() as Server;
    const createResponse = await request(httpServer)
      .post('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Transition Test' });

    const pipelineId = createResponse.body.id as string;

    const response = await request(httpServer)
      .post(`/pipelines/${pipelineId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' })
      .expect(201);

    expect(response.body.status).toBe('ACTIVE');
  });

  it('should reject unauthorized requests', async () => {
    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .get('/pipelines')
      .expect(401);
  });
});
