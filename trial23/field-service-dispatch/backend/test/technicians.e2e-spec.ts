import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Technicians (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

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
      data: { name: 'Technician Test Company' },
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tech-e2e@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'tech-e2e@test.com', password: 'password123' });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /technicians', () => {
    it('should create a technician', async () => {
      const response = await request(app.getHttpServer())
        .post('/technicians')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'John Doe', email: 'john@test.com' })
        .expect(201);

      expect(response.body.name).toBe('John Doe');
    });
  });

  describe('GET /technicians', () => {
    it('should list technicians', async () => {
      const response = await request(app.getHttpServer())
        .get('/technicians')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /technicians/:id', () => {
    it('should update a technician', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/technicians')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Update Tech', email: 'update-tech@test.com' });

      const response = await request(app.getHttpServer())
        .patch(`/technicians/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Tech' })
        .expect(200);

      expect(response.body.name).toBe('Updated Tech');
    });
  });

  describe('DELETE /technicians/:id', () => {
    it('should delete a technician', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/technicians')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Delete Tech', email: 'delete-tech@test.com' });

      await request(app.getHttpServer())
        .delete(`/technicians/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
