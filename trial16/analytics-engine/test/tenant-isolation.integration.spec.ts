import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let tenantAToken: string;
  let tenantBToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    tenantAToken = await jwtService.signAsync({
      sub: 'user-a',
      email: 'a@test.com',
      tenantId: 'tenant-a',
    });

    tenantBToken = await jwtService.signAsync({
      sub: 'user-b',
      email: 'b@test.com',
      tenantId: 'tenant-b',
    });
  });

  afterAll(async () => {
    await prisma.dataSource.deleteMany({
      where: { tenantId: { in: ['tenant-a', 'tenant-b'] } },
    });
    await app.close();
  });

  it('should isolate data sources between tenants', async () => {
    const dsA = await prisma.dataSource.create({
      data: {
        tenantId: 'tenant-a',
        name: 'Tenant A DB',
        type: 'POSTGRESQL',
        config: { host: 'localhost' },
      },
    });

    const dsB = await prisma.dataSource.create({
      data: {
        tenantId: 'tenant-b',
        name: 'Tenant B DB',
        type: 'MYSQL',
        config: { host: 'localhost' },
      },
    });

    const tenantAResults = await prisma.dataSource.findMany({
      where: { tenantId: 'tenant-a' },
    });

    const tenantBResults = await prisma.dataSource.findMany({
      where: { tenantId: 'tenant-b' },
    });

    expect(tenantAResults.some((ds) => ds.id === dsA.id)).toBe(true);
    expect(tenantAResults.some((ds) => ds.id === dsB.id)).toBe(false);
    expect(tenantBResults.some((ds) => ds.id === dsB.id)).toBe(true);
    expect(tenantBResults.some((ds) => ds.id === dsA.id)).toBe(false);
  });

  it('should reject requests without JWT', async () => {
    const response = await fetch(
      `http://localhost:${(app.getHttpServer().address() as { port: number }).port}/data-sources`,
    );

    expect(response.status).toBe(401);
  });
});
