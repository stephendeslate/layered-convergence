import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TEST-005
describe('Events Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        event: {
          create: jest.fn().mockResolvedValue({
            id: 'event-1',
            type: 'CLICK',
            status: 'PENDING',
            source: 'web',
            tenantId: 'tenant-1',
          }),
          findMany: jest.fn().mockResolvedValue([
            { id: 'event-1', type: 'CLICK', status: 'PENDING', source: 'web', tenantId: 'tenant-1', createdAt: new Date() },
          ]),
          findFirst: jest.fn().mockResolvedValue({
            id: 'event-1',
            type: 'CLICK',
            status: 'PENDING',
            source: 'web',
            tenantId: 'tenant-1',
          }),
          update: jest.fn().mockResolvedValue({
            id: 'event-1',
            status: 'PROCESSED',
          }),
          delete: jest.fn().mockResolvedValue({ id: 'event-1' }),
          count: jest.fn().mockResolvedValue(1),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /events', () => {
    it('should create an event with auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          type: 'CLICK',
          source: 'web',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('CLICK');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({ type: 'CLICK', source: 'web', tenantId: 'tenant-1' });

      expect(response.status).toBe(401);
    });

    it('should reject invalid event type', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          type: 'INVALID',
          source: 'web',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /events', () => {
    it('should return paginated events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .query({ tenantId: 'tenant-1' })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.headers['cache-control']).toContain('max-age');
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/event-1')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('event-1');
    });
  });
});
