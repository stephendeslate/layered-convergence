import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import request from 'supertest';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestUser,
} from './helpers';

describe('Prisma Errors (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;
  let companyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const company = await createTestCompany();
    companyId = company.id;
    const user = await createTestUser(companyId);
    token = await jwtService.signAsync({
      sub: user.id,
      email: user.email,
      companyId,
    });
  });

  it('should return 409 for duplicate unique constraint (P2002)', async () => {
    const prisma = getTestPrisma();
    await prisma.company.create({
      data: { name: 'Dupe Co', slug: 'unique-slug' },
    });

    const res = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another Co', slug: 'unique-slug' })
      .expect(409);

    expect(res.body.message.toLowerCase()).toContain('unique');
  });

  it('should return 404 for record not found (P2025)', async () => {
    await request(app.getHttpServer())
      .get('/technicians/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 400 for validation errors', async () => {
    await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 123 })
      .expect(400);
  });

  it('should return 400 for invalid UUID format', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${token}`)
      .send({ workOrderId: 'not-a-uuid', technicianId: 'not-a-uuid' })
      .expect(400);
  });

  it('should strip unknown fields with whitelist', async () => {
    await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', slug: 'test-strip', extraField: 'should-be-stripped' })
      .expect(400);
  });
});
