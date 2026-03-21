// [TRACED:FD-035] Integration tests with real AppModule and supertest
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";
import { PrismaService } from "../common/prisma.service";

describe("Integration Tests", () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(),
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    company: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    workOrder: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    route: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    invoice: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.CORS_ORIGIN = "http://localhost:3001";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should reject ADMIN role on registration (400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "admin@example.com",
        password: "password123",
        name: "Admin User",
        role: "ADMIN",
        companyId: "company-1",
      });

    expect(response.status).toBe(400);
  });

  it("should reject missing required fields (400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
      });

    expect(response.status).toBe(400);
  });

  it("should reject non-whitelisted fields (forbidNonWhitelisted)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "DISPATCHER",
        companyId: "company-1",
        isAdmin: true,
      });

    expect(response.status).toBe(400);
  });

  it("should require authentication on protected endpoints (401)", async () => {
    const response = await request(app.getHttpServer()).get("/work-orders");

    expect(response.status).toBe(401);
  });
});
