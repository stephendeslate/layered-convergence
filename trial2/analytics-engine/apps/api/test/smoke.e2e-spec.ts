import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

describe('Smoke Tests (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let tenantId: string;
  let accessToken: string;

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
    jwtService = app.get(JwtService);

    const apiKey = `ak_live_${randomBytes(32).toString('hex')}`;
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Smoke Test Tenant',
        slug: `smoke-test-${Date.now()}`,
        apiKey,
        apiKeyHash,
        branding: {},
      },
    });
    tenantId = tenant.id;

    accessToken = jwtService.sign({ sub: tenantId, tenantSlug: tenant.slug });
  });

  afterAll(async () => {
    await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
    await app.close();
  });

  describe('POST /api/v1/dashboards', () => {
    it('should return 201 with a valid body', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test Dashboard' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Dashboard');
      expect(res.body.tenantId).toBe(tenantId);
    });

    it('should return 400 with an empty body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/dashboards')
        .send({ name: 'No Auth Dashboard' })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 with an empty body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 401 with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ slug: 'nonexistent', apiKey: 'wrong' })
        .expect(401);
    });
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });
  });
});
