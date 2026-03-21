import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Routes (e2e)', () => {
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
      data: { name: 'Route Test Company' },
    });

    const technician = await prisma.technician.create({
      data: { name: 'Route Tech', email: 'route-tech@test.com', companyId: company.id },
    });
    technicianId = technician.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'route-dispatcher@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'route-dispatcher@test.com', password: 'password123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a route', async () => {
    const response = await request(app.getHttpServer())
      .post('/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Morning Route',
        date: '2026-03-25T08:00:00Z',
        estimatedDistance: 25.5,
        technicianId,
      })
      .expect(201);

    expect(response.body.name).toBe('Morning Route');
    expect(response.body.status).toBe('PLANNED');
  });

  it('should list routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/routes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should transition route status', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Transition Route',
        date: '2026-03-25T08:00:00Z',
        estimatedDistance: 15.0,
        technicianId,
      });

    const response = await request(app.getHttpServer())
      .patch(`/routes/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    expect(response.body.status).toBe('IN_PROGRESS');
  });
});
