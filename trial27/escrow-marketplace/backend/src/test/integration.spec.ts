// [TRACED:EM-035] Integration tests with real AppModule + supertest
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";
import { PrismaService } from "../common/prisma.service";

describe("Integration Tests (AppModule)", () => {
  let app: INestApplication;
  let prismaService: {
    user: { create: jest.Mock; findFirst: jest.Mock };
    transaction: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    dispute: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    payout: { create: jest.Mock; findMany: jest.Mock };
    webhook: { create: jest.Mock; findMany: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $executeRaw: jest.Mock;
  };

  beforeAll(async () => {
    prismaService = {
      user: { create: jest.fn(), findFirst: jest.fn() },
      transaction: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      dispute: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      payout: { create: jest.fn(), findMany: jest.fn() },
      webhook: { create: jest.fn(), findMany: jest.fn() },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $executeRaw: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("POST /auth/register should reject ADMIN role", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test",
        role: "ADMIN",
      });

    expect(response.status).toBe(400);
  });

  it("POST /auth/register should reject missing fields", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "test@example.com" });

    expect(response.status).toBe(400);
  });

  it("POST /auth/register should reject non-whitelisted fields", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test",
        role: "BUYER",
        isAdmin: true,
      });

    expect(response.status).toBe(400);
  });

  it("GET /transactions should require authentication", async () => {
    const response = await request(app.getHttpServer())
      .get("/transactions");

    expect(response.status).toBe(401);
  });
});
