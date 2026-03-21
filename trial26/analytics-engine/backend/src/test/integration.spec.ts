// [TRACED:AE-033] Integration tests with real AppModule
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";

// [TRACED:IT-001] Integration tests with real AppModule testing actual endpoints
describe("Analytics Engine Integration", () => {
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
    if (app) {
      await app.close();
    }
  });

  describe("POST /auth/register", () => {
    it("should reject registration without required fields", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("should reject registration with ADMIN role", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          name: "Hacker",
          email: "hacker@test.com",
          password: "password123",
          role: "ADMIN",
          tenantId: "tenant-1",
        })
        .expect(400);

      expect(response.body.message).toContain("Role must be");
    });

    it("should reject registration with invalid email", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          name: "Test",
          email: "not-an-email",
          password: "password123",
          role: "VIEWER",
          tenantId: "tenant-1",
        })
        .expect(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should reject login without credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({})
        .expect(400);
    });
  });

  describe("GET /analytics/dashboards/:tenantId", () => {
    it("should require authentication", async () => {
      await request(app.getHttpServer())
        .get("/analytics/dashboards/tenant-1")
        .expect(401);
    });
  });

  describe("GET /analytics/data-sources/:tenantId", () => {
    it("should require authentication", async () => {
      await request(app.getHttpServer())
        .get("/analytics/data-sources/tenant-1")
        .expect(401);
    });
  });
});
