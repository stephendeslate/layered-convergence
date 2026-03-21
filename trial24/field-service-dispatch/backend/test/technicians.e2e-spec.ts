import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Technicians (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

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
      data: { name: 'Tech Test Company' },
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tech-dispatcher@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'tech-dispatcher@test.com', password: 'password123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a technician', async () => {
    const response = await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Smith', email: 'john@test.com' })
      .expect(201);

    expect(response.body.name).toBe('John Smith');
  });

  it('should list technicians', async () => {
    const response = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .expect(401);
  });
});
