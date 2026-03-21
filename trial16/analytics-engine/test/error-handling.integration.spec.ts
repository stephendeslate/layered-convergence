import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/common/prisma-exception.filter';

describe('Error Handling (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let baseUrl: string;
  let validToken: string;

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
    await app.listen(0);

    const address = app.getHttpServer().address() as { port: number };
    baseUrl = `http://localhost:${address.port}`;

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    validToken = await jwtService.signAsync({
      sub: 'user-err',
      email: 'err@test.com',
      tenantId: 'tenant-error-test',
    });
  });

  afterAll(async () => {
    await prisma.dataSource.deleteMany({ where: { tenantId: 'tenant-error-test' } });
    await app.close();
  });

  it('should return 401 for requests without auth header', async () => {
    const response = await fetch(`${baseUrl}/data-sources`);
    expect(response.status).toBe(401);
  });

  it('should return 401 for invalid JWT', async () => {
    const response = await fetch(`${baseUrl}/data-sources`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid request body', async () => {
    const response = await fetch(`${baseUrl}/data-sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        name: '',
        type: 'INVALID_TYPE',
        config: 'not-an-object',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent data source', async () => {
    const response = await fetch(
      `${baseUrl}/data-sources/00000000-0000-0000-0000-000000000000`,
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.status).toBe(404);
  });

  it('should reject requests with extra fields (forbidNonWhitelisted)', async () => {
    const response = await fetch(`${baseUrl}/data-sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        name: 'Test DB',
        type: 'POSTGRESQL',
        config: { host: 'localhost' },
        maliciousField: 'hack',
      }),
    });

    expect(response.status).toBe(400);
  });
});
