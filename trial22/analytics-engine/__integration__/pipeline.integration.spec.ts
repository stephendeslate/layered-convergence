// [TRACED:TS-004] Pipeline state machine integration test with real DB

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Pipeline Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let accessToken: string;
  let tenantId: string;

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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    const tenant = await prisma.tenant.create({
      data: { name: 'Pipeline Test Tenant', slug: 'pipeline-test' },
    });
    tenantId = tenant.id;

    const user = await prisma.user.create({
      data: {
        email: 'pipeline-test@test.com',
        hashedPassword: 'hashed',
        role: 'EDITOR',
        tenantId,
      },
    });

    accessToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId,
    });
  });

  afterAll(async () => {
    await prisma.pipeline.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await app.close();
  });

  it('should create a pipeline in DRAFT status', async () => {
    const response = await request(app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Pipeline' })
      .expect(201);

    expect(response.body.status).toBe('DRAFT');
    expect(response.body.name).toBe('Test Pipeline');
  });

  it('should transition DRAFT -> ACTIVE', async () => {
    const pipeline = await prisma.pipeline.findFirst({
      where: { tenantId },
    });

    const response = await request(app.getHttpServer())
      .put(`/pipelines/${pipeline!.id}/transition`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    expect(response.body.status).toBe('ACTIVE');
  });

  it('should reject invalid transition ACTIVE -> DRAFT', async () => {
    const pipeline = await prisma.pipeline.findFirst({
      where: { tenantId },
    });

    await request(app.getHttpServer())
      .put(`/pipelines/${pipeline!.id}/transition`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'DRAFT' })
      .expect(400);
  });
});
