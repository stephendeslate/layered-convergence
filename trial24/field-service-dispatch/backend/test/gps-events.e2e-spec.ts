import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GpsEvents (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let technicianId: string;

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

    prisma = app.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({
      data: { name: 'GPS Test Company' },
    });

    const technician = await prisma.technician.create({
      data: { name: 'GPS Tech', email: 'gps-tech@test.com', companyId: company.id },
    });
    technicianId = technician.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'gps-dispatcher@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'gps-dispatcher@test.com', password: 'password123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a GPS event', async () => {
    const response = await request(app.getHttpServer())
      .post('/gps-events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: '2026-03-25T10:30:00Z',
        eventType: 'CHECK_IN',
        technicianId,
      })
      .expect(201);

    expect(response.body.latitude).toBe(40.7128);
    expect(response.body.longitude).toBe(-74.006);
  });

  it('should list GPS events', async () => {
    const response = await request(app.getHttpServer())
      .get('/gps-events')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/gps-events')
      .expect(401);
  });
});
