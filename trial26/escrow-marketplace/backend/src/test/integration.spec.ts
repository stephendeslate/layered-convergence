// [TRACED:EM-034] Integration tests with real AppModule
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";

// [TRACED:IT-001] Integration tests with real AppModule testing actual endpoints
describe("Escrow Marketplace Integration", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) { await app.close(); }
  });

  describe("POST /auth/register", () => {
    it("should reject empty body", async () => {
      await request(app.getHttpServer()).post("/auth/register").send({}).expect(400);
    });

    it("should reject ADMIN role", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ name: "Hacker", email: "h@h.com", password: "password123", role: "ADMIN" })
        .expect(400);
      expect(res.body.message).toContain("Role must be");
    });
  });

  describe("POST /auth/login", () => {
    it("should reject empty body", async () => {
      await request(app.getHttpServer()).post("/auth/login").send({}).expect(400);
    });
  });

  describe("POST /transactions", () => {
    it("should require authentication", async () => {
      await request(app.getHttpServer()).post("/transactions").send({}).expect(401);
    });
  });

  describe("POST /disputes", () => {
    it("should require authentication", async () => {
      await request(app.getHttpServer()).post("/disputes").send({}).expect(401);
    });
  });

  describe("GET /webhooks", () => {
    it("should require authentication", async () => {
      await request(app.getHttpServer()).get("/webhooks").expect(401);
    });
  });
});
