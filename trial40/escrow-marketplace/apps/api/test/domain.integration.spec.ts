// TRACED: EM-TEST-005 — Domain integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  it('GET /listings should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/listings')
      .expect(401);
  });

  it('GET /transactions should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .expect(401);
  });

  it('GET /escrows should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/escrows')
      .expect(401);
  });

  it('GET /disputes should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/disputes')
      .expect(401);
  });

  it('POST /listings should validate DTO', async () => {
    await request(app.getHttpServer())
      .post('/listings')
      .send({})
      .expect(401);
  });

  it('GET /health should return ok status', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
    expect(response.body.version).toBeDefined();
  });
});
