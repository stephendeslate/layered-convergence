import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS, APP_VERSION } from '@analytics-engine/shared';

// TRACED:AE-CROSS-007
describe('Cross-Layer Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn().mockImplementation(({ where }: { where: { email: string } }) => {
            if (where.email === 'crosslayer@test.com') {
              return Promise.resolve({
                id: 'user-cross-1',
                email: 'crosslayer@test.com',
                passwordHash,
                role: 'USER',
                tenantId: 'tenant-cross-1',
                tenant: { id: 'tenant-cross-1', name: 'Cross Layer Tenant' },
              });
            }
            if (where.email === 'newuser@test.com') {
              return Promise.resolve(null);
            }
            return Promise.resolve(null);
          }),
          create: jest.fn().mockResolvedValue({
            id: 'user-cross-2',
            email: 'newuser@test.com',
            role: 'USER',
            tenantId: 'tenant-cross-1',
          }),
        },
        dashboard: {
          create: jest.fn().mockResolvedValue({
            id: 'dash-cross-1',
            name: 'Cross Layer Dashboard',
            tenantId: 'tenant-cross-1',
            userId: 'user-cross-2',
          }),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null),
          count: jest.fn().mockResolvedValue(0),
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
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED:AE-CROSS-008
  it('should complete full cross-layer flow: register -> login -> create dashboard -> verify headers -> validation error -> health version', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuser@test.com',
        password: 'password123',
        tenantId: 'tenant-cross-1',
        role: 'USER',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.accessToken).toBeDefined();
    jwtToken = registerResponse.body.accessToken;

    // Step 2: Login with existing user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'crosslayer@test.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body.accessToken).toBeDefined();
    const loginToken = loginResponse.body.accessToken;

    // Step 3: Create a dashboard with the login token
    const dashboardResponse = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({
        name: 'Cross Layer Dashboard',
        tenantId: 'tenant-cross-1',
      });

    expect(dashboardResponse.status).toBe(201);
    expect(dashboardResponse.body.name).toBe('Cross Layer Dashboard');

    // Step 4: Verify X-Correlation-ID header is present
    expect(dashboardResponse.headers['x-correlation-id']).toBeDefined();

    // Step 5: Verify X-Response-Time header is present
    expect(dashboardResponse.headers['x-response-time']).toBeDefined();
    expect(dashboardResponse.headers['x-response-time']).toMatch(/\d+ms/);

    // Step 6: Trigger a validation error
    const validationErrorResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'invalid',
        password: 'p',
        tenantId: 'tenant-cross-1',
        role: 'ADMIN',
      });

    expect(validationErrorResponse.status).toBe(400);

    // Step 7: Verify correlationId in error response (no stack trace)
    expect(validationErrorResponse.headers['x-correlation-id']).toBeDefined();
    expect(validationErrorResponse.body.stack).toBeUndefined();

    // Step 8: Verify /health returns APP_VERSION
    const healthResponse = await request(app.getHttpServer()).get('/health');

    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.version).toBe(APP_VERSION);
    expect(healthResponse.headers['x-correlation-id']).toBeDefined();
    expect(healthResponse.headers['x-response-time']).toBeDefined();
  });
});
